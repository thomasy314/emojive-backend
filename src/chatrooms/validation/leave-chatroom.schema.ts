import { JSONSchemaType } from 'ajv';
import ajv from '../../middleware/validation/ajv';
import { VALIDATION_ERRORS } from '../../middleware/validation/error-messages';
import createExpressValidator from '../../middleware/validation/express.validator';

type LeaveChatroomSchema = {
  chatroomUUID: string;
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
  },
  required: ['chatroomUUID'],
  additionalProperties: false,
};

const validateLeaveChatroom = ajv.compile(leaveChatroomSchema);

const leaveChatroomValidator = createExpressValidator(validateLeaveChatroom);

export { leaveChatroomValidator };
export type { LeaveChatroomSchema };
