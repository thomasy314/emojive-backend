import { NextFunction, Request, Response } from 'express';

function chatroomController() {
  function createChatroom(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const { chatroomName, isPublic, maxOccupancy } = req.body;

    // TODO: Call chatroomService().createChatroom

    res.send({
      chatroomUUID: '123', // TODO: Get UUID from createChatroom() call
      chatroomName,
      isPublic,
      maxOccupancy,
    });
    return Promise.resolve().catch(next);
  }

  return {
    createChatroom,
  };
}

export default chatroomController;
