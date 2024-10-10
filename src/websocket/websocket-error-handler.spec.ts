import { WebSocket } from 'ws';
import errorHandler from '../errorHandling/error-handler';
import { givenRandomResponseError } from '../utils/test-helpers';
import webSocketCloseCode from './websocket-close-codes';
import websocketErrorHandler from './websocket-error-handler';

jest.mock('../errorHandling/error-handler');

describe('Express Error Handler', () => {
  test('GIVEN thrown error THEN error is sent to client', () => {
    // Setup
    const socket = {} as WebSocket;
    socket.send = jest.fn();
    socket.close = jest.fn();

    const responseError = givenRandomResponseError(
      webSocketCloseCode.INTERNAL_ERROR
    );

    const errorHandlerMock = jest.mocked(errorHandler);
    errorHandlerMock.mockReturnValueOnce(responseError);

    // Execute
    websocketErrorHandler(responseError, socket);

    // Validate
    expect(socket.send).toHaveBeenCalledTimes(1);
    expect(socket.send).toHaveBeenCalledWith(
      JSON.stringify({
        status: responseError.status,
        error: responseError.externalMessage,
        ...responseError.json,
      })
    );

    expect(socket.close).toHaveBeenCalledTimes(1);
    expect(socket.close).toHaveBeenCalledWith(
      responseError.status,
      'See previous websocket message for details'
    );
  });
});
