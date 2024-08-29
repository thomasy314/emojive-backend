type RouteConfig = {
    IP: string,
    PORT: number
};

const routeConfig: RouteConfig = {
    IP: process.env.IP ?? "localhost",
    PORT: process.env.PORT ? parseInt(process.env.PORT) : 3000
}

export {
    routeConfig
};
