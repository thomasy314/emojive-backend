import { isValidISO3166 } from './country-code-helpers';

describe('Country Code Helpers', () => {
  describe('isValidISO316', () => {
    it('should return true for a valid country code', () => {
      expect(isValidISO3166('US')).toBe(true);
      expect(isValidISO3166('CA')).toBe(true);
    });

    it('should return true for a valid country code with region', () => {
      expect(isValidISO3166('US-CA')).toBe(true);
      expect(isValidISO3166('CA-AB')).toBe(true);
    });

    it('should return false for an invalid country code', () => {
      jest.spyOn(console, 'warn').mockImplementation(() => {});

      expect(isValidISO3166('XX')).toBe(false);
      expect(isValidISO3166('')).toBe(false);
      expect(isValidISO3166('US-')).toBe(false);
    });
  });
});
