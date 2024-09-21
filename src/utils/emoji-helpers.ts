import { strip as emojiStrip } from 'node-emoji';

function isOnlyEmojis(test: string) {
  const strippedText = emojiStrip(test);
  return strippedText.length === 0;
}

export { isOnlyEmojis };
