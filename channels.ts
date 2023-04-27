import { getData, setData } from './dataStore';
import { getUserByToken, getChannelsInfo } from './helper';
import HTTPError from 'http-errors';
import {
  User,
  Channel,
  Member,
  ChannelsList,
  Data,
  Standup,
} from './interface';

/**
 * Creates a new channel with the given name, that is either
 * a public or private channel. The user who created it
 * automatically joins the channel.
 *
 * Returns 400 Error when any of:
 * - length of name is less than 1 or more than 20
 *
 * Returns 403 Error when any of:
 * - `token` is invalid
 *
 * @param { string } token
 * @param { string } name
 * @param { boolean } isPublic
 *
 * @returns { channelId: number } - no error
 */
function channelsCreateV3(
  token: string,
  name: string,
  isPublic: boolean
): { channelId: number } {
  if (typeof name !== 'string' || name.length < 1 || name.length > 20) {
    throw HTTPError(
      400,
      'name is not a string or length is not between 1 and 20'
    );
  }

  const user: User = getUserByToken(token);
  if (!user) {
    throw HTTPError(403, 'Invalid token');
  }

  const data: Data = getData();

  const member: Member = {
    uId: user.uId,
    email: user.email,
    nameFirst: user.nameFirst,
    nameLast: user.nameLast,
    handleStr: user.handleStr,
    profileImgUrl: user.profileImgUrl,
  };

  const standup: Standup = {
    ownerId: -1,
    isActive: false,
    timeFinish: -1,
    queue: [],
  };

  const channelId = data.channels.length + 1;
  const newChannel: Channel = {
    ownersId: [user.uId],
    channelId: channelId,
    name: name,
    isPublic: isPublic,
    members: [member],
    standup,
  };

  data.channels.push(newChannel);
  setData(data);

  return { channelId: channelId };
}

/**
 * Provides an array of all channels (and their associated
 * details) that the authorised user is part of.
 *
 * Return 403 Error when any of:
 * - `token` is invalid
 *
 * @param { string } token
 *
 * @returns { ChannelsList[] } - no error
 */
function channelsListV3(token: string): { channels: ChannelsList[] } {
  const user: User = getUserByToken(token);
  if (!user) {
    throw HTTPError(403, 'Invalid token');
  }

  const data: Data = getData();
  const channels: Channel[] = data.channels.filter((channel) =>
    channel.members.find((member) => member.uId === user.uId)
  );

  return { channels: getChannelsInfo(channels) };
}

/**
 * Provides an array of all channels, including private
 * channels and their associated details.
 *
 * Return 403 Error when any of:
 * - `token` is invalid
 *
 * @param { string } token
 *
 * @returns { ChannelsList[] } - no error
 */
function channelsListAllV3(token: string): { channels: ChannelsList[] } {
  const user: User = getUserByToken(token);
  if (!user) {
    throw HTTPError(403, 'Invalid token');
  }

  const data: Data = getData();
  return { channels: getChannelsInfo(data.channels) };
}

export { channelsCreateV3, channelsListV3, channelsListAllV3 };
