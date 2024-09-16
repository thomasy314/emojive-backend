import express, { Express } from 'express';
import authorization from '../middleware/auth/authorization';
import errorHandler from '../middleware/errorHandler';
import userRouter from '../users/users.router';

const expressServer: Express = express();

expressServer.use(express.urlencoded({ extended: true }));
expressServer.use(express.json());

expressServer.use(authorization);

expressServer.use('/user', userRouter);

expressServer.use(errorHandler);

export default expressServer;
