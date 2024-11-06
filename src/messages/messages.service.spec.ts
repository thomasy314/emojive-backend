import { ChatMessageSchema, MessageSchema } from './messages.schema';
import messageService, { MessageService } from './messages.service';

describe('MessageService', () => {
  let service: MessageService;

  beforeEach(() => {
    service = messageService;
  });

  it('should process chat message correctly', async () => {
    const message: ChatMessageSchema = {
      messageType: 'chat',
      messageText: 'Hello, world!',
    };
    const messageData = { userUUID: '12345' };

    const result = await service.processIncomingMessage(message, messageData);

    expect(result).toEqual({
      messageText: 'Hello, world!',
      sender: '12345',
    });
  });

  it('should log a warning and process unknown message type with default processor', async () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

    const message: MessageSchema = {
      // @ts-expect-error - testing unknown message type
      messageType: 'unknown',
    };
    const messageData = {};

    const result = await service.processIncomingMessage(message, messageData);

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Message with unknown type: ',
      message
    );
    expect(result).toEqual({});
  });
});
