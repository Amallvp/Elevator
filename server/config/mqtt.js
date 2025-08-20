import mqtt from 'mqtt';
import { TelemetryIngestor } from '../telemetry/ingestor.js';

export function initMqtt() {
  const url = process.env.MQTT_URL;
  const client = mqtt.connect(url, {
    username: process.env.MQTT_USERNAME || undefined,
    password: process.env.MQTT_PASSWORD || undefined
  });
  client.on('connect', () => {
    console.log('[mqtt] connected');
    const topic = process.env.MQTT_TELEMETRY_TOPIC || 'elevator/+/telemetry';
    client.subscribe(topic, (err) => {
      if (err) console.error('[mqtt] subscribe error', err);
      else console.log('[mqtt] subscribed', topic);
    });
  });
  client.on('message', async (topic, message) => {
    try {
      const payload = JSON.parse(message.toString());
      await TelemetryIngestor.fromMqtt(topic, payload);
    } catch (e) {
      console.error('[mqtt] message error', e.message);
    }
  });
}