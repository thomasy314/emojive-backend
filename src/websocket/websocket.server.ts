import { IncomingMessage, Server } from 'http';
import { WebSocket, WebSocketServer } from 'ws';
import catchError from '../errorHandling/catch-error';
import { urlEndToURL } from '../utils/url-helpers';
import { WebSocketRouterFunction } from './websocket-middleware-handler';
import websocketRouter, { WebSocketRouter } from './websocket-router';
import { WebSocketError } from './websocket.message-schema';
import { subProtocolsToObject } from './websocket.utils';

function createWebSocketServer(
  httpServer: Server,
  websocketServer?: WebSocketServer
) {
  if (websocketServer === undefined || websocketServer === null) {
    websocketServer = new WebSocketServer({
      server: httpServer,
    });
  }

  const router = websocketRouter();

  websocketServer.addListener(
    'connection',
    (socket: WebSocket, request: IncomingMessage) => {
      const requestUrl = urlEndToURL(request.url);

      const subProtocol =
        request.headers['sec-websocket-protocol']?.split(', ') ?? [];

      request.headers = {
        ...request.headers,
        ...subProtocolsToObject(subProtocol),
      };

      console.log(request.headers);

      const connectionHandler = router.get(requestUrl.pathname, 'connection');
      connectionHandler.handle(socket, request);

      socket.addListener('message', async (event: MessageEvent) => {
        const onMessageHandlers = router.get(requestUrl.pathname, 'message');

        const [error, message] = catchError(() => JSON.parse(event.toString()));

        if (error) {
          const errorMessage: WebSocketError = {
            error: 'invalid JSON',
            details: event.toString(),
          };
          socket.send(JSON.stringify(errorMessage));
          return;
        }

        const eventData = {
          message,
          headers: request.headers,
          url: request.url,
        };

        onMessageHandlers.handle(socket, eventData);
      });

      socket.addListener('close', (code: number, reason: Buffer) => {
        const onCloseHandlers = router.get(requestUrl.pathname, 'close');

        const eventData = {
          code,
          reason,
          ...request,
        };

        onCloseHandlers.handle(socket, eventData);
      });
    }
  );

  function onWebSocketMessage(
    path: string,
    ...handlers: WebSocketRouterFunction[]
  ) {
    onWebSocketEvent(path, 'message', ...handlers);
  }

  function onWebSocketConnection(
    path: string,
    ...handlers: WebSocketRouterFunction[]
  ) {
    onWebSocketEvent(path, 'connection', ...handlers);
  }

  function onWebSocketEvent(
    path: string,
    event: string,
    ...handlers: WebSocketRouterFunction[]
  ) {
    router.on(path, event, ...handlers);
  }

  function on(path: string, ...handlers: WebSocketRouterFunction[]) {
    router.on(path, undefined, ...handlers);
  }

  function useRouter(path: string, otherRouter: WebSocketRouter) {
    router.merge(path, otherRouter);
  }

  return {
    onWebSocketEvent,
    onWebSocketMessage,
    onWebSocketConnection,
    on,
    useRouter,
    httpServer,
  };
}

export default createWebSocketServer;
