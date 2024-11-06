import { givenRandomString, givenValidUUID } from '../utils/test-helpers';
import { ChatMessageSchema, MessageSchema } from './messages.schema';
import messageService, { MessageService } from './messages.service';

describe('MessageService', () => {
  let service: MessageService;

  beforeEach(() => {
    service = messageService;
  });

  test('GIVEN a chat message WHEN processed THEN it should process chat message correctly', async () => {
    // Setup
    const messageText = givenRandomString();
    const message: ChatMessageSchema = {
      messageType: 'chat',
      messageText,
    };

    const userUUID = givenValidUUID();
    const messageData = { userUUID: userUUID };

    const result = await service.processIncomingMessage(message, messageData);

    expect(result).toEqual({
      messageText: messageText,
      sender: userUUID,
    });
  });

  test('GIVEN an unknown message type WHEN processed THEN it should log a warning and process with default processor', async () => {
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
