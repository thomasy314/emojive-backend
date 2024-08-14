import { randomUUID } from "crypto";
import { IncomingMessage, ServerResponse } from "http";

/**
 * TODO: Add a proper authentication scheme
 * 
 * Creates a client Id and sends it back to the user
 * @param {IncomingMessage} req - Incoming HTTP request data
 * @param {ServerResponse} res - Object used to respond to handle HTTP request responses
 */
function authHandler(req: IncomingMessage, res: ServerResponse) {
    res.writeHead(200, { 'content-type': 'application/json' });
    const clientId: string = randomUUID();

    res.write(JSON.stringify({ clientId: clientId }))
    res.end()
}

export {
    authHandler
};
