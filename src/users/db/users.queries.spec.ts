import { Pool } from 'pg';
import { createUserQuery, findUserByUUID } from './users.queries';

jest.mock('pg', () => {
  const mPool = {
    query: jest.fn(),
  };
  return { Pool: jest.fn(() => mPool) };
});

const userName: string = '😊';
const countryCode: string = 'US';
const countryRegion: string = 'CA';

describe('User Queries', () => {
  let mockedPool: jest.MockedObject<Pool>;

  beforeEach(() => {
    mockedPool = jest.mocked(new Pool());
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createUserQuery', () => {
    test('GIVEN valid input THEN createUserQuery returns new user UUID', () => {
      // Setup
      const userUUID = '550e8400-e29b-41d4-a716-446655440000';

      mockedPool.query.mockImplementationOnce(
        (
          _,
          [userNameDbInput, countryCodeDbInput, countryRegionDbInput]: [
            string,
            string,
            string,
          ]
        ) => {
          return Promise.resolve({
            rows: [
              {
                userName: userNameDbInput,
                countryCode: countryCodeDbInput,
                countryRegion: countryRegionDbInput,
                userUUID,
              },
            ],
          });
        }
      );

      // Execute
      const createUserPromise = createUserQuery(
        userName,
        countryCode,
        countryRegion
      );

      // Validate
      createUserPromise.then(finalResponse => {
        expect(finalResponse).toStrictEqual({
          rows: [
            {
              userName,
              countryCode,
              countryRegion,
              userUUID,
            },
          ],
        });
      });
    });
  });

  describe('findUserByUUID', () => {
    test('GIVEN valid input THEN findUserByUUID returns user', () => {
      // Setup
      const userUUID = '550e8400-e29b-41d4-a716-446655440000';

      mockedPool.query.mockImplementationOnce(
        (_, [userUUID]: [string, string, string]) => {
          return Promise.resolve({
            rows: [
              {
                userUUID,
              },
            ],
          });
        }
      );

      // Execute
      const findUserByUUIDResponse = findUserByUUID(userUUID);

      // Validate
      findUserByUUIDResponse.then(finalResponse => {
        expect(finalResponse).toStrictEqual({
          rows: [
            {
              userUUID,
            },
          ],
        });
      });
    });
  });
});
