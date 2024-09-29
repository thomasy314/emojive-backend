import { RequestHandler } from 'express';
import chatroomService from './chatrooms.service';

function chatroomController() {
  const createChatroom: RequestHandler = (
    request,
    response,
    next
  ): Promise<void> => {
    const { chatroomName, isPublic, maxOccupancy } = request.body;

    return chatroomService()
      .createChatroom(chatroomName, isPublic, maxOccupancy)
      .then(result => {
        response.send(result);
      })
      .catch(next);
  };

  return {
    createChatroom,
  };
}

export default chatroomController;
