import { NextFunction, Request, Response } from 'express';

function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) {
  console.error(err.stack);
  return res.status(500).json({ error: 'Internal Server Error' });
}

export default errorHandler;
