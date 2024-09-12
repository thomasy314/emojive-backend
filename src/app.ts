import { httpServerConfig } from './config/express.config';
import expressServer from './routes/router';

expressServer.listen(httpServerConfig.PORT, httpServerConfig.IP, () => {
  console.log(
    `Server is running on ${httpServerConfig.IP}:${httpServerConfig.PORT}`
  );
});
