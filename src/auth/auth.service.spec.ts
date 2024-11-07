import { IncomingHttpHeaders } from 'http';
import { QueryResult } from 'pg';
import { findUserByUUIDQuery } from '../users/db/users.queries';
import { givenDBUser } from '../utils/test-helpers';
import authservice from './auth.service';

jest.mock('../users/db/users.queries');

describe('Auth Service', () => {
  describe('confirmRouteAuthNeeded', () => {
    test('GIVEN api path that needs auth THEN return true', () => {
      // Setup
      const routePath = '/path/needs/auth';

      // Execute
      const authNeeded = authservice.confirmRouteAuthNeeded(routePath);

      // Validate
      expect(authNeeded).toBe(true);
    });

    test("GIVEN api path that DOESN'T need auth THEN return false", () => {
      // Setup
      const routePath = '/user/create';

      // Execute
      const authNeeded = authservice.confirmRouteAuthNeeded(routePath);

      // Validate
      expect(authNeeded).toBe(false);
    });
  });

  describe('authorizeRequest', () => {
    const findUserByUUIDMock = jest.mocked(findUserByUUIDQuery);

    afterEach(() => {
      findUserByUUIDMock.mockReset();
    });

    test('GIVEN valid and authorized UUID THEN return true', () => {
      // Setup
      const user = givenDBUser();

      const queryResult = {
        rows: [user],
      } as QueryResult;

      findUserByUUIDMock.mockResolvedValueOnce(queryResult);

      // Execute
      const requestAuthorized = authservice.authorizeRequest(user.user_uuid);

      // Validate
      requestAuthorized.then(result => expect(result).toBe(true));

      expect(findUserByUUIDMock).toHaveBeenCalledTimes(1);
      expect(findUserByUUIDMock).toHaveBeenCalledWith(user.user_uuid);
    });

    test('GIVEN unknown UUID THEN reject request with 401', () => {
      // Setup
      const user = givenDBUser();

      const queryResult = {
        rowCount: 0,
      } as unknown as QueryResult;

      findUserByUUIDMock.mockResolvedValueOnce(queryResult);

      // Execute
      const requestAuthorized = authservice.authorizeRequest(user.user_uuid);

      // Validate
      requestAuthorized.catch(result =>
        expect(result).toStrictEqual({
          status: 401,
          error: Error('Not Authorized'),
        })
      );

      expect(findUserByUUIDMock).toHaveBeenCalledTimes(1);
      expect(findUserByUUIDMock).toHaveBeenCalledWith(user.user_uuid);
    });

    test('GIVEN UUID with multiple matches THEN reject request with 500', () => {
      // Setup
      const user = givenDBUser();

      const queryResult = {
        rows: [user, user],
      } as unknown as QueryResult;

      findUserByUUIDMock.mockResolvedValueOnce(queryResult);

      // Execute
      const requestAuthorized = authservice.authorizeRequest(user.user_uuid);

      // Validate
      requestAuthorized.catch(result =>
        expect(result).toStrictEqual({
          status: 500,
          error: Error('Too many users found for user UUID: ' + user.user_uuid),
        })
      );

      expect(findUserByUUIDMock).toHaveBeenCalledTimes(1);
      expect(findUserByUUIDMock).toHaveBeenCalledWith(user.user_uuid);
    });

    test('GIVEN findUserByUUID fails THEN reject request with 500', () => {
      // Setup
      const user = givenDBUser();

      const dbError = new Error('the server exploded');

      findUserByUUIDMock.mockRejectedValueOnce(dbError);

      // Execute
      const requestAuthorized = authservice.authorizeRequest(user.user_uuid);

      // Validate
      requestAuthorized.catch(result =>
        expect(result).toStrictEqual({
          status: 500,
          error: dbError,
        })
      );

      expect(findUserByUUIDMock).toHaveBeenCalledTimes(1);
      expect(findUserByUUIDMock).toHaveBeenCalledWith(user.user_uuid);
    });
  });

  describe('getAuthToken', () => {
    test('GIVEN valid authorization header THEN return token', () => {
      // Setup
      const headers = {
        authorization: 'Token validAuthToken',
      };

      // Execute
      const authToken = authservice.getAuthToken(headers);

      // Validate
      expect(authToken).toBe('validAuthToken');
    });

    test('GIVEN missing authorization header THEN throw error', () => {
      // Setup
      const headers = {};

      // Execute & Validate
      expect(() =>
        authservice.getAuthToken(headers as IncomingHttpHeaders)
      ).toThrow('Not Authorized');
    });

    test('GIVEN incorrect authorization type THEN throw error', () => {
      // Setup
      const headers = {
        authorization: 'Bearer invalidAuthToken',
      };

      // Execute & Validate
      expect(() =>
        authservice.getAuthToken(headers as IncomingHttpHeaders)
      ).toThrow('Incorrect Authorization Type');
    });

    test('GIVEN malformed authorization header THEN throw error', () => {
      // Setup
      const headers = {
        authorization: 'Token',
      };

      // Execute & Validate
      expect(() =>
        authservice.getAuthToken(headers as IncomingHttpHeaders)
      ).toThrow('Invalid Token');
    });
  });
});
