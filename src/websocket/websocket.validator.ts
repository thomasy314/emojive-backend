import { ValidateFunction } from 'ajv';
import { IncomingMessage } from 'http';
import { ResponseError } from '../middleware/errorHandling/error.types';
import { parseErrors } from '../middleware/validation/ajv-errors';
import { urlEndToURL } from '../utils/url-helpers';
import webSocketCloseCode from './websocket-close-codes';
import { WebSocketRouterFunction } from './websocket-middleware-handler';

type GetContextDataFunction = (context: unknown) => object;

function getConnectionParamContextData(context: unknown) {
  const incomingMessage = context as IncomingMessage;
  return Object.fromEntries(
    urlEndToURL(incomingMessage.url).searchParams.entries()
  );
}

function getConnectionMessageContextData(context: unknown) {
  const message = context as { message: object };
  return {
    message: message.message,
  };
}

function getConnectionCloseContextData(context: unknown) {
  const closeData = context as { code: number; reason: Buffer };
  return {
    closeCode: closeData.code,
    closeReason: closeData.reason.toString(),
  };
}

function getConnectionUserUUIDContextData(context: unknown) {
  const { userUUID } = context as { userUUID: string };
  return { userUUID };
}

function getConnectionChatroomUUIDContextData(context: unknown) {
  const { chatroomUUID } = context as { chatroomUUID: string };
  return { chatroomUUID };
}

function createWebSocketValidator(
  validateFunction: ValidateFunction,
  ...getContextDataFunctions: GetContextDataFunction[]
): WebSocketRouterFunction {
  return async (socket, context, next): Promise<void> => {
    const data = getContextDataFunctions.reduce((acc, fn) => {
      return { ...acc, ...fn(context) };
    }, {});

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

    next({ newContext: data }); // If no error occurred proceed further
  };
}

export default createWebSocketValidator;
export {
  getConnectionChatroomUUIDContextData,
  getConnectionCloseContextData,
  getConnectionMessageContextData,
  getConnectionParamContextData,
  getConnectionUserUUIDContextData,
};
