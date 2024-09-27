import express, { Express } from 'express';
import chatroomRouter from '../chatrooms/chatrooms.router';
import authorization from '../middleware/auth/authorization';
import errorHandler from '../middleware/errorHandling/error-handler';
import userRouter from '../users/users.router';

const expressServer: Express = express();

expressServer.use(express.urlencoded({ extended: true }));
expressServer.use(express.json());

expressServer.use(authorization);

expressServer.use('/user', userRouter);
expressServer.use('/chatroom', chatroomRouter);

expressServer.use(errorHandler);

export default expressServer;
