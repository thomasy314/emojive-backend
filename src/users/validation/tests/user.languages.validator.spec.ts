import { NextFunction, Request, Response } from 'express';
import userValidator from '../users.validator';

const validUserName = '🦆';
const validCountryCode = 'US';
const validCountryRegion = 'CA';

describe('Languages Validation', () => {
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

  test('GIVEN languages missing THEN userValidator returns languages missing error', async () => {
    // Setup
    const request: Request = {
      body: {
        userName: validUserName,
        countryCode: validCountryCode,
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
          param: 'languages',
          message: "must have required property 'languages'",
          value: 'languages',
        },
      ],
    });
  });

  test('GIVEN languages too short THEN userValidator returns languages too short error', async () => {
    // Setup
    const request: Request = {
      body: {
        userName: validUserName,
        languages: [],
        countryCode: validCountryCode,
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
          param: '/languages',
          message: 'must NOT have fewer than 1 items',
          value: [],
        },
      ],
    });
  });

  test('GIVEN languages too long THEN userValidator returns languages too long error', async () => {
    // Setup
    const tooLongLanguages = new Array(11).fill('hello');

    const request: Request = {
      body: {
        userName: validUserName,
        languages: tooLongLanguages,
        countryCode: validCountryCode,
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
          param: '/languages',
          message: 'must NOT have more than 10 items',
          value: tooLongLanguages,
        },
      ],
    });
  });

  test('GIVEN non-array languages THEN userValidator returns type error', async () => {
    // Setup
    const request: Request = {
      body: {
        userName: validUserName,
        languages: 7,
        countryCode: validCountryCode,
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
          param: '/languages',
          message: 'must be of type String[]',
          value: 7,
        },
      ],
    });
  });

  test('GIVEN languages array with non-strings THEN userValidator returns type error', async () => {
    // Setup
    const request: Request = {
      body: {
        userName: validUserName,
        languages: ['hello', 7, 'world', 8],
        countryCode: validCountryCode,
        countryRegion: validCountryRegion,
      },
    } as Request;

    const response = {} as Response;
    response.json = jest.fn();
    response.status = jest.fn(() => response);

    const next = jest.fn();

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
          param: '/languages/1',
          message: 'must be string',
          value: 7,
        },
        {
          param: '/languages/3',
          message: 'must be string',
          value: 8,
        },
      ],
    });
  });
});
