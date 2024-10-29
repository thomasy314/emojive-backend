import { Kafka } from 'kafkajs';
import {
  EventBusEvent,
  EventConsumer,
  EventLedger,
  EventProducer,
} from '../events.types';
import createKafkaConsumer from './kafka.consumer';
import createKafkaProducer from './kakfa.producer';

function createKafkaLedger(kafkaInstance: Kafka): EventLedger {
  const consumers = new Map<string, EventConsumer>();
  const producers = new Map<string, EventProducer>();
  const producersCount = new Map<string, number>();

  async function addConsumer(groupId: string, topics: string[]) {
    const consumer = await createKafkaConsumer(kafkaInstance, groupId, topics);
    consumers.set(groupId, consumer);
    return consumer;
  }

  async function addProducer(topic: string) {
    if (!producers.has(topic)) {
      const eventProducer = await createKafkaProducer(kafkaInstance, topic);
      producers.set(topic, eventProducer);
    }
    producersCount.set(topic, (producersCount.get(topic) ?? 0) + 1);
    return producers.get(topic)!;
  }

  async function submitEvent(topic: string, message: EventBusEvent) {
    if (!producers.has(topic)) {
      throw new Error(`Producer for topic ${topic} not found`);
    }
    const producer = producers.get(topic);
    if (producer) {
      await producer.sendMessage(message);
    }
  }

  function removeConsumer(groupId: string) {
    consumers.get(groupId)?.destroy();
    consumers.delete(groupId);
  }

  function removeProducer(topic: string) {
    if (producersCount.has(topic)) {
      if (producersCount.get(topic)! <= 1) {
        producers.get(topic)?.destroy();
        producers.delete(topic);
        producersCount.delete(topic);
      } else {
        producersCount.set(topic, producersCount.get(topic)! - 1);
      }
    }
  }

  return {
    addConsumer,
    addProducer,
    submitEvent,
    removeConsumer,
    removeProducer,
  };
}

export default createKafkaLedger;
