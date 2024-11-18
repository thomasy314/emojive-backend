import { RequestHandler } from 'express';
import authService from '../auth/auth.service';
import { catchAsyncError } from '../errorHandling/catch-error';
import { EventBusEvent } from '../events/events.types';
import { MessageEvent, MessageSchema } from '../messages/messages.schema';
import { WebSocketRouterFunction } from '../websocket/websocket-middleware-handler';
import chatroomService from './chatrooms.service';
import { ChatroomWebSocketSchema } from './validation/chatroom-websocket.schema';
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

  const joinChatroom: RequestHandler = (
    request,
    response,
    next
  ): Promise<void> => {
    const userUUID = authService.getAuthToken(request.headers);
    const { chatroomUUID } = request.body;

    return chatroomService
      .joinChatroom(chatroomUUID, userUUID)
      .then(() => {
        response.status(201).send();
      })
      .catch(next);
  };

  const addUserChatroomsToContext: WebSocketRouterFunction = async (
    socket,
    context,
    next
  ): Promise<void> => {
    const { userUUID } = context as ChatroomWebSocketSchema;

    const [error, chatrooms] = await catchAsyncError(() =>
      chatroomService.getUserChatrooms(userUUID)
    );

    if (error) {
      next(error);
      return;
    }

    if (chatrooms.length === 0) {
      next({ error: new Error('User is not part of any chatrooms') });
      return;
    }

    if (chatrooms.length > 1) {
      next({
        error: new Error(`User is part of multiple chatrooms: ${chatrooms}`),
      });
      return;
    }

    const newContext = { ...(context as object), chatroomUUID: chatrooms[0] };

    next({ newContext });
  };

  const registerUserMessageHandler: WebSocketRouterFunction = async (
    socket,
    context,
    next
  ): Promise<void> => {
    const { userUUID } = context as ChatroomWebSocketSchema;
    const { chatroomUUID } = context as { chatroomUUID: string };

    const onMessage = (event: EventBusEvent) => {
      const eventValue = event.value as MessageEvent;

      const outgoing = {
        ...eventValue.message,
        timeStamp: eventValue.timestamp,
      };

      socket.send(JSON.stringify(outgoing));
    };

    return chatroomService
      .addChatroomMessageReceiver(userUUID, chatroomUUID, onMessage)
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
    const { userUUID } = context as LeaveChatroomSchema;
    const { chatroomUUID } = context as { chatroomUUID: string };

    console.log('leaving chatroom: ', chatroomUUID, userUUID);

    chatroomService.leaveChatroom(chatroomUUID, userUUID).catch(next);
  };

  return {
    createChatroom,
    joinChatroom,
    addUserChatroomsToContext,
    registerUserMessageHandler,
    receiveChatroomMessage,
    leaveChatroom,
  };
}

export default chatroomController();
