import { Kafka, Message } from 'kafkajs';
import { EventBusEvent, EventProducer } from '../events.types';

async function createKafkaProducer(
  kafka: Kafka,
  topic: string
): Promise<EventProducer> {
  const producer = kafka.producer();

  await producer.connect();

  async function sendMessage(...events: EventBusEvent[]): Promise<void> {
    const messages = events.map((event): Message => {
      return {
        key: event.key,
        value: JSON.stringify(event.value),
      };
    });

    await producer.send({
      topic,
      messages,
    });
  }

  async function destroy(): Promise<void> {
    await producer.disconnect();
  }

  return {
    sendMessage,
    destroy,
  };
}

export default createKafkaProducer;
