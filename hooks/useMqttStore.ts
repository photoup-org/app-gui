import { create } from 'zustand';
import mqtt, { MqttClient } from 'mqtt';

export interface GatewayInfo {
  gateway_id: string;
  version: string;
  status: string;
  uptime_seconds?: number;
}

interface MqttState {
  client: MqttClient | null;
  isConnected: boolean;
  listeners: Record<string, Set<(payload: any) => void>>;
  gatewayInfo: GatewayInfo | null;
  liveDevices: Record<string, { status: string, last_seen: number }>;
  lastRegistrationUpdate: number;
  liveValues: Record<string, any>;
  chartSeries: Record<string, any[]>;
}

interface MqttActions {
  connect: (brokerUrl?: string) => void;
  disconnect: () => void;
  subscribe: (topic: string, callback: (payload: any) => void) => () => void;
  publish: (topic: string, payload: any) => void;
}

let liveValuesBuffer: Record<string, any> = {};
let chartSeriesBuffer: Record<string, any[]> = {};
let isBufferDirty = false;

export const useMqttStore = create<MqttState & MqttActions>((set, get) => {
  // 10Hz (100ms) flush interval to prevent React reconciliation thrashing
  setInterval(() => {
    if (!isBufferDirty) return;
    set((state) => {
      let newLiveValues = state.liveValues;
      if (Object.keys(liveValuesBuffer).length > 0) {
        newLiveValues = { ...state.liveValues, ...liveValuesBuffer };
      }
      
      let newChartSeries = state.chartSeries;
      if (Object.keys(chartSeriesBuffer).length > 0) {
        newChartSeries = { ...state.chartSeries };
        Object.keys(chartSeriesBuffer).forEach(deviceId => {
          const currentSeries = newChartSeries[deviceId] || [];
          const combined = [...currentSeries, ...chartSeriesBuffer[deviceId]];
          newChartSeries[deviceId] = combined.slice(-1000);
        });
      }

      liveValuesBuffer = {};
      chartSeriesBuffer = {};
      isBufferDirty = false;

      return {
        liveValues: newLiveValues,
        chartSeries: newChartSeries
      };
    });
  }, 100);

  return {
  client: null,
  isConnected: false,
  listeners: {},
  gatewayInfo: null,
  liveDevices: {},
  lastRegistrationUpdate: 0,
  liveValues: {},
  chartSeries: {},

  connect: (brokerUrl) => {
    const mqttUrl = brokerUrl || process.env.MQTT_CONNECTION_URL;
    const { client } = get();
    // Prevent duplicate client connections
    if (client) {
      return;
    }

    console.log(`[MQTT] Connecting to broker at ${mqttUrl}...`);
    const mqttClient = mqtt.connect(mqttUrl as string);

    mqttClient.on('connect', () => {
      console.log(`[MQTT] Connected successfully to ${mqttUrl}`);
      set({ isConnected: true });

      // Request and subscribe to gateway info
      mqttClient.subscribe('system/info/report', (err) => {
        if (err) {
          console.error('[MQTT] Failed to subscribe to system/info/report:', err);
        }
      });
      mqttClient.publish('system/info/request', JSON.stringify({}));

      // Subscribe to device tracking topics
      mqttClient.subscribe('system/devices/report', (err) => {
        if (err) console.error('[MQTT] Failed to subscribe to system/devices/report:', err);
      });
      mqttClient.subscribe('nodes/+/status', (err) => {
        if (err) console.error('[MQTT] Failed to subscribe to nodes/+/status:', err);
      });
      mqttClient.subscribe('system/devices/registered', (err) => {
        if (err) console.error('[MQTT] Failed to subscribe to system/devices/registered:', err);
      });

      mqttClient.publish('system/devices/request', JSON.stringify({}));

      // Re-subscribe to all active topics in the listeners registry
      const { listeners } = get();
      Object.keys(listeners).forEach((topic) => {
        if (listeners[topic].size > 0) {
          console.log(`[MQTT] Resubscribing to active topic: ${topic}`);
          mqttClient.subscribe(topic, (err) => {
            if (err) {
              console.error(`[MQTT] Resubscribe failed for topic ${topic}:`, err);
            }
          });
        }
      });
    });

    mqttClient.on('close', () => {
      console.log('[MQTT] Broker connection closed');
      set({ isConnected: false });
    });

    mqttClient.on('error', (err) => {
      console.error('[MQTT] Client encountered error:', err);
    });

    mqttClient.on('message', (topic, messageBuffer) => {
      const payloadString = messageBuffer.toString();

      // Handle raw string payloads first
      if (topic.startsWith('nodes/') && topic.endsWith('/status')) {
        const parts = topic.split('/');
        if (parts.length === 3) {
          const deviceId = parts[1];
          set((state) => ({
            liveDevices: {
              ...state.liveDevices,
              [deviceId]: {
                status: payloadString.trim(),
                last_seen: Date.now()
              }
            }
          }));
        }
        return;
      }

      // Intercept new topic structure
      if (topic.startsWith('ui/live/device/')) {
        const parts = topic.split('/');
        const deviceId = parts[3];
        const streamType = parts[4];
        if (!deviceId || !streamType) return;
        
        try {
          const payload = JSON.parse(payloadString);

          if (streamType === 'raw') {
            liveValuesBuffer[deviceId] = payload;
            isBufferDirty = true;
          } else if (streamType === 'sync') {
            const timestamp = payload.timestamp || new Date().toISOString();
            const newReadings: any[] = [];
            
            Object.keys(payload).forEach(key => {
                if (key !== 'timestamp' && key !== 'device_id' && key !== 'deviceId') {
                    newReadings.push({
                        id: Math.random().toString(36).substring(7),
                        deviceId: deviceId,
                        metricType: key,
                        value: Number(payload[key]),
                        timestamp: timestamp
                    });
                }
            });

            if (newReadings.length > 0) {
              if (!chartSeriesBuffer[deviceId]) {
                chartSeriesBuffer[deviceId] = [];
              }
              chartSeriesBuffer[deviceId].push(...newReadings);
              isBufferDirty = true;
            }
          }

          // Still execute callbacks for components using the subscribe hook
          const callbacks = get().listeners[topic];
          if (callbacks) {
            callbacks.forEach((cb) => {
              try {
                cb(payload);
              } catch (err) {
                console.error(`[MQTT] Error executing callback for topic ${topic}:`, err);
              }
            });
          }
        } catch (err) {
          console.error("Failed to parse live telemetry:", err);
        }
        return; // Exit early so it doesn't fall into older parsers
      }

      try {
        const payload = JSON.parse(payloadString);

        if (topic === 'system/info/report') {
          set({ gatewayInfo: payload as GatewayInfo });
        } else if (topic === 'system/devices/report') {
          set({ liveDevices: payload });
        } else if (topic === 'system/devices/registered') {
          set({ lastRegistrationUpdate: Date.now() });
        }

        // Find exact topic match in our registry
        const callbacks = get().listeners[topic];
        if (callbacks) {
          callbacks.forEach((cb) => {
            try {
              cb(payload);
            } catch (err) {
              console.error(`[MQTT] Error executing callback for topic ${topic}:`, err);
            }
          });
        }
      } catch (err) {
        console.error(`[MQTT] Failed to parse message on topic ${topic}:`, err);
      }
    });

    set({ client: mqttClient });
  },

  disconnect: () => {
    const { client } = get();
    if (client) {
      console.log('[MQTT] Ending connection clean up...');
      client.end();
    }
    set({ client: null, isConnected: false, listeners: {} });
  },

  subscribe: (topic: string, callback: (payload: any) => void) => {
    const { client, listeners, isConnected } = get();
    const updatedListeners = { ...listeners };

    if (!updatedListeners[topic]) {
      updatedListeners[topic] = new Set();
    }

    updatedListeners[topic].add(callback);
    set({ listeners: updatedListeners });

    // If this is the first listener for this topic and client is connected, subscribe
    if (updatedListeners[topic].size === 1 && client && isConnected) {
      console.log(`[MQTT] Client subscribing to topic: ${topic}`);
      client.subscribe(topic, (err) => {
        if (err) {
          console.error(`[MQTT] Subscription failed for topic ${topic}:`, err);
        }
      });
    }

    // Return the cleanup / unsubscribe function
    return () => {
      const { client: activeClient, listeners: activeListeners } = get();
      const nextListeners = { ...activeListeners };

      if (nextListeners[topic]) {
        nextListeners[topic].delete(callback);

        // If no more listeners remain for this topic, unsubscribe and delete key
        if (nextListeners[topic].size === 0) {
          delete nextListeners[topic];
          console.log(`[MQTT] No remaining listeners. Unsubscribing from topic: ${topic}`);
          if (activeClient && activeClient.connected) {
            activeClient.unsubscribe(topic, (err) => {
              if (err) {
                console.error(`[MQTT] Unsubscribe failed for topic ${topic}:`, err);
              }
            });
          }
        }
      }

      set({ listeners: nextListeners });
    };
  },

  publish: (topic: string, payload: any) => {
    const { client, isConnected } = get();
    if (!client || !isConnected) {
      console.warn('[MQTT] Publish failed: Client is not currently connected');
      return;
    }

    const payloadString = typeof payload === 'string' ? payload : JSON.stringify(payload);
    client.publish(topic, payloadString, (err) => {
      if (err) {
        console.error(`[MQTT] Publication failed on topic ${topic}:`, err);
      }
    });
  },
};
});
