import { NextFunction, Request, Response } from 'express';
import authService from '../../auth/auth.service';
import { givenRandomString, givenValidUUID } from '../../utils/test-helpers';
import { ResponseError } from '../errorHandling/error.types';
import authorization from './express.authorization';

const nonAllowListedUrl = '/non/allow-listed/api';

jest.mock('../../auth/auth.service');

describe('authorization middleware', () => {
  const response: Response = {} as Response;
  const authorizeRequestMock = jest.mocked(authService.authorizeRequest);
  const getAuthTokenMock = jest.mocked(authService.getAuthToken);
  let next: NextFunction;
  let authToken: string;

  beforeEach(() => {
    next = jest.fn();

    authToken = givenRandomString();
  });

  afterEach(() => {
    jest.clearAllMocks();
    authorizeRequestMock.mockReset();
    getAuthTokenMock.mockReset();
  });

  test('GIVEN userUUID THEN authorization calls next function with no input', async () => {
    // Setup
    const request: Request = {
      path: nonAllowListedUrl,
    } as unknown as Request;

    authorizeRequestMock.mockResolvedValueOnce(true);
    getAuthTokenMock.mockReturnValueOnce(authToken);

    // Execute
    await authorization(request, response, next);

    // Validate
    expect(authorizeRequestMock).toHaveBeenCalledTimes(1);
    expect(authorizeRequestMock).toHaveBeenCalledWith(authToken);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith();
  });

  test('GIVEN unauthorized userUUID THEN next function is called with response error', async () => {
    // Setup
    const request: Request = {
      path: nonAllowListedUrl,
    } as unknown as Request;

    const nextError: ResponseError = {
      status: 401,
      error: new Error('Not Authorized'),
    };

    authorizeRequestMock.mockResolvedValueOnce(false);
    getAuthTokenMock.mockReturnValueOnce(authToken);

    // Execute
    await authorization(request, response, next);

    // Validate
    expect(authorizeRequestMock).toHaveBeenCalledTimes(1);
    expect(authorizeRequestMock).toHaveBeenCalledWith(authToken);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(nextError);
  });

  test('GIVEN allowlisted pathname without userUUID THEN authorization calls next function with no input', async () => {
    // Setup
    const request: Request = {
      path: '/user/create',
    } as Request;

    authorizeRequestMock.mockResolvedValueOnce(true);
    getAuthTokenMock.mockReturnValueOnce(authToken);

    const confirmRouteAuthNeeded = jest.mocked(
      authService.confirmRouteAuthNeeded
    );
    confirmRouteAuthNeeded.mockReturnValueOnce(false);

    // Execute
    await authorization(request, response, next);

    // Validate
    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith();

    expect(authorizeRequestMock).toHaveBeenCalledTimes(0);
  });

  test('GIVEN auth service fails THEN next function is called with response error', async () => {
    // Setup
    const request: Request = {
      path: nonAllowListedUrl,
      query: {
        userUUID: givenValidUUID(),
      },
    } as unknown as Request;

    const noUserFoundResError: ResponseError = {
      status: 401,
      error: Error('User not found'),
    };

    authorizeRequestMock.mockRejectedValueOnce(noUserFoundResError);
    getAuthTokenMock.mockReturnValueOnce(authToken);

    // Execute
    await authorization(request, response, next);

    // Validate
    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(noUserFoundResError);
  });

  test('GIVEN get auth token fails THEN next function is called with response error', async () => {
    // Setup
    const request: Request = {
      path: nonAllowListedUrl,
      query: {
        userUUID: givenValidUUID(),
      },
    } as unknown as Request;

    getAuthTokenMock.mockImplementationOnce(() => {
      throw new Error('User not found');
    });

    // Execute
    await authorization(request, response, next);

    // Validate
    const noUserFoundResError: ResponseError = {
      status: 401,
      error: Error('User not found'),
    };

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(noUserFoundResError);
  });
});
