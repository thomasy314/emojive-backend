import { isValidISO3166 } from './country-code-helpers';

describe('Country Code Helpers', () => {
  describe('isValidISO316', () => {
    test('GIVEN a valid country code THEN should return true', () => {
      expect(isValidISO3166('US')).toBe(true);
      expect(isValidISO3166('CA')).toBe(true);
    });

    test('GIVEN a valid country code with region THEN should return true', () => {
      expect(isValidISO3166('US-CA')).toBe(true);
      expect(isValidISO3166('CA-AB')).toBe(true);
    });

    test('GIVEN valid string but non-existent country THEN should return false', () => {
      expect(isValidISO3166('XX')).toBe(false);
      expect(isValidISO3166('')).toBe(false);
    });

    test('GIVEN an invalid country code THEN should return false', () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      expect(isValidISO3166('US-')).toBe(false);

      expect(warnSpy).toHaveBeenCalledTimes(1);
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringMatching('error parsing iso-3166 code:'),
        expect.anything()
      );
    });
  });
});
