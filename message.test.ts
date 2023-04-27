import {
  authRegister,
  authLogin,
  authLogout,
  channelInvite,
  channelsCreate,
  dmCreate,
  messageSendDm,
  messageSend,
  messageEdit,
  messageRemove,
  messageReact,
  messageUnreact,
  messagePin,
  messageUnpin,
  messageShare,
  messageSendLater,
  messageSendLaterDm,
  channelMessages,
  channelLeave,
  sleep,
  clear,
  dmMessages,
  dmRemove,
  userProfile,
} from './testHelper';

const MESSAGEID = { messageId: expect.any(Number) };
const CHANNELID = { channelId: expect.any(Number) };
const SHAREDMESSAGEID = { sharedMessageId: expect.any(Number) };

const longString =
  'hfQaM031262GdWECfxLmzDd3cSersnOQD1QXV0Y7cmdgncb1htr8oQeRAGB' +
  'N16LgI8jDHHU8uwsI5UcI4KCEIIqUrXUjIh6g4X66wiffss4jyIBOFeJM0qeGmJclPo3XSDR' +
  'In7wKkTrnPsW0rfgdSkffDQuflH2LZkZ0XnPf3swXf2GiI6K6cPHVpmjzf0HJGcQy7IpugaHF' +
  'prB2q9KcHQpHzmraRisCc9wn445f4CABINyfx0LVI2oLAi09HtnzHI22zyG6yfXBdrddzC3pr' +
  'azca72ZydERwTbMqrs66GDWGlxvWr9WfgSbdTWJ3k6OUszbmBBnc2L03ZW58IrmfWVuTpkPSb3' +
  'EMAESnqDBPbcckvfGdfxtof2sGarwvRc7Zfq0jU4c2N3VnimstEvWpEeZO3mQmF1zBbWRLw36el' +
  'SoyJIpYrFY6FCjK5dDNoSL2VzVycx4KQvTzi8IM9SbunbVEqP3MtqfHwxggRchEuUsza5NMZ00E' +
  'NlGqDOjfktaWrgd9nnnw3buqyJ17eKDRfPoPM4hlvByuikLrAnvtdc02MT6aRvvRv2Ws9nQzeck7t' +
  'bRQZvx8eNMDkBgfLBL3xLlFbzBPpOIFAOQiBVP0ACahk7AekA41kvwWyNkHfwYcRWlGfUfzOoyQeJO' +
  '3UGSo7pje8N7Ca71P3I5HUMKTXzQBaqyBw1VGYdb9eaClI925qkxOpDYveh2LEmc9grRfLNwoAUo6dl' +
  'KOOw0Jxnto7lhQuiose1pPICJLB4eMlPiqSwes3rAPwaBoN7eeHjeQ0G42waKLqG2YQcDHpa51ts2io0' +
  'Dp4kmsnIHW4KkX5pK25C2zIIsp2yYzq9HGtPyinQcdyTVmWJUySEJu3YEHDiXUVmWpJKrEgWn1UMOaUQ' +
  '47DhU1NiHg8Y054X5QYefpbVf1AfgvM9UOKwoFSGxqSZhN10siEh7B1fKVCzSgVu3esmVBZ76Ogs4Tju' +
  'z7sOZBHqjB1AQG9QFPuMsMTiEHdhiurhgtiudrh';

const user = authRegister('h20@gmail.com', '123456', 'John', 'Smith');
const user2 = authRegister('h50@gmail.com', '123456', 'John', 'Smith');
const channel = channelsCreate(user2.token, 'test-channel', true);
const user3 = authRegister('h51@gmail.com', '123456', 'John', 'Smith');
const user4 = authRegister('h52@gmail.com', '123456', 'John', 'Smith');
const user5 = authRegister('h57@gmail.com', '1234567', 'Scot', 'Lang');
const user6 = authRegister('h58@gmail.com', '1234567', 'Tonny', 'Stark');
const user7 = authRegister('h59@gmail.com', '1234567', 'I love you', '3000');

channelInvite(user2.token, channel.channelId, user6.authUserId);

const userHandle = userProfile(user.token, user.authUserId).user.handleStr;
const user6Handle = userProfile(user.token, user6.authUserId).user.handleStr;
const user7Handle = userProfile(user.token, user7.authUserId).user.handleStr;

const dm = dmCreate(user3.token, [
  user.authUserId,
  user2.authUserId,
  user4.authUserId,
  user7.authUserId,
]);
const dmMessage = messageSendDm(
  user.token,
  dm.dmId,
  'This is going to be changed'
);

