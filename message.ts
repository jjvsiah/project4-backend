import { getData, setData } from './dataStore';
import {
  User,
  Member,
  Message,
  React,
  Notification,
  Data,
  Channel,
} from './interface';
import {
  generateMessageId,
  getReactInMessage,
  getUserByHandle,
} from './helper';
import HTTPError from 'http-errors';
import {
  getUserByToken,
  getChannel,
  getChannelIndex,
  getMessageById,
  findMessageInChannel,
  findMessageInDm,
  getDmById,
  getGlobalOwnerId,
  getUser,
  findMemberInChannel,
  findMemberInDm,
  getDmIndex,
} from './helper';
import { clearInterval, clearTimeout } from 'timers';

const validReactId = [1];

/**
 * Send a message from the authorised user to the channel specified by channelId.
 * Note: Each message should have its own unique ID,
 * i.e. no messages should share an ID with another message,
 * even if that other message is in a different channel.
 *
 * 400 Error when any of:
 *  - channelId does not refer to a valid channel
 *  - length of message is less than 1 or over 1000 characters
 *
 * 403 Error when any of:
 *  - channelId is valid and the authorised user is not a member of the channel
 *  - token is invalid
 *
 * @param { string } token
 * @param { number } channelId
 * @param { string } message
 *
 * @returns {{ messageId: number }} - no error
 * @throws { HTTPError } - error
 */
function messageSendV2(
  token: string,
  channelId: number,
  message: string
): { messageId: number } {
  const authorUser: User = getUserByToken(token);
  if (!authorUser) {
    throw HTTPError(403, 'Invalid Token');
  }

  const channel: Channel = getChannel(channelId);
  if (!channel) {
    throw HTTPError(400, 'Invalid channelId');
  }

  const member: Member = channel.members.find((m) => m.uId === authorUser.uId);
  if (!member) {
    throw HTTPError(403, 'Not a member of channel');
  }

  if (message.length < 1 || message.length > 1000) {
    throw HTTPError(400, 'Invalid message length');
  }

  const messageId = generateMessageId();
  const newMessage: Message = {
    messageId: messageId,
    uId: authorUser.uId,
    channelId: channelId,
    dmId: -1,
    message: message,
    timeSent: Date.now() / 1000,
    reacts: [],
    isPinned: false,
  };
  const data: Data = getData();
  data.messages.push(newMessage);

  const uniqueTags = getUniqueTags(message);

  uniqueTags.forEach((tag) => {
    const user = getUserByHandle(tag);
    if (user) {
      const userIndex = data.users.indexOf(user);

      const isMember = channel.members.find((m) => m.uId === user.uId);

      if (userIndex !== -1 && isMember) {
        const notification: Notification = {
          channelId: channelId,
          dmId: -1,
          notificationMessage: `${authorUser.handleStr} tagged you in ${
            channel.name
          }: ${message.slice(0, 20)}`,
        };

        data.users[userIndex].notifications.unshift(notification);
      }
    }
  });

  setData(data);

  return { messageId: messageId };
}

/**
 * Given a message, update its text with new text.
 * If the new message is an empty string, the message is deleted.
 *
 * 400 Error when any of:
 * - length of message is over 1000 characters
 * - messageId does not refer to a valid message within a channel/DM
 *   that the authorised user has joined
 *
 * 403 Error when any of:
 * - the message was not sent by the authorised user making this request and
 *   the user does not have owner permissions in the channel/DM
 * - token is invalid
 *
 * @param { string } token
 * @param { number } messageId
 * @param { string } message
 *
 * @returns {{}} - no error
 * @throws { HTTPError } - error
 */
