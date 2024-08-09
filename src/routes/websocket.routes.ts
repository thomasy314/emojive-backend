import http from 'node:http';
import WebSocket from "ws";
import chatHandlers from '../controllers/chat.controller';
import { AppContext } from '../types/app.types';
import { eventControllerWithAppContext } from '../types/websocket.types';

const appContext: AppContext = {
    allWebSockets: []
}

const httpServer = http.createServer(function createServer(req: http.IncomingMessage, res: http.ServerResponse) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end();
});

const webSocketServer = new WebSocket.Server({ server: httpServer });

webSocketServer.on('connection', (ws: WebSocket) => {
    const eventHandlers: Map<string, eventControllerWithAppContext>[] = [
        chatHandlers
    ]

    for (const controller of eventHandlers) {
        for (const [event, eventController] of controller.entries()) {
            function callEventControllerWithAppContext(...args: any[]) { eventController(ws, appContext, ...args) }
            ws.on(event, callEventControllerWithAppContext);
        }
    }

    appContext.allWebSockets.push(ws);
});

webSocketServer.on('error', (ws: WebSocket, error: Error) => {
    console.log("Error Occurred: ", error)
});

export {
    AppContext,
    eventControllerWithAppContext,
    httpServer
};

