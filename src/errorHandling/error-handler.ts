import { ResponseError } from '../middleware/errorHandling/error.types';

function errorHandler(
  internalErrorCode: number,
  err: ResponseError | Error
): ResponseError {
  if (err instanceof Error) {
    err = {
      status: internalErrorCode,
      error: err,
    };
  }

  if (err.status === internalErrorCode) {
    console.error(err.error.stack);
  }

  if (err.error.message === '') {
    console.warn('Unknown error occurred: ', err.error.stack);
    err.error.message = 'Unknown Error';
  }

  err.externalMessage =
    err.status === internalErrorCode
      ? 'Internal Server Error'
      : err.error.message;

  return err;
}

export default errorHandler;
