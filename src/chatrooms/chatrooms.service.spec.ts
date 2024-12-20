import { UUID } from 'crypto';
import { Kafka } from 'kafkajs';
import { QueryResult } from 'pg';
import { EventAdmin, EventLedger } from '../events/events.types';
import createKafkaAdmin from '../events/kafka/kafka.admin';
import {
  ChatMessageData,
  ChatMessageSchema,
} from '../messages/messages.schema';
import messagesService from '../messages/messages.service';
import {
  givenDBChatroom,
  givenRandomBoolean,
  givenRandomEmoji,
  givenRandomInt,
  givenValidUUID,
} from '../utils/test-helpers';
import { createChatroomService } from './chatrooms.service';
import {
  createChatroomQuery,
  createChatroomUserLinkQuery,
  deleteChatroomUserLinkQuery,
  getChatroomUsersQuery,
  getUserChatroomsQuery,
  listChatroomsQuery,
} from './db/chatrooms.queries';

jest.mock('mongodb');
jest.mock('../db/mongodb');
jest.mock('./db/chatrooms.queries');
jest.mock('../events/kafka/kafka.admin');
jest.mock('../events/kafka/kafka.ledger');
jest.mock('../messages/messages.service');

jest.mock('kafkajs', () => {
  return {
    ...jest.requireActual('kafkajs'),
    Kafka: jest.fn(() => test),
  };
});

