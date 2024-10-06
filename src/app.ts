import { httpServerConfig } from './config/express.config';
import httpServer from './routes/router';

httpServer.listen(httpServerConfig.PORT, httpServerConfig.IP, () => {
  console.log(
    `Server is running on ${httpServerConfig.IP}:${httpServerConfig.PORT}`
  );
});
