import { QueryResult } from 'pg';
import { query } from '../../db';

function createUserQuery(
  userName: string,
  countryCode: string,
  countryRegion?: string
): Promise<QueryResult> {
  const queryText: string =
    'INSERT INTO users(user_name, country, country_region) VALUES($1, $2, $3) RETURNING *';
  const values: unknown[] = [userName, countryCode, countryRegion];

  return query(queryText, values);
}

function findUserByUUIDQuery(userUUID: string): Promise<QueryResult> {
  const queryText: string =
    "SELECT users.*, ARRAY_AGG(language_code || COALESCE('-' || region_code, '')) language_tags FROM users LEFT JOIN users_languages USING (user_id) LEFT JOIN languages USING (language_id) WHERE user_uuid = $1 GROUP BY users.user_id";
  const values: string[] = [userUUID];

  return query(queryText, values);
}

function findUserByIDQuery(userUUID: string) {
  const queryText: string =
    "SELECT users.*, ARRAY_AGG(language_code || COALESCE('-' || region_code, '')) language_tags FROM users LEFT JOIN users_languages USING (user_id) LEFT JOIN languages USING (language_id) WHERE user_id = $1 GROUP BY users.user_id";

  return query(queryText, [userUUID]);
}

function linkUserToLanguageQuery(
  userId: string,
  languageIds: string[]
): Promise<QueryResult> {
  const queryText =
    'INSERT INTO users_languages(user_id, language_id) SELECT * FROM UNNEST ($1::int[], $2::int[])';

  const userIdArray = new Array(languageIds.length).fill(userId);

  return query(queryText, [userIdArray, languageIds]);
}

export {
  createUserQuery,
  findUserByIDQuery,
  findUserByUUIDQuery,
  linkUserToLanguageQuery,
};
