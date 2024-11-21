import { Router } from 'express';
import websocketRouter from '../websocket/websocket-router';
import chatroomController from './chatrooms.controller';
import { chatroomWebsocketValidator } from './validation/chatroom-websocket.schema';
import { createCharoomValidator } from './validation/create-chatroom.schema';
import { getChatroomMessagesValidator } from './validation/get-chatroom-messages.schema';
import { joinCharoomValidator } from './validation/join-chatroom.schema';
import { leaveChatroomValidator } from './validation/leave-chatroom.schema';
import { listChatroomsValidator } from './validation/list-chatrooms.schema';
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

chatroomRouter.get(
  '/messages',
  getChatroomMessagesValidator,
  chatroomController.getChatroomMessages
);

chatroomRouter.get(
  '/',
  listChatroomsValidator,
  chatroomController.listChatrooms
);

chatroomRouter.delete(
  '/leave',
  leaveChatroomValidator,
  chatroomController.leaveChatroom,
  chatroomController.emitUserLeftChatroomMessage
);

chatroomWebSocketRouter.onWebSocketConnection(
  '/',
  chatroomWebsocketValidator,
  chatroomController.addUserChatroomsToContext,
  chatroomController.registerUserMessageHandler,
  chatroomController.emitUserJoinedChatroomMessage
);

chatroomWebSocketRouter.onWebSocketMessage(
  '/',
  receiveChatroomMessageValidator,
  chatroomController.addUserChatroomsToContext,
  chatroomController.receiveChatroomMessage
);

export { chatroomRouter, chatroomWebSocketRouter };
