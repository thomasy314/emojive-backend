import { NextFunction, Request, Response } from 'express';
import { userValidator } from '../users.validator';

const validUserName = '🦆';
const validLanguages = ['EN'];
const validCountryCode = 'US';
const validCountryRegion = 'CA';

describe('Users Validator', () => {
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

  test('GIVEN valid user json THEN userValidator calls next function', async () => {
    // Setup
    const request: Request = {
      body: {
        userName: validUserName,
        languages: validLanguages,
        countryCode: validCountryCode,
        countryRegion: validCountryRegion,
      },
    } as Request;

    // Execute
    await userValidator(request, response, next);

    // Validate
    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith();

    expect(response.status).toHaveBeenCalledTimes(0);
    expect(response.json).toHaveBeenCalledTimes(0);
  });
});
