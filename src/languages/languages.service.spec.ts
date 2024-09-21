import languagesService from './languages.service';

describe('languages service', () => {
  describe('language tag to language tag ob', () => {
    test('GIVEN language tag without region THEN function returns transformed obj', () => {
      // Setup
      const languageTag = 'en';

      // Execute
      const languageTagObj =
        languagesService().languageTagToLanguageTagObj(languageTag);

      // Validate
      expect(languageTagObj).toStrictEqual({
        languageCode: 'en',
        regionCode: null,
      });
    });

    test('GIVEN language tag with region THEN function returns transformed obj', () => {
      // Setup
      const languageTag = 'en-GB';

      // Execute
      const languageTagObj =
        languagesService().languageTagToLanguageTagObj(languageTag);

      // Validate
      expect(languageTagObj).toStrictEqual({
        languageCode: 'en',
        regionCode: 'GB',
      });
    });

    test('GIVEN unformatted valid language tag THEN function returns formatted and transformed obj', () => {
      // Setup
      const languageTag = 'EN-gb';

      // Execute
      const languageTagObj =
        languagesService().languageTagToLanguageTagObj(languageTag);

      // Validate
      expect(languageTagObj).toStrictEqual({
        languageCode: 'en',
        regionCode: 'GB',
      });
    });

    test('GIVEN invalid language tag THEN function throws error', () => {
      // Setup
      const invalidLanguageTag = 'invalid tag';

      try {
        // Execute
        languagesService().languageTagToLanguageTagObj(invalidLanguageTag);
      } catch (error) {
        // Validate
        expect(error).toStrictEqual(Error('Invalid language tag: invalid tag'));
      }
    });
  });
});
