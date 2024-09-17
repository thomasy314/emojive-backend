import * as emoji from 'node-emoji';

function isOnlyEmojis(test: string) {
  const strippedText = emoji.strip(test);
  return strippedText.length === 0;
}

export { isOnlyEmojis };