afterAll(() => {
  clear();
});

describe('/message/send/v2', () => {
  test('Success send a message', () => {
    const data = messageSend(
      user2.token,
      channel.channelId,
      'This is the 1st message'
    );
    expect(data).toStrictEqual(MESSAGEID);
  });

  test('Invalid Token Type', () => {
    const data = messageSend(
      undefined,
      channel.channelId,
      'This is the 1st message'
    );
    expect(data).toStrictEqual(403);
  });

  test('Invalid Token', () => {
    const data = messageSend(
      '-1',
      channel.channelId,
      'This is the 1st message'
    );
    expect(data).toStrictEqual(403);
  });

  test('Invalid channelId', () => {
    const invalid = -1;
    const data = messageSend(user2.token, invalid, 'This is the 1st message');
    expect(data).toStrictEqual(400);
  });

  test('Invalid 0 Message length', () => {
    const data = messageSend(user2.token, channel.channelId, '');
    expect(data).toStrictEqual(400);
  });

  test('Invalid over 1000 Message length', () => {
    expect(
      messageSend(user2.token, channel.channelId, longString)
    ).toStrictEqual(400);
  });

  test('User is not a member of channel', () => {
    const data = messageSend(user.token, channel.channelId, 'hello there');
    expect(data).toStrictEqual(403);
  });
});

const message = messageSend(user2.token, channel.channelId, 'Hello there');
const message2 = messageSend(user2.token, channel.channelId, '2nd message');

describe('/message/edit/v2', () => {
  test('Success Changed in Channel', () => {
    const data = messageEdit(
      user2.token,
      message.messageId,
      'First change in channel'
    );
    expect(data).toStrictEqual({});
  });

  test('Success Changed with empty message in channel', () => {
    const data = messageEdit(user2.token, message2.messageId, '');
    expect(data).toStrictEqual({});
  });

  test('Global Owner success change the message in channel', () => {
    channelInvite(user2.token, channel.channelId, user.authUserId);
    const data = messageEdit(user.token, message.messageId, 'GO change this');
    expect(data).toStrictEqual({});
  });

  test('Global owner is failed to change in dm', () => {
    const dmMessage2 = messageSendDm(
      user4.token,
      dm.dmId,
      'Global Owner cannot change this'
    );
    const data = messageEdit(
      user.token,
      dmMessage2.messageId,
      'Let me change this'
    );
    expect(data).toStrictEqual(403);
  });

  test('Success Changed with empty message in dm', () => {
    const dmMessage3 = messageSendDm(
      user4.token,
      dm.dmId,
      'Going to be deleted'
    );
    const data = messageEdit(user4.token, dmMessage3.messageId, '');
    expect(data).toStrictEqual({});
  });

  test('Success Changed in dm', () => {
    const data = messageEdit(
      user.token,
      dmMessage.messageId,
      'Changed by messageOwner'
    );
    expect(data).toStrictEqual({});
  });

  test('Invalid Token', () => {
    const data = messageEdit(
      '-1',
      message.messageId,
      'First change in channel'
    );
    expect(data).toStrictEqual(403);
  });

  test('Invalid Message Id', () => {
    const data = messageEdit(user2.token, -1, 'First change in channel');
    expect(data).toStrictEqual(400);
  });

  test('Over 1000 message lengt', () => {
    const data = messageEdit(user2.token, message.messageId, longString);
    expect(data).toStrictEqual(400);
  });

  test('User is not a member of Channel', () => {
    const data = messageEdit(
      user3.token,
      message.messageId,
      'Let me change this'
    );
    expect(data).toStrictEqual(403);
  });

  test('dm Owner edit message', () => {
    const data = messageEdit(
      user3.token,
      dmMessage.messageId,
      'change in dm by dmOwner'
    );
    expect(data).toStrictEqual({});
  });

  test('Member failed to change the other message', () => {
    channelInvite(user2.token, channel.channelId, user3.authUserId);
    const data = messageEdit(
      user3.token,
      message.messageId,
      'Member want to change'
    );
    expect(data).toStrictEqual(403);
  });

  test('Non Member failed to change dm message', () => {
    const data = messageEdit(
      user5.token,
      dmMessage.messageId,
      'I want to change this'
    );
    expect(data).toStrictEqual(403);
  });
});

