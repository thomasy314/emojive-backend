import { NextFunction, Request, Response } from 'express';
import {
  givenRandomBoolean,
  givenRandomEmoji,
  givenRandomInt,
} from '../utils/test-helpers';
import chatroomController from './chatrooms.controller';

describe('Chatroom Controller', () => {
  let response: Response;
  let next: NextFunction;

  beforeEach(() => {
    response = {} as Response;
    response.send = jest.fn();

    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Create Chatroom', () => {
    test('GIVEN proper input THEN a chatroom is created and returned', async () => {
      const chatroomName = givenRandomEmoji();
      const isPublic = givenRandomBoolean();
      const maxOccupancy = givenRandomInt();

      // Setup
      const request: Request = {
        body: {
          chatroomName,
          isPublic,
          maxOccupancy,
        },
      } as unknown as Request;

      // Execute
      await chatroomController().createChatroom(request, response, next);

      // Validate

      // TODO: Check if createChatroom called correct times and with correct input

      expect(response.send).toHaveBeenCalledTimes(1);
      expect(response.send).toHaveBeenCalledWith({
        chatroomUUID: '123', // TODO: Change to random UUID
        chatroomName,
        isPublic,
        maxOccupancy,
      });

      expect(next).toHaveBeenCalledTimes(0);
    });

    test.todo(
      'GIVEN an error occurs during chatroom creation THEN an error is passed to next'
    );
  });
});
