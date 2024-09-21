import { NextFunction, Request, Response } from 'express';
import { ResponseError } from './error.types';

function errorHandler(
  err: ResponseError | Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) {
  if (err instanceof Error) {
    err = {
      status: 500,
      error: err,
    };
  }

  if (err.status === 500) {
    console.error(err.error.stack);
  }

  if (err.error.message === '') {
    console.warn('Unknown error occurred: ', err.error.stack);
    err.error.message = 'Unknown Error';
  }

  const externalMessage =
    err.status === 500 ? 'Internal Server Error' : err.error.message;
  return res.status(err.status).json({ error: externalMessage, ...err.json });
}

export default errorHandler;
