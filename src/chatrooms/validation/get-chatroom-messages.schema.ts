import { JSONSchemaType } from 'ajv';
import ajv from '../../middleware/validation/ajv';
import { VALIDATION_ERRORS } from '../../middleware/validation/error-messages';
import createExpressValidator from '../../middleware/validation/express.validator';

type GetChatroomMessagesSchema = {
  chatroomUUID: string;
};

const getChatroomMessagesSchema: JSONSchemaType<GetChatroomMessagesSchema> = {
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

const validateGetChatroomMessages = ajv.compile(getChatroomMessagesSchema);

const getChatroomMessagesValidator = createExpressValidator(
  validateGetChatroomMessages
);

export { getChatroomMessagesValidator };
export type { GetChatroomMessagesSchema };
