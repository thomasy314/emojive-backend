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

  test('GIVEN a path, event not in lookup THEN empty handler is returned', () => {
    // Setup
    const path = givenRandomString();
    const event = givenRandomString();

    const router = websocketRouter();

    // Get handler
    const returnedHandler = router.get(path, event);

    // Validate
    expect(websocketMiddlewareHandler).toHaveBeenCalledTimes(1);

    expect(returnedHandler).toBe(handler);
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
                          handler: {
                            handle: expect.any(Function),
                            push: expect.any(Function),
                          },
                        },
                      ],
                    ]),
                    handler: undefined,
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
                                handler: {
                                  handle: expect.any(Function),
                                  push: expect.any(Function),
                                },
                              },
                            ],
                          ]),
                          handler: undefined,
                        },
                      ],
                    ]),
                    handler: undefined,
                  },
                ],
              ]),
              handler: undefined,
            },
          ],
        ]),
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
});
