import { WebSocket } from 'ws';
import { givenRandomError } from '../utils/test-helpers';
import websocketErrorHandler from './websocket-error-handler';
import websocketMiddlewareHandler from './websocket-middleware-handler';

jest.mock('./websocket-error-handler');

describe('WebSocket Middleware Handler', () => {
  const websocketErrorHandlerMock = jest.mocked(websocketErrorHandler);

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('GIVEN multiple middleware THEN they are called in correct order', () => {
    // Setup
    const middleware1 = jest.fn((socket, context, next) => next());
    const middleware2 = jest.fn();

    const middlewareHandler = websocketMiddlewareHandler(
      middleware1,
      middleware2
    );

    const socket = {} as WebSocket;
    const context: string[] = [];

    // Execute
    middlewareHandler.handle(socket, context);

    // Validate
    const middleware1CallOrder = middleware1.mock.invocationCallOrder[0];
    const middleware2CallOrder = middleware2.mock.invocationCallOrder[0];
    expect(middleware1CallOrder).toBeLessThan(middleware2CallOrder);

    expect(websocketErrorHandlerMock).toHaveBeenCalledTimes(0);
  });

  test('GIVEN middleware added with push THEN they are called in correct order', () => {
    // Setup
    const middleware1 = jest.fn((socket, context, next) => next());
    const middleware2 = jest.fn();

    const middlewareHandler = websocketMiddlewareHandler(middleware1);

    middlewareHandler.push(middleware2);

    const socket = {} as WebSocket;
    const context: string[] = [];

    // Execute
    middlewareHandler.handle(socket, context);

    // Validate
    const middleware1CallOrder = middleware1.mock.invocationCallOrder[0];
    const middleware2CallOrder = middleware2.mock.invocationCallOrder[0];
    expect(middleware1CallOrder).toBeLessThan(middleware2CallOrder);

    expect(websocketErrorHandlerMock).toHaveBeenCalledTimes(0);
  });

  test('GIVEN next function called multiple times THEN error handler called', () => {
    // Setup
    const middleware1 = jest.fn((socket, context, next) => {
      next();
      next();
    });

    const middlewareHandler = websocketMiddlewareHandler(middleware1);

    const socket = {} as WebSocket;
    const context: string[] = [];

    const expectedError = new Error('next() called multiple times');

    // Execute
    middlewareHandler.handle(socket, context);

    // Validate
    expect(websocketErrorHandlerMock).toHaveBeenCalledTimes(1);
    expect(websocketErrorHandlerMock).toHaveBeenCalledWith(
      expectedError,
      socket
    );
  });

  test('GIVEN multiple middleware THEN updated context is passed on', () => {
    // Setup
    const contextStart: string[] = [];
    const contextEnd: string[] = [];

    const middleware1 = jest.fn((socket, context, next) =>
      next({ context: contextEnd })
    );
    const middleware2 = jest.fn();

    const middlewareHandler = websocketMiddlewareHandler(
      middleware1,
      middleware2
    );

    const socket = {} as WebSocket;
    socket.close = jest.fn();

    // Execute
    middlewareHandler.handle(socket, contextStart);

    // Validate
    expect(middleware2).toHaveBeenCalledWith(
      socket,
      contextEnd,
      expect.any(Function)
    );

    expect(socket.close).toHaveBeenCalledTimes(0);
  });

  test('GIVEN error passed to next THEN error handler called', () => {
    // Setup

    const error = givenRandomError();
    const middleware1 = jest.fn((socket, context, next) => next({ error }));

    const middlewareHandler = websocketMiddlewareHandler(middleware1);

    const socket = {} as WebSocket;
    socket.close = jest.fn();
    const context: string[] = [];

    // Execute
    middlewareHandler.handle(socket, context);

    // Validate
    expect(websocketErrorHandlerMock).toHaveBeenCalledTimes(1);
    expect(websocketErrorHandlerMock).toHaveBeenCalledWith(error, socket);
  });
});
