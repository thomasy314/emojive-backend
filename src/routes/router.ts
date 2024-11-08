import cors from 'cors';
import express, { Express } from 'express';
import { createServer } from 'http';
import {
  chatroomRouter,
  chatroomWebSocketRouter,
} from '../chatrooms/chatrooms.router';
import authorization from '../middleware/auth/express.authorization';
import websocketAuthorization from '../middleware/auth/websocket.authorization';
import expressErrorHandler from '../middleware/errorHandling/express-error-handler';
import userRouter from '../users/users.router';
import createWebSocketServer from '../websocket/websocket.server';

const expressServer: Express = express();
const websocketServer = createWebSocketServer(createServer(expressServer));

expressServer.use(cors());

websocketServer.on('/', websocketAuthorization);
websocketServer.useRouter('/chatroom', chatroomWebSocketRouter);

expressServer.use(express.urlencoded({ extended: true }));
expressServer.use(express.json());

expressServer.use(authorization);

expressServer.use('/user', userRouter);
expressServer.use('/chatroom', chatroomRouter);

expressServer.use(expressErrorHandler);

export default websocketServer.httpServer;
