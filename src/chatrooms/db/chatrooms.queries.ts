import { QueryResult } from 'pg';
import { query } from '../../db/postgres';

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
    const result = await query(queryText, values);
    if (result.rowCount === 0) {
      throw Error(
        `Chatroom or user not found for UUIDs: chatroom::${chatroomUUID}, user::${userUUID}`
      );
    }
  } catch (error) {
    if ((error as { code: string }).code === '23505') {
      console.error(error);
      return;
    }
    throw error;
  }
}

function deleteChatroomUserLinkQuery(chatroomUUID: string, userUUID: string) {
  const queryText =
    'DELETE FROM chatrooms_users WHERE chatroom_id IN (SELECT chatroom_id FROM chatrooms WHERE chatroom_uuid = $1) AND user_id IN (SELECT user_id FROM users WHERE user_uuid = $2)';
  const values = [chatroomUUID, userUUID];

  return query(queryText, values);
}

function getUserChatroomsQuery(userUUId: string) {
  const queryText =
    'SELECT chatrooms.chatroom_uuid FROM chatrooms JOIN chatrooms_users ON chatrooms.chatroom_id = chatrooms_users.chatroom_id JOIN users ON users.user_id = chatrooms_users.user_id WHERE users.user_uuid = $1';

  const values = [userUUId];

  return query(queryText, values);
}

function getChatroomUsersQuery(chatroomUUID: string) {
  const queryText =
    'SELECT users.user_uuid FROM chatrooms JOIN chatrooms_users ON chatrooms.chatroom_id = chatrooms_users.chatroom_id JOIN users ON users.user_id = chatrooms_users.user_id WHERE chatrooms.chatroom_uuid = $1';

  const values = [chatroomUUID];

  return query(queryText, values);
}

function listChatroomsQuery() {
  const queryText = 'SELECT * FROM chatrooms WHERE is_public = true';

  return query(queryText);
}

export {
  createChatroomQuery,
  createChatroomUserLinkQuery,
  deleteChatroomUserLinkQuery,
  getChatroomUsersQuery,
  getUserChatroomsQuery,
  listChatroomsQuery,
};
