import { RequestHandler } from 'express';
import authService from '../auth/auth.service';
import { catchAsyncError } from '../errorHandling/catch-error';
import { EventBusEvent } from '../events/events.types';
import { MessageEvent, MessageSchema } from '../messages/messages.schema';
import messagesService from '../messages/messages.service';
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

  const getChatroomMessages: RequestHandler = async (
    request,
    response,
    next
  ): Promise<void> => {
    const { chatroomUUID } = request.query as { chatroomUUID: string };
    const userUUID = authService.getAuthToken(request.headers);

    const chatroomUsers = await chatroomService.getChatroomUsers(chatroomUUID);

    if (!chatroomUsers.includes(userUUID)) {
      next({
        status: 403,
        error: new Error(
          `User [${userUUID}] is not a member of chatroom [${chatroomUUID}] `
        ),
      });
      return;
    }

    return messagesService
      .getChatroomMessages(chatroomUUID)
      .then(messages =>
        messages.map(messagesService.extractUserVisibleMessageContent)
      )
      .then(messages => {
        response.send(messages);
      })
      .catch(next);
  };

  const listChatrooms: RequestHandler = async (
    request,
    response,
    next
  ): Promise<void> => {
    return chatroomService
      .listChatrooms()
      .then(chatrooms => {
        response.send(chatrooms);
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

      const outGoing =
        messagesService.extractUserVisibleMessageContent(eventValue);

      socket.send(JSON.stringify(outGoing));
    };

    await chatroomService
      .addChatroomMessageReceiver(userUUID, chatroomUUID, onMessage)
      .then(() => next())
      .catch(next);
  };

  const emitUserJoinedChatroomMessage: WebSocketRouterFunction = (
    socket,
    context,
    next
  ): Promise<void> => {
    const { userUUID } = context as ChatroomWebSocketSchema;
    const { chatroomUUID } = context as { chatroomUUID: string };

    const userJoinedMessage: MessageSchema = {
      messageType: 'join',
    };

    return chatroomService
      .emitChatroomMessage(chatroomUUID, userUUID, userJoinedMessage)
      .catch(next);
  };

  const emitUserLeftChatroomMessage: WebSocketRouterFunction = (
    socket,
    context,
    next
  ): Promise<void> => {
    const { userUUID } = context as ChatroomWebSocketSchema;
    const { chatroomUUID } = context as { chatroomUUID: string };

    console.log('User left chatroom', userUUID, chatroomUUID);

    const userJoinedMessage: MessageSchema = {
      messageType: 'leave',
    };

    return chatroomService
      .emitChatroomMessage(chatroomUUID, userUUID, userJoinedMessage)
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
      .emitChatroomMessage(chatroomUUID, userUUID, message)
      .catch(next);
  };

  const leaveChatroom: WebSocketRouterFunction = (socket, context, next) => {
    const { userUUID } = context as LeaveChatroomSchema;
    const { chatroomUUID } = context as { chatroomUUID: string };

    return chatroomService
      .leaveChatroom(chatroomUUID, userUUID)
      .then(() => next())
      .catch(next);
  };

  return {
    createChatroom,
    joinChatroom,
    getChatroomMessages,
    listChatrooms,
    addUserChatroomsToContext,
    registerUserMessageHandler,
    emitUserJoinedChatroomMessage,
    emitUserLeftChatroomMessage,
    receiveChatroomMessage,
    leaveChatroom,
  };
}

export default chatroomController();
