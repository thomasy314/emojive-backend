import express, { Express } from 'express';
import userRouter from '../users/users.router';

const expressServer: Express = express();

expressServer.use(express.urlencoded({ extended: true }));
expressServer.use(express.json());
expressServer.use('/user', userRouter);

export default expressServer;
