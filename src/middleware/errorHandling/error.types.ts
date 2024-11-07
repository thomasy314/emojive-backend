type ResponseError = {
  status: number;
  error: Error;
  externalMessage?: string;
  json?: object;
};

function instanceOfResponseError(obj: unknown): boolean {
  return obj instanceof Object && 'status' in obj && 'error' in obj;
}

export { ResponseError, instanceOfResponseError };
