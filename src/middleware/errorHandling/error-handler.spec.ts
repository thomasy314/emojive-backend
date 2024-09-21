import { Request, Response } from 'express';
import errorHandler from './error-handler';
import { ResponseError } from './error.types';

describe('Error Handling', () => {
  test('GIVEN an Error occurs THEN error is logged and sent to client', () => {
    // Setup
    const error = new Error();
    error.stack = 'stack';

    const request = {} as Request;

    const response = {} as Response;
    response.json = jest.fn();
    response.status = jest.fn(() => response);

    const next = jest.fn();

    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(jest.fn);

    // Execute
    errorHandler(error, request, response, next);

    // Validate
    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith(error.stack);

    expect(response.status).toHaveBeenCalledTimes(1);
    expect(response.status).toHaveBeenCalledWith(500);

    expect(response.json).toHaveBeenCalledTimes(1);
    expect(response.json).toHaveBeenCalledWith({
      error: 'Internal Server Error',
    });
  });

  test('GIVEN an internal response error occurs THEN error is logged and internal error sent to client', () => {
    // Setup
    const error = new Error('db exploded');
    error.stack = 'there was fire';

    const responseError: ResponseError = {
      status: 500,
      error,
      json: {
        dbError: 'there was nothing we could have done',
      },
    };

    const request = {} as Request;

    const response = {} as Response;
    response.json = jest.fn();
    response.status = jest.fn(() => response);

    const next = jest.fn();

    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(jest.fn);

    // Execute
    errorHandler(responseError, request, response, next);

    // Validate
    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith(error.stack);

    expect(response.status).toHaveBeenCalledTimes(1);
    expect(response.status).toHaveBeenCalledWith(500);

    expect(response.json).toHaveBeenCalledTimes(1);
    expect(response.json).toHaveBeenCalledWith({
      error: 'Internal Server Error',
      dbError: 'there was nothing we could have done',
    });
  });

  test('GIVEN a client response error occurs THEN error is sent to client', () => {
    // Setup
    const error = new Error('Not Authorized');
    error.stack = 'you messed up';

    const responseError: ResponseError = {
      status: 401,
      error,
      json: {
        authError: 'what are you even doing??',
      },
    };

    const request = {} as Request;

    const response = {} as Response;
    response.json = jest.fn();
    response.status = jest.fn(() => response);

    const next = jest.fn();

    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(jest.fn);

    // Execute
    errorHandler(responseError, request, response, next);

    // Validate
    expect(consoleErrorSpy).toHaveBeenCalledTimes(0);

    expect(response.status).toHaveBeenCalledTimes(1);
    expect(response.status).toHaveBeenCalledWith(401);

    expect(response.json).toHaveBeenCalledTimes(1);
    expect(response.json).toHaveBeenCalledWith({
      error: 'Not Authorized',
      authError: 'what are you even doing??',
    });
  });

  test('GIVEN a response error with no message occurs THEN log error and send to client', () => {
    // Setup
    const error = new Error();
    error.stack = 'you messed up';

    const responseError: ResponseError = {
      status: 400,
      error,
    };

    const request = {} as Request;

    const response = {} as Response;
    response.json = jest.fn();
    response.status = jest.fn(() => response);

    const next = jest.fn();

    const consoleErrorSpy = jest
      .spyOn(console, 'warn')
      .mockImplementation(jest.fn);

    // Execute
    errorHandler(responseError, request, response, next);

    // Validate
    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);

    expect(response.status).toHaveBeenCalledTimes(1);
    expect(response.status).toHaveBeenCalledWith(400);

    expect(response.json).toHaveBeenCalledTimes(1);
    expect(response.json).toHaveBeenCalledWith({
      error: 'Unknown Error',
    });
  });
});
