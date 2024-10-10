import { IncomingMessage, Server } from 'http';
import { WebSocket, WebSocketServer } from 'ws';
import { urlEndToURL } from '../utils/url-helpers';
import { WebSocketRouterFunction } from './websocket-middleware-handler';
import websocketRouter, { WebSocketRouter } from './websocket-router';

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

      const connectionHandler = router.get(requestUrl.pathname, 'connection');
      connectionHandler.handle(socket, request);

      socket.addListener('message', (event: MessageEvent) => {
        const onMessageHandlers = router.get(requestUrl.pathname, 'message');

        const eventData = JSON.parse(event.toString());
        onMessageHandlers.handle(socket, eventData);
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

  function useRouter(path: string, otherRouter: WebSocketRouter) {
    router.merge(path, otherRouter);
  }

  return {
    onWebSocketEvent,
    onWebSocketMessage,
    onWebSocketConnection,
    useRouter,
    httpServer,
  };
}

export default createWebSocketServer;
