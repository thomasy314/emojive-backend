import websocketMiddlewareHandler, {
  WebSocketRouterFunction,
  WebSocketRouterHandler,
} from './websocket-middleware-handler';

type WebSocketRouterNode = {
  children: Map<string, WebSocketRouterNode>;
  middleware: WebSocketRouterFunction[];
};

interface WebSocketRouter {
  on: (
    path: string,
    event?: string,
    ...handlers: WebSocketRouterFunction[]
  ) => void;
  onWebSocketMessage: (
    path: string,
    ...handlers: WebSocketRouterFunction[]
  ) => void;
  onWebSocketConnection: (
    path: string,
    ...handlers: WebSocketRouterFunction[]
  ) => void;
  onWebSocketClose: (
    path: string,
    ...handlers: WebSocketRouterFunction[]
  ) => void;
  merge: (path: string, otherRouter: WebSocketRouter) => void;
  get: (path: string, event: string) => WebSocketRouterHandler;
  _getRootNode: () => WebSocketRouterNode;
}

function websocketRouter(): WebSocketRouter {
  const routerRoot: WebSocketRouterNode = {
    children: new Map(),
    middleware: [],
  };

  function _getRootNode() {
    return routerRoot;
  }

  function get(path: string, event: string): WebSocketRouterHandler {
    const pathParts = _getPathParts(path, event);

    let curNode: WebSocketRouterNode | undefined = routerRoot;

    const middleware = [];

    for (const part of pathParts) {
      curNode = curNode?.children.get(part);
      middleware.push(...(curNode?.middleware ?? []));
      if (curNode === undefined || curNode == null) {
        break;
      }
    }

    return websocketMiddlewareHandler(...middleware);
  }

  function on(
    path: string,
    event?: string,
    ...handlers: WebSocketRouterFunction[]
  ) {
    const leafNode = _buildLeafNode(routerRoot, path, event);

    leafNode.middleware.push(...handlers);
  }

  function onWebSocketMessage(
    path: string,
    ...handlers: WebSocketRouterFunction[]
  ) {
    on(path, 'message', ...handlers);
  }

  function onWebSocketConnection(
    path: string,
    ...handlers: WebSocketRouterFunction[]
  ) {
    on(path, 'connection', ...handlers);
  }

  function onWebSocketClose(
    path: string,
    ...handlers: WebSocketRouterFunction[]
  ) {
    on(path, 'close', ...handlers);
  }

  function merge(path: string, otherRouter: WebSocketRouter) {
    const leafNode = _buildLeafNode(routerRoot, path);

    const curNode = otherRouter._getRootNode().children.get('/');
    if (curNode == undefined || curNode == null) {
      throw new Error('Other router must start with "/" path');
    }

    leafNode.children = new Map([...leafNode.children, ...curNode.children]);
  }

  function _buildLeafNode(
    rootRouterNode: WebSocketRouterNode,
    path: string,
    event?: string
  ) {
    const pathParts = _getPathParts(path, event);

    return pathParts.reduce((curNode, part) => {
      const nextNode = curNode.children.get(part) ?? _newRouterNode();
      curNode.children.set(part, nextNode);
      return nextNode;
    }, rootRouterNode);
  }

  function _getPathParts(path: string, event?: string) {
    return ['/'].concat(path.split('/'), event ?? '').filter(p => p);
  }

  function _newRouterNode(
    children: Map<string, WebSocketRouterNode> = new Map()
  ): WebSocketRouterNode {
    return {
      children,
      middleware: [],
    };
  }

  return {
    on,
    onWebSocketMessage,
    onWebSocketConnection,
    onWebSocketClose,
    get,
    _getRootNode,
    merge,
  };
}

export default websocketRouter;
export type { WebSocketRouter };
