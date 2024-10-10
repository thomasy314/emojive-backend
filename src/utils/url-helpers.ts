function urlEndToURL(urlEnd: string | undefined) {
  return new URL(`http://${process.env.HOST ?? 'localhost'}${urlEnd}`);
}

export { urlEndToURL };
