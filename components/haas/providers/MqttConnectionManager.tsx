"use client";

import { useEffect } from 'react';
import { useMqttStore } from '@/hooks/useMqttStore';
import { useApp } from '@/contexts/AppContext';

export function MqttConnectionManager() {
  const connect = useMqttStore((state) => state.connect);
  const disconnect = useMqttStore((state) => state.disconnect);
  const { state } = useApp();

  useEffect(() => {
    // Establish connection to local Mosquitto MQTT broker WebSocket port
    connect(process.env.NEXT_PUBLIC_MQTT_CONNECTION_URL, state.workspace.departmentId);

    // Clean up connection on component unmount
    return () => {
      disconnect();
    };
  }, [connect, disconnect, state.workspace.departmentId]);

  return null;
}
