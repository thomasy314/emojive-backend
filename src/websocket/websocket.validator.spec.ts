import { IncomingMessage } from 'http';
import { WebSocket } from 'ws';
import ajv from '../middleware/validation/ajv';
import createWebSocketValidator, {
  getConnectionContextData,
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
      getContextFunction.mockReturnValueOnce({ foo: 1, bar: 'hi' });

      // Execute
      const wsValidator = createWebSocketValidator(
        validationFunction,
        getContextFunction
      );
      wsValidator(socket, context, next);
      // Validate

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith();
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
    test('GIVEN connection context THEN getConnectionContextData returns params as objects', () => {
      // Setup
      const context = { url: '/hello?param1=1&param2=2' } as IncomingMessage;

      // Execute
      const data = getConnectionContextData(context);

      // Validate
      expect(data).toStrictEqual({
        param1: '1',
        param2: '2',
      });
    });
  });
});
