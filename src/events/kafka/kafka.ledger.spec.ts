import { Kafka } from 'kafkajs';
import { givenRandomJson, givenRandomString } from '../../utils/test-helpers';
import { EventBusEvent } from '../events.types';
import createKafkaConsumer from './kafka.consumer';
import createKafkaLedger from './kafka.ledger';
import createKafkaProducer from './kakfa.producer';

jest.mock('./kafka.consumer');
jest.mock('./kakfa.producer');

describe('Kafka Ledger', () => {
  let kafkaInstance: Kafka;
  let kafkaLedger: ReturnType<typeof createKafkaLedger>;

  let groupId: string;
  let topic: string;

  const mockConsumer = { destroy: jest.fn() };
  const mockProducer = { sendMessage: jest.fn(), destroy: jest.fn() };

  beforeEach(() => {
    kafkaInstance = {} as Kafka;
    kafkaLedger = createKafkaLedger(kafkaInstance);

    groupId = givenRandomString();
    topic = givenRandomString();

    (createKafkaConsumer as jest.Mock).mockResolvedValue(mockConsumer);
    (createKafkaProducer as jest.Mock).mockResolvedValue(mockProducer);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Add Consumer', () => {
    test('GIVEN a groupId and topics WHEN adding a consumer THEN it should add the consumer', async () => {
      // Execute
      const consumer = await kafkaLedger.addConsumer(groupId, [topic]);

      // Validate
      expect(createKafkaConsumer).toHaveBeenCalledWith(kafkaInstance, groupId, [
        topic,
      ]);
      expect(consumer).toBe(mockConsumer);
    });
  });

  describe('Add Producer', () => {
    test('GIVEN a topic WHEN adding a producer THEN it should add the producer', async () => {
      // Execute
      const producer = await kafkaLedger.addProducer(topic);

      // Validate
      expect(createKafkaProducer).toHaveBeenCalledWith(kafkaInstance, topic);
      expect(producer).toBe(mockProducer);
    });
  });

  describe('Submit Event', () => {
    test('GIVEN a topic and message WHEN submitting an event THEN it should submit the event', async () => {
      // Setup
      const message: EventBusEvent = {
        key: givenRandomString(),
        value: givenRandomJson(),
      };

      // Execute
      await kafkaLedger.addProducer(topic);
      await kafkaLedger.submitEvent(topic, message);

      // Validate
      expect(mockProducer.sendMessage).toHaveBeenCalledWith(message);
    });

    test('GIVEN a non-existent producer WHEN submitting an event THEN it should throw an error', async () => {
      // Setup
      const topic = 'non-existent-topic';
      const message: EventBusEvent = {
        key: givenRandomString(),
        value: givenRandomJson(),
      };

      // Execute and Validate
      await expect(kafkaLedger.submitEvent(topic, message)).rejects.toThrow(
        `Producer for topic ${topic} not found`
      );
    });
  });

  describe('Remove Consumer', () => {
    test('GIVEN a groupId and topics WHEN removing a consumer THEN it should remove the consumer', async () => {
      // Execute
      await kafkaLedger.addConsumer(groupId, [topic]);
      kafkaLedger.removeConsumer(groupId);

      // Validate
      expect(mockConsumer.destroy).toHaveBeenCalled();
    });
  });

  describe('Remove Producer', () => {
    test('GIVEN a topic WHEN removing a producer THEN it should remove the producer', async () => {
      // Execute
      await kafkaLedger.addProducer(topic);
      kafkaLedger.removeProducer(topic);

      // Validate
      expect(mockProducer.destroy).toHaveBeenCalled();
    });

    test('GIVEN multiple producers for a topic WHEN removing a producer THEN it should decrement producer count instead of removing', async () => {
      // Execute
      await kafkaLedger.addProducer(topic);
      await kafkaLedger.addProducer(topic);
      kafkaLedger.removeProducer(topic);

      // Validate
      expect(mockProducer.destroy).not.toHaveBeenCalled();
    });
  });
});
