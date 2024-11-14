import { JSONSchemaType } from 'ajv';
import ajv from '../../middleware/validation/ajv';
import { VALIDATION_ERRORS } from '../../middleware/validation/error-messages';
import createWebSocketValidator, {
  getConnectionParamContextData,
  getConnectionUserUUIDContextData,
} from '../../websocket/websocket.validator';

type LeaveChatroomSchema = {
  chatroomUUID: string;
  userUUID: string;
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
  },

  required: ['chatroomUUID', 'userUUID'],
  additionalProperties: true,
};

const validateCreateChatroom = ajv.compile(leaveChatroomSchema);

const leaveChatroomValidator = createWebSocketValidator(
  validateCreateChatroom,
  getConnectionUserUUIDContextData,
  getConnectionParamContextData
);

export { leaveChatroomValidator };
export type { LeaveChatroomSchema };
