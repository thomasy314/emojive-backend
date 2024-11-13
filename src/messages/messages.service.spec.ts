import { QueryResult } from 'pg';
import { findUserByUUIDQuery } from '../users/db/users.queries';
import { givenDBUser, givenRandomString } from '../utils/test-helpers';
import { ChatMessageSchema, MessageSchema } from './messages.schema';
import messageService, { MessageService } from './messages.service';

jest.mock('../users/db/users.queries');

describe('MessageService', () => {
  let service: MessageService;
  let userData = givenDBUser();
  let queryResult: QueryResult;

  const findUserByUUIDQueryMock = jest.mocked(findUserByUUIDQuery);

  beforeEach(() => {
    service = messageService;

    userData = givenDBUser();
    queryResult = { rows: [userData] } as QueryResult;

    findUserByUUIDQueryMock.mockResolvedValue(queryResult);
  });

  test('GIVEN a chat message WHEN processed THEN it should process chat message correctly', async () => {
    // Setup
    const messageText = givenRandomString();
    const message: ChatMessageSchema = {
      messageType: 'chat',
      messageText,
    };

    const messageData = { userUUID: userData.user_uuid };

    const result = await service.processIncomingMessage(message, messageData);

    expect(result).toEqual({
      messageText: messageText,
      sender: userData.user_name,
      messageType: 'chat',
    });
  });

  test('GIVEN a join message type WHEN processed THEN it should log a warning and process with default processor', async () => {
    const message: MessageSchema = {
      messageType: 'join',
    };
    const messageData = {
      userUUID: userData.user_uuid,
    };

    const result = await service.processIncomingMessage(message, messageData);

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

    const result = await service.processIncomingMessage(message, messageData);

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
      service.processIncomingMessage(message, messageData)
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
      service.processIncomingMessage(message, messageData)
    ).rejects.toThrow(`User with UUID ${userUUID} not found`);
  });
});
