import { WebSocket } from 'ws';
import errorHandler from '../errorHandling/error-handler';
import { givenRandomResponseError } from '../utils/test-helpers';
import webSocketCloseCode from './websocket-close-codes';
import websocketErrorHandler from './websocket-error-handler';

jest.mock('../errorHandling/error-handler');

describe('Express Error Handler', () => {
  const responseError = givenRandomResponseError(
    webSocketCloseCode.INTERNAL_ERROR
  );
  const errorHandlerMock = jest.mocked(errorHandler);

  beforeEach(() => {
    errorHandlerMock.mockReturnValueOnce(responseError);
  });

  test('GIVEN thrown error and websocket still open THEN error is sent to client', () => {
    // Setup
    const socket = {
      readyState: WebSocket.OPEN,
    } as WebSocket;
    socket.send = jest.fn();
    socket.close = jest.fn();

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

  test('GIVEN thrown error and websocket closed THEN error is sent to client', () => {
    // Setup
    const socket = {
      readyState: WebSocket.CLOSED,
    } as WebSocket;

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    // Execute
    websocketErrorHandler(responseError, socket);

    // Validate
    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Socket is unable to receive error: ' +
        JSON.stringify({
          status: responseError.status,
          error: responseError.externalMessage,
          ...responseError.json,
        })
    );
  });
});
