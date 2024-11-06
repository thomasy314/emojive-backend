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

    return processor(message, messageData);
  }

  function _defaultMessageProcessor(
    message: MessageSchema,
    messageData: object
  ): object {
    console.warn('Message with unknown type: ', message);
    return {};
  }

  function _chatMessageProcessor(
    message: MessageSchema,
    messageData: object
  ): ChatMessageData {
    const { messageText } = message as ChatMessageSchema;
    const { userUUID } = messageData as { userUUID: string };
    return {
      messageText,
      sender: userUUID,
    };
  }

  return {
    processIncomingMessage,
  };
}

export default messageService();
export type { MessageService };