describe('/message/senddm/v2', () => {
  test('Success send a message into dm', () => {
    const data = messageSendDm(
      user.token,
      dm.dmId,
      'This is the 1st message of dm'
    );
    expect(data).toStrictEqual(MESSAGEID);
  });

  test('Invalid token', () => {
    const data = messageSendDm(undefined, dm.dmId, 'This is the 1st message');
    expect(data).toStrictEqual(403);
  });

  test('Invalid dmId', () => {
    const invalidDmId = -1;
    const data = messageSendDm(
      user.token,
      invalidDmId,
      'This is the 1st message'
    );
    expect(data).toStrictEqual(400);
  });

  test('Invalid 0 message length', () => {
    const data = messageSendDm(user.token, dm.dmId, '');
    expect(data).toStrictEqual(400);
  });

  test('Not a member of Dm', () => {
    const data = messageSendDm(user5.token, dm.dmId, 'Hello world');
    expect(data).toStrictEqual(403);
  });
});

describe('/message/remove/v2', () => {
  const channel2 = channelsCreate(user3.token, 'channelTest2', false);
  const channelMess = messageSend(
    user3.token,
    channel2.channelId,
    'This 1st message of channel2'
  );

  const dm2 = dmCreate(user4.token, [user.authUserId, user2.authUserId]);
  const dmMess = messageSendDm(
    user4.token,
    dm2.dmId,
    'This is the first message of 2nd dm'
  );
  const dmMess2 = messageSendDm(
    user2.token,
    dm2.dmId,
    'This is the 2nd message of 2nd dm'
  );
  const dmMess3 = messageSendDm(
    user.token,
    dm2.dmId,
    'This is the 3rd message of 2nd dm'
  );

  test('Member cannot remove other message in dm', () => {
    const data = messageRemove(user2.token, dmMess3.messageId);
    expect(data).toStrictEqual(403);
  });

  test('Member as GlobalOwner cannot remove other message in dm', () => {
    const data = messageRemove(user.token, dmMess.messageId);
    expect(data).toStrictEqual(403);
  });

  test('Non-member cannot delete dm message', () => {
    const data = messageRemove(user5.token, dmMess.messageId);
    expect(data).toStrictEqual(403);
  });

  test('Invalid token', () => {
    const data = messageRemove(undefined, channelMess.messageId);
    expect(data).toStrictEqual(403);
  });

  test('Invalid messageId', () => {
    const data = messageRemove(user4.token, -1);
    expect(data).toStrictEqual(400);
  });

  test('Success Removed member message by dmOwner', () => {
    const data = messageRemove(user4.token, dmMess2.messageId);
    expect(data).toStrictEqual({});
  });

  test('Success Removed by Owner Message in Channel', () => {
    const data = messageRemove(user3.token, channelMess.messageId);
    expect(data).toStrictEqual({});
  });

  test('Member cannot delete message', () => {
    const data = messageRemove(user3.token, message.messageId);
    expect(data).toStrictEqual(403);
  });

  test('Non-member cannot delete message', () => {
    const data = messageRemove(user4.token, message.messageId);
    expect(data).toStrictEqual(403);
  });

  test('Global Owner success remove the message in channel', () => {
    const data = messageRemove(user.token, message.messageId);
    expect(data).toStrictEqual({});
  });
});

describe('Work well on 2 seperate token', () => {
  const token1OfUser = authRegister('w@gmail.com', '123456', 'John', 'Smith');
  const token2OfUser = authLogin('w@gmail.com', '123456');

  test('Success Create channel by token 1', () => {
    const channel3 = channelsCreate(token1OfUser.token, 'test-channel', true);
    expect(channel3).toStrictEqual(CHANNELID);
  });

  test('Logout and failed to create channel by that token', () => {
    authLogout(token1OfUser.token);
    const channel4 = channelsCreate(token1OfUser.token, 'test-channel2', true);
    expect(channel4).toStrictEqual(403);
  });

  test('Functioning well with 2nd token', () => {
    const channel5 = channelsCreate(token2OfUser.token, 'test-channel2', true);
    expect(channel5).toStrictEqual(CHANNELID);
    const data = messageSend(token2OfUser.token, channel5.channelId, 'hello');
    expect(data).toStrictEqual(MESSAGEID);
    const success = authLogout(token2OfUser.token);
    expect(success).toStrictEqual({});
  });
});

const validReactId = 1;
const inValidReactId = 780;

