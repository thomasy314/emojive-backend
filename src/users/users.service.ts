import { transaction } from '../db';
import { createLanguageQuery } from '../languages/db/languages.queries';
import { LanguageTag } from '../languages/languages.types';
import {
  createUserQuery,
  findUserByIDQuery,
  linkUserToLanguageQuery,
} from './db/users.queries';

function userService() {
  async function createUser(
    userName: string,
    languages: LanguageTag[],
    countryCode: string,
    countryRegion?: string
  ) {
    const createResourcesTransaction = await transaction([
      () => createUserQuery(userName, countryCode, countryRegion),
      () => createLanguageQuery(languages),
    ]);

    const userData = createResourcesTransaction[0].rows[0];
    const languageIds = createResourcesTransaction[1].rows.map(
      lang => lang.language_id
    );

    await linkUserToLanguageQuery(userData.user_id, languageIds);

    const getUserQueryResult = await findUserByIDQuery(userData.user_id);
    const finalUserData = getUserQueryResult.rows[0];

    return {
      userUUID: finalUserData.user_uuid,
      userName: finalUserData.user_name,
      country: finalUserData.country,
      countryRegion: finalUserData.country_region,
      languages: finalUserData.language_tags,
    };
  }

  return {
    createUser,
  };
}

export default userService;
