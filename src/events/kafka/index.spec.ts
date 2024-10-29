import { Kafka } from 'kafkajs';
import { createKafkaEvents } from '.';

describe('Kafka Client', () => {
  test('GIVEN kafka client has been set THEN get kafka returns client', () => {
    // Setup
    const kafkaClient = {} as Kafka;
    const kafkaEvents = createKafkaEvents(kafkaClient);

    // Get Kafka Client
    const returnedKafkaClient = kafkaEvents.getKafka();

    // Validate
    expect(kafkaClient).toBe(returnedKafkaClient);
  });
});
