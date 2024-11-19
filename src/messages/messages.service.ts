import {
  mongoDBMessageCollection,
  mongoDBName,
} from '../config/mongodb.config';
import createMongoConnection from '../db/mongodb';
import { MessageEvent } from '../messages/messages.schema';
import { findUserByUUIDQuery } from '../users/db/users.queries';
import {
  ChatMessageData,
  ChatMessageSchema,
  MessageSchema,
} from './messages.schema';

interface MessageService {
  getChatroomMessages: (chatroomUUID: string) => Promise<MessageEvent[]>;
  processIncomingMessage: (
    message: MessageSchema,
    messageData: object
  ) => Promise<object>;
  extractUserVisibleMessageContent: (event: MessageEvent) => object;
}

function messageService(): MessageService {
  const processorLookup = {
    chat: _chatMessageProcessor,
  };

  const mongoDBPromise = createMongoConnection(
    mongoDBName,
    mongoDBMessageCollection
  );

  async function processIncomingMessage(
    message: MessageSchema,
    messageData: object
  ): Promise<object> {
    const processor =
      processorLookup[message.messageType as keyof typeof processorLookup] ??
      _defaultMessageProcessor;

    const formattedMessage = await processor(message, messageData);
    return {
      ...formattedMessage,
      messageType: message.messageType,
    };
  }

  async function _defaultMessageProcessor(
    message: MessageSchema,
    messageData: object
  ): Promise<object> {
    const userName = await _getUserNameFromMessageData(messageData);
    return { sender: userName };
  }

  async function _chatMessageProcessor(
    message: MessageSchema,
    messageData: object
  ): Promise<ChatMessageData> {
    const { messageText } = message as ChatMessageSchema;

    const userName = await _getUserNameFromMessageData(messageData);

    return {
      messageText,
      sender: userName,
    };
  }

  async function _getUserNameFromMessageData(
    messageData: object
  ): Promise<string> {
    const { userUUID } = messageData as { userUUID: string };

    if (!userUUID) {
      throw new Error('User UUID is required for chat messages');
    }

    const findUserQuery = await findUserByUUIDQuery(userUUID);
    const userName = findUserQuery.rows[0]?.user_name;

    if (!userName) {
      throw new Error(`User with UUID ${userUUID} not found`);
    }

    return userName;
  }

  async function getChatroomMessages(
    chatroomUUID: string
  ): Promise<MessageEvent[]> {
    return await mongoDBPromise.then(async db => {
      return await db
        .getItems<{
          value: MessageEvent;
        }>(
          { 'value.chatroomUUID': chatroomUUID },
          { projection: { _id: 0, value: 1 } }
        )
        .then(result => result.map(item => item.value).filter(item => item));
    });
  }

  function extractUserVisibleMessageContent(event: MessageEvent): object {
    return {
      ...event.message,
      timeStamp: event.timestamp,
    };
  }

  return {
    getChatroomMessages,
    processIncomingMessage,
    extractUserVisibleMessageContent,
  };
}

export default messageService();
export type { MessageService };
