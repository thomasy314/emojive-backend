export function givenValidUUID(): string {
  return 'a1aa4073-d4d2-4135-b4d8-a24bf3e7dca6';
}

export function givenInvalidUUID(): string {
  return 'a1aa4073-d4d2-4135-b4d8-a24bf3e7dca';
}

export function givenRandomInt(max: number = 100): number {
  return Math.floor(Math.random() * max);
}

export function givenUser() {
  return {
    user_uuid: '7ab39ec9-612d-4be8-b43c-f84bbea7f8a4',
    user_name: '🦆',
    creation_timestamp: '2024-09-12T23:40:02.679Z',
    last_activity_time: '2024-09-12T23:40:02.679Z',
    country: 'US',
    country_region: 'CO',
  };
}