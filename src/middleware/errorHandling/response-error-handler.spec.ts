import { Request, Response } from 'express';
import { ResponseError } from './error.types';
import responseErrorHandler from './response-error-handler';

describe('Response Error Handling', () => {
  test('GIVEN an internal response error occurs THEN error is printed and sent to client', () => {
    // Setup
    const error = {} as Error;
    error.stack = 'stack';
    error.message = 'Bad things be happenin';
    const responseError: ResponseError = {
      status: 500,
      error: error,
      json: {
        extraDetails: 'real bad stuff',
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
    responseErrorHandler(responseError, request, response, next);

    // Validate
    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith(error.stack);

    expect(response.status).toHaveBeenCalledTimes(1);
    expect(response.status).toHaveBeenCalledWith(500);

    expect(response.json).toHaveBeenCalledTimes(1);
    expect(response.json).toHaveBeenCalledWith({
      error: 'Internal Server Error',
      extraDetails: 'real bad stuff',
    });
  });

  test('GIVEN a user caused response error occurs THEN error is printed and sent to client', () => {
    // Setup
    const error = {} as Error;
    error.stack = 'stack';
    error.message = 'Bad stuff be happenin';
    const responseError: ResponseError = {
      status: 401,
      error: error,
      json: {
        extraDetails: 'real bad stuff',
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
    responseErrorHandler(responseError, request, response, next);

    // Validate
    expect(consoleErrorSpy).toHaveBeenCalledTimes(0);

    expect(response.status).toHaveBeenCalledTimes(1);
    expect(response.status).toHaveBeenCalledWith(401);

    expect(response.json).toHaveBeenCalledTimes(1);
    expect(response.json).toHaveBeenCalledWith({
      error: 'Bad stuff be happenin',
      extraDetails: 'real bad stuff',
    });
  });
});
