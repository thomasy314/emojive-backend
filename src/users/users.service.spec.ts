import { QueryResult } from 'pg';
import { transaction } from '../db/postgres';
import { LanguageTag } from '../languages/languages.types';
import { givenDBUser } from '../utils/test-helpers';
import { findUserByIDQuery, linkUserToLanguageQuery } from './db/users.queries';
import userService from './users.service';

jest.mock('./db/users.queries');

jest.mock('../db/postgres');

const validUserName = '🦆';
const validLanguages: LanguageTag[] = [
  {
    languageCode: 'en',
    regionCode: '',
  },
];
const validCountryCode = 'US';
const validCountryRegion = 'CA';

describe('Users Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Create User', () => {
    test('GIVEN expected user input THEN new user object is returned without user id', async () => {
      // Setup

      const userResult = givenDBUser();
      // Need to copy since createUser deletes id, hiding it from the user
      const userId = userResult.user_id;
      const languageResult = {
        language_id: 1,
      };

      const createUserQueryResult = {
        rows: [userResult],
      } as QueryResult;
      const createLanguageQueryResult = {
        rows: [languageResult],
      } as QueryResult;

      const transactionMock = jest.mocked(transaction);
      transactionMock.mockResolvedValueOnce([
        createUserQueryResult,
        createLanguageQueryResult,
      ]);

      const linkUserToLanguageQueryMock = jest.mocked(linkUserToLanguageQuery);

      const findUserByIDQueryMock = jest.mocked(findUserByIDQuery);
      findUserByIDQueryMock.mockResolvedValueOnce(createUserQueryResult);

      // Execute
      const result = await userService().createUser(
        validUserName,
        validLanguages,
        validCountryCode,
        validCountryRegion
      );

      // Validate
      expect(result).toStrictEqual({
        userUUID: userResult.user_uuid,
        userName: userResult.user_name,
        country: userResult.country,
        countryRegion: userResult.country_region,
        languages: userResult.language_tags,
      });

      expect(transactionMock).toHaveBeenCalledTimes(1);
      expect(transactionMock).toHaveBeenCalledWith([
        expect.any(Function),
        expect.any(Function),
      ]);

      expect(linkUserToLanguageQueryMock).toHaveBeenCalledTimes(1);
      expect(linkUserToLanguageQueryMock).toHaveBeenCalledWith(userId, [1]);

      expect(findUserByIDQueryMock).toHaveBeenCalledTimes(1);
      expect(findUserByIDQueryMock).toHaveBeenCalledWith(userId);
    });

    test('GIVEN the create user transaction fails THEN error is thrown', () => {
      // Setup

      const transactionMock = jest.mocked(transaction);
      transactionMock.mockRejectedValueOnce('Evil');

      const linkUserToLanguageQueryMock = jest.mocked(linkUserToLanguageQuery);

      // Execute
      const resultPromise = userService().createUser(
        validUserName,
        validLanguages,
        validCountryCode,
        validCountryRegion
      );

      // Validate
      expect(resultPromise).rejects.toBe('Evil');

      expect(transactionMock).toHaveBeenCalledTimes(1);
      expect(transactionMock).toHaveBeenCalledWith([
        expect.any(Function),
        expect.any(Function),
      ]);

      expect(linkUserToLanguageQueryMock).toHaveBeenCalledTimes(0);
    });
  });
});
