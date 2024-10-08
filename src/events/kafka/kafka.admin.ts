import { Kafka } from 'kafkajs';
import { EventAdmin } from '../events.types';

async function createKafkaAdmin(kafka: Kafka): Promise<EventAdmin> {
  const admin = kafka.admin();

  await admin.connect();

  async function createTopic(topic: string, numPartitions: number) {
    await admin.createTopics({
      topics: [
        {
          topic,
          numPartitions,
        },
      ],
    });
  }

  async function destroy(): Promise<void> {
    await admin.disconnect();
  }

  return { createTopic, destroy };
}

export default createKafkaAdmin;
