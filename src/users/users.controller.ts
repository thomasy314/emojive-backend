import { RequestHandler } from 'express';
import languagesService from '../languages/languages.service';
import { LanguageTag } from '../languages/languages.types';
import userService from './users.service';

function userController() {
  const createUser: RequestHandler = (
    request,
    response,
    next
  ): Promise<void> => {
    const { userName, languages, countryCode, countryRegion } = request.body;

    const languageTags: LanguageTag[] = languages.map(
      languagesService().languageTagToLanguageTagObj
    );

    return userService()
      .createUser(userName, languageTags, countryCode, countryRegion)
      .then(result => {
        response.send(result);
      })
      .catch(next);
  };

  return {
    createUser,
  };
}

export default userController;
