import { ValidateFunction } from 'ajv';
import { NextFunction, Request, RequestHandler, Response } from 'express';
import { ResponseError } from '../errorHandling/error.types';
import { parseErrors } from './ajv-errors';

function createExpressValidator(
  validateFunction: ValidateFunction
): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction) => {
    const input = req.method === 'GET' ? req.query : req.body;
    const isValid = validateFunction(input);
    if (!isValid && validateFunction.errors) {
      // If schema validation failed and error occurred return with formatted error message
      const errors = parseErrors(validateFunction.errors);
      const responseError: ResponseError = {
        status: 400,
        error: new Error('Input Validation Error'),
        json: { validationErrors: errors },
      };
      next(responseError);
      return;
    }

    next(); // If no error occurred proceed further
    return;
  };
}

export default createExpressValidator;
