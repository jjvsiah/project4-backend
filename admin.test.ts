import {
  authRegister,
  channelsCreate,
  channelJoin,
  channelDetails,
  channelMessages,
  dmCreate,
  dmDetails,
  dmMessages,
  usersAll,
  userProfile,
  messageSend,
  messageSendDm,
  clear,
  adminUserRemove,
  adminUserPermissionChange,
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

describe('/admin/user/permission/change/v1', () => {
  const user = authRegister('usEr@gmail.com', '123456', 'User', 'Zero');
  const user1 = authRegister('usEr1@gmail.com', '123456', 'User', 'One');
  // const user2 = authRegister('user2@gmail.com', '123456', 'User', 'Two');
  // const user3 = authRegister('user3@gmail.com', '123456', 'User', 'Three');
  // const user4 = authRegister('user4@gmail.com', '123456', 'User', 'Four');

  describe('error', () => {
    test('invalid token', () => {
      const error = adminUserPermissionChange('invalid', user.authUserId, 2);
      expect(error).toEqual(403);
    });

    test('authorised user not a global owner', () => {
      const error = adminUserPermissionChange(user.token, user.authUserId, 1);
      expect(error).toEqual(403);
    });

    test('user is a invalid user', () => {
      const error = adminUserPermissionChange(
        globalOwner.token,
        user.authUserId + 999,
        1
      );
      expect(error).toEqual(400);
    });

    test('uId refers to only global owner being demoted', () => {
      const error = adminUserPermissionChange(
        globalOwner.token,
        globalOwner.authUserId,
        2
      );
      expect(error).toEqual(400);
    });

    test('invalid permissionId', () => {
      const error = adminUserPermissionChange(
        globalOwner.token,
        user.authUserId,
        3
      );
      expect(error).toEqual(400);
    });

    test('user already has the permissions level of permissionId', () => {
      const error = adminUserPermissionChange(
        globalOwner.token,
        user.authUserId,
        2
      );
      expect(error).toEqual(400);
    });
  });

  describe('success', () => {
    test('change user to global owner', () => {
      const change = adminUserPermissionChange(
        globalOwner.token,
        user1.authUserId,
        1
      );
      expect(change).toStrictEqual({});
    });

    test('change global owner to user', () => {
      const change = adminUserPermissionChange(
        globalOwner.token,
        user1.authUserId,
        2
      );
      expect(change).toStrictEqual({});
    });
  });
});

describe('/admin/user/remove/v1', () => {
  const user = authRegister('user@gmail.com', '123456', 'User', 'Zero');
  const user1 = authRegister('user1@gmail.com', '123456', 'User', 'One');
  const user2 = authRegister('user2@gmail.com', '123456', 'User', 'Two');
  const user3 = authRegister('user3@gmail.com', '123456', 'User', 'Three');
  const user4 = authRegister('user4@gmail.com', '123456', 'User', 'Four');

  describe('error', () => {
    test('uId does not refer to a valid user', () => {
      const error = adminUserRemove(globalOwner.token, user.authUserId + 999);
      expect(error).toStrictEqual(400);
    });

    test('the only global owner', () => {
      const error = adminUserRemove(globalOwner.token, globalOwner.authUserId);
      expect(error).toStrictEqual(400);
    });

    test('authorised user is not a global owner', () => {
      const error = adminUserRemove(user.token, user.authUserId);
      expect(error).toStrictEqual(403);
    });

    test('invalid token', () => {
      const error = adminUserRemove('invalid', user.authUserId);
      expect(error).toStrictEqual(403);
    });
  });

  describe('success', () => {
    test('remove a user', () => {
      const remove = adminUserRemove(globalOwner.token, user.authUserId);
      expect(remove).toStrictEqual({});

      const profile = userProfile(globalOwner.token, user.authUserId);
      expect(profile).toStrictEqual({
        user: {
          uId: expect.any(Number),
          email: null,
          nameFirst: 'Removed',
          nameLast: 'user',
          handleStr: null,
          profileImgUrl:
            'http://localhost:3200/default/default.jpg',
        },
      });

      const all = usersAll(globalOwner.token);
      expect(all.users).toHaveLength(7);
    });

    test('remove from channel', () => {
      const channel = channelsCreate(user1.token, 'channel', true);

      const remove = adminUserRemove(globalOwner.token, user1.authUserId);
      expect(remove).toStrictEqual({});

      const profile = userProfile(globalOwner.token, user1.authUserId);
      expect(profile).toStrictEqual({
        user: {
          uId: expect.any(Number),
          email: null,
          nameFirst: 'Removed',
          nameLast: 'user',
          handleStr: null,
          profileImgUrl:
            'http://localhost:3200/default/default.jpg',
        },
      });

      channelJoin(globalOwner.token, channel.channelId);
      const details = channelDetails(globalOwner.token, channel.channelId);
      expect(details).toStrictEqual({
        name: 'channel',
        isPublic: true,
        ownerMembers: [],
        allMembers: [
          {
            uId: expect.any(Number),
            email: 'globalowner@gmail.com',
            nameFirst: 'Global',
            nameLast: 'Owner',
            handleStr: expect.any(String),
            profileImgUrl:
              'http://localhost:3200/default/default.jpg',
          },
        ],
      });
    });

    test('remove from dm', () => {
      const dm = dmCreate(user2.token, [globalOwner.authUserId]);

      const remove = adminUserRemove(globalOwner.token, user2.authUserId);
      expect(remove).toStrictEqual({});

      const list = dmDetails(globalOwner.token, dm.dmId);
      expect(list).toStrictEqual({
        name: 'globalowner, usertwo',
        members: [
          {
            uId: 1,
            email: 'globalowner@gmail.com',
            nameFirst: 'Global',
            nameLast: 'Owner',
            handleStr: 'globalowner',
            profileImgUrl:
              'http://localhost:3200/default/default.jpg',
          },
        ],
      });
    });

    test('remove channel message', () => {
      const channel = channelsCreate(user3.token, 'channel', true);
      channelJoin(globalOwner.token, channel.channelId);
      messageSend(user3.token, channel.channelId, 'message');

      const remove = adminUserRemove(globalOwner.token, user3.authUserId);
      expect(remove).toStrictEqual({});

      const messages = channelMessages(globalOwner.token, channel.channelId, 0);
      expect(messages).toStrictEqual({
        messages: [
          {
            messageId: expect.any(Number),
            uId: expect.any(Number),
            message: 'Removed user',
            timeSent: expect.any(Number),
            reacts: expect.any(Array),
            isPinned: expect.any(Boolean),
          },
        ],
        start: 0,
        end: -1,
      });
    });

    test('remove dm message', () => {
      const dm = dmCreate(user4.token, [globalOwner.authUserId]);
      messageSendDm(user4.token, dm.dmId, 'message');

      const remove = adminUserRemove(globalOwner.token, user4.authUserId);
      expect(remove).toStrictEqual({});

      const messages = dmMessages(globalOwner.token, dm.dmId, 0);
      expect(messages).toStrictEqual({
        messages: [
          {
            messageId: expect.any(Number),
            uId: expect.any(Number),
            message: 'Removed user',
            timeSent: expect.any(Number),
            reacts: expect.any(Array),
            isPinned: expect.any(Boolean),
          },
        ],
        start: 0,
        end: -1,
      });
    });

    test('reusable handle and email', () => {
      const newUser = authRegister(
        'newuser@gmail.com',
        '123456',
        'new',
        'user'
      );

      const remove = adminUserRemove(globalOwner.token, newUser.authUserId);
      expect(remove).toStrictEqual({});

      const sameUser = authRegister(
        'newuser@gmail.com',
        '123456',
        'new',
        'user'
      );

      const profile = userProfile(globalOwner.token, sameUser.authUserId);
      expect(profile).toStrictEqual({
        user: {
          uId: expect.any(Number),
          email: 'newuser@gmail.com',
          nameFirst: 'new',
          nameLast: 'user',
          handleStr: expect.any(String),
          profileImgUrl:
            'http://localhost:3200/default/default.jpg',
        },
      });
    });

    // test('remove other global owner', () => {});
  });
});
