import WebSocket from "ws";

import { webSocketCloseCode } from "../../routes/webSocketCloseCode";
import { AppContext } from "../../types/app.types";
import { assertIncomingChat, IncomingChat, OutgoingChat } from "../../types/chat.types";
import { EventControllerWithAppContext } from "../../types/websocket.types";
import { isValidJson } from "../../utils/jsonValidator";

/**
 * map of handlers for various websocket events
 */
const chatHandlers: Map<string, EventControllerWithAppContext> = new Map(Object.entries({
    'message': broadCastMessage
}));

/**
 * Given info about the websocket sending the message, app context, and the websocket message, 
 * the given message is sent to all connected websocket 
 * @param {WebSocket} senderWs - The websocket sending the message
 * @param {AppContext} appContext - The app context with information about other connected websockets
 * @param {WebSocket.RawData} eventMessage - The message raw data which is converted and validated as IncomingChat type
 * @returns 
 */
function broadCastMessage(senderWs: WebSocket, appContext: AppContext, eventMessage: WebSocket.RawData) {
    if (!isValidJson(eventMessage.toString())) {
        senderWs.close(webSocketCloseCode.UNSUPPORTED_DATA, "Data provided is not a properly formatted json object");
        return;
    }

    const incomingChat: IncomingChat = JSON.parse(eventMessage.toString());

    if (!assertIncomingChat(incomingChat)) {
        senderWs.close(webSocketCloseCode.UNSUPPORTED_DATA, "Data provided is not a properly formatted chat message");
        return;
    }

    const outgoingMessage: OutgoingChat = {
        message: incomingChat.message
    }

    appContext.allWebSockets.forEach((ws: WebSocket) => {
        ws.send(JSON.stringify(outgoingMessage))
    });
}

export default chatHandlers;

