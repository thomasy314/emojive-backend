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

export default catchError;
