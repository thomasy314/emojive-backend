import { random as randomEmoji } from 'node-emoji';
import { LanguageTag } from '../languages/languages.types';
import { ResponseError } from '../middleware/errorHandling/error.types';

export function givenRandomString(length: number = 10, characterSet?: string) {
  const characters = characterSet ?? 'abcdefghijklmnopqrstuvwxyz1234567890';
  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

export function givenValidUUID(): string {
  const hexCharacters = 'abcdef1234567890';
  const part1 = givenRandomString(8, hexCharacters);
  const part2 = givenRandomString(4, hexCharacters);
  const part3 = givenRandomString(4, hexCharacters);
  const part4 = givenRandomString(4, hexCharacters);
  const part5 = givenRandomString(12, hexCharacters);
  return `${part1}-${part2}-${part3}-${part4}-${part5}`;
}

export function givenInvalidUUID(): string {
  return 'a1aa4073-d4d2-4135-b4d8-a24bf3e7dca';
}

export function givenRandomInt(max: number = 100): number {
  return Math.floor(Math.random() * max);
}

export function givenRandomBoolean(probablityOfTrue: number = 0.5): boolean {
  return Math.random() < probablityOfTrue;
}

export function givenRandomError() {
  const error = new Error(givenRandomString());
  error.stack = givenRandomString();

  return error;
}

export function givenRandomResponseError(
  statusCode: number = 500,
  json: object = givenRandomObject(),
  externalMessage: string = givenRandomString()
) {
  const error = new Error(givenRandomString());
  error.stack = givenRandomString();

  const responseError: ResponseError = {
    error: error,
    status: statusCode,
    externalMessage: externalMessage,
    json: json,
  };

  return responseError;
}

export function givenRandomEmoji(length: number = 1): string {
  return Array(length)
    .fill('')
    .map(() => randomEmoji().emoji)
    .join('');
}

export function givenDBUser() {
  return {
    user_id: givenRandomInt(100),
    user_uuid: givenValidUUID(),
    user_name: givenRandomEmoji(),
    creation_timestamp: '2024-09-12T23:40:02.679Z',
    last_activity_time: '2024-09-12T23:40:02.679Z',
    country: 'US',
    country_region: 'CO',
    language_tags: ['en', 'en-GB'],
  };
}

export function givenDBChatroom() {
  return {
    chatroom_id: givenRandomInt(100),
    chatroom_uuid: givenValidUUID(),
    chatroom_name: givenRandomEmoji(),
    is_public: givenRandomBoolean(),
    max_occupancy: givenRandomInt(20),
  };
}

export function givenLanguageTag(
  languageCode: string = 'en',
  regionCode: string = 'GB'
): LanguageTag {
  return {
    languageCode,
    regionCode,
  };
}

export function givenRandomObject(additionalJson?: object) {
  return {
    [givenRandomString()]: givenRandomString(),
    [givenRandomString()]: givenRandomString(),
    [givenRandomString()]: givenRandomString(),
    ...additionalJson,
  };
}
