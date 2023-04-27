import HTTPError from 'http-errors';
import { getData } from './dataStore';
import { getUserByToken, findMemberInChannel, findMemberInDm } from './helper';
import { Messages } from './interface';

/**
 * Given a query string, return a collection of messages in all of the channels/DMs
 * that the user has joined that contain the query (case-insensitive).
 * There is no expected order for these messages.
 *
 * @param {string} token
 * @param {string} queryStr
 *
 * @returns {{ messages }} - no error
 *
 * @throws {HTTPError(400)} - when queryStr is less than 1 or over 1000 characters
 * @throws {HTTPError(403)} - invalid token
 */
function searchV1(token: string, queryStr: string): { messages: Messages[] } {
  const data = getData();

  const user = getUserByToken(token);
  if (!user) {
    throw HTTPError(403, 'Invalid token');
  }

  if (queryStr.length < 1 || queryStr.length > 1000) {
    throw HTTPError(400, 'Invalid query string length');
  }

  const searchMessages: Messages[] = [];

  // Search messages in all channels
  for (const channel of data.channels) {
    const isChannelMember = findMemberInChannel(channel.channelId, user.uId);
    if (!isChannelMember) {
      continue;
    } else {
      const channelMessage = data.messages.filter((m) => m.channelId === channel.channelId);
      channelMessage.forEach((message) => {
        if (message.message.toLowerCase().includes(queryStr.toLowerCase())) {
          searchMessages.push({
            messageId: message.messageId,
            uId: message.uId,
            message: message.message,
            timeSent: message.timeSent,
            reacts: message.reacts,
            isPinned: message.isPinned,
          });
        }
      });
    }
  }

  // Search messages in all DMs
  for (const dm of data.dms) {
    const isDmMember = findMemberInDm(dm.dmId, user.uId);
    if (!isDmMember) {
      continue;
    } else {
      const dmMessage = data.messages.filter((m) => m.dmId === dm.dmId);

      dmMessage.forEach((message) => {
        if (message.message.toLowerCase().includes(queryStr.toLowerCase())) {
          searchMessages.push({
            messageId: message.messageId,
            uId: message.uId,
            message: message.message,
            timeSent: message.timeSent,
            reacts: message.reacts,
            isPinned: message.isPinned,
          });
        }
      });
    }
  }

  return { messages: searchMessages };
}

export { searchV1 };
