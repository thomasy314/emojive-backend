function subProtocolsToObject(subProtocols: string[]): object {
  const result: { [key: string]: string } = {};

  for (let i = 0; i < subProtocols.length; i += 2) {
    result[subProtocols[i].toLowerCase()] = subProtocols[i + 1];
  }

  return result;
}

export { subProtocolsToObject };
