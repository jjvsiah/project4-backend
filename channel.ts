import { getData, setData } from './dataStore';
import HTTPError from 'http-errors';
import {
  User,
  Member,
  Channel,
  ChannelDetails,
  Messages,
  ChannelMessages,
  Data,
  Notification,
} from './interface';
import {
  getChannel,
  getUser,
  getUserByToken,
  getMember,
  getGlobalOwnerId,
  getChannelIndex,
  channelOwnerIndex,
} from './helper';

/**
 * Given a channel with ID `channelId` that the authorised user
 * is a member of, provides basic details about the channel.
 *
 * 400 Error when:
 * - `channelId` does not refer to a valid channel
 *
 * 403 Error when:
 * - `channelId` is valid and the authorised user is not a member of the channel
 * - `token` is invalid
 *
 * @param { string } token
 * @param { number } channelId
 *
 * @returns { ChannelDetails }
 * @throws { HTTPError }
 */
function channelDetailsV3(token: string, channelId: number): ChannelDetails {
  const channel: Channel = getChannel(channelId);
  if (!channel) {
    throw HTTPError(400, 'channelId is invalid');
  }

  const user: User = getUserByToken(token);
  if (!user) {
    throw HTTPError(403, 'token is invalid');
  }

  const userMember: Member = channel.members.find((m) => m.uId === user.uId);
  if (!userMember) {
    throw HTTPError(403, 'authorised user is not a member of the channel');
  }

  const data = getData();

  const channelOwners = channel.ownersId.map((ownerId) => {
    const channelOwner = getUser(ownerId);
    const channelOwnerMember: Member = getMember(channelOwner);
    return channelOwnerMember;
  });

  channel.members.forEach((m) => {
    const userInfo = data.users.find((u) => u.uId === m.uId);
    m.profileImgUrl = userInfo.profileImgUrl;
  });

  const channelDetails: ChannelDetails = {
    name: channel.name,
    isPublic: channel.isPublic,
    ownerMembers: channelOwners,
    allMembers: channel.members,
  };

  setData(data);

  return channelDetails;
}

/**
 * Given a `channelId` of a channel that the authorised user
 * can join, adds them to that channel
 *
 * 400 Error when:
 * - `channelId` does not refer to a valid channel
 * - authorised user is already a member of the channel
 *
 * 403 Error when:
 * - `channelId` refers to a private channel and the authorised user
 *   is not already a channel memebr and is not a global owner
 * - `token` is invalid
 *
 * @param { string } token
 * @param { number } channelId
 *
 * @returns {{}} - no error
 * @throws { HTTPError } - error
 */
function channelJoinV3(
  token: string,
  channelId: number
): Record<string, never> {
  const channel: Channel = getChannel(channelId);
  if (!channel) {
    throw HTTPError(400, 'channelId is invalid');
  }

  const user: User = getUserByToken(token);
  if (!user) {
    throw HTTPError(403, 'token is invalid');
  }

  const userMember: Member = channel.members.find((m) => m.uId === user.uId);
  if (userMember) {
    throw HTTPError(400, 'authorised user is already a member of the channel');
  }

  const globalOwnerId: number = getGlobalOwnerId(user.uId);
  if (channel.isPublic === false && globalOwnerId !== user.uId) {
    throw HTTPError(
      403,
      'authorised user is not a global owner amd not a memebr'
    );
  }

  const data: Data = getData();
  const channelIndex = data.channels.findIndex(
    (c) => c.channelId === channelId
  );
  data.channels[channelIndex].members.push(getMember(user));
  setData(data);

  return {};
}

/**
 * Invites a user with ID `uId` to join a channel with ID `channelId`.
 * Once invited, the user is added to the channel immediately.
 * In both public and private channels, all members are able to invite users.
 *
 * 400 Error when:
 * - `channelId` does not refer to a valid channel
 * - `uId` does not refer to a valid user
 * - `uId` is already a member of the channel
 *
 * 403 Error when:
 * - `token` is invalid
 * - `channelId` is valid and the authorised user is not a member of the channel
 *
 * @param { string } token
 * @param { channelId } number
 * @param { number } uId
 *
 * @returns {{}} - no error
 * @throws { HTTPError } - error
 */
