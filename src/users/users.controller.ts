import { RequestHandler } from 'express';
import userService from './users.service';

function userController() {
  const createUser: RequestHandler = (req, res, next): Promise<void> => {
    const { userName, languages, countryCode, countryRegion } = req.body;

    return userService()
      .createUser(userName, languages, countryCode, countryRegion)
      .then(result => {
        res.send(JSON.stringify(result));
      })
      .catch(next);
  };

  return {
    createUser,
  };
}

export default userController;
