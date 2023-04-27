import { getData } from './dataStore';
import { User, Member, Channel, Message, Dm, Data } from './interface';

// ========================================================================= //

// Channel

/**
 * Helper function to return a channel object by a corresponding id.
 *
 * @param { number } channelId
 *
 * @returns {{ Channel }} - channel found
 * @returns {{ undefined }} - channel not found
 */
export function getChannel(channelId: number): Channel {
  const data = getData();
  return data.channels.find((c) => c.channelId === channelId);
}

/**
 * Helper function for `channelsList`
 *
 * @param { Channel[] } channels
 *
 * @returns {{ channelId: number, name: string }}
 */
export function getChannelsInfo(channels: Channel[]) {
  return channels.map((channel) => ({
    channelId: channel.channelId,
    name: channel.name,
  }));
}

/**
 * Helper function to return a channel index from data.channels
 *
 * @param { number } channelId
 *
 * @returns { number } - index of channel found
 */
export function getChannelIndex(channelId: number): number {
  const data = getData();
  return data.channels.findIndex((c) => c.channelId === channelId);
}

/**
 * Helper to return a channel owner index from data.channels.owners
 *
 * @param { number } channelIndex
 * @param { number } uId
 *
 * @returns { number }
 */
export function channelOwnerIndex(channelIndex: number, uId: number): number {
  const data = getData();
  return data.channels[channelIndex].ownersId.findIndex((o) => o === uId);
}

/**
 * Helper to return a channel member index from data.channels.members
 *
 * @param { number } channelIndex
 * @param { number } uId
 *
 * @returns  { number }
 */
export function getChannelMember(channelIndex: number, uId: number): number {
  const data: Data = getData();
  return data.channels[channelIndex].members.findIndex((m) => m.uId === uId);
}

// ========================================================================= //

// User

/**
 * Helper function to return a user object by a corresponding token.
 *
 * @param { number } token
 *
 * @returns {{ User }}
 */
export function getUserByToken(token: string): User {
  const data = getData();
  let user1;
  for (const user of data.users) {
    for (const isToken of user.token) {
      if (isToken === token) {
        user1 = user;
      }
    }
  }
  return user1;
}

/**
 * Helper function to return a user object by a corresponding email.
 *
 * @param { string } email
 *
 * @returns {{ User }}
 */
export function getUserByEmail(email: string): User {
  const data = getData();
  return data.users.find((e: User) => e.email === email);
}

/**
 * Helper function to return a user object by a corresponding id
 *
 * @param { number } authUserId
 *
 * @returns {{ User }} - user found in data.users
 * @returns {{ undefined }} - user not found
 */
export function getUser(authUserId: number): User {
  const data = getData();
  return data.users.find((u) => u.uId === authUserId);
}

/**
 * Helper function to return a user object by a corresponding handleStr
 *
 * @param { string } handleStr
 *
 * @returns {{ User }} - user found in data.users
 * @returns {{ undefined }} - user not found
 */
export function getUserByHandle(handleStr: string): User {
  const data = getData();
  return data.users.find((u) => u.handleStr === handleStr);
}

/**
 * Helper function to return a global owner user id
 *
 * @param { number } uId
 *
 * @returns {{ globalOwnwerId: number }}
 */
export function getGlobalOwnerId(uId: number): number {
  const data = getData();
  const index = data.globalOwnersId.findIndex((o) => o === uId);
  if (index === -1) {
    return -1;
  }
  return data.globalOwnersId[index];
}

// ========================================================================= //

// Member

/**
 * Helper function to return memeber from user
 *
 * @param { User }
 * @returns {{ Member }}
 */
export function getMember(user: User): Member {
  const members = {
    uId: user.uId,
    email: user.email,
    nameFirst: user.nameFirst,
    nameLast: user.nameLast,
    handleStr: user.handleStr,
    profileImgUrl: user.profileImgUrl,
  };
  return members;
}

// ========================================================================= //

// Auth

/**
 * Helper function to generate a random token for an authorised user
 *
 * @param {{}}
 *
 * @returns {{ tokenStr: string }}
 */