function channelInviteV3(
  token: string,
  channelId: number,
  uId: number
): Record<string, never> {
  const channel: Channel = getChannel(channelId);
  if (!channel) {
    throw HTTPError(400, 'channelId is invalid');
  }

  const authUser: User = getUserByToken(token);
  if (!authUser) {
    throw HTTPError(403, 'token is invalid');
  }

  const newUser: User = getUser(uId);
  if (!newUser) {
    throw HTTPError(400, 'uId is invalid');
  }

  const member: Member = channel.members.find((m) => m.uId === authUser.uId);
  if (!member) {
    throw HTTPError(403, 'authorised user is not a member of the channel');
  }

  const newMember: Member = channel.members.find((m) => m.uId === uId);
  if (newMember) {
    throw HTTPError(400, 'uId is already a member of the channel');
  }

  const data: Data = getData();
  const channelIndex = data.channels.findIndex(
    (c) => c.channelId === channelId
  );

  data.channels[channelIndex].members.push(getMember(newUser));
  setData(data);

  // After inviting a user to the channel, push a notification object into the
  // notification array of that user that's being invited

  const notification: Notification = {
    channelId: channel.channelId,
    dmId: -1,
    notificationMessage: `${authUser.handleStr} added you to ${channel.name}`,
  };

  const newUserIndex = data.users.indexOf(newUser);

  data.users[newUserIndex].notifications.unshift(notification);

  return {};
}

/**
 * Given a channel with ID `channelId` that the authorised user is a member of,
 * returns up to 50 messages between index "start" and "start + 50" messages
 * between index 0 ( the first element in the returned arary of `messages`)
 * is the most recent message in the channel. this function returns a new index "end".
 * If there are more messages to return after this function call, "end" equals "start + 50".
 *
 * If this function has returned the least recent messages in the channel, "end"
 * equals -1 to indicate there are no more messages to load after this return.
 *
 * 400 Error when:
 * - `channelId` does not refer to a valid channel
 * - `start` is greater than the total number of messages in the channel
 *
 * 403 Error when:
 * - `token` is invalid
 * - `channelId` is valid and the authrorised user is not a member of the channel
 *
 * @param { token } string
 * @param { number } channelId
 * @param { number } start
 *
 * @returns { ChannelMessages } - no error
 * @throws { HTTPError } - error
 */
function channelMessagesV3(
  token: string,
  channelId: number,
  start: number
): ChannelMessages {
  const authUser: User = getUserByToken(token);
  if (!authUser) {
    throw HTTPError(403, 'token is invalid');
  }

  const channel: Channel = getChannel(channelId);
  if (!channel) {
    throw HTTPError(400, 'channelId is invalid');
  }

  const member: Member = channel.members.find((u) => u.uId === authUser.uId);
  if (!member) {
    throw HTTPError(403, 'authorised user is not a member of the channel');
  }

  const data: Data = getData();
  const messages = data.messages.filter((m) => m.channelId === channelId);
  if (start > messages.length || start < 0) {
    throw HTTPError(400, 'start is greater than the total number of messages');
  }

  messages.forEach((message) => {
    message.reacts.forEach((r) => {
      if (r.uIds.includes(authUser.uId)) {
        r.isThisUserReacted = true;
      } else {
        r.isThisUserReacted = false;
      }
    });
  });

  const end = Math.min(start + 50, messages.length);
  messages.sort((a, b) => b.timeSent - a.timeSent);
  const channelMessagesArray: Messages[] = messages.slice(start, end);
  const channelMsgsArray = channelMessagesArray.map((m) => ({
    messageId: m.messageId,
    uId: m.uId,
    message: m.message,
    timeSent: m.timeSent,
    reacts: m.reacts,
    isPinned: m.isPinned,
  }));

  const channelMessages: ChannelMessages = {
    messages: channelMsgsArray,
    start,
    end: end === messages.length ? -1 : end,
  };

  return channelMessages;
}

/**
 * Given a channel with ID channelId that the authorised user
 * is a member of, remove them as a member of the channel.
 * Their messages should remain in the channel.
 * If the only channel owner leaves, the channel will remain.
 *
 * 400 Error when:
 * - `channelId` does not refer to a valid channel
 * - the authorised user is the starter of an active standup in the channel
 *
 * 403 Error when:
 * - `channelId` is valid and the authorised user is not a member of the channel
 * - `token` is invalid
 *
 * @param { string } token
 * @param { channelId } number
 *
 * @returns {{}} - no error
 * @throws { HTTPError } - error
 */
function channelLeaveV2(
  token: string,
  channelId: number
): Record<string, never> {
  const channelIndex: number = getChannelIndex(channelId);
  if (channelIndex === -1) {
    throw HTTPError(400, 'channelId is invalid');
  }

  const authUser: User = getUserByToken(token);
  if (!authUser) {
    throw HTTPError(403, 'token is invalid');
  }

  const data: Data = getData();
  const memberIndex: number = data.channels[channelIndex].members.findIndex(
    (m) => m.uId === authUser.uId
  );
  if (memberIndex === -1) {
    throw HTTPError(403, 'authUserId is not a member of the channel');
  }
  data.channels[channelIndex].members.splice(memberIndex, 1);

  if (data.channels[channelIndex].standup.ownerId === authUser.uId) {
    throw HTTPError(400, 'user is the starter of an active standup in channel');
  }

  const channelOwnerIndex: number = data.channels[
    channelIndex
  ].ownersId.findIndex((n) => n === authUser.uId);
  if (channelOwnerIndex !== -1) {
    data.channels[channelIndex].ownersId.splice(channelOwnerIndex, 1);
  }

  setData(data);

  return {};
}

