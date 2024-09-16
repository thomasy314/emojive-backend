import { QueryResult } from 'pg';
import { query } from '../../db';

function createUserQuery(
  userName: string,
  countryCode: string,
  countryRegion?: string
): Promise<QueryResult> {
  const queryText: string =
    'INSERT INTO users(user_name, country, country_region) VALUES($1, $2, $3) RETURNING *';
  const values: unknown[] = [userName, countryCode, countryRegion];

  return query(queryText, values);
}

function findUserByUUID(userUUID: string): Promise<QueryResult> {
  const queryText: string = 'SELECT * FROM users WHERE user_uuid=$1';
  const values: string[] = [userUUID];

  return query(queryText, values);
}

export { createUserQuery, findUserByUUID };
