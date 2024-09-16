import { NextFunction, Request, Response } from 'express';
import { userValidator } from '../users.validator';

const validUserName = '🦆';
const validLanguages = ['EN'];
const validCountryRegion = 'CA';

describe('Country Code Validation', () => {
  let response: Response;
  let next: NextFunction;

  beforeEach(() => {
    response = {} as Response;
    response.json = jest.fn();
    response.status = jest.fn(() => response);

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
    expect(next).toHaveBeenCalledTimes(0);

    expect(response.status).toHaveBeenCalledTimes(1);
    expect(response.status).toHaveBeenCalledWith(400);

    expect(response.json).toHaveBeenCalledTimes(1);
    expect(response.json).toHaveBeenCalledWith({
      status: 'errors',
      code: 400,
      errors: [
        {
          param: 'countryCode',
          message: "must have required property 'countryCode'",
          value: 'countryCode',
        },
      ],
    });
  });

  test('GIVEN countryCode too short THEN userValidator returns countryCode too short error', async () => {
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
    expect(next).toHaveBeenCalledTimes(0);

    expect(response.status).toHaveBeenCalledTimes(1);
    expect(response.status).toHaveBeenCalledWith(400);

    expect(response.json).toHaveBeenCalledTimes(1);
    expect(response.json).toHaveBeenCalledWith({
      status: 'errors',
      code: 400,
      errors: [
        {
          param: '/countryCode',
          message: 'must contain exactly 2 characters',
          value: 'E',
        },
      ],
    });
  });

  test('GIVEN countryCode too long THEN userValidator returns countryCode too long error', async () => {
    // Setup
    const request: Request = {
      body: {
        userName: validUserName,
        languages: validLanguages,
        countryCode: 'ENU',
        countryRegion: validCountryRegion,
      },
    } as Request;

    // Execute
    await userValidator(request, response, next);

    // Validate
    expect(next).toHaveBeenCalledTimes(0);

    expect(response.status).toHaveBeenCalledTimes(1);
    expect(response.status).toHaveBeenCalledWith(400);

    expect(response.json).toHaveBeenCalledTimes(1);
    expect(response.json).toHaveBeenCalledWith({
      status: 'errors',
      code: 400,
      errors: [
        {
          param: '/countryCode',
          message: 'must contain exactly 2 characters',
          value: 'ENU',
        },
      ],
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
    expect(next).toHaveBeenCalledTimes(0);

    expect(response.status).toHaveBeenCalledTimes(1);
    expect(response.status).toHaveBeenCalledWith(400);

    expect(response.json).toHaveBeenCalledTimes(1);
    expect(response.json).toHaveBeenCalledWith({
      status: 'errors',
      code: 400,
      errors: [
        {
          param: '/countryCode',
          message: 'must be of type String',
          value: 5,
        },
      ],
    });
  });
});