function messageEditV2(
  token: string,
  messageId: number,
  message: string
): Record<string, never> {
  if (message.length > 1000) {
    throw HTTPError(400, 'message is too long');
  }

  checkMessagePermission(token, messageId);
  const data: Data = getData();
  const messageObj = getMessageById(messageId);
  const messageIndex = data.messages.indexOf(messageObj);
  if (message.length === 0) {
    data.messages.splice(messageIndex, 1);
  } else {
    data.messages[messageIndex].message = message;
  }

  const authorUser = getUserByToken(token);

  if (message.length > 0) {
    const uniqueTags = getUniqueTags(message);

    if (messageObj.dmId !== -1) {
      const dm = getDmById(messageObj.dmId);

      uniqueTags.forEach((tag) => {
        const user = getUserByHandle(tag);
        if (user) {
          const userIndex = data.users.indexOf(user);

          const isMember = dm.dmMembers.find((m) => m.uId === user.uId);

          if (userIndex !== -1 && isMember) {
            const notification: Notification = {
              channelId: -1,
              dmId: dm.dmId,
              notificationMessage: `${authorUser.handleStr} tagged you in ${
                dm.dmName
              }: ${message.slice(0, 20)}`,
            };

            data.users[userIndex].notifications.unshift(notification);
          }
        }
      });
    } else {
      uniqueTags.forEach((tag) => {
        const channel = getChannel(messageObj.channelId);

        const user = getUserByHandle(tag);
        if (user) {
          const userIndex = data.users.indexOf(user);

          const isMember = channel.members.find((m) => m.uId === user.uId);

          if (userIndex !== -1 && isMember) {
            const notification: Notification = {
              channelId: channel.channelId,
              dmId: -1,
              notificationMessage: `${authorUser.handleStr} tagged you in ${
                channel.name
              }: ${message.slice(0, 20)}`,
            };

            data.users[userIndex].notifications.unshift(notification);
          }
        }
      });
    }
  }

  setData(data);

  // Need to consider more after stand up and share message is implemented.

  return {};
}

/**
 * Given a messageId for a message, this message is removed from the channel/DM
 *
 * 400 Error when any of:
 * - messageId does not refer to a valid message within a channel/DM that
 *  the authorised user has joined
 *
 * 403 Error when any of:
 * - if the authorised user does not have permissions, and
 *   the message was not sent by them
 *
 * @param { string } token
 * @param { number } messageId
 *
 * @returns {{}} - no error
 * @throws { HTTPError } - error
 */
function messageRemoveV2(
  token: string,
  messageId: number
): Record<string, never> {
  checkMessagePermission(token, messageId);
  const data = getData();
  const messageObj = getMessageById(messageId);
  const messageIndex = data.messages.indexOf(messageObj);
  data.messages.splice(messageIndex, 1);
  setData(data);

  return {};
}

/**
 * Send a message from authorised user to the DM specified by dmId.
 * Note: Each message should have it's own unique ID,
 * i.e. no messages should share an ID with another message,
 * even if that other message is in a different channel or DM.
 *
 * 400 Error when any of:
 *  - dmId does not refer to a valid DM
 *  - length of message is less than 1 or over 1000 characters
 *
 * 403 Error when any of:
 *  - dmId is valid and the authorised user is not a member of the DM
 *  - token is invalid
 *
 * @param { string } token
 * @param { number } dmId
 * @param { string } message
 *
 * @returns {{ messageId: number }} - no error
 * @throws { HTTPError } - error
 */
function messageSendDmV2(
  token: string,
  dmId: number,
  message: string
): { messageId: number } {
  const authorUser = getUserByToken(token);
  if (!authorUser) {
    throw HTTPError(403, 'Invalid token');
  }

  const dm = getDmById(dmId);
  if (!dm) {
    throw HTTPError(400, 'Invalid dmId');
  }

  const member = dm.dmMembers.find((m) => m.uId === authorUser.uId);
  if (!member) {
    throw HTTPError(403, 'Not a member of dm');
  }

  if (message.length < 1 || message.length > 1000) {
    throw HTTPError(400, 'Invalid message length');
  }

  const messageId = generateMessageId();

  const newMessage: Message = {
    messageId: messageId,
    uId: authorUser.uId,
    channelId: -1,
    dmId: dm.dmId,
    message: message,
    timeSent: Date.now() / 1000,
    reacts: [],
    isPinned: false,
  };

  const data = getData();
  data.messages.push(newMessage);

  const uniqueTags = getUniqueTags(message);

  uniqueTags.forEach((tag) => {
    const user = getUserByHandle(tag);
    if (user) {
      const userIndex = data.users.indexOf(user);

      const isMember = dm.dmMembers.find((m) => m.uId === user.uId);

      if (userIndex !== -1 && isMember) {
        const notification: Notification = {
          channelId: -1,
          dmId: dmId,
          notificationMessage: `${authorUser.handleStr} tagged you in ${
            dm.dmName
          }: ${message.slice(0, 20)}`,
        };

        data.users[userIndex].notifications.unshift(notification);
      }
    }
  });

  setData(data);

  return { messageId: newMessage.messageId };
}

