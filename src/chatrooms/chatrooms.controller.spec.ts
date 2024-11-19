import { NextFunction, Request, Response } from 'express';
import WebSocket from 'ws';
import { EventBusEvent } from '../events/events.types';
import { MessageEvent } from '../messages/messages.schema';
import messagesService from '../messages/messages.service';
import {
  givenRandomBoolean,
  givenRandomEmoji,
  givenRandomInt,
  givenValidUUID,
} from '../utils/test-helpers';
import chatroomController from './chatrooms.controller';
import chatroomService from './chatrooms.service';

jest.mock('mongodb');
jest.mock('../db/mongodb');
jest.mock('../messages/messages.service');
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

      const finalMessage = {
        text: 'Hello',
        timeStamp: Date.now(),
      };

      const mockDate = new Date('2020-01-01');
      jest.useFakeTimers().setSystemTime(mockDate);

      const addChatroomMessageReceiverMock = jest.mocked(
        chatroomService.addChatroomMessageReceiver
      );
      addChatroomMessageReceiverMock.mockImplementationOnce(
        (userUUID, chatroomUUID, onMessage) => {
          const event = {
            value: finalMessage,
          } as EventBusEvent;
          onMessage(event);
          return Promise.resolve();
        }
      );

      const extractUserVisibleMessageContentMock = jest.mocked(
        messagesService.extractUserVisibleMessageContent
      );
      extractUserVisibleMessageContentMock.mockReturnValueOnce(finalMessage);

      // Execute
      await chatroomController.registerUserMessageHandler(
        socket,
        context,
        next
      );

      // Validate
      expect(socket.send).toHaveBeenCalledTimes(1);
      expect(socket.send).toHaveBeenCalledWith(JSON.stringify(finalMessage));

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

  describe('Get Chatroom Messages', () => {
    test('GIVEN valid chatroom UUID and user is a member THEN returns chatroom messages', async () => {
      // Setup
      const request: Request = {
        query: {
          chatroomUUID,
        },
        headers: {
          authorization: `Token ${userUUID}`,
        },
      } as unknown as Request;

      const responseMessages = [
        {
          message: { text: 'Hello' },
          chatroomUUID,
          userUUID,
          timestamp: new Date().toISOString(),
        },
        {
          message: { text: 'World' },
          chatroomUUID,
          userUUID,
          timestamp: new Date().toISOString(),
        },
      ] as MessageEvent[];

      const getChatroomUsersMock = jest.mocked(
        chatroomService.getChatroomUsers
      );
      getChatroomUsersMock.mockResolvedValueOnce([userUUID]);

      const getChatroomMessagesMock = jest.mocked(
        messagesService.getChatroomMessages
      );
      getChatroomMessagesMock.mockResolvedValueOnce(responseMessages);

      const extractUserVisibleMessageContentMock = jest.mocked(
        messagesService.extractUserVisibleMessageContent
      );
      extractUserVisibleMessageContentMock.mockImplementation(msg => msg);

      // Execute
      await chatroomController.getChatroomMessages(request, response, next);

      // Validate
      expect(getChatroomUsersMock).toHaveBeenCalledTimes(1);
      expect(getChatroomUsersMock).toHaveBeenCalledWith(chatroomUUID);

      expect(getChatroomMessagesMock).toHaveBeenCalledTimes(1);
      expect(getChatroomMessagesMock).toHaveBeenCalledWith(chatroomUUID);

      expect(response.send).toHaveBeenCalledTimes(1);
      expect(response.send).toHaveBeenCalledWith(responseMessages);

      expect(next).toHaveBeenCalledTimes(0);
    });

    test('GIVEN user is not a member of chatroom THEN next function is called with error', async () => {
      // Setup
      const request: Request = {
        query: {
          chatroomUUID,
        },
        headers: {
          authorization: `Token ${userUUID}`,
        },
      } as unknown as Request;

      const getChatroomUsersMock = jest.mocked(
        chatroomService.getChatroomUsers
      );
      getChatroomUsersMock.mockResolvedValueOnce([]);

      // Execute
      await chatroomController.getChatroomMessages(request, response, next);

      // Validate
      expect(getChatroomUsersMock).toHaveBeenCalledTimes(1);
      expect(getChatroomUsersMock).toHaveBeenCalledWith(chatroomUUID);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith({
        status: 403,
        error: new Error(
          `User [${userUUID}] is not a member of chatroom [${chatroomUUID}] `
        ),
      });
    });

    test('GIVEN error occurs while fetching chatroom messages THEN next function is called', async () => {
      // Setup
      const request: Request = {
        query: {
          chatroomUUID,
        },
        headers: {
          authorization: `Token ${userUUID}`,
        },
      } as unknown as Request;

      const getChatroomUsersMock = jest.mocked(
        chatroomService.getChatroomUsers
      );
      getChatroomUsersMock.mockResolvedValueOnce([userUUID]);

      const getChatroomMessagesMock = jest.mocked(
        messagesService.getChatroomMessages
      );
      getChatroomMessagesMock.mockRejectedValueOnce('Evil');

      // Execute
      await chatroomController.getChatroomMessages(request, response, next);

      // Validate
      expect(getChatroomUsersMock).toHaveBeenCalledTimes(1);
      expect(getChatroomUsersMock).toHaveBeenCalledWith(chatroomUUID);

      expect(getChatroomMessagesMock).toHaveBeenCalledTimes(1);
      expect(getChatroomMessagesMock).toHaveBeenCalledWith(chatroomUUID);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith('Evil');
    });
  });

  describe('List Chatrooms', () => {
    test('GIVEN request to list chatrooms THEN returns list of chatrooms', async () => {
      // Setup
      const request: Request = {} as Request;

      const chatrooms = [
        {
          chatroomUUID: givenValidUUID(),
          chatroomName: 'Chatroom 1',
          maxOccupancy: 2,
        },
        {
          chatroomUUID: givenValidUUID(),
          chatroomName: 'Chatroom 2',
          maxOccupancy: 5,
        },
      ];

      const listChatroomsMock = jest.mocked(chatroomService.listChatrooms);
      listChatroomsMock.mockResolvedValueOnce(chatrooms);

      // Execute
      await chatroomController.listChatrooms(request, response, next);

      // Validate
      expect(listChatroomsMock).toHaveBeenCalledTimes(1);
      expect(response.send).toHaveBeenCalledTimes(1);
      expect(response.send).toHaveBeenCalledWith(chatrooms);
      expect(next).toHaveBeenCalledTimes(0);
    });

    test('GIVEN error occurs while listing chatrooms THEN next function is called', async () => {
      // Setup
      const request: Request = {
        query: {
          chatroomUUID,
        },
        headers: {
          authorization: `Token ${userUUID}`,
        },
      } as unknown as Request;

      const listChatroomsMock = jest.mocked(chatroomService.listChatrooms);
      listChatroomsMock.mockRejectedValueOnce('Evil');

      // Execute
      await chatroomController.listChatrooms(request, response, next);

      // Validate
      expect(listChatroomsMock).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith('Evil');
    });
  });
});
