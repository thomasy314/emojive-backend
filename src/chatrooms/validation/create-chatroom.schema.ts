import { JSONSchemaType } from 'ajv';
import ajv from '../../middleware/validation/ajv';
import { VALIDATION_ERRORS } from '../../middleware/validation/error-messages';
import createExpressValidator from '../../middleware/validation/express.validator';

type CreateChatroomSchema = {
  chatroomName: string;
  isPublic: boolean;
  maxOccupancy: number;
};

const createChatroomScheam: JSONSchemaType<CreateChatroomSchema> = {
  type: 'object',
  properties: {
    chatroomName: {
      type: 'string',
      format: 'emoji',
      nullable: false,
      minLength: 1,
      maxLength: 10,
      errorMessage: {
        minLength: `${VALIDATION_ERRORS.MIN_LENGTH} 1 character`,
        maxLength: `${VALIDATION_ERRORS.MAX_LENGTH} 10 characters - note that emojis can be made up of multiple characters`,
        type: `${VALIDATION_ERRORS.TYPE} String`,
        format: `${VALIDATION_ERRORS.FORMAT} Emoji`,
      },
    },
    isPublic: {
      type: 'boolean',
      errorMessage: {
        type: `${VALIDATION_ERRORS.TYPE} Boolean`,
      },
    },
    maxOccupancy: {
      type: 'number',
      maximum: 10,
      minimum: 2,
      errorMessage: {
        minimum: `${VALIDATION_ERRORS.MIN} 2`,
        maximum: `${VALIDATION_ERRORS.MAX} 2`,
        type: `${VALIDATION_ERRORS.TYPE} Number`,
      },
    },
  },
  required: ['chatroomName'],
  additionalProperties: false,
};

const validateCreateChatroom = ajv.compile(createChatroomScheam);

const createCharoomValidator = createExpressValidator(validateCreateChatroom);

export { createCharoomValidator };