/**
 * Given a message within a channel or DM the authorised user is part of,
 * adds a "react" to that particular message.
 *
 * 400 Error when any of:
 * - messageId does not refer to a valid message within a channel/DM that
 *  the authorised user has joined
 * - reactId is not a valid react ID - currently, the only valid react ID the
 *  front end has is 1
 * - the message already contains an active react from the authorised user with
 *
 * 403 Error when any of:
 * - token is invalid
 *
 * @param { string } token
 * @param { number } messageId
 * @param { number } reactId
 *
 * @returns {{}} - no error
 * @throws { HTTPError } - error
 */
function messageReactV1(
  token: string,
  messageId: number,
  reactId: number
): Record<string, never> {
  checkMessagePermissionLessVer(token, messageId);

  if (!validReactId.includes(reactId)) {
    throw HTTPError(400, 'Invalid reactId');
  }

  const user = getUserByToken(token);
  const message = getMessageById(messageId);
  const data = getData();
  const messageIndex = data.messages.indexOf(message);

  const react = getReactInMessage(messageId, reactId);
  if (!react) {
    const newReact: React = {
      reactId: reactId,
      uIds: [user.uId],
      isThisUserReacted: true,
    };
    message.reacts.push(newReact);
  } else {
    const reactIndex = message.reacts.indexOf(react);

    if (message.reacts[reactIndex].uIds.includes(user.uId)) {
      throw HTTPError(400, 'Already reacted');
    } else {
      message.reacts[reactIndex].uIds.push(user.uId);
    }
  }

  data.messages[messageIndex] = message;

  // If the reacting user is not the author user, push a notification
  // object into the notification array of the messages author for the
  // message being reacted to
  const reactedUser = getUser(message.uId);

  // is reactedUser and user are defined and reactedUser.uid!==....etc
  if (reactedUser && reactedUser.uId !== user.uId) {
    let notificationMessage = '';

    if (message.channelId !== -1) {
      const channel = getChannel(message.channelId);

      notificationMessage = `${user.handleStr} reacted to your message in channel ${channel.name}`;
    } else {
      const dm = getDmById(message.dmId);

      notificationMessage = `${user.handleStr} reacted to your message in ${dm.dmName}`;
    }

    const notification: Notification = {
      channelId: message.channelId !== -1 ? message.channelId : -1,
      dmId: message.dmId !== -1 ? message.dmId : -1,
      notificationMessage: notificationMessage,
    };

    const userIndex = data.users.indexOf(reactedUser);

    data.users[userIndex].notifications.unshift(notification);
  }

  setData(data);

  return {};
}

/**
 * Given a message within a channel or DM the authorised user is part of,
 * removes a "react" to that particular message.
 *
 * 400 Error when any of:
 * - messageId does not refer to a valid message within a channel/DM that
 *   the authorised user has joined
 * - reactId is not a valid react ID
 * - the message does not contain an active react from the authorised user
 *
 * 403 Error when any of:
 * - token is invalid
 *
 * @param { string } token
 * @param { number } messageId
 * @param { number } reactId
 *
 * @returns {{}} - error
 * @throws { HTTPError } - no error
 */
function messageUnreactV1(
  token: string,
  messageId: number,
  reactId: number
): Record<string, never> {
  checkMessagePermissionLessVer(token, messageId);

  if (!validReactId.includes(reactId)) {
    throw HTTPError(400, 'Invalid reactId');
  }

  const user = getUserByToken(token);
  const message = getMessageById(messageId);
  const data = getData();
  const messageIndex = data.messages.indexOf(message);

  const react = getReactInMessage(messageId, reactId);
  if (!react) {
    throw HTTPError(400, 'Does not exist this reaction type on this message');
  } else {
    const reactIndex = message.reacts.indexOf(react);

    if (!message.reacts[reactIndex].uIds.includes(user.uId)) {
      throw HTTPError(400, 'No reacted from auth User before');
    } else {
      const userIndex = message.reacts[reactIndex].uIds.indexOf(user.uId);
      message.reacts[reactIndex].uIds.splice(userIndex, 1);
    }
  }

  data.messages[messageIndex] = message;
  setData(data);
  return {};
}

