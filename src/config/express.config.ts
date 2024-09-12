type HttpServerConfig = {
  IP: string;
  PORT: number;
};

const httpServerConfig: HttpServerConfig = {
  IP: process.env.IP ?? 'localhost',
  PORT: process.env.PORT ? parseInt(process.env.PORT) : 3000,
};

export { HttpServerConfig, httpServerConfig };
