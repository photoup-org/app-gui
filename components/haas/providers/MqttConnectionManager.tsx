"use client";

import { useEffect } from 'react';
import { useMqttStore } from '@/hooks/useMqttStore';

export function MqttConnectionManager() {
  const connect = useMqttStore((state) => state.connect);
  const disconnect = useMqttStore((state) => state.disconnect);

  useEffect(() => {
    // Establish connection to local Mosquitto MQTT broker WebSocket port
    connect('ws://localhost:9001');

    // Clean up connection on component unmount
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return null;
}
