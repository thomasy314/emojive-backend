import { WebSocket } from 'ws';
import errorHandler from '../errorHandling/error-handler';
import { ResponseError } from '../middleware/errorHandling/error.types';
import webSocketCloseCode from './websocket-close-codes';

type WebsocketErrorHandler = (
  err: ResponseError | Error,
  socket: WebSocket
) => ResponseError;

async function websocketErrorHandler(
  err: ResponseError | Error,
  socket: WebSocket
): Promise<ResponseError> {
  const formattedError = errorHandler(webSocketCloseCode.INTERNAL_ERROR, err);
  const errorResponse = JSON.stringify({
    status: formattedError.status,
    error: formattedError.externalMessage,
    ...formattedError.json,
  });
  socket.send(errorResponse);
  socket.close(
    formattedError.status,
    'See previous websocket message for details'
  );
  return formattedError;
}

export default websocketErrorHandler;
export type { WebsocketErrorHandler };
