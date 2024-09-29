import { createChatroomQuery } from './db/chatrooms.queries';

function chatroomService() {
  async function createChatroom(
    chatroomName: string,
    isPublic: boolean,
    maxOccupancy: number
  ) {
    const createChatroomResult = await createChatroomQuery(
      chatroomName,
      isPublic,
      maxOccupancy
    );
    const createChatroomData = createChatroomResult.rows[0];

    return {
      chatroomUUID: createChatroomData.chatroom_uuid,
      chatroomName: createChatroomData.chatroom_name,
      isPublic: createChatroomData.is_public,
      maxOccupancy: createChatroomData.max_occupancy,
    };
  }

  return {
    createChatroom,
  };
}

export default chatroomService;
