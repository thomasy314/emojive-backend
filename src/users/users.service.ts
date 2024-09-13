import { createUserQuery } from './db/users.queries';

function userService() {
  function createUser(
    userName: string,
    languages: string[],
    countryCode: string,
    countryRegion?: string
  ) {
    // TODO: Add language support

    return new Promise((resolve, reject) => {
      createUserQuery(userName, countryCode, countryRegion)
        .then(results => {
          const response = results.rows[0];
          delete response.user_id;
          resolve(response);
        })
        .catch(reject);
    });
  }

  return {
    createUser,
  };
}

export default userService;
