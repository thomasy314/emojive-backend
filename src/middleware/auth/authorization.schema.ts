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

type AuthorizationSchema = {
  userUUID: string;
};

const authorizationSchema: JSONSchemaType<AuthorizationSchema> = {
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
  additionalProperties: true,
};

const validateAuthorization = ajv.compile(authorizationSchema);

export { validateAuthorization };
