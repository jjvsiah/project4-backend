import {
  authRegister,
  channelsCreate,
  channelDetails,
  channelJoin,
  channelInvite,
  channelMessages,
  channelLeave,
  channelAddOwner,
  channelRemoveOwner,
  messageReact,
  messageSend,
  standupStart,
  clear,
} from './testHelper';

afterAll(() => {
  clear();
});

const globalOwner = authRegister(
  'globalowner@gmail.com',
  '123456',
  'Global',
  'Owner'
);

describe('/channel/details/v3', () => {
  const user = authRegister('long@gmail.com', '123456', 'John', 'Smith');
  const user1 = authRegister('ze@gmail.com', '123456', 'John', 'Smith');
  const channel = channelsCreate(user.token, 'channel1', true);

  describe('errors', () => {
    test('channelId does not refer to a valid channel', () => {
      const error = channelDetails(user.token, channel.channelId + 999);
      expect(error).toStrictEqual(400);
    });

    test('channelId is valid and token is not a member of the channel', () => {
      const error = channelDetails(user1.token, channel.channelId);
      expect(error).toStrictEqual(403);
    });

    test('token is invalid', () => {
      const error = channelDetails('0', channel.channelId);
      expect(error).toStrictEqual(403);

      const error1 = channelDetails('', channel.channelId);
      expect(error1).toStrictEqual(403);
    });
  });

  describe('success', () => {
    test('sucessful details', () => {
      const details = channelDetails(user.token, channel.channelId);
      expect(details).toStrictEqual({
        name: 'channel1',
        isPublic: true,
        ownerMembers: [
          {
            uId: expect.any(Number),
            email: 'long@gmail.com',
            nameFirst: 'John',
            nameLast: 'Smith',
            handleStr: expect.any(String),
            profileImgUrl:
              'http://localhost:3200/default/default.jpg',
          },
        ],
        allMembers: [
          {
            uId: expect.any(Number),
            email: 'long@gmail.com',
            nameFirst: 'John',
            nameLast: 'Smith',
            handleStr: expect.any(String),
            profileImgUrl:
              'http://localhost:3200/default/default.jpg',
          },
        ],
      });
    });
  });
});

describe('/channel/join/v3', () => {
  const user = authRegister('long1@gmail.com', '123456', 'John', 'Smith');
  const user1 = authRegister('ze1@gmail.com', '123456', 'John', 'Smith');
  const channel = channelsCreate(user.token, 'channel1', true);
  const channel1 = channelsCreate(user1.token, 'channel2', false);

  describe('errors', () => {
    test('channeld does not refer to a valid channel', () => {
      const error = channelJoin(user.token, channel1.channelId + 99);
      expect(error).toStrictEqual(400);
    });

    test('the authorised user is already a member of the channel', () => {
      const error = channelJoin(user.token, channel.channelId);
      expect(error).toStrictEqual(400);
    });

    test('channeId refers to a channel that is private, and the authorised user is not a member of a global owner', () => {
      const error = channelJoin(user.token, channel1.channelId);
      expect(error).toStrictEqual(403);
    });

    test('token is invalid', () => {
      const error = channelJoin('0', channel.channelId);
      expect(error).toStrictEqual(403);

      const error1 = channelDetails('', channel.channelId);
      expect(error1).toStrictEqual(403);
    });
  });

  describe('success', () => {
    test('successful join', () => {
      const join = channelJoin(user1.token, channel.channelId);
      expect(join).toStrictEqual({});

      const details = channelDetails(user1.token, channel.channelId);
      expect(details).toStrictEqual({
        name: 'channel1',
        isPublic: true,
        ownerMembers: [
          {
            uId: expect.any(Number),
            email: 'long1@gmail.com',
            nameFirst: 'John',
            nameLast: 'Smith',
            handleStr: expect.any(String),
            profileImgUrl:
              'http://localhost:3200/default/default.jpg',
          },
        ],
        allMembers: [
          {
            uId: expect.any(Number),
            email: 'long1@gmail.com',
            nameFirst: 'John',
            nameLast: 'Smith',
            handleStr: expect.any(String),
            profileImgUrl:
              'http://localhost:3200/default/default.jpg',
          },
          {
            uId: expect.any(Number),
            email: 'ze1@gmail.com',
            nameFirst: 'John',
            nameLast: 'Smith',
            handleStr: expect.any(String),
            profileImgUrl:
              'http://localhost:3200/default/default.jpg',
          },
        ],
      });
    });
  });
});