/**
 * Make user with user id `uId` an owner of the channel.
 *
 * 400 Error when:
 * - `channelId` does not refer to a valid channel
 * - `uId` does not refer to a valid user
 * - `uId` refers to a user who is not a member of the channel
 * - `uId` refers to a user who is already an owner of the channel
 *
 * 403 Error when:
 * - `token` is invalid
 * - `channelId` is valid and the authorised user does not have
 *    owner permission to add owners to the channel
 *
 * @param { string } token
 * @param { number } channelId
 * @param { number } uId
 *
 * @returns {{}} - no error
 * @throws { HTTPError } - error
 */
function channelAddOwnerV2(
  token: string,
  channelId: number,
  uId: number
): Record<never, string> {
  const channelIndex: number = getChannelIndex(channelId);
  if (channelIndex === -1) {
    throw HTTPError(400, 'channelId is invalid');
  }

  const authUser: User = getUserByToken(token);
  if (!authUser) {
    throw HTTPError(403, 'token is invalid');
  }

  const newUser: User = getUser(uId);
  if (!newUser) {
    throw HTTPError(400, 'uId is invalid');
  }

  const data: Data = getData();

  const authUserOwner: number = channelOwnerIndex(channelIndex, authUser.uId);
  if (authUserOwner === -1 && authUser.uId !== getGlobalOwnerId(authUser.uId)) {
    throw HTTPError(403, 'authUserId is not an owner of the channel');
  }

  const newMember: Member = data.channels[channelIndex].members.find(
    (m) => m.uId === uId
  );
  if (!newMember) {
    throw HTTPError(400, 'uId is not a member of the channel');
  }

  const newUserOwner: number = channelOwnerIndex(channelIndex, uId);
  if (newUserOwner !== -1) {
    throw HTTPError(400, 'uId is already an owner of the channel');
  }

  // global owners or channel owners can add members as owners
  data.channels[channelIndex].ownersId.push(uId);
  setData(data);

  return {};
}

/**
 * Remove user with user id uId as an owner of the channel
 *
 * 400 Error when:
 * - `channelId` does not refer to a valid channel
 * - `uId` does not refer to a valid user
 * - `uId` refers to a user who is not an owner of the channel
 * - `uId` refers to a user who is currently the owner of the channel
 *
 * 403 Error when:
 * - `channelId` is valid and the authorised user does not have owner permissions
 *    in the channel
 * - `token` is invalid
 *
 * @param { number } token
 * @param { number } channelId
 * @param { number } uId
 *
 * @returns {{}} - no error
 * @throws { HTTPError } - error
 */
function channelRemoveOwnerV2(
  token: string,
  channelId: number,
  uId: number
): Record<string, never> {
  const channelIndex: number = getChannelIndex(channelId);
  if (channelIndex === -1) {
    throw HTTPError(400, 'channelId is invalid');
  }

  const authUser: User = getUserByToken(token);
  if (!authUser) {
    throw HTTPError(403, 'token is invalid');
  }

  const newUser: User = getUser(uId);
  if (!newUser) {
    throw HTTPError(400, 'uId is invalid');
  }

  const data: Data = getData();
  const authUserOwner: number = channelOwnerIndex(channelIndex, authUser.uId);

  if (authUserOwner === -1 && authUser.uId !== getGlobalOwnerId(authUser.uId)) {
    throw HTTPError(403, 'authUserId is not an owner of the channel');
  }

  const authMember: Member = data.channels[channelIndex].members.find(
    (m) => m.uId === authUser.uId
  );
  if (!authMember) {
    throw HTTPError(403, 'authUserId is not a member of the channel');
  }

  const userOwnerIndex: number = channelOwnerIndex(channelIndex, uId);
  const ownersLength: number = data.channels[channelIndex].ownersId.length;
  if (userOwnerIndex === -1 || ownersLength === 1) {
    throw HTTPError(400, 'uId is not an owner of the channel');
  }

  data.channels[channelIndex].ownersId.splice(userOwnerIndex, 1);
  setData(data);

  return {};
}

export {
  channelJoinV3,
  channelInviteV3,
  channelMessagesV3,
  channelDetailsV3,
  channelLeaveV2,
  channelAddOwnerV2,
  channelRemoveOwnerV2,
};
