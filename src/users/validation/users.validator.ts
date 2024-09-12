import { NextFunction, Request, Response } from 'express';
import { parseErrors } from '../../middleware/validation/ajvErrors';
import { validateUser } from './users.schema';

const userValidator = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | null> => {
  const isValid = validateUser(req.body);
  if (!isValid && validateUser.errors) {
    // If schema validation failed and error occurred return with formatted error message
    const error = await parseErrors(validateUser.errors);
    return res.status(400).json({ status: 'errors', code: 400, errors: error });
  }
  next(); // If no error occurred proceed further
  return null;
};

export default userValidator;
