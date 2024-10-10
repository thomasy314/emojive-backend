import express, { Express } from 'express';
import { createServer } from 'http';
import authorization from '../middleware/auth/authorization';
import expressErrorHandler from '../middleware/errorHandling/express-error-handler';
import userRouter from '../users/users.router';
import createWebSocketServer from '../websocket/websocket.server';

const expressServer: Express = express();

const websocketServer = createWebSocketServer(createServer(expressServer));

expressServer.use(express.urlencoded({ extended: true }));
expressServer.use(express.json());

expressServer.use(authorization);

expressServer.use('/user', userRouter);

expressServer.use(expressErrorHandler);

export default websocketServer.httpServer;