describe('/channel/invite/v3', () => {
  const user = authRegister('long2@gmail.com', '123456', 'John', 'Smith');
  const user1 = authRegister('ze2@gmail.com', '123456', 'John', 'Smith');
  const channel = channelsCreate(user.token, 'channel1', true);
  const channel1 = channelsCreate(user1.token, 'channel2', false);

  describe('errors', () => {
    test('channelId does not refer to a valid channel', () => {
      const error = channelInvite(
        user1.token,
        channel.channelId + 99,
        user.authUserId
      );
      expect(error).toStrictEqual(400);
    });

    test('uId does not refer to valid user', () => {
      const error = channelInvite(user.token, channel.channelId, -1);
      expect(error).toStrictEqual(400);
    });

    test('uId refers to a user who is already a memeber of the channel', () => {
      const error = channelInvite(
        user.token,
        channel.channelId,
        user.authUserId
      );
      expect(error).toStrictEqual(400);
    });

    test('channelId is valid and the authorised user is not a member of the channel', () => {
      const error = channelInvite(
        user1.token,
        channel.channelId,
        user.authUserId
      );
      expect(error).toStrictEqual(403);
    });

    test('token is invalid', () => {
      const error = channelInvite('-999', channel1.channelId, user1.authUserId);
      expect(error).toStrictEqual(403);

      const error1 = channelDetails('', channel.channelId);
      expect(error1).toStrictEqual(403);
    });
  });

  describe('success', () => {
    test('succesful invite', () => {
      const invite = channelInvite(
        user1.token,
        channel1.channelId,
        user.authUserId
      );
      expect(invite).toStrictEqual({});
    });
  });
});

describe('/channel/messages/v3', () => {
  const user = authRegister('long3@gmail.com', '123456', 'John', 'Smith');
  const user1 = authRegister('ze3@gmail.com', '123456', 'John', 'Smith');
  const channel = channelsCreate(user.token, 'channel1', true);
  const channel1 = channelsCreate(user1.token, 'channel2', false);

  describe('error', () => {
    test('channelId does not refer to a valid channel', () => {
      const error = channelMessages(user.token, 99, 0);
      expect(error).toStrictEqual(400);
    });

    test('token is invalid', () => {
      const error = channelMessages('-1', channel1.channelId, 0);
      expect(error).toStrictEqual(403);

      const error1 = channelDetails('', channel.channelId);
      expect(error1).toStrictEqual(403);
    });

    test('start is greater than the total number of messages in the channel', () => {
      const error = channelMessages(user1.token, channel1.channelId, 9999);
      expect(error).toStrictEqual(400);
    });

    test('channelId is valid and the token is not a member of the channel', () => {
      const error = channelMessages(user1.token, channel.channelId, 0);
      expect(error).toStrictEqual(403);
    });
  });

  describe('success', () => {
    test('successful messages', () => {
      const messages = channelMessages(user1.token, channel1.channelId, 0);
      expect(messages).toStrictEqual({
        messages: expect.any(Array),
        start: 0,
        end: -1,
      });

      expect(messages.messages.length).toBeLessThanOrEqual(50);
    });

    test('channel message non react', () => {
      const user3 = authRegister('usER3@gmail.com', '123456', 'User', 'Three');
      channelJoin(user3.token, channel.channelId);
      const send = messageSend(user.token, channel.channelId, 'message');
      messageReact(user.token, send.messageId, 1);
      const messages = channelMessages(user3.token, channel.channelId, 0);

      expect(messages).toStrictEqual({
        messages: expect.any(Array),
        start: 0,
        end: -1,
      });
    });

    test('channel message react', () => {
      const user2 = authRegister('usER2@gmail.com', '123456', 'User', 'Two');
      channelJoin(user2.token, channel.channelId);
      const send = messageSend(user2.token, channel.channelId, 'message');
      messageReact(user.token, send.messageId, 1);
      const messages = channelMessages(user.token, channel.channelId, 0);

      expect(messages).toStrictEqual({
        messages: expect.any(Array),
        start: 0,
        end: -1,
      });
    });

    test('end has returned 50 messages', () => {
      for (let i = 0; i < 51; i++) {
        messageSend(user1.token, channel1.channelId, 'message');
      }

      const messages = channelMessages(user1.token, channel1.channelId, 0);
      expect(messages).toStrictEqual({
        messages: expect.any(Array),
        start: expect.any(Number),
        end: expect.any(Number),
      });

      expect(messages.messages.length).toBeLessThanOrEqual(50);
      expect(messages.start).toStrictEqual(0);
      expect(messages.end).toStrictEqual(50);
    });
  });
});

