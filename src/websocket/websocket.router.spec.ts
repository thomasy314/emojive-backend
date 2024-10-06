import { IncomingMessage, Server } from 'http';
import { MessageEvent, WebSocket, WebSocketServer } from 'ws';
import { givenRandomJson, givenRandomString } from '../utils/test-helpers';
import websocketMiddlewareLookup from './websocket-middleware-lookup';
import createWebSocketServer from './websocket.router';

jest.mock('./websocket-middleware-lookup');

describe('WebSocket Router', () => {
  let httpServer: Server;
  let websocketServer: WebSocketServer;

  beforeEach(() => {
    httpServer = {} as Server;
    websocketServer = new WebSocketServer({ noServer: true });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('Create WebSocket Server', () => {
    // Setup
    const websocketMiddlewareLookupMock = jest.mocked(
      websocketMiddlewareLookup
    );
    const dummyHandler = {
      push: jest.fn(),
      handle: jest.fn(),
    };
    const connectionHandler = {
      push: jest.fn(),
      handle: jest.fn(),
    };
    const messageHandler = {
      push: jest.fn(),
      handle: jest.fn(),
    };
    const lookupMock = {
      add: jest.fn(),
      get: jest
        .fn(() => dummyHandler)
        .mockReturnValueOnce(connectionHandler)
        .mockReturnValueOnce(messageHandler),
      getEventhandlers: jest.fn(),
    };
    websocketMiddlewareLookupMock.mockReturnValue(lookupMock);

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
    expect(lookupMock.get).toHaveBeenCalledTimes(2);
    expect(lookupMock.get).toHaveBeenNthCalledWith(1, url, 'connection');
    expect(lookupMock.get).toHaveBeenNthCalledWith(2, url, 'message');

    expect(connectionHandler.handle).toHaveBeenCalledTimes(1);
    expect(connectionHandler.handle).toHaveBeenCalledWith(socket);

    expect(messageHandler.handle).toHaveBeenCalledTimes(1);
    expect(messageHandler.handle).toHaveBeenCalledWith(socket, eventJson);

    expect(dummyHandler.handle).toHaveBeenCalledTimes(0);

    expect(wssServer.httpServer).toBe(httpServer);
  });

  test('on websocket event', () => {
    // Setup
    const path = givenRandomString();
    const event = givenRandomString();
    const handler = jest.fn();

    const websocketMiddlewareLookupMock = jest.mocked(
      websocketMiddlewareLookup
    );
    const lookupMock = {
      add: jest.fn(),
      get: jest.fn(),
      getEventhandlers: jest.fn(),
    };
    websocketMiddlewareLookupMock.mockReturnValue(lookupMock);

    const wssServer = createWebSocketServer(httpServer, websocketServer);

    // Execute
    wssServer.onWebSocketEvent(path, event, handler);

    // Validate
    expect(lookupMock.add).toHaveBeenCalledWith(path, event, handler);
  });

  test('on websocket connection', () => {
    // Setup
    const path = givenRandomString();
    const handler = jest.fn();

    const websocketMiddlewareLookupMock = jest.mocked(
      websocketMiddlewareLookup
    );
    const lookupMock = {
      add: jest.fn(),
      get: jest.fn(),
      getEventhandlers: jest.fn(),
    };
    websocketMiddlewareLookupMock.mockReturnValue(lookupMock);

    const wssServer = createWebSocketServer(httpServer, websocketServer);

    // Execute
    wssServer.onWebSocketConnection(path, handler);

    // Validate
    expect(lookupMock.add).toHaveBeenCalledWith(path, 'connection', handler);
  });

  test('on websocket message', () => {
    // Setup
    const path = givenRandomString();
    const handler = jest.fn();

    const websocketMiddlewareLookupMock = jest.mocked(
      websocketMiddlewareLookup
    );
    const lookupMock = {
      add: jest.fn(),
      get: jest.fn(),
      getEventhandlers: jest.fn(),
    };
    websocketMiddlewareLookupMock.mockReturnValue(lookupMock);

    const wssServer = createWebSocketServer(httpServer, websocketServer);

    // Execute
    wssServer.onWebSocketMessage(path, handler);

    // Validate
    expect(lookupMock.add).toHaveBeenCalledWith(path, 'message', handler);
  });
});
