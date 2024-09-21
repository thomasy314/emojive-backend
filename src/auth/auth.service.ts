import { ResponseError } from '../middleware/errorHandling/error.types';
import { findUserByUUIDQuery } from '../users/db/users.queries';
import routeAllowList from './authorization.allowlist';

function authService() {
  function confirmRouteAuthNeeded(pathName: string): boolean {
    return !routeAllowList.includes(pathName);
  }

  function authorizeRequest(userUUID: string): Promise<boolean> {
    return new Promise((resolve, reject: (error: ResponseError) => void) => {
      return findUserByUUIDQuery(userUUID)
        .then(result => {
          if (result.rows.length === 0) {
            reject({ status: 401, error: Error('Not Authorized') });
            return;
          }

          if (result.rows.length > 1) {
            reject({
              status: 500,
              error: Error('Too many users found for user UUID: ' + userUUID),
            });
            return;
          }

          resolve(true);
        })
        .catch(error => {
          reject({ status: 500, error: error });
        });
    });
  }

  return {
    authorizeRequest,
    confirmRouteAuthNeeded,
  };
}

export default authService;
