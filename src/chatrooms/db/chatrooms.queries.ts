import { QueryResult } from 'pg';
import { query } from '../../db';

function createChatroomQuery(
  chatroomName: string,
  isPublic: boolean,
  maxOccupancy: number
): Promise<QueryResult> {
  const queryText =
    'INSERT INTO chatrooms(chatroom_name, is_public, max_occupancy) VALUES($1, $2, $3) RETURNING *';
  const values = [chatroomName, isPublic, maxOccupancy];

  return query(queryText, values);
}

async function createChatroomUserLinkQuery(
  chatroomUUID: string,
  userUUID: string
) {
  const queryText =
    'INSERT INTO chatrooms_users (chatroom_id, user_id) SELECT c.chatroom_id, u.user_id FROM (SELECT chatroom_id FROM chatrooms WHERE chatroom_uuid = $1) AS c CROSS JOIN (SELECT user_id FROM users WHERE user_uuid = $2) AS u';
  const values = [chatroomUUID, userUUID];

  try {
    await query(queryText, values);
  } catch (error) {
    // @ts-expect-error - error is a pg error
    if (error.code !== '23505') {
      throw error;
    }
    console.error(error);
  }
}

async function deleteChatroomUserLinkQuery(
  chatroomUUID: string,
  userUUID: string
) {
  const queryText =
    'DELETE FROM chatrooms_users WHERE chatroom_id IN (SELECT chatroom_id FROM chatrooms WHERE chatroom_uuid = $1) AND user_id IN (SELECT user_id FROM users WHERE user_uuid = $2)';
  const values = [chatroomUUID, userUUID];

  await query(queryText, values);
}

export {
  createChatroomQuery,
  createChatroomUserLinkQuery,
  deleteChatroomUserLinkQuery,
};
