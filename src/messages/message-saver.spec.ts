import { Kafka } from 'kafkajs';
import createMongoDBConnection, { DocumentDBConnection } from '../db/mongodb';
import { EventConsumer } from '../events/events.types';
import kafkaEvents from '../events/kafka';
import createKafkaConsumer from '../events/kafka/kafka.consumer';
import { givenRandomObject, givenValidUUID } from '../utils/test-helpers';
import messageSaver from './message-saver';

jest.mock('mongodb');
jest.mock('../events/kafka', () => {
  return {
    getKafka: jest.fn(),
  };
});
jest.mock('../events/kafka/kafka.consumer');
jest.mock('../db/mongodb');

describe('Message Saver', () => {
  beforeAll(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  test('GIVEN messageSaver is create THEN all values are configured correctly', async () => {
    // Setup
    const kakfaInstanceMock = {} as Kafka;
    const getKafkaMock = kafkaEvents.getKafka as jest.Mock;
    getKafkaMock.mockReturnValue(kakfaInstanceMock);

    const kafkaComsumerMock = {} as EventConsumer;
    kafkaComsumerMock.setEventHandler = jest.fn();
    const createKafkaConsumerMock = jest.mocked(createKafkaConsumer);
    createKafkaConsumerMock.mockResolvedValue(kafkaComsumerMock);

    const mongoDBConnectionMock = {} as DocumentDBConnection;
    mongoDBConnectionMock.saveItem = jest.fn();
    const createMongoDBConnectionMock = jest.mocked(createMongoDBConnection);
    createMongoDBConnectionMock.mockResolvedValue(mongoDBConnectionMock);

    // Execute
    await messageSaver();

    // Validate
    expect(getKafkaMock).toHaveBeenCalledTimes(1);

    expect(createKafkaConsumerMock).toHaveBeenCalledTimes(1);
    expect(createKafkaConsumerMock).toHaveBeenCalledWith(
      kakfaInstanceMock,
      'message-connector-group',
      [/^[^_+].*/]
    );

    expect(createMongoDBConnectionMock).toHaveBeenCalledTimes(1);
    expect(createMongoDBConnectionMock).toHaveBeenCalledWith(
      'emojive_document_db',
      'messages'
    );
  });

  describe('Event Handler', () => {
    const kakfaInstanceMock = {} as Kafka;
    const kafkaComsumerMock = {} as EventConsumer;
    const mongoDBConnectionMock = {} as DocumentDBConnection;

    beforeAll(async () => {
      // Setup
      const getKafkaMock = kafkaEvents.getKafka as jest.Mock;
      getKafkaMock.mockReturnValue(kakfaInstanceMock);

      kafkaComsumerMock.setEventHandler = jest.fn();
      const createKafkaConsumerMock = jest.mocked(createKafkaConsumer);
      createKafkaConsumerMock.mockResolvedValue(kafkaComsumerMock);

      mongoDBConnectionMock.saveItem = jest.fn();
      const createMongoDBConnectionMock = jest.mocked(createMongoDBConnection);
      createMongoDBConnectionMock.mockResolvedValue(mongoDBConnectionMock);
    });

    test("GIVEN messageSaver received kafka event THEN it's saved in MongoDB", async () => {
      // Setup
      await messageSaver();
      const messageHandler = (kafkaComsumerMock.setEventHandler as jest.Mock)
        .mock.calls[0][0];

      // Execute
      const message = {
        key: givenValidUUID(),
        value: givenRandomObject(),
      };
      messageHandler(message);

      // Validate
      expect(mongoDBConnectionMock.saveItem).toHaveBeenCalledTimes(1);
      expect(mongoDBConnectionMock.saveItem).toHaveBeenCalledWith({
        _id: message.key,
        value: message.value,
      });
    });
  });
});
