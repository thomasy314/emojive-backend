import { httpServerConfig } from './config/express.config';
import messageSaver from './messages/message-saver';
import httpServer from './routes/router';

messageSaver();

httpServer.listen(httpServerConfig.PORT, httpServerConfig.IP, () => {
  console.log(
    `Server is running on ${httpServerConfig.IP}:${httpServerConfig.PORT}`
  );
});
