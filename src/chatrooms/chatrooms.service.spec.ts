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
} from './db/chatrooms.queries';

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

    test('Given expected chatroom input THEN new chatroom data is returned without chatroom id', async () => {
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

    test('Given create chatroom query fails THEN error is thrown', () => {
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
    let onMessage: jest.Mock;

    beforeEach(() => {
      chatroomUUID = givenValidUUID();
      userUUID = givenValidUUID();
      onMessage = jest.fn();
    });

    test('Given valid chatroom and user UUIDs THEN user is added to chatroom and event handler is set', async () => {
      // Setup
      const createChatroomUserLinkQueryMock = jest.mocked(
        createChatroomUserLinkQuery
      );
      createChatroomUserLinkQueryMock.mockResolvedValueOnce();

      // Execute
      await chatroomService.joinChatroom(chatroomUUID, userUUID, onMessage);

      // Validate
      expect(createChatroomUserLinkQueryMock).toHaveBeenCalledTimes(1);
      expect(createChatroomUserLinkQueryMock).toHaveBeenCalledWith(
        chatroomUUID,
        userUUID
      );

      expect(eventLedger.addConsumer).toHaveBeenCalledTimes(1);
      expect(eventLedger.addConsumer).toHaveBeenCalledWith(userUUID, [
        chatroomUUID,
      ]);

      expect(eventConsumer.setEventHandler).toHaveBeenCalledTimes(1);
      expect(eventConsumer.setEventHandler).toHaveBeenCalledWith(
        expect.any(Function)
      );

      expect(eventLedger.addProducer).toHaveBeenCalledTimes(1);
      expect(eventLedger.addProducer).toHaveBeenCalledWith(chatroomUUID);
    });

    test('Given join chatroom query fails THEN error is thrown', async () => {
      // Setup
      const createChatroomUserLinkQueryMock = jest.mocked(
        createChatroomUserLinkQuery
      );
      createChatroomUserLinkQueryMock.mockRejectedValueOnce('Evil');

      // Execute
      const resultPromise = chatroomService.joinChatroom(
        chatroomUUID,
        userUUID,
        onMessage
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

    test('Given valid chatroom and user UUIDs THEN user is removed from chatroom', async () => {
      // Setup
      const deleteChatroomUserLinkQueryMock = jest.mocked(
        deleteChatroomUserLinkQuery
      );
      deleteChatroomUserLinkQueryMock.mockResolvedValueOnce();

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

    test('Given leave chatroom query fails THEN error is thrown', async () => {
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

    test('Given valid chatroom and user UUIDs and message THEN event is submitted to ledger', async () => {
      // Setup
      eventLedger.submitEvent = jest.fn();

      // Execute
      await chatroomService.receiveChatroomMessage(
        chatroomUUID,
        userUUID,
        message
      );

      // Validate
      expect(eventLedger.submitEvent).toHaveBeenCalledTimes(1);
      expect(eventLedger.submitEvent).toHaveBeenCalledWith(chatroomUUID, {
        key: 'chat',
        value: processedMessage,
      });
    });
  });
});
