import routeConfig from "./config/routes.config";
import { httpServer } from "./routes/websocket.routes";

httpServer.listen(routeConfig.PORT, routeConfig.IP, () => {
    console.log(`Listening for requests at: ${routeConfig.IP}:${routeConfig.PORT}`);
});