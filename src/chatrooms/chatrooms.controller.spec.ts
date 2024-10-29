import { NextFunction, Request, Response } from 'express';
import WebSocket from 'ws';
import {
  givenRandomBoolean,
  givenRandomEmoji,
  givenRandomInt,
  givenValidUUID,
} from '../utils/test-helpers';
import chatroomController from './chatrooms.controller';
import chatroomService from './chatrooms.service';

jest.mock('./chatrooms.service');

describe('Chatroom Controller', () => {
  let response: Response;
  let next: NextFunction;

  let chatroomName: string;
  let isPublic: boolean;
  let maxOccupancy: number;

  let chatroomUUID: string;
  let userUUID: string;

  beforeEach(() => {
    response = {} as Response;
    response.send = jest.fn();

    next = jest.fn();

    chatroomName = givenRandomEmoji();
    isPublic = givenRandomBoolean();
    maxOccupancy = givenRandomInt(20);

    chatroomUUID = givenValidUUID();
    userUUID = givenValidUUID();
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

      const mockedCreateChatroom = jest.mocked(chatroomService.createChatroom);

      const chatroomUUID = givenValidUUID();
      const responseData = {
        chatroomUUID,
        chatroomName,
        isPublic,
        maxOccupancy,
      };
      mockedCreateChatroom.mockResolvedValueOnce(responseData);

      // Execute
      await chatroomController.createChatroom(request, response, next);

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

      const mockedCreateChatroom = jest.mocked(chatroomService.createChatroom);
      mockedCreateChatroom.mockRejectedValueOnce('Evil');

      // Execute
      await chatroomController.createChatroom(request, response, next);

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

  describe('Join Chatroom', () => {
    test('Given chatroom and user UUIDs THEN chatroom service is called', async () => {
      // Setup
      const socket = {} as WebSocket;
      const context = {
        chatroomUUID,
        userUUID,
      };

      const joinChatroomMock = jest.mocked(chatroomService.joinChatroom);

      joinChatroomMock.mockResolvedValueOnce();

      // Execute
      chatroomController.joinChatroom(socket, context, next);

      // Validate
      expect(joinChatroomMock).toHaveBeenCalledTimes(1);
      expect(joinChatroomMock).toHaveBeenCalledWith(
        chatroomUUID,
        userUUID,
        expect.any(Function)
      );

      expect(next).toHaveBeenCalledTimes(0);
    });

    test('GIVEN error occurs while creating chatroom THEN next function is called', async () => {
      // Setup

      const socket = {} as WebSocket;
      const context = {
        chatroomUUID,
        userUUID,
      };

      const joinChatroomMock = jest.mocked(chatroomService.joinChatroom);
      joinChatroomMock.mockRejectedValueOnce('Evil');

      // Execute
      await chatroomController.joinChatroom(socket, context, next);

      // Validate
      expect(joinChatroomMock).toHaveBeenCalledTimes(1);
      expect(joinChatroomMock).toHaveBeenCalledWith(
        chatroomUUID,
        userUUID,
        expect.any(Function)
      );

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith('Evil');
    });
  });

  describe('Receive Chatroom Message', () => {
    test('Given chatroom UUID, user UUID, and message THEN chatroom service is called', async () => {
      // Setup
      const socket = {} as WebSocket;
      const context = {
        chatroomUUID,
        userUUID,
        message: { text: 'Hello' },
      };

      const receiveChatroomMessageMock = jest.mocked(
        chatroomService.receiveChatroomMessage
      );
      receiveChatroomMessageMock.mockResolvedValueOnce();

      // Execute
      await chatroomController.receiveChatroomMessage(socket, context, next);

      // Validate
      expect(receiveChatroomMessageMock).toHaveBeenCalledTimes(1);
      expect(receiveChatroomMessageMock).toHaveBeenCalledWith(
        context.chatroomUUID,
        context.userUUID,
        context.message
      );

      expect(next).toHaveBeenCalledTimes(0);
    });

    test('GIVEN error occurs while receiving chatroom message THEN next function is called', async () => {
      // Setup
      const socket = {} as WebSocket;
      const context = {
        chatroomUUID,
        userUUID,
        message: { text: 'Hello' },
      };

      const receiveChatroomMessageMock = jest.mocked(
        chatroomService.receiveChatroomMessage
      );
      receiveChatroomMessageMock.mockRejectedValueOnce('Evil');

      // Execute
      await chatroomController.receiveChatroomMessage(socket, context, next);

      // Validate
      expect(receiveChatroomMessageMock).toHaveBeenCalledTimes(1);
      expect(receiveChatroomMessageMock).toHaveBeenCalledWith(
        context.chatroomUUID,
        context.userUUID,
        context.message
      );

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith('Evil');
    });
  });

  describe('Leave Chatroom', () => {
    test('Given chatroom and user UUIDs THEN chatroom service is called', async () => {
      // Setup
      const socket = {} as WebSocket;
      const context = {
        chatroomUUID,
        userUUID,
      };

      const leaveChatroomMock = jest.mocked(chatroomService.leaveChatroom);
      leaveChatroomMock.mockResolvedValueOnce();

      // Execute
      chatroomController.leaveChatroom(socket, context, next);

      // Validate
      expect(leaveChatroomMock).toHaveBeenCalledTimes(1);
      expect(leaveChatroomMock).toHaveBeenCalledWith(chatroomUUID, userUUID);

      expect(next).toHaveBeenCalledTimes(0);
    });

    test('GIVEN error occurs while leaving chatroom THEN next function is called', async () => {
      // Setup

      const socket = {} as WebSocket;
      const context = {
        chatroomUUID,
        userUUID,
      };

      const leaveChatroomMock = jest.mocked(chatroomService.leaveChatroom);
      leaveChatroomMock.mockRejectedValueOnce('Evil');

      // Execute
      await chatroomController.leaveChatroom(socket, context, next);

      // Validate
      expect(leaveChatroomMock).toHaveBeenCalledTimes(1);
      expect(leaveChatroomMock).toHaveBeenCalledWith(chatroomUUID, userUUID);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith('Evil');
    });
  });
});
