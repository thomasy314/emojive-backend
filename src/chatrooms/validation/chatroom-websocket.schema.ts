import { JSONSchemaType } from 'ajv';
import ajv from '../../middleware/validation/ajv';
import { VALIDATION_ERRORS } from '../../middleware/validation/error-messages';
import createWebSocketValidator, {
  getConnectionUserUUIDContextData,
} from '../../websocket/websocket.validator';

type ChatroomWebSocketSchema = {
  userUUID: string;
};

const chatroomWebSocketSchema: JSONSchemaType<ChatroomWebSocketSchema> = {
  type: 'object',
  properties: {
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
  required: ['userUUID'],
  additionalProperties: false,
};

const validateChatroomWebsocket = ajv.compile(chatroomWebSocketSchema);

const chatroomWebsocketValidator = createWebSocketValidator(
  validateChatroomWebsocket,
  getConnectionUserUUIDContextData
);

export { chatroomWebsocketValidator };
export type { ChatroomWebSocketSchema };
