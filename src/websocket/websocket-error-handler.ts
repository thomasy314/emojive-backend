import { WebSocket } from 'ws';
import errorHandler from '../errorHandling/error-handler';
import { ResponseError } from '../middleware/errorHandling/error.types';
import webSocketCloseCode from './websocket-close-codes';

type WebsocketErrorHandler = (
  err: ResponseError | Error,
  socket: WebSocket
) => ResponseError;

function websocketErrorHandler(
  err: ResponseError | Error,
  socket: WebSocket
): ResponseError {
  const finalResponseError = errorHandler(
    webSocketCloseCode.INTERNAL_ERROR,
    err
  );

  socket.close(
    finalResponseError.status,
    JSON.stringify({
      error: finalResponseError.externalMessage,
      ...finalResponseError.json,
    })
  );
  return finalResponseError;
}

export default websocketErrorHandler;
export type { WebsocketErrorHandler };
