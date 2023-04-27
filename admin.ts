import { getData, setData } from './dataStore';
import { User, Data } from './interface';
import { getUser, getUserByToken, getGlobalOwnerId } from './helper';
import HTTPError from 'http-errors';
import { port, url } from './config.json';

const SERVER_URL = `${url}:${port}/`;

/**
 * Given a user by their uId, removes them from Memes. This means they
 * should be removed from all channels/DMs, and will not be included in
 * the array of users returned by users/all. Memes owners can remove other Memes owners
 * (including the original first owner). Once a user is removed, the contents of the messages
 * they sent will be replaced by 'Removed user'. Their profile must still be retrievable with
 * user/profile, however nameFirst should be 'Removed' and nameLast should be 'user'.
 * The user's email and handle should be reusable.
 *
 * 400 Error when:
 * - `uId` does not refer to a valid user
 * - 'uId` refers to a user who is the only global owner
 *
 * 403 Error when:
 * - the authorised user is not a global owner
 * - token is invalid
 *
 * @param { string } token
 * @param { number } uId
 *
 * @returns {{}} - no error
 * @throws { HTTPError } - error
 */
function adminUserRemoveV1(token: string, uId: number): Record<string, never> {
  const authUser: User = getUserByToken(token);
  if (!authUser) {
    throw HTTPError(403, 'invalid token');
  }

  const globalOwnerId: number = getGlobalOwnerId(authUser.uId);
  if (globalOwnerId !== authUser.uId) {
    throw HTTPError(403, 'authorised user is not a global owner');
  }

  const newUser: User = getUser(uId);
  if (!newUser) {
    throw HTTPError(400, 'uId is invalid');
  }

  const data: Data = getData();
  if (data.globalOwnersId.length === 1 && data.globalOwnersId[0] === uId) {
    throw HTTPError(400, 'uId is the only global owner');
  }

  data.channels.forEach((c) => {
    if (c.ownersId.includes(uId)) {
      c.ownersId = c.ownersId.filter((ownerId) => ownerId !== uId);
    }
    c.members = c.members.filter((member) => member.uId !== uId);
  });

  data.dms.forEach((dm) => {
    dm.dmMembers = dm.dmMembers.filter((member) => member.uId !== uId);
  });

  data.messages.forEach((m) => {
    if (m.uId === uId) {
      m.message = 'Removed user';
    }
  });

  const defaultImgUrl = SERVER_URL + 'default/default.jpg';

  data.users.forEach((u) => {
    if (u.uId === uId) {
      u.token = [];
      u.nameFirst = 'Removed';
      u.nameLast = 'user';
      u.password = null;
      u.email = null;
      u.permissionId = -1;
      u.handleStr = null;
      u.profileImgUrl = defaultImgUrl;
    }
  });

  setData(data);
  return {};
}

/**
 * Given a user by their uId, sets their permissions to new permissions described by permissionId.
 *
 * 400 Error when:
 * - uId does not refer to a valid user
 * - uId refers to a user who is the only global owner and they are being demoted to a user
 * - permissionId is invalid
 * - the user already has the permissions level of permissionId
 *
 * 403 Error when:
 * - the authorised user is not a global owner
 * - token is invalid
 *
 * @param { string } token
 * @param { number } uId
 * @param { number } permissionId
 *
 * @returns {{}} - no error
 * @throws { HTTPError } - error
 */
function adminUserPermissionChangeV1(
  token: string,
  uId: number,
  permissionId: number
): Record<string, never> {
  if (permissionId !== 1 && permissionId !== 2) {
    throw HTTPError(400, 'permissionId is invalid');
  }

  const authUser: User = getUserByToken(token);
  if (!authUser) {
    throw HTTPError(403, 'invalid token');
  }

  if (authUser.permissionId !== 1) {
    throw HTTPError(403, 'authorised user is not a global owner');
  }

  const user: User = getUser(uId);
  if (!user) {
    throw HTTPError(400, 'user is invalid');
  }

  if (user.permissionId === permissionId) {
    throw HTTPError(400, 'user already has the permission level');
  }

  if (permissionId === 2) {
    const data: Data = getData();
    if (data.globalOwnersId.length === 1 && data.globalOwnersId[0] === uId) {
      throw HTTPError(400, 'uId only global owner is demoted to a user');
    }
  }

  const data: Data = getData();
  data.users.forEach((u) => {
    if (u.uId === uId) {
      u.permissionId = permissionId;
    }
  });

  if (permissionId === 2) {
    data.globalOwnersId = data.globalOwnersId.filter(
      (ownerId) => ownerId !== uId
    );
  } else {
    data.globalOwnersId.push(uId);
  }
  setData(data);

  return {};
}

export { adminUserRemoveV1, adminUserPermissionChangeV1 };
