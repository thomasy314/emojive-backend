import { IncomingMessage, ServerResponse } from "node:http";

import { authHandler } from "../controllers/httpControllers/auth.controller";

const routes = new Map(Object.entries({
    "GET /auth": authHandler
}));

/**
 * Basic HTTP request routing based on HTTP Method and URL path
 * @param {IncomingMessage} req - Incoming HTTP request data
 * @param {ServerResponse} res - Object used to respond to handle HTTP request responses
 */
function handleHttpRouting(req: IncomingMessage, res: ServerResponse): void {
    const { method, url } = req;
    const handler = routes.get(`${method} ${url}`)

    if (!handler) {
        res.writeHead(404, { 'content-type': 'text/plain' });
        res.end('not found');
        return;
    }

    handler(req, res);
}

export {
    handleHttpRouting
};
