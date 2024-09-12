import { RequestHandler } from 'express';
import userService from './users.service';

function userController() {
  const createUser: RequestHandler = (req, res, next) => {
    const { user_name, languages, country_code, country_region } = req.body;

    console.log('creating user');

    userService()
      .createUser(user_name, languages, country_code, country_region)
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
