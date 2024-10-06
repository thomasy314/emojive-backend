import { NextFunction, Request, Response } from 'express';
import errorHandler from '../../errorHandling/error-handler';
import { givenRandomResponseError } from '../../utils/test-helpers';
import expressErrorHandler from './express-error-handler';

jest.mock('../../errorHandling/error-handler');

describe('Express Error Handler', () => {
  let response: Response;
  let next: NextFunction;

  beforeEach(() => {
    response = {} as Response;
    response.status = jest.fn(() => response);
    response.json = jest.fn();

    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('GIVEN thrown error THEN error is sent to client', () => {
    // Setup
    const responseError = givenRandomResponseError(500);
    const request = {} as Request;

    const errorHandlerMock = jest.mocked(errorHandler);
    errorHandlerMock.mockReturnValueOnce(responseError);

    // Execute
    expressErrorHandler(responseError, request, response, next);

    // Validate
    expect(response.status).toHaveBeenCalledWith(responseError.status);
    expect(response.json).toHaveBeenCalledWith({
      error: responseError.externalMessage,
      ...responseError.json,
    });
  });
});
