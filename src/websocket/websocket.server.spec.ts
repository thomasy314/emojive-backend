import { IncomingMessage, Server } from 'http';
import { MessageEvent, WebSocket, WebSocketServer } from 'ws';
import { givenRandomJson, givenRandomString } from '../utils/test-helpers';
import {
  WebSocketRouter,
  default as websocketRouter,
} from './websocket-router';
import createWebSocketServer from './websocket.server';

jest.mock('./websocket-router');

describe('WebSocket Router', () => {
  let httpServer: Server;
  let websocketServer: WebSocketServer;

  const routerGetFunction = jest.fn();
  const routerMock = {
    on: jest.fn(),
    get: routerGetFunction,
    merge: jest.fn(),
  } as unknown as WebSocketRouter;

  const websocketRouterMock = jest.mocked(websocketRouter);

  beforeEach(() => {
    httpServer = {} as Server;
    websocketServer = new WebSocketServer({ noServer: true });

    websocketRouterMock.mockReturnValue(routerMock);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Registering Events', () => {
    test('GIVEN websocket path WHEN registering THEN should call router on method', () => {
      const path = givenRandomString();
      const handler = jest.fn();

      const wssServer = createWebSocketServer(httpServer, websocketServer);
      wssServer.on(path, handler);

      expect(routerMock.on).toHaveBeenCalledWith(path, undefined, handler);
    });

    test('GIVEN websocket event WHEN registering THEN should call router on method', () => {
      const path = givenRandomString();
      const event = givenRandomString();
      const handler = jest.fn();

      const wssServer = createWebSocketServer(httpServer, websocketServer);
      wssServer.onWebSocketEvent(path, event, handler);

      expect(routerMock.on).toHaveBeenCalledWith(path, event, handler);
    });

    test('GIVEN websocket connection WHEN registering THEN should call router on method with connection event', () => {
      const path = givenRandomString();
      const handler = jest.fn();

      const wssServer = createWebSocketServer(httpServer, websocketServer);
      wssServer.onWebSocketConnection(path, handler);

      expect(routerMock.on).toHaveBeenCalledWith(path, 'connection', handler);
    });

    test('GIVEN websocket message WHEN registering THEN should call router on method with message event', () => {
      const path = givenRandomString();
      const handler = jest.fn();

      const wssServer = createWebSocketServer(httpServer, websocketServer);
      wssServer.onWebSocketMessage(path, handler);

      expect(routerMock.on).toHaveBeenCalledWith(path, 'message', handler);
    });

    test('GIVEN router WHEN using THEN should call router merge method', () => {
      const path = givenRandomString();
      const otherRouter = {} as WebSocketRouter;

      const wssServer = createWebSocketServer(httpServer, websocketServer);
      wssServer.useRouter(path, otherRouter);

      expect(routerMock.merge).toHaveBeenCalledWith(path, otherRouter);
    });
  });

  describe('Handle Events', () => {
    let url: string;
    let incomingMessageMock: IncomingMessage;
    let socket: WebSocket;

    const eventHandler = { handle: jest.fn() };

    beforeEach(() => {
      url = `/${givenRandomString()}`;
      incomingMessageMock = { url } as IncomingMessage;

      // @ts-expect-error - null input is not included in types
      socket = new WebSocket(null, undefined, {});
      jest.spyOn(socket, 'send').mockImplementation(jest.fn());

      routerGetFunction
        .mockReturnValueOnce(eventHandler)
        .mockReturnValueOnce(eventHandler);
    });

    test('GIVEN websocket connection WHEN handling THEN should call router get method and event handler', () => {
      // Setup
      const wssServer = createWebSocketServer(httpServer, websocketServer);

      // Execute
      websocketServer.emit('connection', socket, incomingMessageMock);

      // Validate
      expect(routerMock.get).toHaveBeenCalledTimes(1);
      expect(routerMock.get).toHaveBeenCalledWith(url, 'connection');

      expect(eventHandler.handle).toHaveBeenCalledTimes(1);
      expect(eventHandler.handle).toHaveBeenCalledWith(
        socket,
        incomingMessageMock
      );

      expect(wssServer.httpServer).toBe(httpServer);
    });

    describe('Handle Websocket Messages', () => {
      test('GIVEN websocket message WHEN handling THEN should call router get method and event handler', () => {
        // Setup
        const messageEvent = {} as MessageEvent;
        const eventJson = givenRandomJson();
        messageEvent.toString = () => JSON.stringify(eventJson);

        const wssServer = createWebSocketServer(httpServer, websocketServer);

        // Execute
        websocketServer.emit('connection', socket, incomingMessageMock);
        socket.emit('message', messageEvent);

        // Validate
        expect(routerMock.get).toHaveBeenCalledTimes(2);
        expect(routerMock.get).toHaveBeenNthCalledWith(1, url, 'connection');
        expect(routerMock.get).toHaveBeenNthCalledWith(2, url, 'message');

        expect(eventHandler.handle).toHaveBeenCalledTimes(2);
        expect(eventHandler.handle).toHaveBeenNthCalledWith(
          1,
          socket,
          incomingMessageMock
        );
        expect(eventHandler.handle).toHaveBeenNthCalledWith(2, socket, {
          message: eventJson,
          ...incomingMessageMock,
        });

        expect(wssServer.httpServer).toBe(httpServer);
      });

      test('GIVEN websocket message with invalid JSON WHEN handling THEN should call router get method and event handler', () => {
        // Setup
        const messageEvent = {} as MessageEvent;
        const invalidJson = '{invalidJson}';
        messageEvent.toString = () => invalidJson;

        const wssServer = createWebSocketServer(httpServer, websocketServer);

        // Execute
        websocketServer.emit('connection', socket, incomingMessageMock);
        socket.emit('message', messageEvent);

        // Validate
        expect(routerMock.get).toHaveBeenCalledTimes(2);
        expect(routerMock.get).toHaveBeenNthCalledWith(1, url, 'connection');
        expect(routerMock.get).toHaveBeenNthCalledWith(2, url, 'message');

        expect(eventHandler.handle).toHaveBeenCalledTimes(1);
        expect(eventHandler.handle).toHaveBeenNthCalledWith(
          1,
          socket,
          incomingMessageMock
        );

        expect(wssServer.httpServer).toBe(httpServer);
      });
    });

    test('GIVEN websocket close event WHEN handling THEN should call router get method and event handler', () => {
      // Setup
      const closeCode = 1000;
      const closeReason = Buffer.from(givenRandomString());

      const wssServer = createWebSocketServer(httpServer, websocketServer);

      // Execute
      websocketServer.emit('connection', socket, incomingMessageMock);
      socket.emit('close', closeCode, closeReason);

      // Validate
      expect(routerMock.get).toHaveBeenCalledTimes(2);
      expect(routerMock.get).toHaveBeenNthCalledWith(1, url, 'connection');
      expect(routerMock.get).toHaveBeenNthCalledWith(2, url, 'close');

      expect(eventHandler.handle).toHaveBeenCalledTimes(2);
      expect(eventHandler.handle).toHaveBeenCalledWith(socket, {
        code: closeCode,
        reason: closeReason,
        ...incomingMessageMock,
      });

      expect(wssServer.httpServer).toBe(httpServer);
    });
  });
});
