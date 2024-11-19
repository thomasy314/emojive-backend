import { ErrorObject, ValidateFunction } from 'ajv';
import { SchemaEnv } from 'ajv/dist/compile';
import { Request, Response } from 'express';
import { ResponseError } from '../errorHandling/error.types';
import { parseErrors } from './ajv-errors';
import createExpressValidator from './express.validator';

jest.mock('./ajv-errors', () => ({
  parseErrors: jest.fn(),
}));

describe('createExpressValidator', () => {
  const testSchema = {
    type: 'object',
    properties: {
      foo: { type: 'integer' },
      bar: { type: 'string' },
    },
    required: ['foo', 'bar'],
    additionalProperties: false,
  };

  const validationFunctionMock = jest.fn() as unknown as jest.MockedFunction<
    ValidateFunction<unknown>
  >;
  validationFunctionMock.schema = testSchema;
  validationFunctionMock.schemaEnv = {} as SchemaEnv;

  let requestMock: Partial<Request>;
  let responseMock: Partial<Response>;
  const nextMock = jest.fn();

  beforeEach(() => {
    requestMock = { body: {}, query: {} };
    responseMock = {};
  });

  test('GIVEN valid input WHEN validation passes for POST method THEN call next without error', async () => {
    // Setup
    requestMock.method = 'POST';
    validationFunctionMock.mockReturnValue(true);

    const validator = createExpressValidator(validationFunctionMock);

    // Execute
    await validator(requestMock as Request, responseMock as Response, nextMock);

    // Validate
    expect(validationFunctionMock).toHaveBeenCalledWith(requestMock.body);
    expect(nextMock).toHaveBeenCalled();
    expect(nextMock).not.toHaveBeenCalledWith(expect.anything());
  });

  test('GIVEN valid input WHEN validation passes for GET method THEN call next without error', async () => {
    // Setup
    requestMock.method = 'GET';
    validationFunctionMock.mockReturnValue(true);

    const validator = createExpressValidator(validationFunctionMock);

    // Execute
    await validator(requestMock as Request, responseMock as Response, nextMock);

    // Validate
    expect(validationFunctionMock).toHaveBeenCalledWith(requestMock.query);
    expect(nextMock).toHaveBeenCalled();
    expect(nextMock).not.toHaveBeenCalledWith(expect.anything());
  });

  test('GIVEN invalid input WHEN validation fails THEN call next with error', async () => {
    // Setup
    const mockErrors = [{ message: 'error' }] as unknown as ErrorObject[];
    validationFunctionMock.mockReturnValue(false);
    validationFunctionMock.errors = mockErrors;

    (parseErrors as jest.Mock).mockReturnValue(mockErrors);

    const validator = createExpressValidator(validationFunctionMock);

    // Execute
    await validator(requestMock as Request, responseMock as Response, nextMock);

    // Validate
    expect(validationFunctionMock).toHaveBeenCalledWith(requestMock.body);
    expect(parseErrors).toHaveBeenCalledWith(mockErrors);

    const expectedError: ResponseError = {
      status: 400,
      error: new Error('Input Validation Error'),
      json: { validationErrors: mockErrors },
    };

    expect(nextMock).toHaveBeenCalledWith(expectedError);
  });

  test('GIVEN invalid input WHEN validation fails but no errors are present THEN call next without error', async () => {
    // Setup
    validationFunctionMock.mockReturnValue(false);
    validationFunctionMock.errors = null;

    const validator = createExpressValidator(validationFunctionMock);

    // Execute
    await validator(requestMock as Request, responseMock as Response, nextMock);

    // Validate
    expect(validationFunctionMock).toHaveBeenCalledWith(requestMock.body);
    expect(nextMock).toHaveBeenCalled();
    expect(nextMock).not.toHaveBeenCalledWith(expect.anything());
  });
});
