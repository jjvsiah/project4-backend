import { getData, setData } from './dataStore';
import { getDmById, getUserByToken, getUser } from './helper';
import HTTPError from 'http-errors';
import {
  User,
  Dm,
  DmList,
  Member,
  DmMessages,
  Message,
  DmMessage,
  Data,
  DmDetails,
  Notification,
} from './interface';

/**
 * `uIds` contains the user(s) that this DM is directed to,
 * and will not include the creator. The creator is the owner of the DM.
 * `name` should be automatically generated based on the users that are in this DM.
 * The name should be an alphabetically-sorted, comma-and-space-separated
 * concatenation of user handles, e.g. 'ahandle1, bhandle2, chandle3'.
 *
 * 400 Error when any of:
 * - any `uId` in `uIds` does not refer to a valid user
 * - there are duplicate `uId`'s in `uIds`
 *
 * 403 Error when any of:
 * - `token` is invalid.
 *
 * @param { string } token
 * @param { number[] } uIds
 *
 * @returns {{ dmId: number }} - no error
 * @throws { HTTPError } - error
 */
function dmCreateV2(token: string, uIds: number[]): { dmId: number } {
  const dmCreator: User = getUserByToken(token);
  if (!dmCreator) {
    throw HTTPError(403, 'Invalid token');
  }

  const data: Data = getData();
  if (!uIds.every((uId) => getUser(uId))) {
    throw HTTPError(400, 'Invalid user ID');
  }

  if (new Set(uIds).size !== uIds.length) {
    throw HTTPError(400, 'Duplicate user IDs');
  }
  const allMemberUIds: Array<number> = [...uIds, dmCreator.uId];
  const allMembersSort: Member[] = allMemberUIds
    .map((uId) => {
      const user: User = getUser(uId);
      return {
        uId: user.uId,
        email: user.email,
        nameFirst: user.nameFirst,
        nameLast: user.nameLast,
        handleStr: user.handleStr,
        profileImgUrl: user.profileImgUrl,
      };
    })
    .sort((a, b) => a.handleStr.localeCompare(b.handleStr));

  const dmName: string = allMembersSort
    .map((member) => member.handleStr)
    .join(', ');
  const dmId: number = data.dms.length + 1;
  const dm: Dm = {
    dmCreatorId: dmCreator.uId,
    dmId: dmId,
    dmName: dmName,
    dmMembers: allMembersSort,
  };
  data.dms.push(dm);

  // Push a notification object into the notification array of each user (uIds)
  uIds.forEach((uId) => {
    const userIndex = data.users.indexOf(getUser(uId));
    const notification: Notification = {
      channelId: -1,
      dmId: dmId,
      notificationMessage: `${dmCreator.handleStr} added you to a ${dmName}`,
    };
    data.users[userIndex].notifications.unshift(notification);
  });

  setData(data);

  return { dmId };
}

/**
 * Returns the array of DMs that the user is a member of.
 *
 * 403 Error when any of:
 * - `token` is invalid
 *
 * @param { string } token
 *
 * @returns { dms: DmList[] } - no error
 * @throws { HTTPError } - error
 */
function dmListV2(token: string): { dms: DmList[] } {
  const user: User = getUserByToken(token);
  if (!user) {
    throw HTTPError(403, 'Invalid token');
  }

  const data: Data = getData();
  const dms: DmList[] = data.dms
    .filter((dm) => dm.dmMembers.find((u) => u.uId === user.uId))
    .map((dm) => ({ dmId: dm.dmId, name: dm.dmName }));

  return { dms };
}

/**
 * Function that removes an existing DM, so all members are no longer in the DM.
 * This can only be done by the original creator of the DM.
 *
 * 400 Error when any of:
 * - `dmId` is invalid
 *
 * 403 Error when any of:
 * - `token` is invalid
 * - `dmId` is valid but user is no longer a member of dm
 * - `dmId` is valid but user is not the original dm creator
 *
 * @param { string } token
 * @param { number } dmId
 *
 * @returns {{}} - no error
 * @throws { HTTPError } - error
 */
function dmRemoveV2(token: string, dmId: number): Record<never, string> {
  const user: User = getUserByToken(token);
  if (!user) {
    throw HTTPError(403, 'Invalid token');
  }

  const dm: Dm = getDmById(dmId);
  if (!dm) {
    throw HTTPError(400, 'Invalid dmId');
  }

  const data: Data = getData();
  const index = data.dms.indexOf(dm);
  const member = dm.dmMembers.find((u) => u.uId === user.uId);

  if (!member) {
    throw HTTPError(403, 'The authorised user is not a member of the DM');
  }

  if (data.dms[index].dmCreatorId !== user.uId) {
    throw HTTPError(403, 'The authorised user is not the original DM creator');
  }

  data.dms = data.dms.filter((dm) => dm.dmId !== dmId);
  data.messages = data.messages.filter((m) => m.dmId !== dmId);
  setData(data);

  return {};
}

