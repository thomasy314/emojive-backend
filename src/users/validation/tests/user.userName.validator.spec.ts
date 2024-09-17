import { NextFunction, Request, Response } from 'express';
import { userValidator } from '../users.schema';

const validLanguages = ['EN'];
const validCountryCode = 'US';
const validCountryRegion = 'CA';

describe('User Name Validation', () => {
  const response = {} as Response;
  let next: NextFunction;

  beforeEach(() => {
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('GIVEN non-emoji userName THEN userValidator returns userName missing error', async () => {
    // Setup
    const request: Request = {
      body: {
        userName: 'jim',
        languages: validLanguages,
        countryCode: validCountryCode,
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
            param: '/userName',
            message: 'must be of format Emoji',
            value: 'jim',
          },
        ],
      },
    });
  });

  test('GIVEN userName missing THEN userValidator returns userName missing error', async () => {
    // Setup
    const request: Request = {
      body: {
        languages: validLanguages,
        countryCode: validCountryCode,
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
            param: 'userName',
            message: "must have required property 'userName'",
            value: 'userName',
          },
        ],
      },
    });
  });

  test('GIVEN userName too short THEN userValidator returns userName too short error', async () => {
    // Setup
    const request: Request = {
      body: {
        userName: '',
        languages: validLanguages,
        countryCode: validCountryCode,
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
            param: '/userName',
            message: 'must contain at least 1 character',
            value: '',
          },
        ],
      },
    });
  });

  test('GIVEN userName too long THEN userValidator returns userName too long error', async () => {
    // Setup
    const request: Request = {
      body: {
        // Note: the parking and snowman emojis are 2 characters each
        // https://www.unicode.org/emoji/charts/emoji-zwj-sequences.html
        userName: '📋🚶🅿️⛄️🔪🔦🚋💳📋',
        languages: validLanguages,
        countryCode: validCountryCode,
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
            param: '/userName',
            message:
              'must contain at most 10 characters - note that emojis can be made up of multiple characters',
            value: '📋🚶🅿️⛄️🔪🔦🚋💳📋',
          },
        ],
      },
    });
  });

  test('GIVEN non-string userName THEN userValidator returns type error', async () => {
    // Setup
    const request: Request = {
      body: {
        userName: 2,
        languages: validLanguages,
        countryCode: validCountryCode,
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
            param: '/userName',
            message: 'must be of type String',
            value: 2,
          },
        ],
      },
    });
  });
});