/**
 * Given a message within a channel or DM, marks it as "pinned"
 *
 * 400 Error when any of:
 * - messageId is not a valid message within a channel or DM that the
 *  authorised user is part of
 * - the message is already pinned
 *
 * 403 Error when any of:
 * - messageId refers to a valid message in a joined channel/DM that
 *   the authroised user does not have owner permissions in the channel/DM
 *
 * @param { string } token
 * @param { number } messageId
 *
 * @returns {{}} - no error
 * @throws { HTTPError } - error
 */
function messagePinV1(token: string, messageId: number): Record<string, never> {
  checkMessagePermissionWithoutMessOwner(token, messageId);

  const message = getMessageById(messageId);
  if (message.isPinned) {
    throw HTTPError(400, 'Message is already Pinned');
  }

  const data = getData();
  const messageIndex = data.messages.indexOf(message);
  data.messages[messageIndex].isPinned = true;
  setData(data);
  return {};
}

/**
 * Given a message within a channel or DM, removes its mark as "pinned"
 *
 * 400 Error when any of:
 * - messageId is not a valid message within a channel or DM that the
 *   authorised user is part of
 * - the message is already pinned
 *
 * 403 Error when any of:
 * - messageId refers to a valid message in a joined channel/DM that
 *   the authorised user does not have owner permissions in the channel/DM
 *
 * @param { string } token
 * @param { number } messageId
 *
 * @returns {{}} - no error
 * @throws { HTTPError } - error
 */
function messageUnpinV1(
  token: string,
  messageId: number
): Record<string, never> {
  checkMessagePermissionWithoutMessOwner(token, messageId);

  const message = getMessageById(messageId);
  if (!message.isPinned) {
    throw HTTPError(400, 'Message is not already Pinned');
  }

  const data = getData();
  const messageIndex = data.messages.indexOf(message);
  data.messages[messageIndex].isPinned = false;
  setData(data);
  return {};
}

/**
 * ogMessageId is the ID of the original message.
 * channelId is the channel that the message is being shared to,
 * and is -1 if it is being sent to a DM.
 * dmId is the DM that the message is being shared to,
 * and is -1 if it is being sent to a channel.
 * message is the optional message in addition to the shared message,
 * and will be an empty string '' if no message is given.
 *
 * A new message containing the contents of both the original message
 * and the optional message should be sent to the channel/DM identified
 * by the channelId/dmId. The format of the new message does not matter
 * as long as both the original and optional message exist as a substring
 * within the new message.
 * Once sent, this new message has no link to the original message,
 * so if the original message is edited/deleted, no change will occur for
 * the new message.
 *
 * 400 Error when any of:
 * - both channelId and dmId are invalid
 * - neither channelId nor dmId are -1
 * - ogMessageId is not a valid message within a channel or DM that the
 *  authorised user has joined
 * - length of optional message is more than 1000 characters
 *
 * 403 Error when any of:
 * - the pair of channelId and dmId are valid and the authorised user
 *   has not joined the channel or DM they are trying to share the message to
 * - token is invalid
 *
 * @param { string } token
 * @param { string } message
 * @param { number } ogMessageId
 * @param { number } channelId
 * @param { number } dmId
 *
 * @returns { sharedMessageId: number } - no error
 * @throws { HTTPError } - error
 */
