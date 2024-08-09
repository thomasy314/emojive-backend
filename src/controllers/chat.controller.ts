import http from 'node:http';
import WebSocket from 'ws';
import { AppContext, eventControllerWithAppContext } from "../routes/websocket.routes";

type IncomingChat = {
    message: string
}

type OutgoingChat = {
    message: string
}

const chatHandlers: Map<string, eventControllerWithAppContext> = new Map(Object.entries({
    'message': broadCastMessage
}))

function broadCastMessage(registeredWs: WebSocket, appContext: AppContext, eventMessage: http.IncomingMessage) {

    const incomingMessage: IncomingChat = JSON.parse(eventMessage.toString());
    const outgoingMessage: OutgoingChat = {
        message: incomingMessage.message
    }

    appContext.allWebSockets.forEach((ws: WebSocket) => {
        if (ws == registeredWs) {
            console.log("FOUND");
            console.log(registeredWs);
        }
        ws.send(JSON.stringify(outgoingMessage))
    });
}

export default chatHandlers;

