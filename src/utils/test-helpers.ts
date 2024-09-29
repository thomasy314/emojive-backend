import { random as randomEmoji } from 'node-emoji';
import { LanguageTag } from '../languages/languages.types';

export function givenValidUUID(): string {
  return 'a1aa4073-d4d2-4135-b4d8-a24bf3e7dca6';
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
