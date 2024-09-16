import { ValidateFunction } from 'ajv';
import { NextFunction, Request, RequestHandler, Response } from 'express';
import { parseErrors } from '../../middleware/validation/ajvErrors';

function createValidator(validateFunction: ValidateFunction): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction) => {
    const isValid = validateFunction(req.body);
    if (!isValid && validateFunction.errors) {
      // If schema validation failed and error occurred return with formatted error message
      const error = await parseErrors(validateFunction.errors);
      return res
        .status(400)
        .json({ status: 'errors', code: 400, errors: error });
    }
    next(); // If no error occurred proceed further
    return null;
  };
}

export default createValidator;
