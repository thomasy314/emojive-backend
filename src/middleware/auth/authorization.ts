import { NextFunction, Request, Response } from 'express';
import authService from '../../auth/auth.service';
import { ResponseError } from '../errorHandling/error.types';
import {
  AuthorizationSchema,
  validateAuthorization,
} from './authorization.schema';

function authorization(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  if (authService().confirmRouteAuthNeeded(req.path) === false) {
    next();
    return Promise.resolve();
  }

  const isValid = validateAuthorization(req.query);
  if (!isValid) {
    const err: ResponseError = {
      status: 401,
      error: new Error('Not Authorized'),
    };
    next(err);
    return Promise.resolve();
  }

  const requestData: AuthorizationSchema = req.query as AuthorizationSchema;

  return authService()
    .authorizeRequest(requestData.userUUID)
    .then(result => {
      if (result === false) {
        const err: ResponseError = {
          status: 401,
          error: Error('Not Authorized'),
        };
        next(err);
        return;
      }

      next();
    })
    .catch(next);
}

export default authorization;
