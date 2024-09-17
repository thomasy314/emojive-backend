import { NextFunction, Request, Response } from 'express';
import { userValidator } from '../users.schema';

const validUserName = '🦆';
const validLanguages = ['EN'];
const validCountryCode = 'US';

describe('Country Region Validation', () => {
  const response: Response = {} as Response;
  let next: NextFunction;

  beforeEach(() => {
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('GIVEN countryRegion missing THEN no error is thrown', async () => {
    // Setup
    const request: Request = {
      body: {
        userName: validUserName,
        languages: validLanguages,
        countryCode: validCountryCode,
      },
    } as Request;

    // Execute
    await userValidator(request, response, next);

    // Validate
    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith();
  });

  test('GIVEN countryRegion too short THEN userValidator returns countryRegion too short error', async () => {
    // Setup
    const request: Request = {
      body: {
        userName: validUserName,
        languages: validLanguages,
        countryCode: validCountryCode,
        countryRegion: 'E',
      },
    } as Request;

    // Execute
    await userValidator(request, response, next);

    // Validate
    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith({
      status: 400,
      error: new Error('Input Validation Error'),
      json: {
        validationErrors: [
          {
            param: '/countryRegion',
            message: 'must contain exactly 2 characters',
            value: 'E',
          },
        ],
      },
    });
  });

  test('GIVEN countryRegion too long THEN userValidator returns countryRegion too long error', async () => {
    // Setup
    const request: Request = {
      body: {
        userName: validUserName,
        languages: validLanguages,
        countryCode: validCountryCode,
        countryRegion: 'ENU',
      },
    } as Request;

    // Execute
    await userValidator(request, response, next);

    // Validate
    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith({
      status: 400,
      error: new Error('Input Validation Error'),
      json: {
        validationErrors: [
          {
            param: '/countryRegion',
            message: 'must contain exactly 2 characters',
            value: 'ENU',
          },
        ],
      },
    });
  });

  test('GIVEN non-string countryCode THEN userValidator returns type error', async () => {
    // Setup
    const request: Request = {
      body: {
        userName: validUserName,
        languages: validLanguages,
        countryCode: validCountryCode,
        countryRegion: 4,
      },
    } as Request;

    // Execute
    await userValidator(request, response, next);

    // Validate
    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith({
      status: 400,
      error: new Error('Input Validation Error'),
      json: {
        validationErrors: [
          {
            param: '/countryRegion',
            message: 'must be of type String',
            value: 4,
          },
        ],
      },
    });
  });
});