function messageShareV1(
  token: string,
  ogMessageId: number,
  message: string,
  channelId: number,
  dmId: number
): { sharedMessageId: number } {
  if (channelId === -1 && dmId === -1) {
    throw HTTPError(400, 'both channel and dm are invalid');
  }

  if (channelId !== -1 && dmId !== -1) {
    throw HTTPError(400, 'Cannot share in Channel and Dm at the same time');
  }

  if (message.length > 1000) {
    throw HTTPError(400, 'message length is more than 1000 characters');
  }

  const ogMessage = getMessageById(ogMessageId);
  let newMessage: string;
  if (message.length > 0) {
    newMessage = message + '\n===================================================\n' +
                 ogMessage.message +
                 '\n===================================================';
  } else {
    newMessage = '===================================================\n' +
                  ogMessage.message +
                  '\n===================================================';
  }

  checkMessagePermissionLessVer(token, ogMessageId);

  const authUser: User = getUserByToken(token);
  if (dmId === -1) {
    const isChannelMember = findMemberInChannel(channelId, authUser.uId);
    if (!isChannelMember) {
      throw HTTPError(403, 'auth user is not joined the channel');
    }
  } else {
    const isDmMember = findMemberInDm(dmId, authUser.uId);
    if (!isDmMember) {
      throw HTTPError(403, 'auth user is not joined the dm');
    }
  }

  const data: Data = getData();
  const sharedMessageId = generateMessageId();
  const sharedMessage: Message = {
    messageId: sharedMessageId,
    uId: authUser.uId,
    channelId: channelId,
    dmId: dmId,
    message: newMessage,
    timeSent: Date.now() / 1000,
    reacts: [],
    isPinned: false,
  };
  data.messages.push(sharedMessage);

  const uniqueTags = getUniqueTags(newMessage);

  if (channelId === -1) {
    const dm = getDmById(dmId);

    uniqueTags.forEach((tag) => {
      const user = getUserByHandle(tag);
      if (user) {
        const userIndex = data.users.indexOf(user);

        const isMember = dm.dmMembers.find((m) => m.uId === user.uId);

        if (userIndex !== -1 && isMember) {
          const notification: Notification = {
            channelId: -1,
            dmId: dm.dmId,
            notificationMessage: `${authUser.handleStr} tagged you in ${
              dm.dmName
            }: ${newMessage.slice(0, 20)}`,
          };

          data.users[userIndex].notifications.unshift(notification);
        }
      }
    });
  } else {
    uniqueTags.forEach((tag) => {
      const channel = getChannel(channelId);

      const user = getUserByHandle(tag);
      if (user) {
        const userIndex = data.users.indexOf(user);

        const isMember = channel.members.find((m) => m.uId === user.uId);

        if (userIndex !== -1 && isMember) {
          const notification: Notification = {
            channelId: channel.channelId,
            dmId: -1,
            notificationMessage: `${authUser.handleStr} tagged you in ${
              channel.name
            }: ${newMessage.slice(0, 20)}`,
          };

          data.users[userIndex].notifications.unshift(notification);
        }
      }
    });
  }

  setData(data);

  return { sharedMessageId: sharedMessageId };
}

/**
 * Sends a message from the authorised user to the channel
 * specified by channelId automatically at a specified time
 * in the future. The returned messageId will only be considered
 * valid for other actions (editing/deleting/reacting/etc) once
 * it has been sent (i.e. after timeSent).
 *
 * 400 Error when any of:
 * - channelId does not refer to a valid channel
 * - length of message is less than 1 or over 1000 charcters
 * - timeSent is not a valid time in the the past
 *
 * 403 Error when any of:
 * - channelId is valid and the authorised user is not a member of the channel
 *   they are trying to post to
 * - token is invalid
 *
 * @param { string } token
 * @param { number } channelId
 * @param { string } message
 * @param { nunber } timeSent
 *
 * @returns { messageId: number }
 * @throws { HTTPError } - error
 */
