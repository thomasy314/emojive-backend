import { findUserByUUIDQuery } from '../users/db/users.queries';
import {
  ChatMessageData,
  ChatMessageSchema,
  MessageSchema,
} from './messages.schema';

interface MessageService {
  processIncomingMessage: (
    message: MessageSchema,
    messageData: object
  ) => Promise<object>;
}

function messageService(): MessageService {
  const processorLookup = {
    chat: _chatMessageProcessor,
  };

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

  function _defaultMessageProcessor(message: MessageSchema): object {
    console.warn('Message with unknown type: ', message);
    return {};
  }

  async function _chatMessageProcessor(
    message: MessageSchema,
    messageData: object
  ): Promise<ChatMessageData> {
    const { messageText } = message as ChatMessageSchema;
    const { userUUID } = messageData as { userUUID: string };

    if (!userUUID) {
      throw new Error('User UUID is required for chat messages');
    }

    const findUserQuery = await findUserByUUIDQuery(userUUID);
    const userName = findUserQuery.rows[0]?.user_name;

    if (!userName) {
      throw new Error(`User with UUID ${userUUID} not found`);
    }

    return {
      messageText,
      sender: userName,
    };
  }

  return {
    processIncomingMessage,
  };
}

export default messageService();
export type { MessageService };
