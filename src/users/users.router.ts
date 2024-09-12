import { Router } from 'express';
import userController from './users.controller';
import { addUserValidator } from './validation/users.validator';

const userRouter = Router();

userRouter.post('/createUser', addUserValidator, userController().createUser);

export default userRouter;
