import { query } from '../../db/postgres';
import {
  createUserQuery,
  findUserByIDQuery,
  findUserByUUIDQuery,
  linkUserToLanguageQuery,
} from './users.queries';

jest.mock('../../db/postgres');

const userName: string = '😊';
const countryCode: string = 'US';
const countryRegion: string = 'CA';
const userUUID = '550e8400-e29b-41d4-a716-446655440000';
const userID = '1';

describe('User Queries', () => {
  describe('createUserQuery', () => {
    test('GIVEN valid input THEN query is called with the proper input', async () => {
      // Setup

      const queryMock = jest.mocked(query);

      // Execute
      await createUserQuery(userName, countryCode, countryRegion);

      // Validate
      expect(queryMock).toHaveBeenCalledTimes(1);
      expect(queryMock).toHaveBeenCalledWith(
        'INSERT INTO users(user_name, country, country_region) VALUES($1, $2, $3) RETURNING *',
        [userName, countryCode, countryRegion]
      );
    });
  });

  describe('findUserByUUID', () => {
    test('GIVEN valid input THEN query is called with the proper input', async () => {
      // Setup
      const queryMock = jest.mocked(query);

      // Execute
      await findUserByUUIDQuery(userUUID);

      // Validate
      expect(queryMock).toHaveBeenCalledTimes(1);
      expect(queryMock).toHaveBeenCalledWith(
        "SELECT users.*, ARRAY_AGG(language_code || COALESCE('-' || region_code, '')) language_tags FROM users LEFT JOIN users_languages USING (user_id) LEFT JOIN languages USING (language_id) WHERE user_uuid = $1 GROUP BY users.user_id",
        [userUUID]
      );
    });
  });

  describe('findUserByID', () => {
    test('GIVEN valid input THEN query is called with the proper input', async () => {
      // Setup
      const queryMock = jest.mocked(query);

      // Execute
      await findUserByIDQuery(userID);

      // Validate
      expect(queryMock).toHaveBeenCalledTimes(1);
      expect(queryMock).toHaveBeenCalledWith(
        "SELECT users.*, ARRAY_AGG(language_code || COALESCE('-' || region_code, '')) language_tags FROM users LEFT JOIN users_languages USING (user_id) LEFT JOIN languages USING (language_id) WHERE user_id = $1 GROUP BY users.user_id",
        [userID]
      );
    });
  });

  describe('linkUserToLanguageQuery', () => {
    const languageIDs: string[] = ['10', '11', '12'];

    test('GIVEN valid input THEN linkUserToLanguageQuery returns new user UUID', async () => {
      // Setup
      const queryMock = jest.mocked(query);

      // Execute
      await linkUserToLanguageQuery(userID, languageIDs);

      // Validate

      expect(queryMock).toHaveBeenCalledTimes(1);
      expect(queryMock).toHaveBeenCalledWith(
        'INSERT INTO users_languages(user_id, language_id) SELECT * FROM UNNEST ($1::int[], $2::int[])',
        [[userID, userID, userID], languageIDs]
      );
    });
  });
});
