import { WebSocket } from 'ws';
import {
  instanceOfResponseError,
  ResponseError,
} from '../middleware/errorHandling/error.types';
import websocketErrorHandler from './websocket-error-handler';

type WebSocketNextFunction = (
  nextProps?: NextProps | Error | ResponseError
) => void;

type WebSocketRouterFunction = (
  socket: WebSocket,
  context: unknown,
  next: WebSocketNextFunction
) => void;

interface WebSocketRouterHandler {
  push: (...middleware: WebSocketRouterFunction[]) => void;
  handle: (socket: WebSocket, context?: unknown) => void;
}

type NextProps = {
  error?: Error | ResponseError;
  newContext?: unknown;
};

function websocketMiddlewareHandler(...middlewares: WebSocketRouterFunction[]) {
  const stack = middlewares;

  function push(...middleware: WebSocketRouterFunction[]) {
    stack.push(...middleware);
  }

  function handle(socket: WebSocket, context?: unknown) {
    let prevIndex = -1;

    const runner = (index: number) => {
      if (index === prevIndex) {
        throw new Error('next() called multiple times');
      }

      prevIndex = index;

      if (index >= stack.length) {
        return;
      }

      const middleware = stack[index];

      // TODO: Allow for custom error handler
      if (middleware) {
        try {
          const middlewareNext: WebSocketNextFunction = (input = {}) => {
            if (input instanceof Error || instanceOfResponseError(input)) {
              // @ts-expect-error - Check above will confirm input is an Error or ResponseError
              websocketErrorHandler(input, socket);
              return;
            }

            // @ts-expect-error - Check above will confirm input is a NextProps object
            const { error, newContext } = input;

            if (error) {
              websocketErrorHandler(error, socket);
              return;
            }
            context = newContext ?? context;
            runner(index + 1);
          };

          middleware(socket, context, middlewareNext);
        } catch (err) {
          if (err instanceof Error) {
            websocketErrorHandler(err, socket);
          }
        }
      }
    };

    runner(0);
  }

  return {
    push,
    handle,
  };
}

export default websocketMiddlewareHandler;
export type {
  WebSocketNextFunction,
  WebSocketRouterFunction,
  WebSocketRouterHandler,
};
