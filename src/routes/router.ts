import express, { Express } from 'express';
import { createServer } from 'http';
import chatroomRouter from '../chatrooms/chatrooms.router';
import authorization from '../middleware/auth/authorization';
import expressErrorHandler from '../middleware/errorHandling/express-error-handler';
import userRouter from '../users/users.router';
import createWebSocketServer from '../websocket/websocket.router';

const expressServer: Express = express();

const webSocketServer = createWebSocketServer(createServer(expressServer));

expressServer.use(express.urlencoded({ extended: true }));
expressServer.use(express.json());

expressServer.use(authorization);

expressServer.use('/user', userRouter);
expressServer.use('/chatroom', chatroomRouter);

expressServer.use(expressErrorHandler);

export default webSocketServer.httpServer;
