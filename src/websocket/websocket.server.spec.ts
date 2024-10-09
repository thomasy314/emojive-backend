import { IncomingMessage, Server } from 'http';
import { MessageEvent, WebSocket, WebSocketServer } from 'ws';
import { givenRandomJson, givenRandomString } from '../utils/test-helpers';
import {
  default as webSocketRouter,
  default as websocketRouter,
} from './websocket-router';
import createWebSocketServer from './websocket.server';

jest.mock('./websocket-router');

describe('WebSocket Router', () => {
  let httpServer: Server;
  let websocketServer: WebSocketServer;

  const routerMock = {
    add: jest.fn(),
    get: jest.fn(),
    merge: jest.fn(),
    _getRootNode: jest.fn(),
  };

  beforeEach(() => {
    httpServer = {} as Server;
    websocketServer = new WebSocketServer({ noServer: true });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('Create WebSocket Server', () => {
    // Setup
    const websocketRouterMock = jest.mocked(webSocketRouter);
    const connectionHandler = {
      push: jest.fn(),
      handle: jest.fn(),
    };
    const messageHandler = {
      push: jest.fn(),
      handle: jest.fn(),
    };

    routerMock.get
      .mockReturnValueOnce(connectionHandler)
      .mockReturnValueOnce(messageHandler);

    websocketRouterMock.mockReturnValue(routerMock);

    const url = `/${givenRandomString()}`;
    const incomingMessageMock = { url } as IncomingMessage;

    // @ts-expect-error - constructor needs to define client options to avoid issue with autoPong setting
    // https://github.com/websockets/ws/issues/2188
    const socket = new WebSocket(null, undefined, {});
    const messageEvent = {} as MessageEvent;
    const eventJson = givenRandomJson();
    messageEvent.toString = () => JSON.stringify(eventJson);

    // Execute
    const wssServer = createWebSocketServer(httpServer, websocketServer);
    websocketServer.emit('connection', socket, incomingMessageMock);
    socket.emit('message', messageEvent);

    // Validate
    expect(routerMock.get).toHaveBeenCalledTimes(2);
    expect(routerMock.get).toHaveBeenNthCalledWith(1, url, 'connection');
    expect(routerMock.get).toHaveBeenNthCalledWith(2, url, 'message');

    expect(connectionHandler.handle).toHaveBeenCalledTimes(1);
    expect(connectionHandler.handle).toHaveBeenCalledWith(
      socket,
      incomingMessageMock
    );

    expect(messageHandler.handle).toHaveBeenCalledTimes(1);
    expect(messageHandler.handle).toHaveBeenCalledWith(socket, eventJson);

    expect(wssServer.httpServer).toBe(httpServer);
  });

  test('on websocket event', () => {
    // Setup
    const path = givenRandomString();
    const event = givenRandomString();
    const handler = jest.fn();

    const websocketRouterMock = jest.mocked(websocketRouter);
    websocketRouterMock.mockReturnValue(routerMock);

    const wssServer = createWebSocketServer(httpServer, websocketServer);

    // Execute
    wssServer.onWebSocketEvent(path, event, handler);

    // Validate
    expect(routerMock.add).toHaveBeenCalledWith(path, event, handler);
  });

  test('on websocket connection', () => {
    // Setup
    const path = givenRandomString();
    const handler = jest.fn();

    const websocketRouterMock = jest.mocked(webSocketRouter);
    websocketRouterMock.mockReturnValue(routerMock);

    const wssServer = createWebSocketServer(httpServer, websocketServer);

    // Execute
    wssServer.onWebSocketConnection(path, handler);

    // Validate
    expect(routerMock.add).toHaveBeenCalledWith(path, 'connection', handler);
  });

  test('on websocket message', () => {
    // Setup
    const path = givenRandomString();
    const handler = jest.fn();

    const websocketRouterMock = jest.mocked(websocketRouter);

    websocketRouterMock.mockReturnValue(routerMock);

    const wssServer = createWebSocketServer(httpServer, websocketServer);

    // Execute
    wssServer.onWebSocketMessage(path, handler);

    // Validate
    expect(routerMock.add).toHaveBeenCalledWith(path, 'message', handler);
  });
});
