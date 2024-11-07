import { WebSocket } from 'ws';
import authService from '../../auth/auth.service';
import { givenRandomString } from '../../utils/test-helpers';
import webSocketCloseCode from '../../websocket/websocket-close-codes';
import { ResponseError } from '../errorHandling/error.types';
import websocketAuthorization from './websocket.authorization';

const nonAllowListedUrl = '/non/allow-listed/api';

jest.mock('../../auth/auth.service');

describe('authorization middleware', () => {
  const socket = {} as WebSocket;
  const next = jest.fn();

  const authorizeRequestMock = jest.mocked(authService.authorizeRequest);
  const getAuthTokenMock = jest.mocked(authService.getAuthToken);
  let authToken: string;

  beforeEach(() => {
    authToken = givenRandomString();
  });

  afterEach(() => {
    jest.clearAllMocks();
    authorizeRequestMock.mockReset();
    getAuthTokenMock.mockReset();
  });

  test('GIVEN userUUID THEN authorization calls next function with userUUID added to context', async () => {
    // Setup
    authorizeRequestMock.mockResolvedValueOnce(true);
    getAuthTokenMock.mockReturnValueOnce(authToken);

    const context: object = {
      url: nonAllowListedUrl,
      headers: {
        authorization: `Token ${authToken}`,
      },
    };

    // Execute
    await websocketAuthorization(socket, context, next);

    // Validate
    expect(authorizeRequestMock).toHaveBeenCalledTimes(1);
    expect(authorizeRequestMock).toHaveBeenCalledWith(authToken);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith({
      newContext: { url: nonAllowListedUrl, userUUID: authToken, ...context },
    });
  });

  test('GIVEN unauthorized userUUID THEN next function is called with response error', async () => {
    // Setup
    authorizeRequestMock.mockResolvedValueOnce(false);
    getAuthTokenMock.mockReturnValueOnce(authToken);

    const context: object = {
      url: nonAllowListedUrl,
      headers: {
        authorization: `Token ${authToken}`,
      },
    };

    const nextError: ResponseError = {
      status: webSocketCloseCode.POLICY_VIOLATION,
      error: new Error('Not Authorized'),
    };

    authorizeRequestMock.mockResolvedValueOnce(false);

    // Execute
    await websocketAuthorization(socket, context, next);

    // Validate
    expect(authorizeRequestMock).toHaveBeenCalledTimes(1);
    expect(authorizeRequestMock).toHaveBeenCalledWith(authToken);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(nextError);
  });

  test('GIVEN allowlisted url without userUUID THEN authorization calls next function with userUUID added to context', async () => {
    // Setup
    authorizeRequestMock.mockResolvedValueOnce(true);
    getAuthTokenMock.mockReturnValueOnce(authToken);

    const context: object = {
      url: nonAllowListedUrl,
      headers: {
        authorization: `Token ${authToken}`,
      },
    };

    const confirmRouteAuthNeeded = jest.mocked(
      authService.confirmRouteAuthNeeded
    );
    confirmRouteAuthNeeded.mockReturnValueOnce(false);

    // Execute
    await websocketAuthorization(socket, context, next);

    // Validate
    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith({
      newContext: { url: nonAllowListedUrl, userUUID: authToken, ...context },
    });

    expect(authorizeRequestMock).toHaveBeenCalledTimes(0);
  });

  test('GIVEN auth service called with bad input THEN next function is called with response error', async () => {
    // Setup
    const context: object = {
      url: nonAllowListedUrl,
      headers: {
        authorization: `Token ${authToken}`,
      },
    };

    const noUserFoundResError: ResponseError = {
      status: 401,
      error: Error('User not found'),
    };

    authorizeRequestMock.mockRejectedValueOnce(noUserFoundResError);
    getAuthTokenMock.mockReturnValueOnce(authToken);

    // Execute
    await websocketAuthorization(socket, context, next);

    // Validate
    const expectedError: ResponseError = {
      status: webSocketCloseCode.POLICY_VIOLATION,
      error: Error('User not found'),
    };

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(expectedError);
  });

  test('GIVEN auth service throws internal error THEN next function is called with response error', async () => {
    // Setup
    const context: object = {
      url: nonAllowListedUrl,
      headers: {
        authorization: `Token ${authToken}`,
      },
    };

    const noUserFoundResError: ResponseError = {
      status: 500,
      error: Error('bad thing'),
    };

    authorizeRequestMock.mockRejectedValueOnce(noUserFoundResError);
    getAuthTokenMock.mockReturnValueOnce(authToken);

    // Execute
    await websocketAuthorization(socket, context, next);

    // Validate
    const expectedError: ResponseError = {
      status: webSocketCloseCode.INTERNAL_ERROR,
      error: Error('bad thing'),
    };

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(expectedError);
  });

  test('GIVEN get auth token fails THEN next function is called with response error', async () => {
    // Setup
    const context: object = {
      url: nonAllowListedUrl,
      headers: {
        authorization: `Token ${authToken}`,
      },
    };

    getAuthTokenMock.mockImplementationOnce(() => {
      throw new Error('User not found');
    });

    // Execute
    await websocketAuthorization(socket, context, next);

    // Validate
    const noUserFoundResError: ResponseError = {
      status: webSocketCloseCode.POLICY_VIOLATION,
      error: Error('User not found'),
    };

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(noUserFoundResError);
  });
});
