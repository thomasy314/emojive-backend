import Ajv from 'ajv';
import ajvErrors from 'ajv-errors';
import addFormats from 'ajv-formats';
import tags from 'language-tags';
import ajvOptions from '../../config/ajv.config';
import { isOnlyEmojis } from '../../utils/emoji-helpers';

const ajv = new Ajv(ajvOptions);

addFormats(ajv);
ajvErrors(ajv /*,{ singleError: true }*/);

ajv.addFormat('emoji', {
  type: 'string',
  validate: isOnlyEmojis,
});

ajv.addFormat('language-tag', {
  type: 'string',
  validate: tags.check,
});

export default ajv;
