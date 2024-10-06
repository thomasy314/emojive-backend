type ResponseError = {
  status: number;
  error: Error;
  externalMessage?: string;
  json?: object;
};

export { ResponseError };
