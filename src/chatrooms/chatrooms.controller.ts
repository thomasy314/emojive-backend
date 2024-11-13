import { RequestHandler } from 'express';
import { EventBusEvent } from '../events/events.types';
import { MessageEvent, MessageSchema } from '../messages/messages.schema';
import { WebSocketRouterFunction } from '../websocket/websocket-middleware-handler';
import chatroomService from './chatrooms.service';
import { JoinChatroomSchema } from './validation/join-chatroom.schema';
import { LeaveChatroomSchema } from './validation/leave-chatroom.schema';

function chatroomController() {
  const createChatroom: RequestHandler = (
    request,
    response,
    next
  ): Promise<void> => {
    const { chatroomName, isPublic, maxOccupancy } = request.body;

    return chatroomService
      .createChatroom(chatroomName, isPublic, maxOccupancy)
      .then(result => {
        response.send(result);
      })
      .catch(next);
  };

  const joinChatroom: WebSocketRouterFunction = (
    socket,
    context,
    next
  ): Promise<void> => {
    const { chatroomUUID, userUUID } = context as JoinChatroomSchema;

    const onMessage = (event: EventBusEvent) => {
      const eventValue = event.value as MessageEvent;

      const outgoing = {
        ...eventValue.message,
        timeStamp: eventValue.timestamp,
      };

      socket.send(JSON.stringify(outgoing));
    };

    return chatroomService
      .joinChatroom(chatroomUUID, userUUID, onMessage)
      .catch(next);
  };

  const receiveChatroomMessage: WebSocketRouterFunction = (
    socket,
    context,
    next
  ): Promise<void> => {
    const { chatroomUUID, userUUID, message } = context as {
      chatroomUUID: string;
      userUUID: string;
      message: MessageSchema;
    };

    return chatroomService
      .receiveChatroomMessage(chatroomUUID, userUUID, message)
      .catch(next);
  };

  const leaveChatroom: WebSocketRouterFunction = (socket, context, next) => {
    const { chatroomUUID, userUUID } = context as LeaveChatroomSchema;

    chatroomService.leaveChatroom(chatroomUUID, userUUID).catch(next);
  };

  return {
    createChatroom,
    joinChatroom,
    receiveChatroomMessage,
    leaveChatroom,
  };
}

export default chatroomController();