describe('/channel/leave/v2', () => {
  const user = authRegister('long4@gmail.com', '123456', 'John', 'Smith');
  const user1 = authRegister('ze4@gmail.com', '123456', 'John', 'Smith');
  const user2 = authRegister('ze14@gmail.com', '123456', 'John', 'Smith');

  const channel = channelsCreate(user.token, 'channel1', true);
  const channel1 = channelsCreate(user1.token, 'channel2', false);

  describe('error', () => {
    test('channelId does not refer to a valid channel', () => {
      const error = channelLeave('token', channel.channelId + 999);
      expect(error).toStrictEqual(400);
    });

    test('channelId is valid and the authorised user is not a member of the channel', () => {
      const error = channelLeave(user1.token, channel.channelId);
      expect(error).toStrictEqual(403);
    });

    test('token is invalid', () => {
      const error = channelLeave('token', 2);
      expect(error).toStrictEqual(403);
    });

    test('auth user is starter of an active standup in the channel', async () => {
      const starter = authRegister(
        'stnadup@gmail.com',
        '123456',
        'stand',
        'up'
      );
      const standChannel = channelsCreate(starter.token, 'standup', true);

      const standup = standupStart(starter.token, standChannel.channelId, 2);
      expect(standup).toStrictEqual({ timeFinish: expect.any(Number) });
      await new Promise((resolve) => setTimeout(resolve, 100));

      const error = channelLeave(starter.token, standChannel.channelId);
      expect(error).toStrictEqual(400);
    });
  });

  describe('success', () => {
    test('success channel owner leave', () => {
      channelJoin(user2.token, channel.channelId);
      const leave = channelLeave(user.token, channel.channelId);
      expect(leave).toStrictEqual({});

      const details = channelDetails(user.token, channel.channelId);
      expect(details).toStrictEqual(403);

      const details2 = channelDetails(user2.token, channel.channelId);
      expect(details2).toStrictEqual({
        name: 'channel1',
        isPublic: true,
        ownerMembers: [],
        allMembers: [
          {
            uId: expect.any(Number),
            email: 'ze14@gmail.com',
            nameFirst: 'John',
            nameLast: 'Smith',
            handleStr: expect.any(String),
            profileImgUrl:
              'http://localhost:3200/default/default.jpg',
          },
        ],
      });
    });

    test('success member leave', () => {
      channelInvite(user1.token, channel1.channelId, user2.authUserId);
      const leave = channelLeave(user2.token, channel1.channelId);
      expect(leave).toStrictEqual({});

      // const details = channelDetails(user2.token, channel.channelId);
      // expect(details).toStrictEqual(403);

      // const details2 = channelDetails(user.token, channel.channelId);
      // expect(details2).toStrictEqual({
      //   name: 'channel1',
      //   isPublic: true,
      //   ownerMembers: [],
      //   allMembers: [],
      // });
    });
  });
});

