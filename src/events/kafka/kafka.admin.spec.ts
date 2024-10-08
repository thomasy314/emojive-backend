import { Admin, Kafka } from 'kafkajs';
import { givenRandomString } from '../../utils/test-helpers';
import { EventAdmin } from '../events.types';
import createKafkaAdmin from './kafka.admin';

describe('Events Admin', () => {
  const kafkaAdmin = {} as Admin;
  kafkaAdmin.connect = jest.fn();
  kafkaAdmin.createTopics = jest.fn();
  kafkaAdmin.disconnect = jest.fn();

  const kafka = {} as Kafka;
  kafka.admin = jest.fn(() => kafkaAdmin);

  afterEach(async () => {
    jest.clearAllMocks();
  });

  describe('Create Kafka Admin', () => {
    test('GIVEN kafka client THEN event admin is created', async () => {
      // Execute
      const eventAdmin: EventAdmin = await createKafkaAdmin(kafka);

      // Validate
      expect(kafkaAdmin.connect).toHaveBeenCalledTimes(1);

      expect(eventAdmin).toHaveProperty('createTopic');
      expect(eventAdmin).toHaveProperty('destroy');
    });
  });

  describe('Create Topic', () => {
    test('GIVEN a call to createTopic THEN kafka admin should be called with correct input', async () => {
      // Setup
      const eventAdmin: EventAdmin = await createKafkaAdmin(kafka);

      const topic = givenRandomString();
      const numPartitions = 1;

      // Execute
      eventAdmin.createTopic(topic, numPartitions);

      // Validate
      expect(kafkaAdmin.createTopics).toHaveBeenCalledTimes(1);
      expect(kafkaAdmin.createTopics).toHaveBeenCalledWith({
        topics: [
          {
            topic,
            numPartitions,
          },
        ],
      });
    });
  });

  describe('Destroy', () => {
    test('GIVEN destroy function called THEN kafka consumer is disconnected', async () => {
      // Setup
      const eventAdmin: EventAdmin = await createKafkaAdmin(kafka);

      // Execute
      eventAdmin.destroy();

      // Validate
      expect(kafkaAdmin.disconnect).toHaveBeenCalledTimes(1);
    });
  });
});
