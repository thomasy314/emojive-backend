import { PoolConfig } from 'pg';
import { env } from 'process';

const postgresConfig: PoolConfig = {
  user: env.POSTGRES_USER,
  password: env.POSTGRES_PASSWORD,
  port: parseInt(env.POSTGRES_PORT ?? '5432'),
  host: env.POSTGRES_HOST,
  database: env.POSTGRES_DB ?? 'emojive_db',
};

export { postgresConfig };
