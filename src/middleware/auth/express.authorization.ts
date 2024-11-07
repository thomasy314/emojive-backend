import { NextFunction, Request, Response } from 'express';
import authService from '../../auth/auth.service';
import catchError from '../../utils/catch-error';
import { ResponseError } from '../errorHandling/error.types';

function authorization(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  if (authService.confirmRouteAuthNeeded(req.path) === false) {
    next();
    return Promise.resolve();
  }

  const [error, authToken] = catchError(() =>
    authService.getAuthToken(req.headers)
  );

  if (error || authToken === undefined) {
    const responseErr: ResponseError = {
      status: 401,
      error: error as Error,
    };
    next(responseErr);
    return Promise.resolve();
  }

  return authService
    .authorizeRequest(authToken)
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