function messageSendLaterV1(
  token: string,
  channelId: number,
  message: string,
  timeSent: number
): { messageId: number } {
  if (message.length < 1 || message.length > 1000) {
    throw HTTPError(400, 'message length is invalid');
  }

  if (timeSent < Date.now() / 1000) {
    throw HTTPError(400, 'timeSent is invalid');
  }

  const channelIndex = getChannelIndex(channelId);
  if (channelIndex === -1) {
    throw HTTPError(400, 'channel is invalid');
  }

  const authUser: User = getUserByToken(token);
  if (!authUser) {
    throw HTTPError(403, 'token is invalid');
  }

  const authMember = findMemberInChannel(channelId, authUser.uId);
  if (!authMember) {
    throw HTTPError(403, 'auth user is not in the channel');
  }

  const waitTimeInMili = timeSent * 1000 - Date.now();

  const messageId = generateMessageId();

  const interval = setInterval(() => {
    try {
      const authMember = findMemberInChannel(channelId, authUser.uId);
      if (!authMember) {
        throw HTTPError(403, 'auth user is not in the channel');
      }
    } catch (error) {
      clearInterval(interval);
      clearTimeout(timer);
    }
  }, 50);

  const timer = setTimeout(() => {
    const data: Data = getData();
    const messageSend: Message = {
      messageId: messageId,
      uId: authUser.uId,
      channelId: channelId,
      dmId: -1,
      message: message,
      timeSent: timeSent,
      reacts: [],
      isPinned: false,
    };

    const uniqueTags = getUniqueTags(message);

    const channel = getChannel(channelId);

    uniqueTags.forEach((tag) => {
      const user = getUserByHandle(tag);
      if (user) {
        const userIndex = data.users.indexOf(user);

        const isMember = channel.members.find((m) => m.uId === user.uId);

        if (userIndex !== -1 && isMember) {
          const notification: Notification = {
            channelId: channelId,
            dmId: -1,
            notificationMessage: `${authUser.handleStr} tagged you in ${
              channel.name
            }: {${message.slice(0, 20)}`,
          };

          data.users[userIndex].notifications.unshift(notification);
        }
      }
    });

    data.messages.push(messageSend);
    setData(data);

    clearInterval(interval);
    console.log('Message was sent');
  }, waitTimeInMili);

  return { messageId: messageId };
}

/**
 * Sends a message from the authorised user to the DM
 * specified by dmId automatically at a specified time
 * in the future. The returned messageId will only be considered
 * valid for other actions (editing/deleting/reacting/etc) once
 * it has been sent (i.e. after timeSent). IF the DM is removed before
 * the message has send, the message will not be sent.
 *
 * 400 Error when any of:
 * - dmId does not refer to a valid channel
 * - length of message is less than 1 or over 1000 charcters
 * - timeSent is not a valid time in the the past
 *
 * 403 Error when any of:
 * - channelId is vlaid and the authorised user is not a member of the channel
 *   they are trying to post to
 * - token is invalid
 *
 * @param { number } dmId
 * @param { string } message
 * @param { nunber } timeSent
 *
 * @returns { messageId: number }
 * @throws { HTTPError } - error
 */
function messageSendLaterDmV1(
  token: string,
  dmId: number,
  message: string,
  timeSent: number
): { messageId: number } {
  if (message.length < 1 || message.length > 1000) {
    throw HTTPError(400, 'message length is invalid');
  }

  if (timeSent < Date.now() / 1000) {
    throw HTTPError(400, 'timeSent is invalid');
  }

  const dmIndex = getDmIndex(dmId);
  if (dmIndex === -1) {
    throw HTTPError(400, 'dm is invalid');
  }

  const authUser: User = getUserByToken(token);
  if (!authUser) {
    throw HTTPError(403, 'token is invalid');
  }

  const authMember = findMemberInDm(dmId, authUser.uId);
  if (!authMember) {
    throw HTTPError(403, 'auth user is not in the dm');
  }

  const waitTimeInMili = timeSent * 1000 - Date.now();

  const messageId = generateMessageId();

  const interval2 = setInterval(() => {
    try {
      const dmCheck = getDmById(dmId);
      if (!dmCheck) {
        throw HTTPError(400, 'Invalid dmId');
      }
    } catch (error) {
      clearInterval(interval2);
      clearTimeout(timer2);
    }
  }, 50);

  const timer2 = setTimeout(() => {
    const data: Data = getData();
    const messageSend: Message = {
      messageId: messageId,
      uId: authUser.uId,
      channelId: -1,
      dmId: dmId,
      message: message,
      timeSent: timeSent,
      reacts: [],
      isPinned: false,
    };

    const uniqueTags = getUniqueTags(message);

    const dm = getDmById(dmId);

    uniqueTags.forEach((tag) => {
      const user = getUserByHandle(tag);
      if (user) {
        const userIndex = data.users.indexOf(user);

        const isMember = dm.dmMembers.find((m) => m.uId === user.uId);

        if (userIndex !== -1 && isMember) {
          const notification: Notification = {
            channelId: -1,
            dmId: dm.dmId,
            notificationMessage: `${authUser.handleStr} tagged you in ${
              dm.dmName
            }: ${message.slice(0, 20)}`,
          };

          data.users[userIndex].notifications.unshift(notification);
        }
      }
    });

    data.messages.push(messageSend);
    setData(data);

    clearInterval(interval2);
    console.log('Message was sent');
  }, waitTimeInMili);

  return { messageId: messageId };
}

