import { ValidateFunction } from 'ajv';
import { NextFunction, Request, RequestHandler, Response } from 'express';
import { parseErrors } from '../../middleware/validation/ajvErrors';
import { ResponseError } from '../errorHandling/error.types';

function createValidator(validateFunction: ValidateFunction): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction) => {
    const isValid = validateFunction(req.body);
    if (!isValid && validateFunction.errors) {
      // If schema validation failed and error occurred return with formatted error message
      const errors = await parseErrors(validateFunction.errors);
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

export default createValidator;
