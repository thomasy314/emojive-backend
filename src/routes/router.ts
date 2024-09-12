import express, { Express } from 'express';
import errorHandler from '../middleware/errorHandler';
import userRouter from '../users/users.router';

const expressServer: Express = express();

expressServer.use(express.urlencoded({ extended: true }));
expressServer.use(express.json());

expressServer.use('/user', userRouter);

expressServer.use(errorHandler);

export default expressServer;
