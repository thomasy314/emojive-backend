import { isOnlyEmojis } from './emoji-helpers';

describe('Emoji Helpers', () => {
  describe('isOnlyEmojis', () => {
    test('GIVEN only emoji text THEN return true', () => {
      // Setup
      const text = '📋🚶🅿️⛄️🔪🔦🚋💳📋';

      // Execute
      const result = isOnlyEmojis(text);

      // Validate
      expect(result).toBe(true);
    });

    test('GIVEN compound emoji text THEN return true', () => {
      // Setup
      const text = '🍄‍🟫';

      // Execute
      const result = isOnlyEmojis(text);

      // Validate
      expect(result).toBe(true);
    });

    test('GIVEN blank text THEN return true', () => {
      // Setup
      const text = '';

      // Execute
      const result = isOnlyEmojis(text);

      // Validate
      expect(result).toBe(true);
    });

    test('GIVEN mixed text THEN return false', () => {
      // Setup
      const text = '🔒💅timmy';

      // Execute
      const result = isOnlyEmojis(text);

      // Validate
      expect(result).toBe(false);
    });

    test('GIVEN only non-emojis THEN return false', () => {
      // Setup
      const text = 'tim-tam';

      // Execute
      const result = isOnlyEmojis(text);

      // Validate
      expect(result).toBe(false);
    });
  });
});
