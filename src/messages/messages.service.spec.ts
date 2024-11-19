import { QueryResult } from 'pg';
import createMongoConnection, { DocumentDBConnection } from '../db/mongodb';
import { findUserByUUIDQuery } from '../users/db/users.queries';
import { givenDBUser, givenRandomString } from '../utils/test-helpers';
import {
  ChatMessageSchema,
  MessageEvent,
  MessageSchema,
} from './messages.schema';
import messageService from './messages.service';

jest.mock('mongodb');
jest.mock('../users/db/users.queries');

jest.mock('../db/mongodb', () => {
  const mongoDBConnectionMock = {} as DocumentDBConnection;
  return jest.fn(() => Promise.resolve(mongoDBConnectionMock));
});

describe('MessageService', () => {
  let userData = givenDBUser();
  let queryResult: QueryResult;

  const findUserByUUIDQueryMock = jest.mocked(findUserByUUIDQuery);
  let mongoDBConnectionMock: DocumentDBConnection;

  beforeEach(async () => {
    userData = givenDBUser();
    queryResult = { rows: [userData] } as QueryResult;

    findUserByUUIDQueryMock.mockResolvedValue(queryResult);

    mongoDBConnectionMock = await createMongoConnection(
      givenRandomString(),
      givenRandomString()
    );
    mongoDBConnectionMock.getItems = jest.fn();
  });

  test('GIVEN a chat message WHEN processed THEN it should process chat message correctly', async () => {
    // Setup
    const messageText = givenRandomString();
    const message: ChatMessageSchema = {
      messageType: 'chat',
      messageText,
    };

    const messageData = { userUUID: userData.user_uuid };

    const result = await messageService.processIncomingMessage(
      message,
      messageData
    );

    expect(result).toEqual({
      messageText: messageText,
      sender: userData.user_name,
      messageType: 'chat',
    });
  });

  describe('Process Incoming Message', () => {
    test('GIVEN a join message type WHEN processed THEN it should log a warning and process with default processor', async () => {
      const message: MessageSchema = {
        messageType: 'join',
      };
      const messageData = {
        userUUID: userData.user_uuid,
      };

      const result = await messageService.processIncomingMessage(
        message,
        messageData
      );

      expect(result).toEqual({
        messageType: 'join',
        sender: userData.user_name,
      });
    });

    test('GIVEN an unknown message type WHEN processed THEN it should log a warning and process with default processor', async () => {
      const message: MessageSchema = {
        // @ts-expect-error - testing unknown message type
        messageType: 'unknown',
      };
      const messageData = {
        userUUID: userData.user_uuid,
      };

      const result = await messageService.processIncomingMessage(
        message,
        messageData
      );

      expect(result).toEqual({
        messageType: 'unknown',
        sender: userData.user_name,
      });
    });

    test('GIVEN a chat message without userUUID WHEN processed THEN it should throw an error', async () => {
      const messageText = givenRandomString();
      const message: ChatMessageSchema = {
        messageType: 'chat',
        messageText,
      };

      const messageData = {};

      await expect(
        messageService.processIncomingMessage(message, messageData)
      ).rejects.toThrow('User UUID is required for chat messages');
    });

    test('GIVEN a chat message with non-existent userUUID WHEN processed THEN it should throw an error', async () => {
      const messageText = givenRandomString();
      const message: ChatMessageSchema = {
        messageType: 'chat',
        messageText,
      };

      const userUUID = givenRandomString();
      const queryResult = { rows: [] } as unknown as QueryResult;
      const findUserByUUIDQueryMock = jest.mocked(findUserByUUIDQuery);
      findUserByUUIDQueryMock.mockResolvedValue(queryResult);

      const messageData = { userUUID };

      await expect(
        messageService.processIncomingMessage(message, messageData)
      ).rejects.toThrow(`User with UUID ${userUUID} not found`);
    });
  });

  describe('Get Chatroom Messages', () => {
    test('GIVEN a valid chatroomUUID WHEN getChatroomMessages is called THEN it should return the messages for that chatroom', async () => {
      const chatroomUUID = givenRandomString();
      const userUUID = givenRandomString();
      const messageEvents: MessageEvent[] = [
        {
          message: { messageType: 'chat', messageText: givenRandomString() },
          userUUID,
          chatroomUUID,
          timestamp: new Date().toISOString(),
        },
      ];

      mongoDBConnectionMock.getItems = jest.fn().mockResolvedValue(
        messageEvents.map(event => ({
          value: event,
        }))
      );

      const result = await messageService.getChatroomMessages(chatroomUUID);

      expect(result).toEqual(messageEvents);
      expect(mongoDBConnectionMock.getItems).toHaveBeenCalledWith(
        { 'value.chatroomUUID': chatroomUUID },
        { projection: { _id: 0, value: 1 } }
      );
    });

    test('GIVEN an invalid chatroomUUID WHEN getChatroomMessages is called THEN it should return an empty array', async () => {
      const chatroomUUID = givenRandomString();

      mongoDBConnectionMock.getItems = jest.fn().mockResolvedValue([]);

      const result = await messageService.getChatroomMessages(chatroomUUID);

      expect(result).toEqual([]);
      expect(mongoDBConnectionMock.getItems).toHaveBeenCalledWith(
        { 'value.chatroomUUID': chatroomUUID },
        { projection: { _id: 0, value: 1 } }
      );
    });

    test('GIVEN a chatroomUUID WHEN getChatroomMessages is called THEN it should handle database errors gracefully', async () => {
      const chatroomUUID = givenRandomString();

      mongoDBConnectionMock.getItems = jest
        .fn()
        .mockRejectedValue(new Error('Database error'));

      await expect(
        messageService.getChatroomMessages(chatroomUUID)
      ).rejects.toThrow('Database error');
      expect(mongoDBConnectionMock.getItems).toHaveBeenCalledWith(
        { 'value.chatroomUUID': chatroomUUID },
        { projection: { _id: 0, value: 1 } }
      );
    });
  });

  describe('Extract User Visible Message Content', () => {
    test('GIVEN a message event WHEN extractUserVisibleMessageContent is called THEN it should return the user visible content', () => {
      const messageEvent: MessageEvent = {
        message: { messageType: 'chat', messageText: givenRandomString() },
        userUUID: givenRandomString(),
        chatroomUUID: givenRandomString(),
        timestamp: new Date().toISOString(),
      };

      const result =
        messageService.extractUserVisibleMessageContent(messageEvent);

      expect(result).toEqual({
        ...messageEvent.message,
        timeStamp: messageEvent.timestamp,
      });
    });

    test('GIVEN a message event with additional properties WHEN extractUserVisibleMessageContent is called THEN it should return only the user visible content', () => {
      const messageEvent: MessageEvent = {
        message: { messageType: 'chat', messageText: givenRandomString() },
        userUUID: givenRandomString(),
        chatroomUUID: givenRandomString(),
        timestamp: new Date().toISOString(),
        // @ts-expect-error - testing additional property
        extraProperty: 'extraValue', // additional property
      };

      const result =
        messageService.extractUserVisibleMessageContent(messageEvent);

      expect(result).toEqual({
        ...messageEvent.message,
        timeStamp: messageEvent.timestamp,
      });
    });
  });
});
