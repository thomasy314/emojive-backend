import { IncomingMessage, Server } from 'http';
import { WebSocket, WebSocketServer } from 'ws';
import { MiddlewareFunction } from './websocket-middleware-handler';
import websocketMidlewareLookup from './websocket-middleware-lookup';

function createWebSocketServer(
  httpServer: Server,
  websocketServer?: WebSocketServer
) {
  if (websocketServer === undefined || websocketServer === null) {
    websocketServer = new WebSocketServer({
      server: httpServer,
    });
  }

  const middlewareLookup = websocketMidlewareLookup();

  websocketServer.addListener(
    'connection',
    (socket: WebSocket, request: IncomingMessage) => {
      const requestUrl = new URL(
        `http://${process.env.HOST ?? 'localhost'}${request.url}`
      );

      const connectionHandler = middlewareLookup.get(
        requestUrl.pathname,
        'connection'
      );
      connectionHandler.handle(socket);

      socket.addListener('message', (event: MessageEvent) => {
        const onMessageHandlers = middlewareLookup.get(
          requestUrl.pathname,
          'message'
        );

        const eventData = JSON.parse(event.toString());
        onMessageHandlers.handle(socket, eventData);
      });
    }
  );

  function onWebSocketMessage(path: string, ...handlers: MiddlewareFunction[]) {
    onWebSocketEvent(path, 'message', ...handlers);
  }

  function onWebSocketConnection(
    path: string,
    ...handlers: MiddlewareFunction[]
  ) {
    onWebSocketEvent(path, 'connection', ...handlers);
  }

  function onWebSocketEvent(
    path: string,
    event: string,
    ...handlers: MiddlewareFunction[]
  ) {
    middlewareLookup.add(path, event, ...handlers);
  }

  return {
    onWebSocketEvent,
    onWebSocketMessage,
    onWebSocketConnection,
    httpServer,
  };
}

export default createWebSocketServer;
