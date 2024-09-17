import { givenInvalidUUID, givenValidUUID } from './test-helpers';
import { isValidUUID } from './uuid-helpers';

describe('UUID Helpers', () => {
  describe('isValidUUID', () => {
    test('GIVEN valid uuid THEN returns true', () => {
      // Setup
      const uuid = givenValidUUID();

      // Execute
      const isValid = isValidUUID(uuid);

      // Validate
      expect(isValid).toBe(true);
    });
    test('GIVEN invalid uuid THEN returns false', () => {
      // Setup
      const uuid = givenInvalidUUID();

      // Execute
      const isValid = isValidUUID(uuid);

      // Validate
      expect(isValid).toBe(false);
    });
  });
});