describe('Chatroom Service', () => {
  let chatroomName: string;
  let isPublic: boolean;
  let maxOccupancy: number;

  const kafkaClient = {} as Kafka;
  const eventLedger = {} as EventLedger;
  const chatroomService = createChatroomService(kafkaClient, eventLedger);

  const eventConsumer = {
    setEventHandler: jest.fn(),
  };

  beforeEach(() => {
    chatroomName = givenRandomEmoji();
    isPublic = givenRandomBoolean();
    maxOccupancy = givenRandomInt(20);

    eventLedger.addConsumer = jest.fn().mockResolvedValueOnce(eventConsumer);
    eventLedger.addProducer = jest.fn();
    eventLedger.removeConsumer = jest.fn();
    eventLedger.removeProducer = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Create Chatroom', () => {
    const createKafkaAdminMock = jest.mocked(createKafkaAdmin);

    beforeEach(() => {
      const eventAdmin = {
        createTopic: jest.fn(),
      } as unknown as EventAdmin;
      createKafkaAdminMock.mockResolvedValue(eventAdmin);
    });

    test('GIVEN expected chatroom input THEN new chatroom data is returned without chatroom id', async () => {
      // Setup
      const chatroomResult = givenDBChatroom();

      const createChatroomQueryResult = {
        rows: [chatroomResult],
      } as QueryResult;

      const createChatroomQueryMock = jest.mocked(createChatroomQuery);
      createChatroomQueryMock.mockResolvedValueOnce(createChatroomQueryResult);

      // Execute
      const result = await chatroomService.createChatroom(
        chatroomName,
        isPublic,
        maxOccupancy
      );

      // Validate
      expect(result).toStrictEqual({
        chatroomUUID: chatroomResult.chatroom_uuid,
        chatroomName: chatroomResult.chatroom_name,
        isPublic: chatroomResult.is_public,
        maxOccupancy: chatroomResult.max_occupancy,
      });

      expect(createChatroomQueryMock).toHaveBeenCalledTimes(1);
      expect(createChatroomQueryMock).toHaveBeenCalledWith(
        chatroomName,
        isPublic,
        maxOccupancy
      );
    });

    test('GIVEN create chatroom query fails THEN error is thrown', () => {
      // Setup
      const createChatroomQueryMock = jest.mocked(createChatroomQuery);
      createChatroomQueryMock.mockRejectedValueOnce('Evil');

      // Execute
      const resultPromise = chatroomService.createChatroom(
        chatroomName,
        isPublic,
        maxOccupancy
      );

      // Validate
      expect(resultPromise).rejects.toBe('Evil');

      expect(createChatroomQueryMock).toHaveBeenCalledTimes(1);
      expect(createChatroomQueryMock).toHaveBeenCalledWith(
        chatroomName,
        isPublic,
        maxOccupancy
      );
    });
  });

  describe('Join Chatroom', () => {
    let chatroomUUID: string;
    let userUUID: string;

    beforeEach(() => {
      chatroomUUID = givenValidUUID();
      userUUID = givenValidUUID();
    });

    test('GIVEN valid chatroom and user UUIDs THEN user is added to chatroom and event handler is set', async () => {
      // Setup
      const createChatroomUserLinkQueryMock = jest.mocked(
        createChatroomUserLinkQuery
      );
      createChatroomUserLinkQueryMock.mockResolvedValueOnce();

      // Execute
      await chatroomService.joinChatroom(chatroomUUID, userUUID);

      // Validate
      expect(createChatroomUserLinkQueryMock).toHaveBeenCalledTimes(1);
      expect(createChatroomUserLinkQueryMock).toHaveBeenCalledWith(
        chatroomUUID,
        userUUID
      );
    });

    test('GIVEN join chatroom query fails THEN error is thrown', async () => {
      // Setup
      const createChatroomUserLinkQueryMock = jest.mocked(
        createChatroomUserLinkQuery
      );
      createChatroomUserLinkQueryMock.mockRejectedValueOnce('Evil');

      // Execute
      const resultPromise = chatroomService.joinChatroom(
        chatroomUUID,
        userUUID
      );

      // Validate
      await expect(resultPromise).rejects.toEqual('Evil');

      expect(createChatroomUserLinkQueryMock).toHaveBeenCalledTimes(1);
      expect(createChatroomUserLinkQueryMock).toHaveBeenCalledWith(
        chatroomUUID,
        userUUID
      );

      expect(eventLedger.addConsumer).not.toHaveBeenCalled();
      expect(eventLedger.addProducer).not.toHaveBeenCalled();
    });
  });

  describe('Leave Chatroom', () => {
    let chatroomUUID: string;
    let userUUID: string;

    beforeEach(() => {
      chatroomUUID = givenValidUUID();
      userUUID = givenValidUUID();
    });

    test('GIVEN valid chatroom and user UUIDs THEN user is removed from chatroom', async () => {
      // Setup

      const deleteChatroomUserLinkQueryResult = {} as QueryResult;

      const deleteChatroomUserLinkQueryMock = jest.mocked(
        deleteChatroomUserLinkQuery
      );
      deleteChatroomUserLinkQueryMock.mockResolvedValueOnce(
        deleteChatroomUserLinkQueryResult
      );

      // Execute
      await chatroomService.leaveChatroom(chatroomUUID, userUUID);

      // Validate
      expect(deleteChatroomUserLinkQueryMock).toHaveBeenCalledTimes(1);
      expect(deleteChatroomUserLinkQueryMock).toHaveBeenCalledWith(
        chatroomUUID,
        userUUID
      );

      expect(eventLedger.removeConsumer).toHaveBeenCalledTimes(1);
      expect(eventLedger.removeConsumer).toHaveBeenCalledWith(userUUID);

      expect(eventLedger.removeProducer).toHaveBeenCalledTimes(1);
      expect(eventLedger.removeProducer).toHaveBeenCalledWith(chatroomUUID);
    });

    test('GIVEN leave chatroom query fails THEN error is thrown', async () => {
      // Setup
      const deleteChatroomUserLinkQueryMock = jest.mocked(
        deleteChatroomUserLinkQuery
      );
      deleteChatroomUserLinkQueryMock.mockRejectedValueOnce('Evil');

      // Execute
      const resultPromise = chatroomService.leaveChatroom(
        chatroomUUID,
        userUUID
      );

      // Validate
      await expect(resultPromise).rejects.toBe('Evil');

      expect(deleteChatroomUserLinkQueryMock).toHaveBeenCalledTimes(1);
      expect(deleteChatroomUserLinkQueryMock).toHaveBeenCalledWith(
        chatroomUUID,
        userUUID
      );

      expect(eventLedger.removeConsumer).not.toHaveBeenCalled();
      expect(eventLedger.removeProducer).not.toHaveBeenCalled();
    });
  });

  describe('Receive Chatroom Message', () => {
    let chatroomUUID: string;
    let userUUID: string;
    let message: ChatMessageSchema;

    let processedMessage: ChatMessageData;
    const processIncomingMessageMock = jest.mocked(
      messagesService.processIncomingMessage
    );

    beforeEach(() => {
      chatroomUUID = givenValidUUID();
      userUUID = givenValidUUID();
      message = { messageType: 'chat', messageText: 'hello' };

      processedMessage = {
        messageText: givenRandomEmoji(),
        sender: givenRandomEmoji(),
      };
      processIncomingMessageMock.mockResolvedValueOnce(processedMessage);
    });

    test('GIVEN valid chatroom and user UUIDs and message THEN event is submitted to ledger', async () => {
      // Setup
      eventLedger.submitEvent = jest.fn();

      const randomUUIDSpy = jest.spyOn(crypto, 'randomUUID');
      const uuid = givenValidUUID() as UUID;
      randomUUIDSpy.mockImplementation(() => uuid);

      const mockDate = new Date('2020-01-01');
      jest.useFakeTimers().setSystemTime(mockDate);

      // Execute
      await chatroomService.emitChatroomMessage(
        chatroomUUID,
        userUUID,
        message
      );

      // Validate
      expect(eventLedger.submitEvent).toHaveBeenCalledTimes(1);
      expect(eventLedger.submitEvent).toHaveBeenCalledWith(chatroomUUID, {
        key: uuid,
        value: {
          message: processedMessage,
          chatroomUUID,
          userUUID,
          timestamp: mockDate.toISOString(),
        },
      });
    });

    test('GIVEN ledger submit event fails THEN error is thrown', async () => {
      // Setup
      eventLedger.submitEvent = jest.fn().mockRejectedValueOnce('Evil');

      // Execute
      const resultPromise = chatroomService.emitChatroomMessage(
        chatroomUUID,
        userUUID,
        message
      );

      // Validate
      await expect(resultPromise).rejects.toStrictEqual(Error('Evil'));
      expect(eventLedger.submitEvent).toHaveBeenCalledTimes(1);
      expect(eventLedger.submitEvent).toHaveBeenCalledWith(chatroomUUID, {
        key: expect.any(String),
        value: {
          message: processedMessage,
          chatroomUUID,
          userUUID,
          timestamp: expect.any(String),
        },
      });
    });
  });

  describe('Get Chatroom Users', () => {
    let chatroomUUID: string;

    beforeEach(() => {
      chatroomUUID = givenValidUUID();
    });

    test('GIVEN valid chatroom UUID THEN chatroom users are returned', async () => {
      // Setup
      const userUUIDs = [givenValidUUID(), givenValidUUID()];
      const getChatroomUsersQueryMock = jest.mocked(getChatroomUsersQuery);
      getChatroomUsersQueryMock.mockResolvedValueOnce({
        rows: userUUIDs.map(userUUID => ({
          user_uuid: userUUID,
        })),
      } as QueryResult);

      // Execute
      const result = await chatroomService.getChatroomUsers(chatroomUUID);

      // Validate
      expect(result).toStrictEqual(userUUIDs);
      expect(getChatroomUsersQueryMock).toHaveBeenCalledTimes(1);
      expect(getChatroomUsersQueryMock).toHaveBeenCalledWith(chatroomUUID);
    });

    test('GIVEN get chatroom users query fails THEN error is thrown', async () => {
      // Setup
      const getChatroomUsersQueryMock = jest.mocked(getChatroomUsersQuery);
      getChatroomUsersQueryMock.mockRejectedValueOnce('Evil');

      // Execute
      const resultPromise = chatroomService.getChatroomUsers(chatroomUUID);

      // Validate
      await expect(resultPromise).rejects.toBe('Evil');
      expect(getChatroomUsersQueryMock).toHaveBeenCalledTimes(1);
      expect(getChatroomUsersQueryMock).toHaveBeenCalledWith(chatroomUUID);
    });
  });

  describe('Get User Chatrooms', () => {
    let userUUID: string;

    beforeEach(() => {
      userUUID = givenValidUUID();
    });

    test('GIVEN valid user UUID THEN user chatrooms are returned', async () => {
      // Setup
      const chatroomUUIDs = [givenValidUUID(), givenValidUUID()];
      const getUserChatroomsQueryMock = jest.mocked(getUserChatroomsQuery);
      getUserChatroomsQueryMock.mockResolvedValueOnce({
        rows: chatroomUUIDs.map(chatroomUUID => ({
          chatroom_uuid: chatroomUUID,
        })),
      } as QueryResult);

      // Execute
      const result = await chatroomService.getUserChatrooms(userUUID);

      // Validate
      expect(result).toStrictEqual(chatroomUUIDs);
      expect(getUserChatroomsQueryMock).toHaveBeenCalledTimes(1);
      expect(getUserChatroomsQueryMock).toHaveBeenCalledWith(userUUID);
    });

    test('GIVEN get user chatrooms query fails THEN error is thrown', async () => {
      // Setup
      const getUserChatroomsQueryMock = jest.mocked(getUserChatroomsQuery);
      getUserChatroomsQueryMock.mockRejectedValueOnce('Evil');

      // Execute
      const resultPromise = chatroomService.getUserChatrooms(userUUID);

      // Validate
      await expect(resultPromise).rejects.toBe('Evil');
      expect(getUserChatroomsQueryMock).toHaveBeenCalledTimes(1);
      expect(getUserChatroomsQueryMock).toHaveBeenCalledWith(userUUID);
    });
  });

  describe('Add Chatroom Message Receiver', () => {
    let chatroomUUID: string;
    let userUUID: string;
    let handler: jest.Mock;

    beforeEach(() => {
      chatroomUUID = givenValidUUID();
      userUUID = givenValidUUID();
      handler = jest.fn();
    });

    test('GIVEN valid chatroom and user UUIDs and handler THEN handler is registered and consumer is added', async () => {
      // Setup
      eventLedger.addProducer = jest.fn();
      eventLedger.addConsumer = jest.fn().mockResolvedValueOnce(eventConsumer);
      eventLedger.registerConsumerHandler = jest.fn();

      // Execute
      await chatroomService.addChatroomMessageReceiver(
        userUUID,
        chatroomUUID,
        handler
      );

      // Validate
      expect(eventLedger.addProducer).toHaveBeenCalledTimes(1);
      expect(eventLedger.addProducer).toHaveBeenCalledWith(chatroomUUID);

      expect(eventLedger.addConsumer).toHaveBeenCalledTimes(1);
      expect(eventLedger.addConsumer).toHaveBeenCalledWith(userUUID, [
        chatroomUUID,
      ]);

      expect(eventLedger.registerConsumerHandler).toHaveBeenCalledTimes(1);
      expect(eventLedger.registerConsumerHandler).toHaveBeenCalledWith(
        userUUID,
        handler
      );
    });

    test('GIVEN add consumer fails THEN error is thrown', async () => {
      // Setup
      eventLedger.addProducer = jest.fn();
      eventLedger.addConsumer = jest.fn().mockRejectedValueOnce('Evil');
      eventLedger.registerConsumerHandler = jest.fn();

      // Execute
      const resultPromise = chatroomService.addChatroomMessageReceiver(
        userUUID,
        chatroomUUID,
        handler
      );

      // Validate
      await expect(resultPromise).rejects.toBe('Evil');

      expect(eventLedger.addProducer).toHaveBeenCalledTimes(1);
      expect(eventLedger.addProducer).toHaveBeenCalledWith(chatroomUUID);

      expect(eventLedger.addConsumer).toHaveBeenCalledTimes(1);
      expect(eventLedger.addConsumer).toHaveBeenCalledWith(userUUID, [
        chatroomUUID,
      ]);

      expect(eventLedger.registerConsumerHandler).not.toHaveBeenCalled();
    });

    test('GIVEN register consumer handler fails THEN error is thrown', async () => {
      // Setup
      eventLedger.addProducer = jest.fn();
      eventLedger.addConsumer = jest.fn();
      const error = new Error('Evil');
      eventLedger.registerConsumerHandler = jest
        .fn()
        .mockImplementationOnce(() => {
          throw error;
        });

      // Execute
      const resultPromise = chatroomService.addChatroomMessageReceiver(
        userUUID,
        chatroomUUID,
        handler
      );

      // Validate
      await expect(resultPromise).rejects.toBe(error);

      expect(eventLedger.addProducer).toHaveBeenCalledTimes(1);
      expect(eventLedger.addProducer).toHaveBeenCalledWith(chatroomUUID);

      expect(eventLedger.addConsumer).toHaveBeenCalledTimes(1);
      expect(eventLedger.addConsumer).toHaveBeenCalledWith(userUUID, [
        chatroomUUID,
      ]);

      expect(eventLedger.registerConsumerHandler).toHaveBeenCalledTimes(1);
    });
  });

  describe('List Chatrooms', () => {
    test('GIVEN chatrooms exist THEN chatrooms are returned', async () => {
      // Setup
      const chatrooms = [
        {
          chatroom_uuid: givenValidUUID(),
          chatroom_name: givenRandomEmoji(),
          max_occupancy: givenRandomInt(20),
        },
        {
          chatroom_uuid: givenValidUUID(),
          chatroom_name: givenRandomEmoji(),
          max_occupancy: givenRandomInt(20),
        },
      ];
      const listChatroomsQueryMock = jest.mocked(listChatroomsQuery);
      listChatroomsQueryMock.mockResolvedValueOnce({
        rows: chatrooms,
      } as QueryResult);

      // Execute
      const result = await chatroomService.listChatrooms();

      // Validate
      expect(result).toStrictEqual(
        chatrooms.map(chatroom => ({
          chatroomUUID: chatroom.chatroom_uuid,
          chatroomName: chatroom.chatroom_name,
          maxOccupancy: chatroom.max_occupancy,
        }))
      );
      expect(listChatroomsQueryMock).toHaveBeenCalledTimes(1);
    });

    test('GIVEN list chatrooms query fails THEN error is thrown', async () => {
      // Setup
      const listChatroomsQueryMock = jest.mocked(listChatroomsQuery);
      listChatroomsQueryMock.mockRejectedValueOnce('Evil');

      // Execute
      const resultPromise = chatroomService.listChatrooms();

      // Validate
      await expect(resultPromise).rejects.toBe('Evil');
      expect(listChatroomsQueryMock).toHaveBeenCalledTimes(1);
    });
  });
});
