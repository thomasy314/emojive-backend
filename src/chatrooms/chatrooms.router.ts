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

chatroomWebSocketRouter.onWebSocketConnection(
  '/',
  joinCharoomValidator,
  chatroomController.joinChatroom
);

chatroomWebSocketRouter.onWebSocketMessage(
  '/',
  receiveChatroomMessageValidator,
  chatroomController.receiveChatroomMessage
);

chatroomWebSocketRouter.onWebSocketClose(
  '/',
  leaveChatroomValidator,
  chatroomController.leaveChatroom
);

export { chatroomRouter, chatroomWebSocketRouter };
