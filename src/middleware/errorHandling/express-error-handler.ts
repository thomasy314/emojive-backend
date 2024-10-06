import { NextFunction, Request, Response } from 'express';
import errorHandler from '../../errorHandling/error-handler';
import { ResponseError } from './error.types';

function expressErrorHandler(
  err: ResponseError | Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) {
  const httpInternalErrorCode = 500;
  const finalResponseError: ResponseError = errorHandler(
    httpInternalErrorCode,
    err
  );

  res.status(finalResponseError.status).json({
    error: finalResponseError.externalMessage,
    ...finalResponseError.json,
  });
  return finalResponseError;
}

export default expressErrorHandler;
