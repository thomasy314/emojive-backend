import { IncomingMessage } from 'http';
import { WebSocket } from 'ws';
import ajv from '../middleware/validation/ajv';
import { givenRandomString, givenValidUUID } from '../utils/test-helpers';
import createWebSocketValidator, {
  getConnectionCloseContextData,
  getConnectionMessageContextData,
  getConnectionParamContextData,
  getConnectionUserUUIDContextData,
} from './websocket.validator';

describe('WebSocket Validator', () => {
  describe('Create WebSocket Validator', () => {
    const testSchema = {
      type: 'object',
      properties: {
        foo: { type: 'integer' },
        bar: { type: 'string' },
      },
      required: ['foo', 'bar'],
      additionalProperties: false,
    };
    const validationFunction = ajv.compile(testSchema);

    const socket = {} as WebSocket;
    const context = {};
    const next = jest.fn();

    afterEach(() => {
      jest.clearAllMocks();
    });

    test('GIVEN valid input passed to validator THEN calls next with no arguments', () => {
      // Setup
      const getContextFunction = jest.fn();
      const context = { foo: 1, bar: 'hi' };
      getContextFunction.mockReturnValueOnce(context);

      // Execute
      const wsValidator = createWebSocketValidator(
        validationFunction,
        getContextFunction
      );
      wsValidator(socket, context, next);
      // Validate

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith({
        newContext: context,
      });
    });

    test('GIVEN invalid input passed to validator THEN calls next with error arguments', () => {
      // Setup
      const getContextFunction = jest.fn();
      getContextFunction.mockReturnValueOnce({ foo: 1 });

      // Execute
      const wsValidator = createWebSocketValidator(
        validationFunction,
        getContextFunction
      );
      wsValidator(socket, context, next);

      // Validate
      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith({
        error: {
          error: new Error('Input Validation Error'),
          json: {
            validationErrors: [
              {
                message: "must have required property 'bar'",
                param: 'bar',
                value: 'bar',
              },
            ],
          },
          status: 1008,
        },
      });
    });
  });

  describe('Get Context Data Functions', () => {
    test('GIVEN connection context THEN getConnectionParamContextData returns params as objects', () => {
      // Setup
      const context = { url: '/hello?param1=1&param2=2' } as IncomingMessage;

      // Execute
      const data = getConnectionParamContextData(context);

      // Validate
      expect(data).toStrictEqual({
        param1: '1',
        param2: '2',
      });
    });

    test('GIVEN connection context THEN getConnectionMessageContextData returns params as objects', () => {
      // Setup
      const messageData = givenRandomString();
      const context = { message: messageData };

      // Execute
      const data = getConnectionMessageContextData(context);

      // Validate
      expect(data).toStrictEqual({
        message: messageData,
      });
    });

    test('GIVEN connection context THEN getConnectionCloseContextData returns params as objects', () => {
      // Setup
      const code = 1000;
      const reasonString = givenRandomString();
      const reason = Buffer.from(reasonString);
      const context = { code, reason };

      // Execute
      const data = getConnectionCloseContextData(context);

      // Validate
      expect(data).toStrictEqual({
        closeCode: code,
        closeReason: reasonString,
      });
    });

    test('GIVEN connection context THEN getConnectionUserUUIDContextData returns userUUID in objects', () => {
      // Setup
      const userUUID = givenValidUUID();
      const context = { userUUID };

      // Execute
      const data = getConnectionUserUUIDContextData(context);

      // Validate
      expect(data).toStrictEqual({
        userUUID,
      });
    });
  });
});
