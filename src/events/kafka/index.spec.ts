import { Kafka } from 'kafkajs';
import kafkaEvents from '.';

describe('Kafka Client', () => {
  beforeEach(() => {
    kafkaEvents.destroy();
  });

  test('GIVEN kafka client has been set THEN get kafka returns client', () => {
    // Setup
    const kafkaClient = {} as Kafka;

    // Set Kafka Client
    kafkaEvents.initKafka(kafkaClient);

    // Get Kafka Client
    const returnedKafkaClient = kafkaEvents.getKafka();

    // Validate
    expect(kafkaClient).toBe(returnedKafkaClient);
  });

  test('GIVEN kafka client has NOT been set THEN get kafka throws error', () => {
    expect(kafkaEvents.getKafka).toThrow(
      'kafka client is undefined, please initialize with initKafka(kafkaClient: Kafka)'
    );
  });
});
