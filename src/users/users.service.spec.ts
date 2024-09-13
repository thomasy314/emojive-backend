import { QueryResult } from 'pg';
import { createUserQuery } from './db/users.queries';
import userService from './users.service';

jest.mock('./db/users.queries');

const validUserName = '🦆';
const validLanguages = ['EN'];
const validCountryCode = 'US';
const validCountryRegion = 'CA';

describe('Users Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Create User', () => {
    test('GIVEN expected user input THEN new user object is returned without user id', () => {
      // Setup
      const queryResult = {
        rows: [
          {
            user_uuid: '7ab39ec9-612d-4be8-b43c-f84bbea7f8a4',
            user_name: '🦆',
            creation_timestamp: '2024-09-12T23:40:02.679Z',
            last_activity_time: '2024-09-12T23:40:02.679Z',
            country: 'US',
            country_region: 'CO',
          },
        ],
      } as QueryResult;
      const createUserQueryMock = jest.mocked(createUserQuery);
      createUserQueryMock.mockResolvedValueOnce(queryResult);

      // Execute
      const resultPromise = userService().createUser(
        validUserName,
        validLanguages,
        validCountryCode,
        validCountryRegion
      );

      // Validate
      const resolvedValue = queryResult.rows[0];
      delete resolvedValue.user_id;
      expect(resultPromise).resolves.toStrictEqual(resolvedValue);

      expect(createUserQueryMock).toHaveBeenCalledTimes(1);
      expect(createUserQueryMock).toHaveBeenCalledWith(
        validUserName,
        validCountryCode,
        validCountryRegion
      );
    });

    test('GIVEN createUserQuery fails THEN error thrown in promise', () => {
      // Setup
      const createUserQueryMock = jest.mocked(createUserQuery);
      createUserQueryMock.mockRejectedValueOnce('Evil');

      // Execute
      const resultPromise = userService().createUser(
        validUserName,
        validLanguages,
        validCountryCode,
        validCountryRegion
      );

      // Validate
      expect(resultPromise).rejects.toBe('Evil');

      expect(createUserQueryMock).toHaveBeenCalledTimes(1);
      expect(createUserQueryMock).toHaveBeenCalledWith(
        validUserName,
        validCountryCode,
        validCountryRegion
      );
    });
  });
});
