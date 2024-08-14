import routeConfig from "./config/routes.config";
import { httpServer } from "./routes/servers.routes";

httpServer.listen(routeConfig.PORT, routeConfig.IP, () => {
    console.log(`Listening for requests at: ${routeConfig.IP}:${routeConfig.PORT}`);
});