import { query } from '../../db';
import { givenLanguageTag } from '../../utils/test-helpers';
import { createLanguageQuery } from './languages.queries';

jest.mock('../../db');

describe('languages queries', () => {
  describe('Create language query', () => {
    test('GIVEN language tags THEN query is called with the correct input', async () => {
      // Setup
      const languageTags = [givenLanguageTag(), givenLanguageTag('en', '')];

      const queryMock = jest.mocked(query);

      // Execute
      await createLanguageQuery(languageTags);

      // Validate
      expect(queryMock).toHaveBeenCalledTimes(1);
      const expectedQuery =
        'WITH new_rows(language_code, region_code) AS ( VALUES ($1, $2), ($3, $4)) , inserted AS (INSERT INTO languages (language_code, region_code) SELECT language_code, region_code FROM new_rows ON CONFLICT (language_code, region_code) DO NOTHING RETURNING *) SELECT * FROM inserted UNION ALL SELECT * FROM languages WHERE EXISTS (SELECT * FROM new_rows WHERE languages.language_code = new_rows.language_code AND languages.region_code = new_rows.region_code)';
      expect(queryMock).toHaveBeenCalledWith(expectedQuery, [
        'en',
        'GB',
        'en',
        '',
      ]);
    });
  });
});