const channelMessage = messageSend(
  user2.token,
  channel.channelId,
  'Channel Message'
);
const channelMessage2 = messageSend(
  user2.token,
  channel.channelId,
  'Channel Message2'
);
describe('/message/react/v1', () => {
  test('Invalid ReactId', () => {
    const data = messageReact(
      user2.token,
      channelMessage.messageId,
      inValidReactId
    );
    expect(data).toStrictEqual(400);
  });

  test('Invalid MessageId', () => {
    const data = messageReact(user2.token, 1000087987, validReactId);
    expect(data).toStrictEqual(400);
  });

  test('Invalid Token', () => {
    const data = messageReact(
      'Invalid',
      channelMessage.messageId,
      validReactId
    );
    expect(data).toStrictEqual(403);
  });

  test('Success React by first user', () => {
    const data = messageReact(
      user2.token,
      channelMessage.messageId,
      validReactId
    );
    expect(data).toStrictEqual({});
  });

  test('Member reacted in Channel', () => {
    const data = messageReact(
      user3.token,
      channelMessage.messageId,
      validReactId
    );
    expect(data).toStrictEqual({});
  });

  test('Rereact again by first user', () => {
    const data = messageReact(
      user2.token,
      channelMessage.messageId,
      validReactId
    );
    expect(data).toStrictEqual(400);
  });

  test('Non-member reacted in Channel', () => {
    const data = messageReact(
      user5.token,
      channelMessage.messageId,
      validReactId
    );
    expect(data).toStrictEqual(403);
  });

  test('Non-member reacted in Dm', () => {
    const data = messageReact(user5.token, dmMessage.messageId, validReactId);
    expect(data).toStrictEqual(403);
  });

  test('Member reacted in Dn', () => {
    const data = messageReact(user.token, dmMessage.messageId, validReactId);
    expect(data).toStrictEqual({});
  });
});

describe('/message/unreact/v1', () => {
  test('Invalid ReactId', () => {
    const data = messageUnreact(
      user2.token,
      channelMessage.messageId,
      inValidReactId
    );
    expect(data).toStrictEqual(400);
  });

  test('Unexist ReactId on message', () => {
    const data = messageUnreact(
      user2.token,
      channelMessage2.messageId,
      validReactId
    );
    expect(data).toStrictEqual(400);
  });

  test('Success Unreacted', () => {
    const data = messageUnreact(
      user2.token,
      channelMessage.messageId,
      validReactId
    );
    expect(data).toStrictEqual({});
  });

  test('Failed to Unreacted again', () => {
    const data = messageUnreact(
      user2.token,
      channelMessage.messageId,
      validReactId
    );
    expect(data).toStrictEqual(400);
  });
});

describe('/message/pin/v1', () => {
  test('Invalid MessageId', () => {
    const data = messagePin(user2.token, 1000087987);
    expect(data).toStrictEqual(400);
  });

  test('Invalid Token', () => {
    const data = messagePin('Invalid', channelMessage.messageId);
    expect(data).toStrictEqual(403);
  });

  test('Member cannot pin message', () => {
    const data = messagePin(user3.token, channelMessage.messageId);
    expect(data).toStrictEqual(403);
  });

  test('GO success pin message', () => {
    const data = messagePin(user.token, channelMessage.messageId);
    expect(data).toStrictEqual({});
  });

  test('GO failed to pin message again', () => {
    const data = messagePin(user.token, channelMessage.messageId);
    expect(data).toStrictEqual(400);
  });

  test('Non-member channel failed to pin', () => {
    const data = messagePin(user5.token, channelMessage.messageId);
    expect(data).toStrictEqual(403);
  });

  test('Dm owner success pin message', () => {
    const data = messagePin(user3.token, dmMessage.messageId);
    expect(data).toStrictEqual({});
  });
});

describe('/message/pin/v1', () => {
  test('Dm member - GO failed to unpin message', () => {
    const data = messageUnpin(user.token, dmMessage.messageId);
    expect(data).toStrictEqual(403);
  });

  test('Dm non-member failed to unpin message', () => {
    const data = messageUnpin(user5.token, dmMessage.messageId);
    expect(data).toStrictEqual(403);
  });

  test('Dm owner success unpin message', () => {
    const data = messageUnpin(user3.token, dmMessage.messageId);
    expect(data).toStrictEqual({});
  });

  test('Dm owner failed to unpin message again', () => {
    const data = messageUnpin(user3.token, dmMessage.messageId);
    expect(data).toStrictEqual(400);
  });
});

