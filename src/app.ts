import { routeConfig } from "./config/express.config";
import expressServer from "./routes/router";

expressServer.listen(routeConfig.PORT, routeConfig.IP, () => {
    console.log("env: ", process.env.IP)
    console.log(`Server is running on ${routeConfig.IP}:${routeConfig.PORT}`)
});