import { Router } from 'express';
import chatroomController from './chatrooms.controller';
import { createCharoomValidator } from './validation/create-chatroom.schema';

const chatroomRouter = Router();

chatroomRouter.post(
  '/create',
  createCharoomValidator,
  chatroomController.createChatroom
);

export default chatroomRouter;
