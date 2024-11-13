import { Consumer, EachMessagePayload, Kafka, KafkaMessage } from 'kafkajs';
import {
  givenRandomInt,
  givenRandomObject,
  givenRandomString,
} from '../../utils/test-helpers';
import { EventConsumer } from '../events.types';
import createKafkaConsumer from './kafka.consumer';

describe('Events Consumer', () => {
  const kafkaConsumer = {} as Consumer;
  kafkaConsumer.connect = jest.fn();
  kafkaConsumer.subscribe = jest.fn();
  kafkaConsumer.run = jest.fn();
  kafkaConsumer.disconnect = jest.fn();

  const kafka = {} as Kafka;
  kafka.consumer = jest.fn(() => kafkaConsumer);

  let groupId: string;
  let topics: string[];

  beforeEach(() => {
    groupId = givenRandomString();
    topics = [givenRandomString()];
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  describe('Create Kafka Consumer', () => {
    test('GIVEN kafka client and consumer config THEN event consumer is created', async () => {
      // Setup

      // Execute
      const eventConsumer: EventConsumer = await createKafkaConsumer(
        kafka,
        groupId,
        topics
      );

      // Validate
      expect(kafkaConsumer.connect).toHaveBeenCalledTimes(1);

      expect(eventConsumer).toHaveProperty('setEventHandler');
      expect(eventConsumer).toHaveProperty('destroy');
    });
  });

  describe('Set Event Handler', () => {
    test('GIVEN an event handler THEN handler should be called when message received', async () => {
      // Setup
      const eventConsumer = await createKafkaConsumer(kafka, groupId, topics);

      const eventConumerHandler = jest.fn();

      const kafkaConsumerRunMock = jest.mocked(kafkaConsumer.run);

      const consoleLogSpy = jest.spyOn(console, 'log');
      consoleLogSpy.mockImplementation(jest.fn());

      const partition = givenRandomInt();
      const messageKey = givenRandomString();
      const messageValue = givenRandomObject();
      const message = {
        key: messageKey,
        value: JSON.stringify(messageValue),
      } as unknown as KafkaMessage;
      const eachMessagePayload: EachMessagePayload = {
        topic: topics[0],
        partition,
        message,
        heartbeat: jest.fn(),
        pause: jest.fn(),
      };

      // Execute
      eventConsumer.setEventHandler(eventConumerHandler);

      // Validate
      const eachMessagHandler =
        kafkaConsumerRunMock.mock.calls[0][0]?.eachMessage;
      if (eachMessagHandler == undefined) {
        throw new Error('each message payload is undefined');
      }

      eachMessagHandler(eachMessagePayload);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        `${groupId}: [${topics[0]}]: PART:${partition}`,
        {
          key: messageKey,
          value: messageValue,
        }
      );
    });

    test('GIVEN an event handler THEN handler should be called when message received', async () => {
      // Setup
      const eventConsumer = await createKafkaConsumer(kafka, groupId, topics);

      const eventConumerHandler = jest.fn();

      const kafkaConsumerRunMock = jest.mocked(kafkaConsumer.run);

      const consoleLogSpy = jest.spyOn(console, 'log');
      consoleLogSpy.mockImplementation(jest.fn());

      const partition = givenRandomInt();
      const messageKey = givenRandomString();
      const message = {
        key: messageKey,
        value: null,
      } as unknown as KafkaMessage;
      const eachMessagePayload: EachMessagePayload = {
        topic: topics[0],
        partition,
        message,
        heartbeat: jest.fn(),
        pause: jest.fn(),
      };

      // Execute
      eventConsumer.setEventHandler(eventConumerHandler);

      // Validate
      const eachMessagHandler =
        kafkaConsumerRunMock.mock.calls[0][0]?.eachMessage;
      if (eachMessagHandler == undefined) {
        throw new Error('each message payload is undefined');
      }

      eachMessagHandler(eachMessagePayload);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        `${groupId}: [${topics[0]}]: PART:${partition}`,
        {
          key: messageKey,
          value: null,
        }
      );
    });

    test('GIVEN an event handler with no key THEN error should be thrown', async () => {
      // Setup
      const eventConsumer = await createKafkaConsumer(kafka, groupId, topics);

      const eventConumerHandler = jest.fn();

      const kafkaConsumerRunMock = jest.mocked(kafkaConsumer.run);

      const partition = givenRandomInt();
      const messageValue = givenRandomObject();
      const message = {
        key: null,
        value: JSON.stringify(messageValue),
      } as unknown as KafkaMessage;
      const eachMessagePayload: EachMessagePayload = {
        topic: topics[0],
        partition,
        message,
        heartbeat: jest.fn(),
        pause: jest.fn(),
      };

      // Execute
      eventConsumer.setEventHandler(eventConumerHandler);

      // Validate
      const eachMessagHandler =
        kafkaConsumerRunMock.mock.calls[0][0]?.eachMessage;
      if (eachMessagHandler == undefined) {
        throw new Error('each message payload is undefined');
      }

      expect(() => eachMessagHandler(eachMessagePayload)).rejects.toStrictEqual(
        new Error(
          `${groupId}: [${topics[0]}]: PART:${partition} - Message Missing Key`,
          { cause: message }
        )
      );
    });
  });

  describe('Destroy', () => {
    test('GIVEN destroy function called THEN kafka consumer is disconnected', async () => {
      // Setup
      const eventConsumer = await createKafkaConsumer(kafka, groupId, topics);

      // Execute
      eventConsumer.destroy();

      // Validate
      expect(kafkaConsumer.disconnect).toHaveBeenCalledTimes(1);
    });
  });
});
