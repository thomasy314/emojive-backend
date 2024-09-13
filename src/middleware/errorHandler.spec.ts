import { Request, Response } from 'express';
import errorHandler from './errorHandler';

describe('Error Handling', () => {
  test('GIVEN an error occurs THEN error is printed and sent to client', () => {
    // Setup
    const error = {} as Error;
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
});
