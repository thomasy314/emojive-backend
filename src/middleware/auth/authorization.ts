import { NextFunction, Request, Response } from 'express';
import { findUserByUUID } from '../../users/db/users.queries';
import { validateAuthorization } from './authorization.schema';

function authorization(req: Request, res: Response, next: NextFunction) {
  if (typeof req.query.userUUID !== 'string') {
    return res.sendStatus(401);
  }

  const isValid = validateAuthorization(req.query);
  if (!isValid) {
    return res.sendStatus(401);
  }

  const userUUID: string = req.query.userUUID;

  return findUserByUUID(userUUID)
    .then(result => {
      if (result.rows.length !== 1) return res.sendStatus(401);
      next();
    })
    .catch(error => {
      console.error(error);
      res.sendStatus(500);
    });
}

export default authorization;
