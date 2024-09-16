import { NextFunction, Request, Response } from 'express';
import { QueryResult } from 'pg';
import { findUserByUUID } from '../../users/db/users.queries';
import {
  givenInvalidUUID,
  givenRandomInt,
  givenUser,
  givenValidUUID,
} from '../../utils/test-helpers';
import authorization from './authorization';

jest.mock('../../users/db/users.queries');

describe('authorization middleware', () => {
  let response: Response;
  let next: NextFunction;

  beforeEach(() => {
    response = {} as Response;
    response.sendStatus = jest.fn();

    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('GIVEN userUUID THEN authorization calls next function', async () => {
    // Setup
    const request: Request = {
      query: {
        userUUID: givenValidUUID(),
      },
    } as unknown as Request;

    const queryResult = {
      rows: [givenUser()],
    } as QueryResult;

    const findUserByUUIDMock = jest.mocked(findUserByUUID);
    findUserByUUIDMock.mockResolvedValueOnce(queryResult);

    // Execute
    await authorization(request, response, next);

    // Validate
    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith();

    expect(response.sendStatus).toHaveBeenCalledTimes(0);
  });

  test('GIVEN non string userUUID THEN authorization fails', async () => {
    // Setup

    const request: Request = {
      query: {
        userUUID: givenRandomInt(),
      },
    } as unknown as Request;

    // Execute
    await authorization(request, response, next);

    // Validate
    expect(next).toHaveBeenCalledTimes(0);

    expect(response.sendStatus).toHaveBeenCalledTimes(1);
    expect(response.sendStatus).toHaveBeenCalledWith(401);
  });

  test('GIVEN invalid UUID THEN authorization fails', async () => {
    // Setup

    const request: Request = {
      query: {
        userUUID: givenInvalidUUID(),
      },
    } as unknown as Request;

    // Execute
    await authorization(request, response, next);

    // Validate
    expect(next).toHaveBeenCalledTimes(0);

    expect(response.sendStatus).toHaveBeenCalledTimes(1);
    expect(response.sendStatus).toHaveBeenCalledWith(401);
  });

  test('GIVEN no user was found THEN authorization fails', async () => {
    // Setup
    const queryResult = {
      rows: [],
    } as unknown as QueryResult;

    const findUserByUUIDMock = jest.mocked(findUserByUUID);
    findUserByUUIDMock.mockResolvedValueOnce(queryResult);

    const request: Request = {
      query: {
        userUUID: givenValidUUID(),
      },
    } as unknown as Request;

    // Execute
    await authorization(request, response, next);

    // Validate
    expect(next).toHaveBeenCalledTimes(0);

    expect(response.sendStatus).toHaveBeenCalledTimes(1);
    expect(response.sendStatus).toHaveBeenCalledWith(401);
  });

  test('GIVEN more than one user was found THEN authorization fails', async () => {
    // Setup
    const queryResult = {
      rows: [givenUser(), givenUser()],
    } as unknown as QueryResult;

    const findUserByUUIDMock = jest.mocked(findUserByUUID);
    findUserByUUIDMock.mockResolvedValueOnce(queryResult);

    const request: Request = {
      query: {
        userUUID: givenValidUUID(),
      },
    } as unknown as Request;

    // Execute
    await authorization(request, response, next);

    // Validate
    expect(next).toHaveBeenCalledTimes(0);

    expect(response.sendStatus).toHaveBeenCalledTimes(1);
    expect(response.sendStatus).toHaveBeenCalledWith(401);
  });

  test('GIVEN internal error when querying DB THEN authorization fails', async () => {
    // Setup
    const request: Request = {
      query: {
        userUUID: givenValidUUID(),
      },
    } as unknown as Request;

    const errorMessage = 'bad thing';
    const findUserByUUIDMock = jest.mocked(findUserByUUID);
    findUserByUUIDMock.mockRejectedValueOnce(errorMessage);

    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(jest.fn);

    // Execute
    await authorization(request, response, next);

    // Validate
    expect(next).toHaveBeenCalledTimes(0);

    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith(errorMessage);

    expect(response.sendStatus).toHaveBeenCalledTimes(1);
    expect(response.sendStatus).toHaveBeenCalledWith(500);
  });
});
