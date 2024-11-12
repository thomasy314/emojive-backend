import { Pool, QueryResult } from 'pg';
import { postgresConfig } from '../../config/postgres.config';

const pool = new Pool(postgresConfig);

async function transaction(
  innerQueries: (() => Promise<QueryResult>)[]
): Promise<QueryResult[]> {
  const responses: QueryResult[] = [];
  try {
    await query('BEGIN');
    for (const promiseFunc of innerQueries) {
      responses.push(await promiseFunc());
    }
    await query('COMMIT');
  } catch (error) {
    await query('ROLLBACK');
    throw error;
  }
  return responses;
}

function query(text: string, params?: unknown[]) {
  return pool.query(text, params);
}

export { query, transaction };
