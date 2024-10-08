import { Kafka, Producer } from 'kafkajs';
import { givenRandomJson, givenRandomString } from '../../utils/test-helpers';
import { EventBusEvent, EventProducer } from '../events.types';
import createKafkaProducer from './kakfa.producer';

describe('Events Producer', () => {
  const kafkaProducer = {} as Producer;
  kafkaProducer.connect = jest.fn();
  kafkaProducer.send = jest.fn();
  kafkaProducer.disconnect = jest.fn();

  const kafka = {} as Kafka;
  kafka.producer = jest.fn(() => kafkaProducer);

  let topic: string;

  beforeEach(() => {
    topic = givenRandomString();
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  describe('Create Kafka Producer', () => {
    test('GIVEN kafka client THEN event producer is created', async () => {
      // Execute
      const eventProducer: EventProducer = await createKafkaProducer(
        kafka,
        topic
      );

      // Validate
      expect(kafkaProducer.connect).toHaveBeenCalledTimes(1);

      expect(eventProducer).toHaveProperty('sendMessage');
      expect(eventProducer).toHaveProperty('destroy');
    });
  });

  describe('Send Message', () => {
    test('GIVEN a producer event THEN kafka producer call send with format message', async () => {
      // Setup
      const eventProducer: EventProducer = await createKafkaProducer(
        kafka,
        topic
      );

      const producerEvent: EventBusEvent = {
        key: givenRandomString(),
        value: givenRandomJson(),
      };

      // Execute
      eventProducer.sendMessage(producerEvent);

      // Validate
      expect(kafkaProducer.send).toHaveBeenCalledTimes(1);
      expect(kafkaProducer.send).toHaveBeenCalledWith({
        topic,
        messages: [
          {
            key: producerEvent.key,
            value: JSON.stringify(producerEvent.value),
          },
        ],
      });
    });
  });

  describe('Destroy', () => {
    test('GIVEN destroy function called THEN kafka producer is disconnected', async () => {
      // Setup
      const eventProducer: EventProducer = await createKafkaProducer(
        kafka,
        topic
      );

      // Execute
      eventProducer.destroy();

      // Validate
      expect(kafkaProducer.disconnect).toHaveBeenCalledTimes(1);
    });
  });
});
