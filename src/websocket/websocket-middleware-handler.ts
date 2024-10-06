import { WebSocket } from 'ws';
import { ResponseError } from '../middleware/errorHandling/error.types';
import websocketErrorHandler from './websocket-error-handler';

type MiddlewareFunction = (
  socket: WebSocket,
  context: unknown,
  next: (nextProps?: NextProps) => void
) => void;

interface WebSocketMiddlewareHandler {
  push: (...middleware: MiddlewareFunction[]) => void;
  handle: (socket: WebSocket, context?: unknown) => void;
}

type NextProps = {
  error?: Error | ResponseError;
  newContext?: unknown;
};

function websocketMiddlewareHandler(...middlewares: MiddlewareFunction[]) {
  const stack = middlewares;

  function push(...middleware: MiddlewareFunction[]) {
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
          middleware(
            socket,
            context,
            ({ error, newContext }: NextProps = {}) => {
              if (error) {
                websocketErrorHandler(error, socket);
              }
              context = newContext ?? context;
              runner(index + 1);
            }
          );
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
export type { MiddlewareFunction, WebSocketMiddlewareHandler };
