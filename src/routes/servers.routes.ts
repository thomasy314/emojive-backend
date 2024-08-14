import { createServer, IncomingMessage, ServerResponse } from "http";

import { WebSocketServer } from "ws";
import { verifyClient } from "../middleware/websocket.auth";
import { handleHttpRouting } from "./http.routes";
import { registerWebSocketEvents } from "./websocket.routes";

const httpServer = createServer(function createServer(req: IncomingMessage, res: ServerResponse) {
    handleHttpRouting(req, res);
});

const webSocketServer = new WebSocketServer({
    verifyClient: verifyClient,
    server: httpServer
});

registerWebSocketEvents(webSocketServer);

export {
    httpServer
};
