import WebSocket, { WebSocketServer } from "ws";

import chatHandlers from "../controllers/websocketControllers/chat.controller";
import { AppContext } from "../types/app.types";
import { EventControllerWithAppContext } from "../types/websocket.types";

let appContext: AppContext = {
    allWebSockets: []
}

/**
 * Maps routing for various websocket events for a given WebSocket Server
 * @param {WebSocketServer} wss - The target websocket server to register events to
 */
function registerWebSocketEvents(wss: WebSocketServer): void {
    wss.on('connection', (ws: WebSocket) => {
        const eventHandlers: Map<string, EventControllerWithAppContext>[] = [
            chatHandlers
        ]

        /**
         * TODO: Check if you can set the client id here so that it doesn't need to be sent with every websocket message
         * Or could be used to confirm messages?
         */

        for (const controller of eventHandlers) {
            for (const [event, eventController] of controller.entries()) {
                function callEventControllerWithAppContext(...args: any[]) {
                    eventController(ws, appContext, ...args)
                }
                ws.on(event, callEventControllerWithAppContext);
            }
        }

        appContext.allWebSockets.push(ws);
    });

    wss.on('error', (ws: WebSocket, error: Error) => {
        console.log("Error Occurred: ", error)
    });
}

export {
    registerWebSocketEvents
};

