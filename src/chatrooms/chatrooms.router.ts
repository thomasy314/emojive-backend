import { Router } from 'express';
import chatroomController from './chatrooms.controller';
import { createCharoomValidator } from './validation/create-chatroom.schema';

const chatroomRouter = Router();

chatroomRouter.post(
  '/create',
  createCharoomValidator,
  chatroomController().createChatroom
);

/*
  on websocket connect

  add consumer for chatroom topic
*/

/*
  on websocket message

  push message to chatroom topic
*/

/*
  on websocket destroy

  disconnect from kafka
*/

export default chatroomRouter;