describe('/channel/addowner/v2', () => {
  const user = authRegister('long5@gmail.com', '123456', 'John', 'Smith');
  const user1 = authRegister('ze5@gmail.com', '123456', 'John', 'Smith');
  const user2 = authRegister('ze122@gmail.com', '123456', 'John', 'Smith');

  const channel = channelsCreate(user.token, 'channel1', true);
  const channel1 = channelsCreate(user1.token, 'channel2', false);

  describe('error', () => {
    test('channelId does not refer to a valid channel', () => {
      const error = channelAddOwner(
        user.token,
        channel.channelId + 999,
        user1.authUserId
      );
      expect(error).toStrictEqual(400);
    });

    test('uId does not refer to a valid user who is not a member of the channel', () => {
      const error = channelAddOwner(
        user.token,
        channel.channelId,
        user2.authUserId + 999
      );
      expect(error).toStrictEqual(400);
    });

    test('uId is not a member of the channel', () => {
      const error = channelAddOwner(
        user.token,
        channel.channelId,
        user1.authUserId
      );
      expect(error).toStrictEqual(400);
    });

    test('uId refers to a user who is already an owner of the channel', () => {
      const error = channelAddOwner(
        user.token,
        channel.channelId,
        user.authUserId
      );
      expect(error).toStrictEqual(400);
    });

    test('authorised user does not have owner permissions in the channel', () => {
      const error = channelAddOwner(
        user.token,
        channel1.channelId,
        user2.authUserId
      );
      expect(error).toStrictEqual(403);
    });

    test('token is invalid', () => {
      const error = channelAddOwner(
        'invalid',
        channel.channelId,
        user2.authUserId
      );
      expect(error).toStrictEqual(403);
    });
  });

  describe('success', () => {
    test('success channel add owner', () => {
      channelJoin(user2.token, channel.channelId);

      const addOwner = channelAddOwner(
        user.token,
        channel.channelId,
        user2.authUserId
      );
      expect(addOwner).toStrictEqual({});

      const detail = channelDetails(user2.token, channel.channelId);
      expect(detail).toStrictEqual({
        name: 'channel1',
        isPublic: true,
        ownerMembers: [
          {
            uId: expect.any(Number),
            email: 'long5@gmail.com',
            nameFirst: 'John',
            nameLast: 'Smith',
            handleStr: expect.any(String),
            profileImgUrl:
              'http://localhost:3200/default/default.jpg',
          },
          {
            uId: expect.any(Number),
            email: 'ze122@gmail.com',
            nameFirst: 'John',
            nameLast: 'Smith',
            handleStr: expect.any(String),
            profileImgUrl:
              'http://localhost:3200/default/default.jpg',
          },
        ],
        allMembers: [
          {
            uId: expect.any(Number),
            email: 'long5@gmail.com',
            nameFirst: 'John',
            nameLast: 'Smith',
            handleStr: expect.any(String),
            profileImgUrl:
              'http://localhost:3200/default/default.jpg',
          },
          {
            uId: expect.any(Number),
            email: 'ze122@gmail.com',
            nameFirst: 'John',
            nameLast: 'Smith',
            handleStr: expect.any(String),
            profileImgUrl:
              'http://localhost:3200/default/default.jpg',
          },
        ],
      });
    });

    test('global owner can add owner', () => {
      const newChannel = channelsCreate(user1.token, 'channel3', true);
      channelJoin(globalOwner.token, newChannel.channelId);
      channelJoin(user2.token, newChannel.channelId);
      const addOwner = channelAddOwner(
        globalOwner.token,
        newChannel.channelId,
        user2.authUserId
      );
      expect(addOwner).toStrictEqual({});
      const details = channelDetails(globalOwner.token, newChannel.channelId);
      expect(details).toStrictEqual({
        name: 'channel3',
        isPublic: true,
        ownerMembers: [
          {
            uId: expect.any(Number),
            email: 'ze5@gmail.com',
            nameFirst: 'John',
            nameLast: 'Smith',
            handleStr: expect.any(String),
            profileImgUrl:
              'http://localhost:3200/default/default.jpg',
          },
          {
            uId: expect.any(Number),
            email: 'ze122@gmail.com',
            nameFirst: 'John',
            nameLast: 'Smith',
            handleStr: expect.any(String),
            profileImgUrl:
              'http://localhost:3200/default/default.jpg',
          },
        ],
        allMembers: [
          {
            uId: expect.any(Number),
            email: 'ze5@gmail.com',
            nameFirst: 'John',
            nameLast: 'Smith',
            handleStr: expect.any(String),
            profileImgUrl:
              'http://localhost:3200/default/default.jpg',
          },
          {
            uId: expect.any(Number),
            email: 'globalowner@gmail.com',
            nameFirst: 'Global',
            nameLast: 'Owner',
            handleStr: expect.any(String),
            profileImgUrl:
              'http://localhost:3200/default/default.jpg',
          },
          {
            uId: expect.any(Number),
            email: 'ze122@gmail.com',
            nameFirst: 'John',
            nameLast: 'Smith',
            handleStr: expect.any(String),
            profileImgUrl:
              'http://localhost:3200/default/default.jpg',
          },
        ],
      });
    });
  });
});

