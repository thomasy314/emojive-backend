type MessageEvent = {
  message: object;
  chatroomUUID: string;
  userUUID: string;
  timestamp: string;
};

type MessageSchema = {
  messageType: 'chat' | 'join' | 'leave';
};

type ChatMessageSchema = MessageSchema & {
  messageText: string;
};

type ChatMessageData = {
  messageText: string;
  sender: string;
};

export type { ChatMessageData, ChatMessageSchema, MessageEvent, MessageSchema };
