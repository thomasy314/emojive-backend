import { JSONSchemaType } from 'ajv';
import ajv from '../../middleware/validation/ajv';
import { VALIDATION_ERRORS } from '../../middleware/validation/error-messages';
import createWebSocketValidator, {
  getConnectionContextData,
} from '../../websocket/websocket.Validator';

type JoinChatroomSchema = {
  chatroomUUID: string;
  userUUID: string;
};

const joinChatroomSchema: JSONSchemaType<JoinChatroomSchema> = {
  type: 'object',
  properties: {
    chatroomUUID: {
      type: 'string',
      format: 'uuid',
      nullable: false,
      errorMessage: {
        type: `${VALIDATION_ERRORS.TYPE} String`,
        format: `${VALIDATION_ERRORS.FORMAT} Emoji`,
      },
    },
    userUUID: {
      type: 'string',
      format: 'uuid',
      nullable: false,
      errorMessage: {
        type: `${VALIDATION_ERRORS.TYPE} String`,
        format: `${VALIDATION_ERRORS.FORMAT} Emoji`,
      },
    },
  },
  required: ['chatroomUUID', 'userUUID'],
  additionalProperties: false,
};

const validateCreateChatroom = ajv.compile(joinChatroomSchema);

const joinCharoomValidator = createWebSocketValidator(
  validateCreateChatroom,
  getConnectionContextData
);

export { joinCharoomValidator };
export type { JoinChatroomSchema };
