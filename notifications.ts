import HTTPError from 'http-errors';
import { getUserByToken } from './helper';
import { Notification } from './interface';

/**
 * Returns the user's most recent 20 notifications from most recent to least recent.
 *
 * 403 Error when any of:
 * - token is invalid
 *
 * @param { string } token
 *
 * @returns { notifications: Notification[] } - no error
 * @throws { HTTPError } - error
 */
function getNotificationsV1(token: string): { notifications: Notification[] } {
  const user = getUserByToken(token);
  if (!user) {
    throw HTTPError(403, 'Invalid token');
  }

  const notifications = user.notifications.slice(0, 20);

  return { notifications };
}

export { getNotificationsV1 };