describe('/message/share/v1', () => {
  describe('error', () => {
    test('both channelId and dmId are invalid', () => {
      const share = messageShare(
        user.token,
        channelMessage.messageId,
        'message',
        -1,
        -1
      );
      expect(share).toStrictEqual(400);
    });

    test('Both channelId and dmId are valid', () => {
      const share = messageShare(
        user.token,
        channelMessage.messageId,
        'message',
        channel.channelId,
        dm.dmId
      );
      expect(share).toStrictEqual(400);
    });

    test('ogMessageId is invald', () => {
      const share = messageShare(
        user.token,
        -1,
        'message',
        channel.channelId,
        dm.dmId
      );
      expect(share).toStrictEqual(400);
    });

    test('length of optional message is more than 1000 characters', () => {
      const share = messageShare(
        user.token,
        channelMessage.messageId,
        longString,
        -1,
        dm.dmId
      );
      expect(share).toStrictEqual(400);
    });

    test('authorised user has not joined the dm they are trying to share the message to', () => {
      const share = messageShare(
        user6.token,
        channelMessage.messageId,
        '. user6 share this',
        -1,
        dm.dmId
      );
      expect(share).toStrictEqual(403);
    });

    test('authorised user has not joined the channel they are trying to share the message to', () => {
      const share = messageShare(
        user7.token,
        dmMessage.messageId,
        '. user7 share this',
        channel.channelId,
        -1
      );
      expect(share).toStrictEqual(403);
    });

    test('token is invalid', () => {
      const share = messageShare(
        'Invalid token',
        channelMessage.messageId,
        'message',
        -1,
        dm.dmId
      );
      expect(share).toStrictEqual(403);
    });
  });

  describe('success', () => {
    test('success share channel message into dm with member tag', () => {
      const share = messageShare(
        user.token,
        channelMessage.messageId,
        `. @${user7Handle} GO share this message @hhh`,
        -1,
        dm.dmId
      );
      expect(share).toStrictEqual(SHAREDMESSAGEID);
    });

    test('success share channel message into dm with non-member tag', () => {
      const share = messageShare(
        user.token,
        channelMessage.messageId,
        `. @${user6Handle} GO share this message @uyityiyt`,
        -1,
        dm.dmId
      );
      expect(share).toStrictEqual(SHAREDMESSAGEID);
    });

    test('success share dm message into channel with member tag', () => {
      const share = messageShare(
        user.token,
        dmMessage.messageId,
        `. @${user6Handle} GO share this message @hh`,
        channel.channelId,
        -1
      );
      expect(share).toStrictEqual(SHAREDMESSAGEID);
    });

    test('success share dm message into channel with non-member tag', () => {
      const share = messageShare(
        user.token,
        dmMessage.messageId,
        `. @${user7Handle} GO share this message`,
        channel.channelId,
        -1
      );
      expect(share).toStrictEqual(SHAREDMESSAGEID);
    });

    test('success share channel message into dm with no new message', () => {
      const share = messageShare(
        user.token,
        channelMessage.messageId,
        '',
        -1,
        dm.dmId
      );
      expect(share).toStrictEqual(SHAREDMESSAGEID);
    });
  });
});

describe('/message/sendlater/v1', () => {
  let timeSent: number;
  beforeEach(() => {
    timeSent = Date.now() / 1000 + 2;
  });

  describe('error', () => {
    test('channelId is not a valid channel', () => {
      const send = messageSendLater(user.token, -1, 'message', timeSent);
      expect(send).toStrictEqual(400);
    });

    test('Invalid message length < 0 and > 1000', () => {
      const send = messageSendLater(
        user.token,
        channel.channelId,
        longString,
        timeSent
      );
      expect(send).toStrictEqual(400);

      const send2 = messageSendLater(
        user.token,
        channel.channelId,
        '',
        timeSent
      );
      expect(send2).toStrictEqual(400);
    });

    test('timeSent is not a valid time in the the past', () => {
      const send = messageSendLater(
        user.token,
        channel.channelId,
        'message',
        timeSent - 1000
      );
      expect(send).toStrictEqual(400);
    });

    test('channelId is valid and the authorised user is not a memebr of the channel they are trying to post to', () => {
      const send = messageSendLater(
        user7.token,
        channel.channelId,
        'message',
        timeSent
      );
      expect(send).toStrictEqual(403);
    });

    test('token is invalid', () => {
      const send = messageSendLater(
        'invalid',
        channel.channelId,
        'message',
        timeSent
      );
      expect(send).toStrictEqual(403);
    });

    test('lost member right during waiting time', () => {
      const waitTime = Date.now() / 1000 + 0.5;
      const send = messageSendLater(
        user6.token,
        channel.channelId,
        'message sendLater2',
        waitTime
      );
      expect(send).toStrictEqual(MESSAGEID);
      channelLeave(user6.token, channel.channelId);
      sleep(600);

      const messageList = channelMessages(user.token, channel.channelId, 0);
      expect(messageList.messages).toHaveLength(5);
    });
  });

  describe('success', () => {
    test('success send later with non-member tag', () => {
      const waitTime = Date.now() / 1000 + 1;
      const send = messageSendLater(
        user.token,
        channel.channelId,
        `Hey, @${user6Handle} message sendLater @hh`,
        waitTime
      );

      const messageListBeforeSend = channelMessages(
        user.token,
        channel.channelId,
        0
      );
      expect(messageListBeforeSend.messages).toHaveLength(5);
      expect(send).toStrictEqual(MESSAGEID);

      sleep(1200);

      const messageListAfter = channelMessages(
        user.token,
        channel.channelId,
        0
      );
      expect(messageListAfter.messages).toHaveLength(6);
    });

    test('success send later with member tag', () => {
      const waitTime = Date.now() / 1000 + 1;
      const send = messageSendLater(
        user.token,
        channel.channelId,
        `Hey, @${userHandle} message sendLater`,
        waitTime
      );
      expect(send).toStrictEqual(MESSAGEID);

      sleep(1200);

      const messageListAfter = channelMessages(
        user.token,
        channel.channelId,
        0
      );
      expect(messageListAfter.messages).toHaveLength(7);
    });
  });
});

