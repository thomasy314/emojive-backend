import { IncomingHttpHeaders } from 'http';
import { ResponseError } from '../middleware/errorHandling/error.types';
import { findUserByUUIDQuery } from '../users/db/users.queries';
import routeAllowList from './authorization.allowlist';

function authService() {
  function confirmRouteAuthNeeded(pathName: string | undefined): boolean {
    return pathName !== undefined && !routeAllowList.includes(pathName);
  }

  function authorizeRequest(userUUID: string): Promise<boolean> {
    return new Promise((resolve, reject: (error: ResponseError) => void) => {
      return findUserByUUIDQuery(userUUID)
        .then(result => {
          if (result.rowCount == 0) {
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

  function getAuthToken(headers: IncomingHttpHeaders): string {
    const authHeader = headers?.authorization;

    if (!authHeader) {
      throw new Error('Not Authorized');
    }

    const [authType, authToken] = authHeader.split(/\s|%20/);

    console.log(authType, authToken);

    if (authType !== 'Token') {
      throw new Error('Incorrect Authorization Type');
    }

    if (authToken === '' || authToken === undefined) {
      throw new Error('Invalid Token');
    }

    return authToken;
  }

  return {
    authorizeRequest,
    confirmRouteAuthNeeded,
    getAuthToken,
  };
}

export default authService();
