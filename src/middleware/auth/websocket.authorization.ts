import { IncomingMessage } from 'http';
import { WebSocket } from 'ws';
import authService from '../../auth/auth.service';
import catchError from '../../errorHandling/catch-error';
import webSocketCloseCode from '../../websocket/websocket-close-codes';
import { WebSocketNextFunction } from '../../websocket/websocket-middleware-handler';
import { ResponseError } from '../errorHandling/error.types';

function websocketAuthorization(
  socket: WebSocket,
  context: unknown,
  next: WebSocketNextFunction
) {
  const req = context as IncomingMessage;

  const [error, authToken] = catchError(() => {
    return authService.getAuthToken(req.headers);
  });

  if (error || authToken === undefined) {
    const responseErr: ResponseError = {
      status: webSocketCloseCode.POLICY_VIOLATION,
      error: error as Error,
    };
    next(responseErr);
    return Promise.resolve();
  }

  if (authService.confirmRouteAuthNeeded(req.url) === false) {
    next({ newContext: { ...req, userUUID: authToken } });
    return Promise.resolve();
  }

  return authService
    .authorizeRequest(authToken)
    .then(result => {
      if (result === false) {
        const err: ResponseError = {
          status: webSocketCloseCode.POLICY_VIOLATION,
          error: Error('Not Authorized'),
        };
        next(err);
        return;
      }

      next({ newContext: { ...req, userUUID: authToken } });
    })
    .catch(err => {
      err.status =
        err.status === 401
          ? webSocketCloseCode.POLICY_VIOLATION
          : webSocketCloseCode.INTERNAL_ERROR;
      next(err);
    });
}

export default websocketAuthorization;
