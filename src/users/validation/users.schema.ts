import Ajv, { JSONSchemaType } from 'ajv';
import ajvErrors from 'ajv-errors';
import addFormats from 'ajv-formats';
import { VALIDATION_ERRORS } from '../../middleware/validation/errorMessages';
const ajv = new Ajv({
  allErrors: true,
  verbose: true,
});

addFormats(ajv);
ajvErrors(ajv /*,{ singleError: true }*/);

type UserSchema = {
  user_name: string;
  languages: string[];
  country_code: string;
  country_region: string;
};

const userSchema: JSONSchemaType<UserSchema> = {
  type: 'object',
  properties: {
    user_name: {
      type: 'string',
      nullable: false,
      minLength: 1,
      maxLength: 10,
      errorMessage: {
        minLength: `${VALIDATION_ERRORS.MIN_LENGTH} 1 character`,
        maxLength: `${VALIDATION_ERRORS.MAX_LENGTH} 10 characters`,
        type: `${VALIDATION_ERRORS.TYPE} String`,
      },
    },
    languages: {
      type: 'array',
      items: {
        type: 'string',
      },
      nullable: false,
      minItems: 1,
      maxItems: 10,
      errorMessage: {
        minLength: `${VALIDATION_ERRORS.MIN_LENGTH} 1 language`,
        maxLength: `${VALIDATION_ERRORS.MIN_LENGTH} 10 languages`,
        type: `${VALIDATION_ERRORS.TYPE} String[]`,
      },
    },
    country_code: {
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
    country_region: {
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
  required: ['user_name', 'languages', 'country_code'],
  additionalProperties: false,
};

export const validateUser = ajv.compile(userSchema);