/**
 * Given a DM with ID dmId that the authorised user is a member of,
 * provides basic details about the DM.
 *
 * 400 Error when any of:
 * - `dmId` does not refer to a valid DM
 *
 * 403 Error when any of:
 * - `token` is invalid
 * - `dmId` is valid and the authorised user is not a member of the DM
 *
 * @param { string } token
 * @param { number } dmId
 *
 * @returns {{ name: string, members: members[] }} - no error
 * @throws { HTTPError } - error
 */
function dmDetailsV2(token: string, dmId: number): DmDetails {
  const user: User = getUserByToken(token);
  if (!user) {
    throw HTTPError(403, 'Invalid token');
  }

  const dm: Dm = getDmById(dmId);
  if (!dm) {
    throw HTTPError(400, 'Invalid dmId');
  }

  const member: Member = dm.dmMembers.find((u) => u.uId === user.uId);
  if (!member) {
    throw HTTPError(403, 'The authorised user is not a member of the DM');
  }

  const data = getData();

  dm.dmMembers.forEach((m) => {
    const userInfo = data.users.find((u) => u.uId === m.uId);
    m.profileImgUrl = userInfo.profileImgUrl;
  });

  const details: DmDetails = {
    name: dm.dmName,
    members: dm.dmMembers,
  };

  return details;
}

/**
 * Given a DM with ID dmId, the authorised user is removed as a member
 * of this DM. This does not update the name of the DM.
 * The creator is allowed to leave and the DM will still exist if this happens.
 *
 * 400 Error when any of:
 * - `dmId` is invalid
 *
 * 403 Error when any of:
 * - `token` is invalid
 * - `dmId` is valid but authorised user is not a member of dm
 *
 * @param { string } token
 * @param { number } dmId
 *
 * @returns {{}} - no error
 * @throws { HTTPError } - error
 */
function dmLeaveV2(token: string, dmId: number): Record<never, string> {
  const user: User = getUserByToken(token);
  if (!user) {
    throw HTTPError(403, 'Invalid token');
  }

  const dm: Dm = getDmById(dmId);
  if (!dm) {
    throw HTTPError(400, 'Invalid dmId');
  }

  const member: Member = dm.dmMembers.find((u) => u.uId === user.uId);
  if (!member) {
    throw HTTPError(403, 'The authorised user is not a member of the DM');
  }

  const newMemberList: Member[] = dm.dmMembers.filter(
    (member) => member.uId !== user.uId
  );
  const data: Data = getData();
  const dmIndex: number = data.dms.indexOf(dm);
  data.dms[dmIndex].dmMembers = newMemberList;
  setData(data);

  return {};
}

/**
 * Given a DM with ID dmId that the authorised user is a member of,
 * returns up to 50 messages between index start and "start + 50".
 * Message with index 0 (i.e. the first element in the returned array of messages)
 * is the most recent message in the DM. This function returns a new index end.
 *
 * If there are more messages to return after this function call, end equals
 * "start + 50". If this function has returned the least recent messages in the
 * DM, end equals -1 to indicate that there are no more messages to load after
 * this return.
 *
 * 400 Error when any of:
 * - `dmId` is invalid
 * - `start` is greater than number of messages in dm
 *
 * 403 Error when any of:
 * - `token` is invalid
 * - `dmId` is valid but authorised user is not a member of dm
 *
 * @param { string } token
 * @param { number } dmId
 * @param { number } start
 *
 * @returns {{ messages: [], start: number, end: number }} - no error
 * @throws { HTTPError } - error
 */
function dmMessagesV2(token: string, dmId: number, start: number): DmMessages {
  const user: User = getUserByToken(token);
  if (!user) {
    throw HTTPError(403, 'Invalid token');
  }

  const dm: Dm = getDmById(dmId);
  if (!dm) {
    throw HTTPError(400, 'Invalid dmId');
  }

  const member = dm.dmMembers.find((member) => member.uId === user.uId);
  if (!member) {
    throw HTTPError(403, 'The authorised user is not a member of the DM');
  }

  const data: Data = getData();
  const dmAllMessages: Message[] = data.messages.filter((m) => m.dmId === dmId);
  if (start > dmAllMessages.length || start < 0) {
    throw HTTPError(400, 'Invalid start');
  }

  dmAllMessages.forEach((message) => {
    message.reacts.forEach((r) => {
      if (r.uIds.includes(user.uId)) {
        r.isThisUserReacted = true;
      } else {
        r.isThisUserReacted = false;
      }
    });
  });

  const end = Math.min(start + 50, dmAllMessages.length);
  dmAllMessages.sort((a, b) => b.timeSent - a.timeSent);
  const dmMessagesArray: DmMessage[] = dmAllMessages
    .slice(start, end)
    .map((m) => ({
      messageId: m.messageId,
      uId: m.uId,
      message: m.message,
      timeSent: m.timeSent,
      reacts: m.reacts,
      isPinned: m.isPinned,
    }));

  const dmMessages: DmMessages = {
    messages: dmMessagesArray,
    start,
    end: end === dmAllMessages.length ? -1 : end,
  };

  return dmMessages;
}

export {
  dmCreateV2,
  dmListV2,
  dmRemoveV2,
  dmDetailsV2,
  dmLeaveV2,
  dmMessagesV2,
};
