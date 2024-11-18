import { JSONSchemaType } from 'ajv';
import { MessageSchema } from '../../messages/messages.schema';
import ajv from '../../middleware/validation/ajv';
import { VALIDATION_ERRORS } from '../../middleware/validation/error-messages';
import createWebSocketValidator, {
  getConnectionChatroomUUIDContextData,
  getConnectionMessageContextData,
  getConnectionUserUUIDContextData,
} from '../../websocket/websocket.validator';

type ReceiveChatroomMessageSchema = {
  userUUID: string;
  chatroomUUID: string;
  message: MessageSchema;
};

const receiveChatroomMessageSchema: JSONSchemaType<ReceiveChatroomMessageSchema> =
  {
    type: 'object',
    properties: {
      chatroomUUID: {
        type: 'string',
        format: 'uuid',
        nullable: false,
        errorMessage: {
          type: `${VALIDATION_ERRORS.TYPE} String`,
          format: `${VALIDATION_ERRORS.FORMAT} UUID`,
        },
      },
      userUUID: {
        type: 'string',
        format: 'uuid',
        nullable: false,
        errorMessage: {
          type: `${VALIDATION_ERRORS.TYPE} String`,
          format: `${VALIDATION_ERRORS.FORMAT} UUID`,
        },
      },
      message: {
        type: 'object',
        oneOf: [
          {
            properties: {
              messageType: {
                type: 'string',
                enum: ['join', 'leave'],
                errorMessage: {
                  type: `${VALIDATION_ERRORS.TYPE} String`,
                  enum: `${VALIDATION_ERRORS.ENUM} 'chat' | 'join' | 'leave'`,
                },
              },
            },
          },
          {
            properties: {
              messageType: {
                type: 'string',
                enum: ['chat'],
                errorMessage: {
                  type: `${VALIDATION_ERRORS.TYPE} String`,
                  enum: `${VALIDATION_ERRORS.ENUM} 'chat'`,
                },
              },
              messageText: {
                type: 'string',
                format: 'emoji',
                nullable: false,
                errorMessage: {
                  type: `${VALIDATION_ERRORS.TYPE} String`,
                  format: `${VALIDATION_ERRORS.FORMAT} Emoji`,
                },
              },
            },
            required: ['messageText'],
          },
        ],
        required: ['messageType'],
        errorMessage: {
          type: `${VALIDATION_ERRORS.TYPE} Object`,
        },
        additionalProperties: true,
      },
    },
    required: ['chatroomUUID', 'userUUID', 'message'],
    additionalProperties: false,
  };

const validateReceiveChatroomMessage = ajv.compile(
  receiveChatroomMessageSchema
);

const receiveChatroomMessageValidator = createWebSocketValidator(
  validateReceiveChatroomMessage,
  getConnectionUserUUIDContextData,
  getConnectionChatroomUUIDContextData,
  getConnectionMessageContextData
);

export { receiveChatroomMessageValidator };
export type { ReceiveChatroomMessageSchema };
