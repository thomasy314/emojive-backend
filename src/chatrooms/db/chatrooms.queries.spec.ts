import { QueryResult } from 'pg';
import { query } from '../../db/postgres';
import {
  givenRandomBoolean,
  givenRandomEmoji,
  givenRandomInt,
  givenValidUUID,
} from '../../utils/test-helpers';
import {
  createChatroomQuery,
  createChatroomUserLinkQuery,
  deleteChatroomUserLinkQuery,
  getChatroomUsersQuery,
  getUserChatroomsQuery,
  listChatroomsQuery,
} from './chatrooms.queries';

jest.mock('../../db/postgres');

describe('Chatroom Queries', () => {
  let chatroomName: string;
  let isPublic: boolean;
  let maxOccupancy: number;
  let chatroomUUID: string;
  let userUUID: string;

  beforeEach(() => {
    chatroomName = givenRandomEmoji();
    isPublic = givenRandomBoolean();
    maxOccupancy = givenRandomInt(20);
    chatroomUUID = givenValidUUID();
    userUUID = givenValidUUID();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Create Chatroom Query', () => {
    test('GIVEN valid input THEN query is called with proper input', async () => {
      // Setup
      const queryMock = jest.mocked(query);

      // Execute
      await createChatroomQuery(chatroomName, isPublic, maxOccupancy);

      // Validate
      expect(queryMock).toHaveBeenCalledTimes(1);
      expect(queryMock).toHaveBeenCalledWith(
        'INSERT INTO chatrooms(chatroom_name, is_public, max_occupancy) VALUES($1, $2, $3) RETURNING *',
        [chatroomName, isPublic, maxOccupancy]
      );
    });
  });

  describe('Create Chatroom User Link Query', () => {
    test('GIVEN valid input THEN query is called with proper input', async () => {
      // Setup
      const queryMock = jest.mocked(query);
      queryMock.mockResolvedValueOnce({ rowCount: 1 } as QueryResult);

      // Execute
      await createChatroomUserLinkQuery(chatroomUUID, userUUID);

      // Validate
      expect(queryMock).toHaveBeenCalledTimes(1);
      expect(queryMock).toHaveBeenCalledWith(
        'INSERT INTO chatrooms_users (chatroom_id, user_id) SELECT c.chatroom_id, u.user_id FROM (SELECT chatroom_id FROM chatrooms WHERE chatroom_uuid = $1) AS c CROSS JOIN (SELECT user_id FROM users WHERE user_uuid = $2) AS u',
        [chatroomUUID, userUUID]
      );
    });

    test('GIVEN no user or chatroom with UUID found THEN error is thrown', async () => {
      // Setup
      const queryMock = jest.mocked(query);
      queryMock.mockResolvedValueOnce({ rowCount: 0 } as QueryResult);

      // Execute
      await expect(
        createChatroomUserLinkQuery(chatroomUUID, userUUID)
      ).rejects.toThrow(
        `Chatroom or user not found for UUIDs: chatroom::${chatroomUUID}, user::${userUUID}`
      );

      // Validate
      expect(queryMock).toHaveBeenCalledTimes(1);
      expect(queryMock).toHaveBeenCalledWith(
        'INSERT INTO chatrooms_users (chatroom_id, user_id) SELECT c.chatroom_id, u.user_id FROM (SELECT chatroom_id FROM chatrooms WHERE chatroom_uuid = $1) AS c CROSS JOIN (SELECT user_id FROM users WHERE user_uuid = $2) AS u',
        [chatroomUUID, userUUID]
      );
    });

    test('GIVEN duplicate entry THEN error is logged and not thrown', async () => {
      // Setup
      const queryMock = jest.mocked(query);
      const error = new Error();
      // @ts-expect-error - error is a pg error
      error.code = '23505';
      queryMock.mockRejectedValueOnce(error);
      console.error = jest.fn();

      // Execute
      await createChatroomUserLinkQuery(chatroomUUID, userUUID);

      // Validate
      expect(queryMock).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith(error);
    });

    test('GIVEN other error THEN error is thrown', async () => {
      // Setup
      const queryMock = jest.mocked(query);
      const error = new Error('Some other error');
      queryMock.mockRejectedValueOnce(error);

      // Execute & Validate
      await expect(
        createChatroomUserLinkQuery(chatroomUUID, userUUID)
      ).rejects.toThrow('Some other error');
    });
  });

  describe('Delete Chatroom User Link Query', () => {
    test('GIVEN valid input THEN query is called with proper input', async () => {
      // Setup
      const queryMock = jest.mocked(query);

      // Execute
      await deleteChatroomUserLinkQuery(chatroomUUID, userUUID);

      // Validate
      expect(queryMock).toHaveBeenCalledTimes(1);
      expect(queryMock).toHaveBeenCalledWith(
        'DELETE FROM chatrooms_users WHERE chatroom_id IN (SELECT chatroom_id FROM chatrooms WHERE chatroom_uuid = $1) AND user_id IN (SELECT user_id FROM users WHERE user_uuid = $2)',
        [chatroomUUID, userUUID]
      );
    });

    test('GIVEN query throws an error THEN error is thrown', async () => {
      // Setup
      const queryMock = jest.mocked(query);
      const error = new Error('Some error');
      queryMock.mockRejectedValueOnce(error);

      // Execute & Validate
      await expect(
        deleteChatroomUserLinkQuery(chatroomUUID, userUUID)
      ).rejects.toThrow('Some error');
    });
  });

  describe('Get Users Chatrooms Query', () => {
    test('GIVEN valid input THEN query is called with proper input', async () => {
      // Setup
      const queryMock = jest.mocked(query);

      // Execute
      await getUserChatroomsQuery(userUUID);

      // Validate
      expect(queryMock).toHaveBeenCalledTimes(1);
      expect(queryMock).toHaveBeenCalledWith(
        'SELECT chatrooms.chatroom_uuid FROM chatrooms JOIN chatrooms_users ON chatrooms.chatroom_id = chatrooms_users.chatroom_id JOIN users ON users.user_id = chatrooms_users.user_id WHERE users.user_uuid = $1',
        [userUUID]
      );
    });

    test('GIVEN query throws an error THEN error is thrown', async () => {
      // Setup
      const queryMock = jest.mocked(query);
      const error = new Error('Some error');
      queryMock.mockRejectedValueOnce(error);

      // Execute & Validate
      await expect(getUserChatroomsQuery(userUUID)).rejects.toThrow(
        'Some error'
      );
    });
  });

  describe('Get Chatroom Users Query', () => {
    test('GIVEN valid input THEN query is called with proper input', async () => {
      // Setup
      const queryMock = jest.mocked(query);

      // Execute
      await getChatroomUsersQuery(chatroomUUID);

      // Validate
      expect(queryMock).toHaveBeenCalledTimes(1);
      expect(queryMock).toHaveBeenCalledWith(
        'SELECT users.user_uuid FROM chatrooms JOIN chatrooms_users ON chatrooms.chatroom_id = chatrooms_users.chatroom_id JOIN users ON users.user_id = chatrooms_users.user_id WHERE chatrooms.chatroom_uuid = $1',
        [chatroomUUID]
      );
    });

    test('GIVEN query throws an error THEN error is thrown', async () => {
      // Setup
      const queryMock = jest.mocked(query);
      const error = new Error('Some error');
      queryMock.mockRejectedValueOnce(error);

      // Execute & Validate
      await expect(getChatroomUsersQuery(chatroomUUID)).rejects.toThrow(
        'Some error'
      );
    });
  });

  describe('List Chatrooms Query', () => {
    test('GIVEN valid input THEN query is called with proper input', async () => {
      // Setup
      const queryMock = jest.mocked(query);

      // Execute
      await listChatroomsQuery();

      // Validate
      expect(queryMock).toHaveBeenCalledTimes(1);
      expect(queryMock).toHaveBeenCalledWith(
        'SELECT * FROM chatrooms WHERE is_public = true'
      );
    });

    test('GIVEN query throws an error THEN error is thrown', async () => {
      // Setup
      const queryMock = jest.mocked(query);
      const error = new Error('Some error');
      queryMock.mockRejectedValueOnce(error);

      // Execute & Validate
      await expect(listChatroomsQuery()).rejects.toThrow('Some error');
    });
  });
});
