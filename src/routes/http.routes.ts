import http from "node:http";

export const httpServer = http.createServer(function createServer(req: http.IncomingMessage, res: http.ServerResponse) {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('HTTP server is running');
});