describe('/channel/removeowner/v2', () => {
  const user = authRegister('long8@gmail.com', '123456', 'John', 'Smith');
  const user1 = authRegister('ze8@gmail.com', '123456', 'John', 'Smith');
  const user2 = authRegister('fake2gmail.com', '123324', 'John', 'Smith');
  const user3 = authRegister('fake12322@gmail.com', '123324', 'John', 'Smith');

  const channel = channelsCreate(user.token, 'channel1', false);
  const channel1 = channelsCreate(user1.token, 'channel2', true);
  channelInvite(user.token, channel.channelId, user1.authUserId);
  channelAddOwner(user.token, channel.channelId, user1.authUserId);

  describe('error', () => {
    test('channelId does not refer to a valid channel', () => {
      const error = channelRemoveOwner(
        user.token,
        channel.channelId + 999,
        user.authUserId
      );
      expect(error).toStrictEqual(400);
    });

    test('uId does not refer to a valid user', () => {
      const error = channelRemoveOwner(
        user.token,
        channel.channelId,
        user.authUserId + 999
      );
      expect(error).toStrictEqual(400);
    });

    test('uId refers to a user who is not an owner of the channel', () => {
      const error = channelRemoveOwner(
        user.token,
        channel.channelId,
        user2.authUserId
      );
      expect(error).toStrictEqual(400);
    });

    test('uId refers to a user who is currently the only owner of the channel', () => {
      const error = channelRemoveOwner(
        user1.token,
        channel1.channelId,
        user1.authUserId
      );
      expect(error).toStrictEqual(400);
    });

    test('authorised user does not have owner permissions in the channel', () => {
      const error = channelRemoveOwner(
        user3.token,
        channel.channelId,
        user1.authUserId
      );
      expect(error).toStrictEqual(403);
    });

    test('global owner non member cannot remove owner', () => {
      const error = channelRemoveOwner(
        globalOwner.token,
        channel.channelId,
        user.authUserId
      );
      expect(error).toStrictEqual(403);
    });

    test('token is invalid', () => {
      const error = channelRemoveOwner(
        'invalid',
        channel.channelId,
        user2.authUserId
      );
      expect(error).toStrictEqual(403);
    });
  });

  describe('success', () => {
    test('owner can remove owner', () => {
      const remove = channelRemoveOwner(
        user1.token,
        channel.channelId,
        user.authUserId
      );
      expect(remove).toStrictEqual({});

      const details = channelDetails(user.token, channel.channelId);
      expect(details).toStrictEqual({
        name: 'channel1',
        isPublic: false,
        ownerMembers: [
          {
            uId: expect.any(Number),
            email: 'ze8@gmail.com',
            nameFirst: 'John',
            nameLast: 'Smith',
            handleStr: expect.any(String),
            profileImgUrl:
              'http://localhost:3200/default/default.jpg',
          },
        ],
        allMembers: [
          {
            uId: expect.any(Number),
            email: 'long8@gmail.com',
            nameFirst: 'John',
            nameLast: 'Smith',
            handleStr: expect.any(String),
            profileImgUrl:
              'http://localhost:3200/default/default.jpg',
          },
          {
            uId: expect.any(Number),
            email: 'ze8@gmail.com',
            nameFirst: 'John',
            nameLast: 'Smith',
            handleStr: expect.any(String),
            profileImgUrl:
              'http://localhost:3200/default/default.jpg',
          },
        ],
      });
    });

    test('global owner member can remove owner', () => {
      channelInvite(user1.token, channel1.channelId, globalOwner.authUserId);
      channelInvite(user1.token, channel1.channelId, user.authUserId);
      channelAddOwner(user1.token, channel1.channelId, user.authUserId);
      const remove = channelRemoveOwner(
        globalOwner.token,
        channel1.channelId,
        user1.authUserId
      );
      expect(remove).toStrictEqual({});

      const details = channelDetails(globalOwner.token, channel1.channelId);
      expect(details).toStrictEqual({
        name: 'channel2',
        isPublic: true,
        ownerMembers: [
          {
            uId: expect.any(Number),
            email: 'long8@gmail.com',
            nameFirst: 'John',
            nameLast: 'Smith',
            handleStr: expect.any(String),
            profileImgUrl:
              'http://localhost:3200/default/default.jpg',
          },
        ],
        allMembers: [
          {
            uId: expect.any(Number),
            email: 'ze8@gmail.com',
            nameFirst: 'John',
            nameLast: 'Smith',
            handleStr: expect.any(String),
            profileImgUrl:
              'http://localhost:3200/default/default.jpg',
          },
          {
            uId: expect.any(Number),
            email: 'globalowner@gmail.com',
            nameFirst: 'Global',
            nameLast: 'Owner',
            handleStr: expect.any(String),
            profileImgUrl:
              'http://localhost:3200/default/default.jpg',
          },
          {
            uId: expect.any(Number),
            email: 'long8@gmail.com',
            nameFirst: 'John',
            nameLast: 'Smith',
            handleStr: expect.any(String),
            profileImgUrl:
              'http://localhost:3200/default/default.jpg',
          },
        ],
      });
    });
  });
});
