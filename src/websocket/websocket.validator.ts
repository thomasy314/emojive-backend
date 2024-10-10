import { ValidateFunction } from 'ajv';
import { IncomingMessage } from 'http';
import { ResponseError } from '../middleware/errorHandling/error.types';
import { parseErrors } from '../middleware/validation/ajv-errors';
import { urlEndToURL } from '../utils/url-helpers';
import webSocketCloseCode from './websocket-close-codes';
import { WebSocketRouterFunction } from './websocket-middleware-handler';

type GetContextDataFunction = (context: unknown) => object;

function getConnectionContextData(context: unknown) {
  const incomingMessage = context as IncomingMessage;
  return Object.fromEntries(
    urlEndToURL(incomingMessage.url).searchParams.entries()
  );
}

function createWebSocketValidator(
  validateFunction: ValidateFunction,
  getContextDataFuntcion: GetContextDataFunction
): WebSocketRouterFunction {
  return async (socket, context, next): Promise<void> => {
    const data = getContextDataFuntcion(context);

    const isValid = validateFunction(data);

    if (!isValid && validateFunction.errors) {
      // If schema validation failed and error occurred return with formatted error message
      const errors = parseErrors(validateFunction.errors);
      const responseError: ResponseError = {
        status: webSocketCloseCode.POLICY_VIOLATION,
        error: new Error('Input Validation Error'),
        json: { validationErrors: errors },
      };
      next({ error: responseError });
      return;
    }

    next(); // If no error occurred proceed further
  };
}

export default createWebSocketValidator;
export { getConnectionContextData };
