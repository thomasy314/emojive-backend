import { Router } from 'express';
import userController from './users.controller';
import { userValidator } from './validation/users.schema';

const userRouter = Router();

userRouter.post('/create', userValidator, userController().createUser);

export default userRouter;
