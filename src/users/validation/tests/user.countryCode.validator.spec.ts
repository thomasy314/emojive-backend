import { NextFunction, Request, Response } from 'express';
import { userValidator } from '../users.schema';

const validUserName = '🦆';
const validLanguages = ['EN'];
const validCountryRegion = 'CA';

describe('Country Code Validation', () => {
  const response: Response = {} as Response;
  let next: NextFunction;

  beforeEach(() => {
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('GIVEN countryCode missing THEN userValidator returns countryCode missing error', async () => {
    // Setup
    const request: Request = {
      body: {
        userName: validUserName,
        languages: validLanguages,
        countryRegion: validCountryRegion,
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
            param: 'countryCode',
            message: "must have required property 'countryCode'",
            value: 'countryCode',
          },
        ],
      },
    });
  });

  test('GIVEN countryCode is not iso-3166 THEN userValidator returns countryCode too short error', async () => {
    // Setup
    const request: Request = {
      body: {
        userName: validUserName,
        languages: validLanguages,
        countryCode: 'E',
        countryRegion: validCountryRegion,
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
            message: 'must be of format ISO 3166-1 or ISO 3166-2',
            param: '/countryCode',
            value: 'E',
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
        countryCode: 5,
        countryRegion: validCountryRegion,
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
            param: '/countryCode',
            message: 'must be of type String',
            value: 5,
          },
        ],
      },
    });
  });
});
