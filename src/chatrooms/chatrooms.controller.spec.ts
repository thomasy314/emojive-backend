import { NextFunction, Request, Response } from 'express';
import {
  givenRandomBoolean,
  givenRandomEmoji,
  givenRandomInt,
  givenValidUUID,
} from '../utils/test-helpers';
import chatroomController from './chatrooms.controller';
import chatroomService from './chatrooms.service';

jest.mock('./chatrooms.service', () => {
  const chatroomServiceMock = {
    createChatroom: jest.fn(),
  };
  return jest.fn(() => chatroomServiceMock);
});

describe('Chatroom Controller', () => {
  let response: Response;
  let next: NextFunction;

  let chatroomName: string;
  let isPublic: boolean;
  let maxOccupancy: number;

  beforeEach(() => {
    response = {} as Response;
    response.send = jest.fn();

    next = jest.fn();

    chatroomName = givenRandomEmoji();
    isPublic = givenRandomBoolean();
    maxOccupancy = givenRandomInt(20);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Create Chatroom Controller', () => {
    test('GIVEN expected chatroom body THEN returns data of newly created chatroom', async () => {
      // Setup

      const request: Request = {
        body: {
          chatroomName,
          isPublic,
          maxOccupancy,
        },
      } as unknown as Request;

      const mockedCreateChatroom = jest.mocked(
        chatroomService().createChatroom
      );

      const chatroomUUID = givenValidUUID();
      const responseData = {
        chatroomUUID,
        chatroomName,
        isPublic,
        maxOccupancy,
      };
      mockedCreateChatroom.mockResolvedValueOnce(responseData);

      // Execute
      await chatroomController().createChatroom(request, response, next);

      // Validate
      expect(mockedCreateChatroom).toHaveBeenCalledTimes(1);
      expect(mockedCreateChatroom).toHaveBeenCalledWith(
        chatroomName,
        isPublic,
        maxOccupancy
      );

      expect(next).toHaveBeenCalledTimes(0);
    });

    test('GIVEN error occurs while creating chatroom THEN next function is called', async () => {
      // Setup

      const request: Request = {
        body: {
          chatroomName,
          isPublic,
          maxOccupancy,
        },
      } as unknown as Request;

      const mockedCreateChatroom = jest.mocked(
        chatroomService().createChatroom
      );
      mockedCreateChatroom.mockRejectedValueOnce('Evil');

      // Execute
      await chatroomController().createChatroom(request, response, next);

      // Validate
      expect(mockedCreateChatroom).toHaveBeenCalledTimes(1);
      expect(mockedCreateChatroom).toHaveBeenCalledWith(
        chatroomName,
        isPublic,
        maxOccupancy
      );

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith('Evil');
    });
  });
});
