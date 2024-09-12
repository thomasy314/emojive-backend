import { ErrorObject } from 'ajv';

export const parseErrors = async (validationErrors: ErrorObject[]) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const errors: any[] = [];
  validationErrors.forEach(error => {
    errors.push({
      param: error.params.missingProperty ?? error.instancePath,
      message: error.message,
      value: error.params.missingProperty ?? error.data,
    });
  });
  return errors;
};
