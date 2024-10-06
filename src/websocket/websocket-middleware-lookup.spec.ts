import { givenRandomString } from '../utils/test-helpers';
import websocketMiddlewareHandler from './websocket-middleware-handler';
import websocketMiddlewareLookup from './websocket-middleware-lookup';

jest.mock('./websocket-middleware-handler');

describe('WebSocket Middleware Lookup', () => {
  test('GIVEN a path, event, and handler THEN handler is added to lookup', () => {
    // Setup
    const path = givenRandomString();
    const event = givenRandomString();
    const handlerFunction = jest.fn();

    const handler = {
      push: jest.fn(),
      handle: jest.fn(),
    };
    const middlewareHandlerMock = jest.mocked(websocketMiddlewareHandler);
    middlewareHandlerMock.mockReturnValue(handler);

    const middlewareLookup = websocketMiddlewareLookup();

    // Add handler
    middlewareLookup.add(path, event, handlerFunction);

    // Get handler
    const returnedHandler = middlewareLookup.get(path, event);

    // Validate
    expect(websocketMiddlewareHandler).toHaveBeenCalledTimes(1);

    expect(returnedHandler).toBe(handler);
  });

  test('GIVEN a path, event not in lookup THEN empty handler is returned', () => {
    // Setup
    const path = givenRandomString();
    const event = givenRandomString();

    const handler = {
      push: jest.fn(),
      handle: jest.fn(),
    };
    const middlewareHandlerMock = jest.mocked(websocketMiddlewareHandler);
    middlewareHandlerMock.mockReturnValue(handler);

    const middlewareLookup = websocketMiddlewareLookup();

    // Get handler
    const returnedHandler = middlewareLookup.get(path, event);

    // Validate
    expect(websocketMiddlewareHandler).toHaveBeenCalledTimes(1);

    expect(returnedHandler).toBe(handler);
  });

  test('GIVEN a path, and handler THEN all event handlers for path are returned', () => {
    // Setup
    const path = givenRandomString();
    const event = givenRandomString();
    const handlerFunction = jest.fn();

    const handler = {
      push: jest.fn(),
      handle: jest.fn(),
    };
    const middlewareHandlerMock = jest.mocked(websocketMiddlewareHandler);
    middlewareHandlerMock.mockReturnValue(handler);

    const middlewareLookup = websocketMiddlewareLookup();

    // Add handler
    middlewareLookup.add(path, event, handlerFunction);

    // Get handler
    const eventHandlers = middlewareLookup.getEventhandlers(path);

    // Validate
    expect(websocketMiddlewareHandler).toHaveBeenCalledTimes(1);

    const expectedEventHandlers = new Map();
    expectedEventHandlers.set(event, handler);
    expect(eventHandlers).toStrictEqual(expectedEventHandlers);
  });

  test('GIVEN a path, and handler with not handlers THEN empty map is returned', () => {
    // Setup
    const path = givenRandomString();

    // Get handler
    const eventHandlers = websocketMiddlewareLookup().getEventhandlers(path);

    // Validate
    expect(websocketMiddlewareHandler).toHaveBeenCalledTimes(0);

    expect(eventHandlers.size).toStrictEqual(0);
  });
});
