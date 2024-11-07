import { JSONSchemaType } from 'ajv';
import ajv from '../../middleware/validation/ajv';
import { VALIDATION_ERRORS } from '../../middleware/validation/error-messages';
import createWebSocketValidator, {
  getConnectionCloseContextData,
  getConnectionParamContextData,
  getConnectionUserUUIDContextData,
} from '../../websocket/websocket.validator';

type LeaveChatroomSchema = {
  chatroomUUID: string;
  userUUID: string;
  closeCode: number;
  closeReason: string;
};

const leaveChatroomSchema: JSONSchemaType<LeaveChatroomSchema> = {
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
    closeCode: {
      type: 'number',
      nullable: false,
      errorMessage: {
        type: `${VALIDATION_ERRORS.TYPE} Number`,
      },
    },
    closeReason: {
      type: 'string',
      nullable: false,
      errorMessage: {
        type: `${VALIDATION_ERRORS.TYPE} String`,
      },
    },
  },

  required: ['chatroomUUID', 'userUUID', 'closeCode', 'closeReason'],
  additionalProperties: true,
};

const validateCreateChatroom = ajv.compile(leaveChatroomSchema);

const leaveChatroomValidator = createWebSocketValidator(
  validateCreateChatroom,
  getConnectionUserUUIDContextData,
  getConnectionParamContextData,
  getConnectionCloseContextData
);

export { leaveChatroomValidator };
export type { LeaveChatroomSchema };