describe('/message/sendlaterdm/v1', () => {
  let timeSent: number;
  beforeEach(() => {
    timeSent = Date.now() / 1000 + 1;
  });

  describe('error', () => {
    test('dmId is invalid', () => {
      const send = messageSendLaterDm(
        user3.token,
        -1,
        'dm send later message',
        timeSent
      );
      expect(send).toStrictEqual(400);
    });

    test('length of message is less than 1 or over 1000 charcters', () => {
      const send = messageSendLaterDm(
        user3.token,
        dm.dmId,
        longString,
        timeSent
      );
      expect(send).toStrictEqual(400);

      const send1 = messageSendLaterDm(user3.token, dm.dmId, '', 1);
      expect(send1).toStrictEqual(400);
    });

    test('timeSent is not a valid time in the the past', () => {
      const send = messageSendLaterDm(
        user3.token,
        dm.dmId,
        'dm send later message',
        timeSent - 1000
      );
      expect(send).toStrictEqual(400);
    });

    test('dmId is valid and the authorised user is not a memebr of the dm', () => {
      const newUser = authRegister('ze12332@gmail.com', '1233456', 'ze', 'zse');
      const send = messageSendLaterDm(newUser.token, dm.dmId, 'mese', timeSent);
      expect(send).toStrictEqual(403);
    });

    test('token is invalid', () => {
      const send = messageSendLaterDm('invalid', dm.dmId, 'message', timeSent);
      expect(send).toStrictEqual(403);
    });

    test('dm was removed', () => {
      const dm3 = dmCreate(user7.token, []);
      const waitTime = Date.now() / 1000 + 0.5;
      const send = messageSendLaterDm(
        user7.token,
        dm3.dmId,
        'dm3 Message Send later',
        waitTime
      );
      dmRemove(user7.token, dm3.dmId);
      expect(send).toStrictEqual(MESSAGEID);

      sleep(600);

      const dmMessList = dmMessages(user7.token, dm3.dmId, 0);
      expect(dmMessList).toStrictEqual(400);
    });
  });

  describe('success', () => {
    test('success send later with member tag', () => {
      const waitTime = Date.now() / 1000 + 0.5;
      const send = messageSendLaterDm(
        user.token,
        dm.dmId,
        `Hey, @${user7Handle} dm send later message @Hh`,
        waitTime
      );
      expect(send).toStrictEqual(MESSAGEID);
      sleep(600);
      const dmMessList = dmMessages(user7.token, dm.dmId, 0);
      expect(dmMessList.messages).toHaveLength(7);
    });
  });

  test('success send later with non-member tag', () => {
    const waitTime = Date.now() / 1000 + 0.5;
    const send = messageSendLaterDm(
      user.token,
      dm.dmId,
      `Hey, @${user6Handle} dm send later message`,
      waitTime
    );
    expect(send).toStrictEqual(MESSAGEID);
    sleep(600);
    const dmMessList = dmMessages(user7.token, dm.dmId, 0);
    expect(dmMessList.messages).toHaveLength(8);
  });
});
