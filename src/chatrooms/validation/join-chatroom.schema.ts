import { JSONSchemaType } from 'ajv';
import ajv from '../../middleware/validation/ajv';
import { VALIDATION_ERRORS } from '../../middleware/validation/error-messages';
import createExpressValidator from '../../middleware/validation/express.validator';

type JoinChatroomSchema = {
  chatroomUUID: string;
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
        format: `${VALIDATION_ERRORS.FORMAT} UUID`,
      },
    },
  },
  required: ['chatroomUUID'],
  additionalProperties: false,
};

const validateJoinChatroom = ajv.compile(joinChatroomSchema);

const joinCharoomValidator = createExpressValidator(validateJoinChatroom);

export { joinCharoomValidator };
export type { JoinChatroomSchema };
