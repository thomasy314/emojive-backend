function catchError<T>(fn: () => T): [null, T] | [Error] {
  try {
    return [null, fn()];
  } catch (e) {
    if (e instanceof Error) {
      return [e];
    }
    return [new Error(String(e).toString())];
  }
}

async function catchAsyncError<T>(
  fn: () => Promise<T>
): Promise<[null, T] | [Error]> {
  try {
    const result = await fn();
    return [null, result];
  } catch (e) {
    if (e instanceof Error) {
      return [e];
    }
    return [new Error(String(e).toString())];
  }
}

export { catchAsyncError, catchError };
