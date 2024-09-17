import { NextFunction, Request, Response } from 'express';
import { ResponseError } from './error.types';

function responseErrorHandler(
  err: ResponseError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) {
  if (err.status === 500) {
    console.error(err.error.stack);
  }
  const externalMessage =
    err.status === 500 ? 'Internal Server Error' : err.error.message;
  return res.status(err.status).json({ error: externalMessage, ...err.json });
}

export default responseErrorHandler;
