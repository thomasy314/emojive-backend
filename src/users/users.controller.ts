import { RequestHandler } from 'express';
import languagesService from '../languages/languages.service';
import { LanguageTag } from '../languages/languages.types';
import userService from './users.service';

function userController() {
  const createUser: RequestHandler = (req, res, next): Promise<void> => {
    const { userName, languages, countryCode, countryRegion } = req.body;

    const languageTags: LanguageTag[] = languages.map(
      languagesService().languageTagToLanguageTagObj
    );

    return userService()
      .createUser(userName, languageTags, countryCode, countryRegion)
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
