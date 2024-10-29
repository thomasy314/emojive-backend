import { query } from '../../db';
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
} from './chatrooms.queries';

jest.mock('../../db');

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
    test('Given valid input THEN query is called with proper input', async () => {
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
    test('Given valid input THEN query is called with proper input', async () => {
      // Setup
      const queryMock = jest.mocked(query);

      // Execute
      await createChatroomUserLinkQuery(chatroomUUID, userUUID);

      // Validate
      expect(queryMock).toHaveBeenCalledTimes(1);
      expect(queryMock).toHaveBeenCalledWith(
        'INSERT INTO chatrooms_users (chatroom_id, user_id) SELECT c.chatroom_id, u.user_id FROM (SELECT chatroom_id FROM chatrooms WHERE chatroom_uuid = $1) AS c CROSS JOIN (SELECT user_id FROM users WHERE user_uuid = $2) AS u',
        [chatroomUUID, userUUID]
      );
    });

    test('Given duplicate entry THEN error is logged and not thrown', async () => {
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

    test('Given other error THEN error is thrown', async () => {
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
    test('Given valid input THEN query is called with proper input', async () => {
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

    test('Given query throws an error THEN error is thrown', async () => {
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
});
