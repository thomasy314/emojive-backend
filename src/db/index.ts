import { Pool } from 'pg';
import { postgresConfig } from '../config/postgres.config';

const pool = new Pool(postgresConfig);

function query(text: string, params?: unknown[]) {
  return pool.query(text, params);
}

export { query };