import { Kafka } from 'kafkajs';
import {
  EventBusEvent,
  EventConsumer,
  EventConsumerHandler,
} from '../events.types';

async function createKafkaConsumer(
  kafka: Kafka,
  groupId: string,
  topics: string[]
): Promise<EventConsumer> {
  const consumer = kafka.consumer({ groupId });

  await consumer.connect();

  await consumer.subscribe({
    topics: topics,
    fromBeginning: true,
  });

  async function setEventHandler(
    eventHandler: EventConsumerHandler
  ): Promise<void> {
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const { key, value } = message;

        if (key == null || key == undefined) {
          throw new Error(
            `${groupId}: [${topic}]: PART:${partition} - Message Missing Key`,
            { cause: message }
          );
        }

        const busEvent: EventBusEvent = {
          key: key.toString(),
          value: value ? JSON.parse(value.toString()) : null,
        };

        console.log(`${groupId}: [${topic}]: PART:${partition}`, busEvent);

        eventHandler(busEvent);
      },
    });
  }

  async function destroy(): Promise<void> {
    await consumer.disconnect();
  }

  return {
    setEventHandler,
    destroy,
  };
}

export default createKafkaConsumer;
