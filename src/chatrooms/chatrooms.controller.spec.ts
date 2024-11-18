import { NextFunction, Request, Response } from 'express';
import WebSocket from 'ws';
import { EventBusEvent } from '../events/events.types';
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

  describe('Add User Chatrooms To Context', () => {
    test('GIVEN user UUID THEN chatroom service is called and context is updated', async () => {
      // Setup
      const socket = {} as WebSocket;
      const context = {
        userUUID,
      };

      const getUserChatroomsMock = jest.mocked(
        chatroomService.getUserChatrooms
      );
      getUserChatroomsMock.mockResolvedValueOnce([chatroomUUID]);

      // Execute
      await chatroomController.addUserChatroomsToContext(socket, context, next);

      // Validate
      expect(getUserChatroomsMock).toHaveBeenCalledTimes(1);
      expect(getUserChatroomsMock).toHaveBeenCalledWith(userUUID);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith({
        newContext: { ...context, chatroomUUID },
      });
    });

    test('GIVEN user is not part of any chatrooms THEN next function is called with error', async () => {
      // Setup
      const socket = {} as WebSocket;
      const context = {
        userUUID,
      };

      const getUserChatroomsMock = jest.mocked(
        chatroomService.getUserChatrooms
      );
      getUserChatroomsMock.mockResolvedValueOnce([]);

      // Execute
      await chatroomController.addUserChatroomsToContext(socket, context, next);

      // Validate
      expect(getUserChatroomsMock).toHaveBeenCalledTimes(1);
      expect(getUserChatroomsMock).toHaveBeenCalledWith(userUUID);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith({
        error: new Error('User is not part of any chatrooms'),
      });
    });

    test('GIVEN user is part of multiple chatrooms THEN next function is called with error', async () => {
      // Setup
      const socket = {} as WebSocket;
      const context = {
        userUUID,
      };

      const getUserChatroomsMock = jest.mocked(
        chatroomService.getUserChatrooms
      );

      const chatrooms = [chatroomUUID, givenValidUUID()];
      getUserChatroomsMock.mockResolvedValueOnce(chatrooms);

      // Execute
      await chatroomController.addUserChatroomsToContext(socket, context, next);

      // Validate
      expect(getUserChatroomsMock).toHaveBeenCalledTimes(1);
      expect(getUserChatroomsMock).toHaveBeenCalledWith(userUUID);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith({
        error: new Error(`User is part of multiple chatrooms: ${chatrooms}`),
      });
    });

    test('GIVEN error occurs while fetching user chatrooms THEN next function is called', async () => {
      // Setup
      const socket = {} as WebSocket;
      const context = {
        userUUID,
      };

      const getUserChatroomsMock = jest.mocked(
        chatroomService.getUserChatrooms
      );
      const error = new Error('Evil');
      getUserChatroomsMock.mockRejectedValueOnce(error);

      // Execute
      await chatroomController.addUserChatroomsToContext(socket, context, next);

      // Validate
      expect(getUserChatroomsMock).toHaveBeenCalledTimes(1);
      expect(getUserChatroomsMock).toHaveBeenCalledWith(userUUID);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('Join Chatroom', () => {
    test('GIVEN chatroom and user UUIDs THEN chatroom service is called', async () => {
      // Setup
      const request: Request = {
        body: {
          chatroomName,
          chatroomUUID,
          isPublic,
          maxOccupancy,
        },
        headers: {
          authorization: `Token ${userUUID}`,
        },
      } as unknown as Request;

      const joinChatroomMock = jest.mocked(chatroomService.joinChatroom);

      joinChatroomMock.mockResolvedValueOnce();

      // Execute
      chatroomController.joinChatroom(request, response, next);

      // Validate
      expect(joinChatroomMock).toHaveBeenCalledTimes(1);
      expect(joinChatroomMock).toHaveBeenCalledWith(chatroomUUID, userUUID);

      expect(next).toHaveBeenCalledTimes(0);
    });

    test('GIVEN error occurs while creating chatroom THEN next function is called', async () => {
      // Setup
      const request: Request = {
        body: {
          chatroomName,
          chatroomUUID,
          isPublic,
          maxOccupancy,
        },
        headers: {
          authorization: `Token ${userUUID}`,
        },
      } as unknown as Request;

      const joinChatroomMock = jest.mocked(chatroomService.joinChatroom);
      joinChatroomMock.mockRejectedValueOnce('Evil');

      // Execute
      await chatroomController.joinChatroom(request, response, next);

      // Validate
      expect(joinChatroomMock).toHaveBeenCalledTimes(1);
      expect(joinChatroomMock).toHaveBeenCalledWith(chatroomUUID, userUUID);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith('Evil');
    });
  });

  describe('Register User Message Handler', () => {
    test('GIVEN user UUID and chatroom UUID THEN chatroom service is called', async () => {
      // Setup
      const socket = {
        send: jest.fn(),
      } as unknown as WebSocket;
      const context = {
        userUUID,
        chatroomUUID,
      };

      const addChatroomMessageReceiverMock = jest.mocked(
        chatroomService.addChatroomMessageReceiver
      );
      addChatroomMessageReceiverMock.mockResolvedValueOnce();

      // Execute
      await chatroomController.registerUserMessageHandler(
        socket,
        context,
        next
      );

      // Validate
      expect(addChatroomMessageReceiverMock).toHaveBeenCalledTimes(1);
      expect(addChatroomMessageReceiverMock).toHaveBeenCalledWith(
        userUUID,
        chatroomUUID,
        expect.any(Function)
      );

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith();
    });

    test('GIVEN error occurs while registering message handler THEN next function is called', async () => {
      // Setup
      const socket = {
        send: jest.fn(),
      } as unknown as WebSocket;
      const context = {
        userUUID,
        chatroomUUID,
      };

      const addChatroomMessageReceiverMock = jest.mocked(
        chatroomService.addChatroomMessageReceiver
      );
      addChatroomMessageReceiverMock.mockRejectedValueOnce('Evil');

      // Execute
      await chatroomController.registerUserMessageHandler(
        socket,
        context,
        next
      );

      // Validate
      expect(addChatroomMessageReceiverMock).toHaveBeenCalledTimes(1);
      expect(addChatroomMessageReceiverMock).toHaveBeenCalledWith(
        userUUID,
        chatroomUUID,
        expect.any(Function)
      );

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith('Evil');
    });

    test('GIVEN message event THEN socket send is called with correct data', async () => {
      // Setup
      const socket = {
        send: jest.fn(),
      } as unknown as WebSocket;
      const context = {
        userUUID,
        chatroomUUID,
      };

      const mockDate = new Date('2020-01-01');
      jest.useFakeTimers().setSystemTime(mockDate);

      const addChatroomMessageReceiverMock = jest.mocked(
        chatroomService.addChatroomMessageReceiver
      );
      addChatroomMessageReceiverMock.mockImplementationOnce(
        (userUUID, chatroomUUID, onMessage) => {
          const event = {
            value: {
              message: { text: 'Hello' },
              timestamp: Date.now(),
            },
          } as EventBusEvent;
          onMessage(event);
          return Promise.resolve();
        }
      );

      // Execute
      await chatroomController.registerUserMessageHandler(
        socket,
        context,
        next
      );

      // Validate
      expect(socket.send).toHaveBeenCalledTimes(1);
      expect(socket.send).toHaveBeenCalledWith(
        JSON.stringify({
          text: 'Hello',
          timeStamp: Date.now(),
        })
      );

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith();
    });
  });

  describe('Emit Chatroom Message', () => {
    test('GIVEN chatroom UUID, user UUID, and message THEN chatroom service is called', async () => {
      // Setup
      const socket = {} as WebSocket;
      const context = {
        chatroomUUID,
        userUUID,
        message: { text: 'Hello' },
      };

      const receiveChatroomMessageMock = jest.mocked(
        chatroomService.emitChatroomMessage
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
        chatroomService.emitChatroomMessage
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
    test('GIVEN chatroom and user UUIDs THEN chatroom service is called', async () => {
      // Setup
      const socket = {} as WebSocket;
      const context = {
        chatroomUUID,
        userUUID,
      };

      const leaveChatroomMock = jest.mocked(chatroomService.leaveChatroom);
      leaveChatroomMock.mockResolvedValueOnce();

      // Execute
      await chatroomController.leaveChatroom(socket, context, next);

      // Validate
      expect(leaveChatroomMock).toHaveBeenCalledTimes(1);
      expect(leaveChatroomMock).toHaveBeenCalledWith(chatroomUUID, userUUID);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith();
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

  describe('Emit User Joined Chatroom Message', () => {
    test('GIVEN user UUID and chatroom UUID THEN chatroom service is called', async () => {
      // Setup
      const socket = {} as WebSocket;
      const context = {
        userUUID,
        chatroomUUID,
      };

      const emitChatroomMessageMock = jest.mocked(
        chatroomService.emitChatroomMessage
      );
      emitChatroomMessageMock.mockResolvedValueOnce();

      // Execute
      await chatroomController.emitUserJoinedChatroomMessage(
        socket,
        context,
        next
      );

      // Validate
      expect(emitChatroomMessageMock).toHaveBeenCalledTimes(1);
      expect(emitChatroomMessageMock).toHaveBeenCalledWith(
        chatroomUUID,
        userUUID,
        { messageType: 'join' }
      );

      expect(next).toHaveBeenCalledTimes(0);
    });

    test('GIVEN error occurs while emitting join message THEN next function is called', async () => {
      // Setup
      const socket = {} as WebSocket;
      const context = {
        userUUID,
        chatroomUUID,
      };

      const emitChatroomMessageMock = jest.mocked(
        chatroomService.emitChatroomMessage
      );
      emitChatroomMessageMock.mockRejectedValueOnce('Evil');

      // Execute
      await chatroomController.emitUserJoinedChatroomMessage(
        socket,
        context,
        next
      );

      // Validate
      expect(emitChatroomMessageMock).toHaveBeenCalledTimes(1);
      expect(emitChatroomMessageMock).toHaveBeenCalledWith(
        chatroomUUID,
        userUUID,
        { messageType: 'join' }
      );

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith('Evil');
    });
  });

  describe('Emit User Left Chatroom Message', () => {
    test('GIVEN user UUID and chatroom UUID THEN chatroom service is called', async () => {
      // Setup
      const socket = {} as WebSocket;
      const context = {
        userUUID,
        chatroomUUID,
      };

      const emitChatroomMessageMock = jest.mocked(
        chatroomService.emitChatroomMessage
      );
      emitChatroomMessageMock.mockResolvedValueOnce();

      // Execute
      await chatroomController.emitUserLeftChatroomMessage(
        socket,
        context,
        next
      );

      // Validate
      expect(emitChatroomMessageMock).toHaveBeenCalledTimes(1);
      expect(emitChatroomMessageMock).toHaveBeenCalledWith(
        chatroomUUID,
        userUUID,
        { messageType: 'leave' }
      );

      expect(next).toHaveBeenCalledTimes(0);
    });

    test('GIVEN error occurs while emitting leave message THEN next function is called', async () => {
      // Setup
      const socket = {} as WebSocket;
      const context = {
        userUUID,
        chatroomUUID,
      };

      const emitChatroomMessageMock = jest.mocked(
        chatroomService.emitChatroomMessage
      );
      emitChatroomMessageMock.mockRejectedValueOnce('Evil');

      // Execute
      await chatroomController.emitUserLeftChatroomMessage(
        socket,
        context,
        next
      );

      // Validate
      expect(emitChatroomMessageMock).toHaveBeenCalledTimes(1);
      expect(emitChatroomMessageMock).toHaveBeenCalledWith(
        chatroomUUID,
        userUUID,
        { messageType: 'leave' }
      );

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith('Evil');
    });
  });
});
