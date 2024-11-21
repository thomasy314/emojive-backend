import { JSONSchemaType } from 'ajv';
import ajv from '../../middleware/validation/ajv';
import createExpressValidator from '../../middleware/validation/express.validator';

type ListChatroomsSchema = object;

const listChatroomsSchema: JSONSchemaType<ListChatroomsSchema> = {
  type: 'object',
  properties: {},
  required: [],
  additionalProperties: false,
};

const validateListChatrooms = ajv.compile(listChatroomsSchema);

const listChatroomsValidator = createExpressValidator(validateListChatrooms);

export { listChatroomsValidator };
export type { ListChatroomsSchema };
