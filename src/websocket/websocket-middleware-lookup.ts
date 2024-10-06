import websocketMiddlewareHandler, {
  MiddlewareFunction,
  WebSocketMiddlewareHandler,
} from './websocket-middleware-handler';

function websocketMiddlewareLookup() {
  const routes: Map<
    string,
    Map<string, WebSocketMiddlewareHandler>
  > = new Map();

  function getEventhandlers(
    path: string
  ): Map<string, WebSocketMiddlewareHandler> {
    return routes.get(path) ?? new Map();
  }

  function get(path: string, event: string): WebSocketMiddlewareHandler {
    return routes.get(path)?.get(event) ?? websocketMiddlewareHandler();
  }

  function add(path: string, event: string, ...handlers: MiddlewareFunction[]) {
    const pathHandlers = routes.get(path) ?? new Map();
    const eventHandlers =
      pathHandlers.get(event) ?? websocketMiddlewareHandler();
    eventHandlers.push(...handlers);
    pathHandlers.set(event, eventHandlers);
    routes.set(path, pathHandlers);
  }

  return {
    add,
    get,
    getEventhandlers,
  };
}

export default websocketMiddlewareLookup;
