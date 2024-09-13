import { NextFunction, Request, Response } from 'express';
import userController from './users.controller';
import userService from './users.service';

jest.mock('./users.service', () => {
  const userServiceMock = {
    createUser: jest.fn(),
  };
  return jest.fn(() => userServiceMock);
});

const validUserName = '🦆';
const validLanguages = ['EN'];
const validCountryCode = 'US';
const validCountryRegion = 'CA';

describe('Users Controller', () => {
  let response: Response;
  let next: NextFunction;

  beforeEach(() => {
    response = {} as Response;
    response.send = jest.fn();

    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Create User', () => {
    test('GIVEN expected user body THEN userService createUser is called', async () => {
      // Setup
      const request: Request = {
        body: {
          userName: validUserName,
          languages: validLanguages,
          countryCode: validCountryCode,
          countryRegion: validCountryRegion,
        },
      } as Request;

      const mockedCreateUser = jest.mocked(userService().createUser);
      mockedCreateUser.mockResolvedValueOnce({ hello: 'world' });

      // Execute
      await userController().createUser(request, response, next);

      // Validate
      expect(userService().createUser).toHaveBeenCalledTimes(1);
      expect(userService().createUser).toHaveBeenCalledWith(
        validUserName,
        validLanguages,
        validCountryCode,
        validCountryRegion
      );

      expect(response.send).toHaveBeenCalledTimes(1);
      expect(response.send).toHaveBeenCalledWith('{"hello":"world"}');

      expect(next).toHaveBeenCalledTimes(0);
    });
  });

  test('GIVEN userService createUser fails THEN error is passed to next', async () => {
    // Setup
    const request: Request = {
      body: {
        userName: validUserName,
        languages: validLanguages,
        countryCode: validCountryCode,
        countryRegion: validCountryRegion,
      },
    } as Request;

    const mockedCreateUser = jest.mocked(userService().createUser);
    mockedCreateUser.mockRejectedValueOnce('Evil');

    // Execute
    await userController().createUser(request, response, next);

    // Validate
    expect(userService().createUser).toHaveBeenCalledTimes(1);
    expect(userService().createUser).toHaveBeenCalledWith(
      validUserName,
      validLanguages,
      validCountryCode,
      validCountryRegion
    );

    expect(response.send).toHaveBeenCalledTimes(0);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith('Evil');
  });
});