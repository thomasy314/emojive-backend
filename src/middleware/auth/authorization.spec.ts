import { NextFunction, Request, Response } from 'express';
import authService from '../../auth/auth.service';
import {
  givenInvalidUUID,
  givenRandomInt,
  givenValidUUID,
} from '../../utils/test-helpers';
import { ResponseError } from '../errorHandling/error.types';
import authorization from './authorization';

const nonAllowListedUrl = '/non/allow-listed/api';

jest.mock('../../auth/auth.service', () => {
  const userServiceMock = {
    confirmRouteAuthNeeded: jest.fn(),
    authorizeRequest: jest.fn(),
  };
  return jest.fn(() => userServiceMock);
});

describe('authorization middleware', () => {
  const response: Response = {} as Response;
  const authorizeRequestMock = jest.mocked(authService().authorizeRequest);
  let next: NextFunction;

  beforeEach(() => {
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
    authorizeRequestMock.mockReset();
  });

  test('GIVEN userUUID THEN authorization calls next function with no input', async () => {
    // Setup
    const validUUID = givenValidUUID();
    const request: Request = {
      originalUrl: nonAllowListedUrl,
      query: {
        userUUID: validUUID,
      },
    } as unknown as Request;

    authorizeRequestMock.mockResolvedValueOnce(true);

    // Execute
    await authorization(request, response, next);

    // Validate
    expect(authorizeRequestMock).toHaveBeenCalledTimes(1);
    expect(authorizeRequestMock).toHaveBeenCalledWith(validUUID);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith();
  });

  test('GIVEN unauthorized userUUID THEN next function is called with response error', async () => {
    // Setup
    const validUUID = givenValidUUID();
    const request: Request = {
      originalUrl: nonAllowListedUrl,
      query: {
        userUUID: validUUID,
      },
    } as unknown as Request;

    const nextError: ResponseError = {
      status: 401,
      error: new Error('Not Authorized'),
    };

    authorizeRequestMock.mockResolvedValueOnce(false);

    // Execute
    await authorization(request, response, next);

    // Validate
    expect(authorizeRequestMock).toHaveBeenCalledTimes(1);
    expect(authorizeRequestMock).toHaveBeenCalledWith(validUUID);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(nextError);
  });

  test('GIVEN allowlisted pathname without userUUID THEN authorization calls next function with no input', async () => {
    // Setup
    const request: Request = {
      originalUrl: '/user/create',
    } as Request;

    authorizeRequestMock.mockResolvedValueOnce(true);

    const confirmRouteAuthNeeded = jest.mocked(
      authService().confirmRouteAuthNeeded
    );
    confirmRouteAuthNeeded.mockReturnValueOnce(false);

    // Execute
    await authorization(request, response, next);

    // Validate
    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith();

    expect(authorizeRequestMock).toHaveBeenCalledTimes(0);
  });

  test('GIVEN non string userUUID THEN next function is called with response error', async () => {
    // Setup

    const request: Request = {
      originalUrl: nonAllowListedUrl,
      query: {
        userUUID: givenRandomInt(),
      },
    } as unknown as Request;

    const nextError: ResponseError = {
      status: 401,
      error: new Error('Not Authorized'),
    };

    // Execute
    await authorization(request, response, next);

    // Validate
    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(nextError);
  });

  test('GIVEN invalid UUID THEN next function is called with response error', async () => {
    // Setup

    const request: Request = {
      originalUrl: nonAllowListedUrl,
      query: {
        userUUID: givenInvalidUUID(),
      },
    } as unknown as Request;

    const nextError: ResponseError = {
      status: 401,
      error: new Error('Not Authorized'),
    };

    // Execute
    await authorization(request, response, next);

    // Validate
    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(nextError);
  });

  test('GIVEN auth service fails THEN next function is called with response error', async () => {
    // Setup
    const request: Request = {
      originalUrl: nonAllowListedUrl,
      query: {
        userUUID: givenValidUUID(),
      },
    } as unknown as Request;

    const noUserFoundResError: ResponseError = {
      status: 401,
      error: Error('User not found'),
    };

    authorizeRequestMock.mockRejectedValueOnce(noUserFoundResError);

    // Execute
    await authorization(request, response, next);

    // Validate
    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(noUserFoundResError);
  });
});
