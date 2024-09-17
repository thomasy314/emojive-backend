import { NextFunction, Request, Response } from 'express';
import authService from '../../auth/auth.service';
import { getPathName } from '../../utils/request-url-helpers';
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
  const pathName = getPathName(req.originalUrl);

  if (authService().confirmRouteAuthNeeded(pathName) === false) {
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
    .catch(error => {
      console.log('HERE');
      console.log(error);
      next(error);
    });
}

export default authorization;
