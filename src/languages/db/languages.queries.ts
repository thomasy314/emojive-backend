import { QueryResult } from 'pg';
import { query } from '../../db';
import { LanguageTag } from '../languages.types';

function createLanguageQuery(languages: LanguageTag[]): Promise<QueryResult> {
  const insertLoc = languages
    .map((_, i) => `($${i * 2 + 1}, $${i * 2 + 2})`)
    .join(', ');

  const insertValues = languages.flatMap(lang => [
    lang.languageCode,
    lang.regionCode,
  ]);

  // If language doesn't exist, insert, else, select the existing language
  const queryText = `WITH new_rows(language_code, region_code) AS ( VALUES ${insertLoc}) , inserted AS (INSERT INTO languages (language_code, region_code) SELECT language_code, region_code FROM new_rows ON CONFLICT (language_code, region_code) DO NOTHING RETURNING *) SELECT * FROM inserted UNION ALL SELECT * FROM languages WHERE EXISTS (SELECT * FROM new_rows WHERE languages.language_code = new_rows.language_code AND languages.region_code = new_rows.region_code)`;

  return query(queryText, insertValues);
}

export { createLanguageQuery };
