const pathNameRegex: RegExp = /(\/.*?)(\?.*)?$/;

function getPathName(url: string): string {
  const matchResult = url.match(pathNameRegex);
  return matchResult ? matchResult[0] : '';
}

export { getPathName };
