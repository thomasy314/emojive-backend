import { query } from '../../db';
import {
  givenRandomBoolean,
  givenRandomEmoji,
  givenRandomInt,
} from '../../utils/test-helpers';
import { createChatroomQuery } from './chatrooms.queries';

jest.mock('../../db');

describe('Chatroom Queries', () => {
  let chatroomName: String;
  let isPublic: boolean;
  let maxOccupancy: number;

  beforeEach(() => {
    chatroomName = givenRandomEmoji();
    isPublic = givenRandomBoolean();
    maxOccupancy = givenRandomInt(20);
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
});
