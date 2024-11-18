import { Router } from 'express';
import websocketRouter from '../websocket/websocket-router';
import chatroomController from './chatrooms.controller';
import { createCharoomValidator } from './validation/create-chatroom.schema';
import { joinCharoomValidator } from './validation/join-chatroom.schema';
import { leaveChatroomValidator } from './validation/leave-chatroom.schema';
import { receiveChatroomMessageValidator } from './validation/receive-chatroom-message.schema';

const chatroomRouter = Router();
const chatroomWebSocketRouter = websocketRouter();

chatroomRouter.post(
  '/create',
  createCharoomValidator,
  chatroomController.createChatroom
);

chatroomRouter.post(
  '/join',
  // joinCharoomValidator,
  chatroomController.joinChatroom
);

chatroomWebSocketRouter.onWebSocketConnection(
  '/',
  chatroomController.addUserChatroomsToContext,
  joinCharoomValidator,
  chatroomController.registerUserMessageHandler
);

chatroomWebSocketRouter.onWebSocketMessage(
  '/',
  chatroomController.addUserChatroomsToContext,
  receiveChatroomMessageValidator,
  chatroomController.receiveChatroomMessage
);

chatroomWebSocketRouter.onWebSocketClose(
  '/',
  chatroomController.addUserChatroomsToContext,
  leaveChatroomValidator,
  chatroomController.leaveChatroom
);

chatroomWebSocketRouter.onWebSocketError(
  '/',
  chatroomController.addUserChatroomsToContext,
  leaveChatroomValidator,
  chatroomController.leaveChatroom
);

export { chatroomRouter, chatroomWebSocketRouter };
