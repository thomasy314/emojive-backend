type ResponseError = {
  status: number;
  error: Error;
  json?: object;
};

export { ResponseError };
