import { JSONSchemaType } from 'ajv';
import ajv from '../../middleware/validation/ajv';
import { VALIDATION_ERRORS } from '../../middleware/validation/error-messages';
import createExpressValidator from '../../middleware/validation/express.validator';

type UserSchema = {
  userName: string;
  languages: string[];
  countryCode: string;
  countryRegion: string;
};

const userSchema: JSONSchemaType<UserSchema> = {
  type: 'object',
  properties: {
    userName: {
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
    languages: {
      type: 'array',
      items: {
        type: 'string',
        format: 'language-tag',
        errorMessage: {
          format: `${VALIDATION_ERRORS.FORMAT} language-tag (RFC 5646)`,
          type: `${VALIDATION_ERRORS.TYPE} String`,
        },
      },
      nullable: false,
      minItems: 1,
      maxItems: 10,
      errorMessage: {
        minLength: `${VALIDATION_ERRORS.MIN_LENGTH} 1 language`,
        maxLength: `${VALIDATION_ERRORS.MAX_LENGTH} 10 languages`,
        type: `${VALIDATION_ERRORS.TYPE} String[]`,
      },
    },
    countryCode: {
      type: 'string',
      nullable: false,
      minLength: 2,
      maxLength: 2,
      errorMessage: {
        minLength: `${VALIDATION_ERRORS.EXACT_LENGTH} 2 characters`,
        maxLength: `${VALIDATION_ERRORS.EXACT_LENGTH} 2 characters`,
        type: `${VALIDATION_ERRORS.TYPE} String`,
      },
    },
    countryRegion: {
      type: 'string',
      minLength: 2,
      maxLength: 2,
      errorMessage: {
        minLength: `${VALIDATION_ERRORS.EXACT_LENGTH} 2 characters`,
        maxLength: `${VALIDATION_ERRORS.EXACT_LENGTH} 2 characters`,
        type: `${VALIDATION_ERRORS.TYPE} String`,
      },
    },
  },
  required: ['userName', 'languages', 'countryCode'],
  additionalProperties: false,
};

const validateUser = ajv.compile(userSchema);

const userValidator = createExpressValidator(validateUser);

export { userValidator };
