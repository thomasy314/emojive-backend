import { createUserQuery } from './db/users.queries';

function userService() {
  function createUser(
    userName: string,
    languages: string[],
    countryCode: string,
    countryRegion: string
  ) {
    // TODO: Add language support

    return new Promise((resolve, reject) => {
      createUserQuery(userName, countryCode, countryRegion)
        .then(results => {
          resolve(results.rows);
        })
        .catch(reject);
    });
  }

  return {
    createUser,
  };
}

export default userService;
