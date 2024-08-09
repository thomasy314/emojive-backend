import WebSocket from "ws";
import chatHandlers from "../controllers/chat.controller";
import { httpServer } from "./http.routes";

export type AppContext = {
    allWebSockets: WebSocket[]
}

export type eventControllerWithAppContext = (ws: WebSocket, ...args: any[]) => void

export const webSocketServer = new WebSocket.Server({ server: httpServer });

const appContext: AppContext = {
    allWebSockets: []
}

webSocketServer.on('connection', (ws: WebSocket) => {
    const eventHandlers: Map<string, eventControllerWithAppContext>[] = [
        chatHandlers
    ]

    for (const controller of eventHandlers) {
        for (const [event, eventController] of controller.entries()) {
            function callEventControllerWithAppContext(ws: WebSocket, ...args: any[]) { eventController(ws, appContext, args) }
            ws.on(event, callEventControllerWithAppContext);
        }
    }

    appContext.allWebSockets.push(ws);
});

webSocketServer.on('error', (ws: WebSocket, error: Error) => {
    console.log("Error Occurred: ", error)
})
