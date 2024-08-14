import { IncomingMessage, OutgoingHttpHeaders } from "http";
import { VerifyClientCallbackAsync } from "ws";

import { stringListToStringMap } from "../utils/typeConverters";

type VerifyClientInfo = {
    origin: string,
    secure: boolean,
    req: IncomingMessage
}

type VerifyClientCallBack = (res: boolean, code?: number, message?: string, headers?: OutgoingHttpHeaders) => void

/**
 * TODO: Add a proper authentication scheme
 * 
 * Function used to verify user authentication when creating a websocket connection. Actions performed:
 * 1. Check for clientID
 * 2. If present SUCCEED, else FAIL with 401
 * @param {VerifyClientInfo} info - info needed to perform authentication when creating the websocket message
 * @param {VerifyClientCallBack} cb - Callback function used to either confirm or deny verification
 * @returns 
 */
const verifyClient: VerifyClientCallbackAsync = (
    info: VerifyClientInfo,
    cb: VerifyClientCallBack) => {

    const subProtocols = info.req.headers['sec-websocket-protocol'];

    if (!subProtocols) {
        cb(false, 401, "Unauthorized");
        return;
    }

    const subProtocolMap = stringListToStringMap(subProtocols.replace(/\s/g, '').split(","));

    const clientId = subProtocolMap.get("clientId")

    if (clientId === undefined) {
        cb(false, 401, "Unauthorized");
    }

    cb(true);
}

export {
    verifyClient
};

