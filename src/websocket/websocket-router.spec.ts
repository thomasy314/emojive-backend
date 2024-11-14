import { givenRandomString } from '../utils/test-helpers';
import websocketMiddlewareHandler from './websocket-middleware-handler';
import websocketRouter from './websocket-router';

jest.mock('./websocket-middleware-handler');

describe('WebSocket Router', () => {
  const handler = {
    push: jest.fn(),
    handle: jest.fn(),
  };
  const middlewareHandlerMock = jest.mocked(websocketMiddlewareHandler);

  beforeEach(() => {
    middlewareHandlerMock.mockReturnValue(handler);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('GIVEN a path, event, and handler THEN handler is added to router', () => {
    // Setup
    const path = givenRandomString();
    const event = givenRandomString();
    const handlerFunction = jest.fn();

    const router = websocketRouter();

    // Add handler
    router.on(path, event, handlerFunction);

    // Get handler
    const returnedHandler = router.get(path, event);

    // Validate
    expect(websocketMiddlewareHandler).toHaveBeenCalledTimes(1);

    expect(returnedHandler).toBe(handler);
  });

  test('GIVEN a path, event not in lookup THEN error is thrown', () => {
    // Setup
    const path = givenRandomString();
    const event = givenRandomString();

    const router = websocketRouter();

    // Execute & Validate
    try {
      router.get(path, event);
    } catch (error) {
      expect((error as Error).message).toBe(
        `No middleware found for path: ${path}`
      );
    }
  });

  describe('Router Merge', () => {
    test('GIVEN a new router to merge THEN all paths are added in the correct place', () => {
      // Setup
      const prefix = (prefix: string) => (path: string) => `${prefix}_${path}`;
      const pathPrefix = prefix('path');
      const path1 = pathPrefix(givenRandomString());
      const path2 = pathPrefix(givenRandomString());
      const path3 = pathPrefix(givenRandomString());

      const handlerFunction1 = jest.fn();
      const handlerFunction2 = jest.fn();

      const router = websocketRouter();
      router.onWebSocketConnection(path1, handlerFunction1);

      const otherRouter = websocketRouter();
      otherRouter.onWebSocketMessage(path2, handlerFunction2);

      // Execute
      router.merge(path3, otherRouter);

      // Validate
      const expetedRouter = {
        children: new Map([
          [
            '/',
            {
              children: new Map([
                [
                  path1,
                  {
                    children: new Map([
                      [
                        'connection',
                        {
                          children: new Map(),
                          middleware: [handlerFunction1],
                        },
                      ],
                    ]),
                    middleware: [],
                  },
                ],
                [
                  path3,
                  {
                    children: new Map([
                      [
                        path2,
                        {
                          children: new Map([
                            [
                              'message',
                              {
                                children: new Map(),
                                middleware: [handlerFunction2],
                              },
                            ],
                          ]),
                          middleware: [],
                        },
                      ],
                    ]),
                    middleware: [],
                  },
                ],
              ]),
              middleware: [],
            },
          ],
        ]),
        middleware: [],
      };
      expect(router._getRootNode()).toStrictEqual(expetedRouter);
    });

    test('GIVEN an empty router to merge THEN throw error', () => {
      // Setup
      const prefix = (prefix: string) => (path: string) => `${prefix}_${path}`;
      const pathPrefix = prefix('path');
      const path1 = pathPrefix(givenRandomString());
      const path2 = pathPrefix(givenRandomString());

      const eventPrefix = prefix('event');
      const event1 = eventPrefix(givenRandomString());

      const handlerFunction1 = jest.fn();

      const router = websocketRouter();
      router.on(path1, event1, handlerFunction1);

      const otherRouter = websocketRouter();

      // Execute & Validate
      expect(() => router.merge(path2, otherRouter)).toThrow(
        'Other router must start with "/" path'
      );
    });
  });

  test('GIVEN a path and handler for WebSocket close event THEN handler is added to router', () => {
    // Setup
    const path = givenRandomString();
    const handlerFunction = jest.fn();

    const router = websocketRouter();

    // Add handler
    router.onWebSocketClose(path, handlerFunction);

    // Get handler
    const returnedHandler = router.get(path, 'close');

    // Validate
    expect(websocketMiddlewareHandler).toHaveBeenCalledTimes(1);

    expect(returnedHandler).toBe(handler);
  });

  test('GIVEN a path and handler for WebSocket error event THEN handler is added to router', () => {
    // Setup
    const path = givenRandomString();
    const handlerFunction = jest.fn();

    const router = websocketRouter();

    // Add handler
    router.onWebSocketError(path, handlerFunction);

    // Get handler
    const returnedHandler = router.get(path, 'error');

    // Validate
    expect(websocketMiddlewareHandler).toHaveBeenCalledTimes(1);

    expect(returnedHandler).toBe(handler);
  });
});
