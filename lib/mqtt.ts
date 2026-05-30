import mqtt from 'mqtt';

/**
 * Utility to publish a message to an MQTT broker from a Next.js Server Action.
 * It connects, publishes the payload, and disconnects immediately to prevent connection leaks.
 */
export async function publishMQTTMessage(topic: string, payload: any): Promise<void> {
  const brokerUrl = process.env.MQTT_CONNECTION_URL || 'mqtt://localhost:1883';

  return new Promise((resolve, reject) => {
    const client = mqtt.connect(brokerUrl);

    client.on('connect', () => {
      const payloadString = typeof payload === 'string' ? payload : JSON.stringify(payload);
      
      client.publish(topic, payloadString, (err) => {
        if (err) {
          console.error(`[MQTT] Failed to publish to ${topic}:`, err);
          client.end();
          reject(err);
        } else {
          console.log(`[MQTT] Successfully published to ${topic}`);
          client.end(); // Cleanly disconnect
          resolve();
        }
      });
    });

    client.on('error', (err) => {
      console.error(`[MQTT] Connection error on ${brokerUrl}:`, err);
      client.end();
      reject(err);
    });

    // Timeout to prevent hanging promise if broker is unreachable
    setTimeout(() => {
      client.end();
      reject(new Error('[MQTT] Connection timeout'));
    }, 5000);
  });
}
