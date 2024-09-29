import { QueryResult } from 'pg';
import {
  givenDBChatroom,
  givenRandomBoolean,
  givenRandomEmoji,
  givenRandomInt,
} from '../utils/test-helpers';
import chatroomService from './chatrooms.service';
import { createChatroomQuery } from './db/chatrooms.queries';

jest.mock('./db/chatrooms.queries');

describe('Chatroom Service', () => {
  let chatroomName: string;
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

  describe('Create Chatroom', () => {
    test('Given expected chatroom input THEN new chatroom data is returned without chatroom id', async () => {
      // Setup

      const chatroomResult = givenDBChatroom();

      const createChatroomQueryResult = {
        rows: [chatroomResult],
      } as QueryResult;

      const createChatroomQueryMock = jest.mocked(createChatroomQuery);
      createChatroomQueryMock.mockResolvedValueOnce(createChatroomQueryResult);

      // Execute
      const result = await chatroomService().createChatroom(
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
      const resultPromise = chatroomService().createChatroom(
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
});
