import { setData, getData } from './dataStore';
import HTTPError from 'http-errors';
import { User, Data, Message, StandupActive } from './interface';
import {
  getChannelIndex,
  getUserByToken,
  getChannelMember,
  generateMessageId,
} from './helper';

/**
 * For a given channel, starts a standup period lasting length seconds.
 * During this standup period, if someone calls standup/send with a message,
 * it will be buffered during the length-second window.
 * Then, at the end of the standup, all buffered messages are packaged into
 * one message, and this packaged message is sent to the channel from the
 * user who started the standup
 *
 * If no standup messages are sent during the standup, no message should be sent at the end.
 *
 * 400 Error when:
 * - `channelId` does not refer to a valid channel
 * - length is a negative integer
 * - an active standup is currently running in the channel
 *
 * 403 Error when:
 * - `channelId` is valid and the authorised user is not a member of the channel
 * - `token` is invalid
 *
 * @param { string } token
 * @param { number } channelId
 * @param { number } length
 *
 * @returns {{ timeFinish: number }} - no error
 * @throws { HTTPError } - error
 */
function standupStartV1(
  token: string,
  channelId: number,
  length: number
): { timeFinish: number } {
  if (length < 0) {
    throw HTTPError(400, 'length is a negative integer');
  }

  const channelIndex = getChannelIndex(channelId);
  if (channelIndex === -1) {
    throw HTTPError(400, 'channel does not exist');
  }

  const data: Data = getData();
  const standup = data.channels[channelIndex].standup;
  if (standup && standup.isActive) {
    throw HTTPError(400, 'active standup already running');
  }

  const authUser: User = getUserByToken(token);
  if (!authUser) {
    throw HTTPError(403, 'invalid token');
  }

  const authMember = getChannelMember(channelIndex, authUser.uId);
  if (authMember === -1) {
    throw HTTPError(403, 'user is not a member of the channel');
  }

  const timeFinish = (Date.now() + length * 1000) / 1000;
  standup.ownerId = authUser.uId;
  standup.queue = [];
  standup.isActive = true;
  standup.timeFinish = timeFinish;

  setTimeout(() => {
    const queue = standup.queue;
    if (queue.length > 0) {
      const message = queue.join('\n');
      const messageId = generateMessageId();
      const newMessage: Message = {
        messageId: messageId,
        uId: authUser.uId,
        channelId: channelId,
        dmId: -1,
        message: message,
        timeSent: Date.now() / 1000,
        reacts: [],
        isPinned: false,
      };
      data.messages.push(newMessage);
    }
    standup.ownerId = -1;
    standup.queue = null;
    standup.isActive = false;
    standup.timeFinish = -1;
  }, length * 1000);

  return { timeFinish };
}

/**
 * For a given channel, returns whether a standup is active in it, and what time the standup
 * finishes. If no standup is active, then `timeFinish` should be `null`.
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
 * @returns {{ isActive: boolean, timeFinish: number | null }}
 * @throws { HTTPError } - error
 */
function standupActiveV1(token: string, channelId: number): StandupActive {
  const channelIndex = getChannelIndex(channelId);
  if (channelIndex === -1) {
    throw HTTPError(400, 'channelId is invalid');
  }

  const authUser: User = getUserByToken(token);
  if (!authUser) {
    throw HTTPError(403, 'token is invalid');
  }

  const authMember = getChannelMember(channelIndex, authUser.uId);
  if (authMember === -1) {
    throw HTTPError(403, 'authUser is not a member of the channel');
  }

  const data: Data = getData();
  const isActive: boolean = data.channels[channelIndex].standup.isActive;
  const timeFinish: number = data.channels[channelIndex].standup.timeFinish;

  return { isActive, timeFinish };
}

/**
 * For a given channel, if a standup is currently active in the channel,
 * sends a message to get buffered in the standup queue.
 *
 * Note: @ tags should not be parsed as proper tags
 * (i.e. no notification should be triggered on send, or when the standup finishes)
 *
 * 400 Error when:
 * - `channelId` does not refer to a valid channel
 * - length of `message` is over 1000 characters
 * - an active standup is not currently running in the channel
 *
 * 403 Error when:
 * - `channelId` is valid and the authorised user is not a member of the channel
 * - `token` is invalid
 *
 * @param { string } token
 * @param { number } channelId
 * @param { string } message
 *
 * @returns {{}} - no error
 * @throws { HTTPError } - error
 */
function standupSendV1(
  token: string,
  channelId: number,
  message: string
): Record<string, never> {
  if (message.length > 1000) {
    throw HTTPError(400, 'message is over 1000 characters');
  }

  const channelIndex: number = getChannelIndex(channelId);
  if (channelIndex === -1) {
    throw HTTPError(400, 'channelId is invalid');
  }

  const authUser: User = getUserByToken(token);
  if (!authUser) {
    throw HTTPError(403, 'token is invalid');
  }

  const authMember: number = getChannelMember(channelIndex, authUser.uId);
  if (authMember === -1) {
    throw HTTPError(403, 'user is not a member of the channel');
  }

  const data: Data = getData();
  const isActive: boolean = data.channels[channelIndex].standup.isActive;
  if (!isActive) {
    throw HTTPError(400, 'no active standup in channel');
  }

  const packedMessage = `${authUser.handleStr}: ${message}`;
  data.channels[channelIndex].standup.queue.push(packedMessage);

  setData(data);

  return {};
}

export { standupStartV1, standupActiveV1, standupSendV1 };
