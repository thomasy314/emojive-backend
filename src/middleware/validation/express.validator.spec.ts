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
  //   const validationFunction = ajv.compile(testSchema);
  const validationFunctionMock = jest.fn() as unknown as jest.MockedFunction<
    ValidateFunction<unknown>
  >;
  validationFunctionMock.schema = testSchema;
  validationFunctionMock.schemaEnv = {} as SchemaEnv;

  let requestMock: Partial<Request>;
  let responseMock: Partial<Response>;
  const nextMock = jest.fn();

  beforeEach(() => {
    requestMock = { body: {} };
    responseMock = {};
  });

  it('should call next if validation passes', async () => {
    validationFunctionMock.mockReturnValue(true);

    const validator = createExpressValidator(validationFunctionMock);
    await validator(requestMock as Request, responseMock as Response, nextMock);

    expect(validationFunctionMock).toHaveBeenCalledWith(requestMock.body);
    expect(nextMock).toHaveBeenCalled();
    expect(nextMock).not.toHaveBeenCalledWith(expect.anything());
  });

  it('should call next with error if validation fails', async () => {
    const mockErrors = [{ message: 'error' }] as unknown as ErrorObject[];
    validationFunctionMock.mockReturnValue(false);
    validationFunctionMock.errors = mockErrors;

    (parseErrors as jest.Mock).mockReturnValue(mockErrors);

    const validator = createExpressValidator(validationFunctionMock);
    await validator(requestMock as Request, responseMock as Response, nextMock);

    expect(validationFunctionMock).toHaveBeenCalledWith(requestMock.body);
    expect(parseErrors).toHaveBeenCalledWith(mockErrors);

    const expectedError: ResponseError = {
      status: 400,
      error: new Error('Input Validation Error'),
      json: { validationErrors: mockErrors },
    };

    expect(nextMock).toHaveBeenCalledWith(expectedError);
  });

  it('should call next if validation fails but no errors are present', async () => {
    validationFunctionMock.mockReturnValue(false);
    validationFunctionMock.errors = null;

    const validator = createExpressValidator(validationFunctionMock);
    await validator(requestMock as Request, responseMock as Response, nextMock);

    expect(validationFunctionMock).toHaveBeenCalledWith(requestMock.body);
    expect(nextMock).toHaveBeenCalled();
    expect(nextMock).not.toHaveBeenCalledWith(expect.anything());
  });
});
