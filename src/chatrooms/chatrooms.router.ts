import { Router } from 'express';
import websocketRouter from '../websocket/websocket-router';
import chatroomController from './chatrooms.controller';
import { chatroomWebsocketValidator } from './validation/chatroom-websocket.schema';
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
  joinCharoomValidator,
  chatroomController.joinChatroom
);

chatroomWebSocketRouter.onWebSocketConnection(
  '/',
  chatroomWebsocketValidator,
  chatroomController.addUserChatroomsToContext,
  chatroomController.registerUserMessageHandler
);

chatroomWebSocketRouter.onWebSocketMessage(
  '/',
  receiveChatroomMessageValidator,
  chatroomController.addUserChatroomsToContext,
  chatroomController.receiveChatroomMessage
);

chatroomWebSocketRouter.onWebSocketClose(
  '/',
  leaveChatroomValidator,
  chatroomController.addUserChatroomsToContext,
  chatroomController.leaveChatroom
);

chatroomWebSocketRouter.onWebSocketError(
  '/',
  leaveChatroomValidator,
  chatroomController.addUserChatroomsToContext,
  chatroomController.leaveChatroom
);

export { chatroomRouter, chatroomWebSocketRouter };
