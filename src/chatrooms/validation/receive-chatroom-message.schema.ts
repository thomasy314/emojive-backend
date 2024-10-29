import { JSONSchemaType } from 'ajv';
import ajv from '../../middleware/validation/ajv';
import { VALIDATION_ERRORS } from '../../middleware/validation/error-messages';
import createWebSocketValidator, {
  getConnectionMessageContextData,
  getConnectionParamContextData,
} from '../../websocket/websocket.validator';

type ReceiveChatroomMessageSchema = {
  chatroomUUID: string;
  userUUID: string;
  message: object;
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
        nullable: false,
        errorMessage: {
          type: `${VALIDATION_ERRORS.TYPE} Object`,
        },
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
  getConnectionParamContextData,
  getConnectionMessageContextData
);

export { receiveChatroomMessageValidator };
export type { ReceiveChatroomMessageSchema };