// ========================================================================= //

// Helper Function

function checkMessagePermission(token: string, messageId: number) {
  const user: User = getUserByToken(token);
  if (!user) {
    throw HTTPError(403, 'Invalid token');
  }

  const messageObj = getMessageById(messageId);
  if (!messageObj) {
    throw HTTPError(400, 'Invalid MessageId');
  }
  const channel = findMessageInChannel(messageId);
  const dm = findMessageInDm(messageId);
  const globalOwnerId = getGlobalOwnerId(user.uId);
  if (channel !== undefined && messageObj.channelId !== -1) {
    const member = channel.members.find((m) => m.uId === user.uId);
    if (!member) {
      throw HTTPError(403, 'Permission denied');
    }
    const isChannelOwner = channel.ownersId.includes(user.uId);
    if (
      member.uId !== globalOwnerId &&
      !isChannelOwner &&
      user.uId !== messageObj.uId
    ) {
      throw HTTPError(403, 'Channel Permission denied');
    }
  } else {
    const member = dm.dmMembers.find((m) => m.uId === user.uId);
    if (!member) {
      throw HTTPError(403, 'Dm Permission denied');
    }

    if (member.uId !== dm.dmCreatorId && member.uId !== messageObj.uId) {
      throw HTTPError(403, 'Permission denied');
    }
  }
}

function checkMessagePermissionWithoutMessOwner(
  token: string,
  messageId: number
) {
  const user: User = getUserByToken(token);
  if (!user) {
    throw HTTPError(403, 'Invalid token');
  }

  const messageObj = getMessageById(messageId);
  if (!messageObj) {
    throw HTTPError(400, 'Invalid MessageId');
  }
  const channel = findMessageInChannel(messageId);
  const dm = findMessageInDm(messageId);
  const globalOwnerId = getGlobalOwnerId(user.uId);

  if (channel !== undefined && messageObj.channelId !== -1) {
    const member = channel.members.find((m) => m.uId === user.uId);
    if (!member) {
      throw HTTPError(403, 'Permission denied');
    }
    const isChannelOwner = channel.ownersId.includes(user.uId);
    if (member.uId !== globalOwnerId && !isChannelOwner) {
      throw HTTPError(403, 'Channel Permission denied');
    }
  } else {
    const member = dm.dmMembers.find((m) => m.uId === user.uId);
    if (!member) {
      throw HTTPError(403, 'Dm Permission denied');
    }

    if (member.uId !== dm.dmCreatorId) {
      throw HTTPError(403, 'Permission denied');
    }
  }
}

function checkMessagePermissionLessVer(token: string, messageId: number) {
  const user: User = getUserByToken(token);
  if (!user) {
    throw HTTPError(403, 'Invalid token');
  }

  const messageObj = getMessageById(messageId);
  if (!messageObj) {
    throw HTTPError(400, 'Invalid MessageId');
  }
  const channel = findMessageInChannel(messageId);
  const dm = findMessageInDm(messageId);

  if (channel !== undefined && messageObj.channelId !== -1) {
    const member = channel.members.find((m) => m.uId === user.uId);
    if (!member) {
      throw HTTPError(403, 'Permission denied');
    }
  } else {
    const member = dm.dmMembers.find((m) => m.uId === user.uId);
    if (!member) {
      throw HTTPError(403, 'Dm Permission denied');
    }
  }
}

function getUniqueTags(message: string) {
  const regEx = /@([a-z0-9]+)/i;

  const uniqueTags = message.split(' ').reduce((temp, word) => {
    const match = word.match(regEx);
    if (match) {
      const username = match[1];
      if (!temp.includes(username)) {
        temp.push(username);
      }
    }
    return temp;
  }, []);

  return uniqueTags;
}

export {
  messageSendV2,
  messageEditV2,
  messageSendDmV2,
  messageRemoveV2,
  messagePinV1,
  messageUnpinV1,
  messageReactV1,
  messageUnreactV1,
  messageShareV1,
  messageSendLaterV1,
  messageSendLaterDmV1,
};
