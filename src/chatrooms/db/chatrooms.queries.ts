import { QueryResult } from 'pg';
import { query } from '../../db';

function createChatroomQuery(
  chatroomName: String,
  isPublic: boolean,
  maxOccupancy: number
): Promise<QueryResult> {
  const queryText =
    'INSERT INTO chatrooms(chatroom_name, is_public, max_occupancy) VALUES($1, $2, $3) RETURNING *';
  const values = [chatroomName, isPublic, maxOccupancy];

  return query(queryText, values);
}

export { createChatroomQuery };
