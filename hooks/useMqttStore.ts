import { create } from 'zustand';
import mqtt, { MqttClient } from 'mqtt';

interface MqttState {
  client: MqttClient | null;
  isConnected: boolean;
  listeners: Record<string, Set<(payload: any) => void>>;
}

interface MqttActions {
  connect: (brokerUrl?: string) => void;
  disconnect: () => void;
  subscribe: (topic: string, callback: (payload: any) => void) => () => void;
  publish: (topic: string, payload: any) => void;
}

export const useMqttStore = create<MqttState & MqttActions>((set, get) => ({
  client: null,
  isConnected: false,
  listeners: {},

  connect: (brokerUrl = 'ws://localhost:9001') => {
    const { client } = get();
    // Prevent duplicate client connections
    if (client) {
      return;
    }

    console.log(`[MQTT] Connecting to broker at ${brokerUrl}...`);
    const mqttClient = mqtt.connect(brokerUrl);

    mqttClient.on('connect', () => {
      console.log(`[MQTT] Connected successfully to ${brokerUrl}`);
      set({ isConnected: true });

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
      try {
        const payloadString = messageBuffer.toString();
        const payload = JSON.parse(payloadString);

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
}));