export function generateToken(): string {
  const token = Math.floor(Math.random() * 10000000);
  const tokenStr = token.toString();
  return tokenStr;
}

/**
 * Generate a unique user handle for new register
 * by adding firstName and lastName, then lowercase all of them
 * and remove all the stuff that are not alphanumeric characters
 *
 * @param { string } nameFirst
 * @param { string } nameLast
 *
 * @returns {{ handle: string }}
 */
export function generateUserHandle(
  nameFirst: string,
  nameLast: string
): string {
  const data = getData();
  let handle = nameFirst + nameLast;
  handle = handle.replace(/\s+/g, '').toLowerCase();
  handle = handle.replace(/[^a-z0-9]/g, '');

  if (handle.length > 20) {
    handle = handle.slice(0, 20);
  }

  const end = handle.length;
  let cnt = -1;
  for (const person of data.users) {
    if (person.handleStr === handle) {
      cnt++;
      handle = handle.slice(0, end);
      handle += cnt;
    }
  }
  return handle;
}

// ========================================================================= //

// Message

/**
 * Helper function to get message by Id
 *
 * @param { number } messageId
 *
 * @returns {{ Message }}
 */
export function getMessageById(messageId: number): Message {
  const data = getData();
  return data.messages.find((m) => m.messageId === messageId);
}

/**
 * Helper function to find the message in channel
 *
 * @param { number } messageId
 *
 * @returns {{ Channel }}
 */
export function findMessageInChannel(messageId: number): Channel {
  const data = getData();
  const message = data.messages.find((m) => m.messageId === messageId);
  return data.channels.find((c) => c.channelId === message.channelId);
}

/**
 * Helper function to find member given channelId and uId
 *
 * @param { number } channelId
 * @param { number } uId
 *
 * @returns { Member }
 */
export function findMemberInChannel(channelId: number, uId: number): Member {
  const data = getData();
  const channel = data.channels.find((c) => c.channelId === channelId);
  return channel.members.find((m) => m.uId === uId);
}

/**
 * Generate a message Id
 *
 * @param {{}}
 * @returns { number } messageId
 */
export function generateMessageId(): number {
  const data = getData();
  let messageId = 0;
  do {
    messageId++;
  } while (data.messages.find((m) => m.messageId === messageId));
  return messageId;
}

/**
 * Helper function to get react in message given messageId
 * and reactId
 *
 * @param { number } messageId
 * @param { number } reactId
 *
 * @returns { React }
 */
export function getReactInMessage(messageId: number, reactId: number) {
  const message = getMessageById(messageId);
  return message.reacts.find((r) => r.reactId === reactId);
}

// ========================================================================= //

// Dm

/**
 * Helper function to find member given dmId and uId
 *
 * @param { number } dmId
 * @param { number } uId
 *
 * @returns { Member }
 */
export function findMemberInDm(dmId: number, uId: number): Member {
  const data = getData();
  const dm = data.dms.find((d) => d.dmId === dmId);
  return dm.dmMembers.find((m) => m.uId === uId);
}

/**
 * Helper function to find message in dm
 *
 * @param { number } messageId
 *
 * @returns {{ Dm }}
 */
export function findMessageInDm(messageId: number): Dm {
  const data = getData();
  const message = data.messages.find((m) => m.messageId === messageId);
  return data.dms.find((d) => d.dmId === message.dmId);
}

/**
 * Helper function get dm by Id
 *
 * @param { number } dmId
 *
 * @returns {{ Dm }}
 */
export function getDmById(dmId: number): Dm {
  const data = getData();
  return data.dms.find((d) => d.dmId === dmId);
}

/**
 * Helper function to get dm index from dmId
 *
 * @param { number } dmId
 *
 * @returns { number }
 */
export function getDmIndex(dmId: number): number {
  const data = getData();
  return data.dms.findIndex((d) => d.dmId === dmId);
}

export function sleep(time: number) {
  const timeNow = Date.now();
  while (timeNow + time >= Date.now()) {
    // waiting
  }
}
