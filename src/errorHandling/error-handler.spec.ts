import { ResponseError } from '../middleware/errorHandling/error.types';
import { givenRandomError } from '../utils/test-helpers';
import errorHandler from './error-handler';

const internalErrorCode = 500;

describe('Error Handling', () => {
  test('GIVEN an Error occurs THEN error is logged and returned as response error', () => {
    // Setup
    const error = givenRandomError();

    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(jest.fn);

    // Execute
    const responseError: ResponseError = errorHandler(internalErrorCode, error);

    // Validate
    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith(error.stack);

    expect(responseError).toStrictEqual({
      status: internalErrorCode,
      error,
      externalMessage: 'Internal Server Error',
    });
  });

  test('GIVEN an internal response error occurs THEN error is logged and as response error', () => {
    // Setup
    const error = givenRandomError();

    const responseError: ResponseError = {
      status: 500,
      error,
      json: {
        dbError: 'there was nothing we could have done',
      },
    };

    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(jest.fn);

    // Execute
    const finalResponseError: ResponseError = errorHandler(
      internalErrorCode,
      responseError
    );

    // Validate
    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith(error.stack);

    expect(finalResponseError).toStrictEqual({
      externalMessage: 'Internal Service Error',
      ...responseError,
    });
  });

  test('GIVEN a client response error occurs THEN error is returned as response error and not logged', () => {
    // Setup
    const error = givenRandomError();

    const responseError: ResponseError = {
      status: 401,
      error,
      json: {
        authError: 'what are you even doing??',
      },
    };

    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(jest.fn);

    // Execute
    const finalResponseError: ResponseError = errorHandler(
      internalErrorCode,
      responseError
    );

    // Validate
    expect(consoleErrorSpy).toHaveBeenCalledTimes(0);

    expect(finalResponseError).toStrictEqual({
      externalMessage: error.message,
      ...responseError,
    });
  });

  test('GIVEN a response error with no message occurs THEN error is logged and returned as response error', () => {
    // Setup
    const error = givenRandomError();
    error.message = '';

    const responseError: ResponseError = {
      status: 400,
      error,
    };

    const consoleErrorSpy = jest
      .spyOn(console, 'warn')
      .mockImplementation(jest.fn);

    // Execute
    const finalResponseError: ResponseError = errorHandler(
      internalErrorCode,
      responseError
    );

    // Validate
    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Unknown error occurred: ',
      error.stack
    );

    expect(finalResponseError).toStrictEqual({
      externalMessage: 'unknown error',
      ...responseError,
    });
  });
});
