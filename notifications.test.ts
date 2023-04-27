import {
  authRegister,
  channelsCreate,
  userProfile,
  channelJoin,
  channelInvite,
  messageSend,
  messageReact,
  messageUnreact,
  dmCreate,
  messageSendDm,
  reqNotifications,
  messageEdit,
  clear,
} from './testHelper';

afterAll(() => {
  clear();
});

describe('notifications/get/v1', () => {
  const user = authRegister('h39@gmail.com', '123456', 'John', 'Smith');
  const user2 = authRegister('h40@gmail.com', '123456', 'bJohn', 'Smith');
  const user3 = authRegister('k@gmail.com', '123456', 'Hai', 'Trieu');

  test('Invalid Token', () => {
    const invalidToken = 'invalid';
    expect(reqNotifications(invalidToken)).toEqual(403);
  });

  const publicChannel = channelsCreate(user.token, 'Public Channel', true);
  const privateChannel = channelsCreate(user2.token, 'Private Channel', false);

  channelJoin(user.token, privateChannel.channelId);
  channelJoin(user2.token, publicChannel.channelId);

  const userHandleStr = userProfile(user.token, user.authUserId).user.handleStr;
  const user2HandleStr = userProfile(user2.token, user2.authUserId).user.handleStr;
  const user2uId = userProfile(user2.token, user2.authUserId).user.uId;
  const handleStr3 = userProfile(user.token, user3.authUserId).user.handleStr;

  const channelMess = messageSend(user.token, publicChannel.channelId, `Hi, @${user2HandleStr} @rrgddh`);
  messageSend(user2.token, privateChannel.channelId, `Hey, @${userHandleStr}`);

  const dm1 = dmCreate(user.token, [user2uId]);
  const dmMessage = messageSendDm(
    user.token,
    dm1.dmId,
    `@${user2HandleStr}, what's up? @3434`
  );

  test('Notifications when a user is tagged using "@" in a channel or dm', () => {
    const notification = reqNotifications(user.token);
    expect(notification)
      .toStrictEqual({
        notifications: [
          {
            channelId: privateChannel.channelId,
            dmId: -1,
            notificationMessage: `${user2HandleStr} tagged you in Private Channel: Hey, @johnsmith`,
          }
        ]
      });

    expect(
      reqNotifications(user2.token)).toStrictEqual({
      notifications: [
        {
          channelId: -1,
          dmId: dm1.dmId,
          notificationMessage: `${userHandleStr} tagged you in bjohnsmith, johnsmith: @bjohnsmith, what's `,
        },
        {
          channelId: -1,
          dmId: dm1.dmId,
          notificationMessage: `${userHandleStr} added you to a bjohnsmith, johnsmith`,
        },
        {
          channelId: publicChannel.channelId,
          dmId: -1,
          notificationMessage: `${userHandleStr} tagged you in Public Channel: Hi, @bjohnsmith @rrg`,
        },
      ],
    });
  });

  test('Notifications when user reacts to a message in dm', () => {
    messageReact(user2.token, dmMessage.messageId, 1);
    const notification = reqNotifications(user.token);
    expect(notification.notifications).toHaveLength(2);
  });

  test('Notifications when user receives an invite to a channel or dm', () => {
    channelInvite(user.token, publicChannel.channelId, user2uId);
    dmCreate(user.token, [user2uId]);
    const receivedInviteNotifications = reqNotifications(
      user2.token
    ).notifications;

    expect(receivedInviteNotifications.length).toStrictEqual(4);

    expect(receivedInviteNotifications[0].notificationMessage).toStrictEqual(
      `${userHandleStr} added you to a bjohnsmith, johnsmith`
    );
  });

  test('Non-member wil not receive notification when they are tagged in channel', () => {
    for (let i = 0; i < 20; i++) {
      messageSend(user.token, publicChannel.channelId, `@${handleStr3} hello ${i} `);
      messageSendDm(user.token, dm1.dmId, `@${handleStr3} hello ${i}`);
    }

    const receivedMessageNotifications = reqNotifications(
      user3.token
    ).notifications;
    expect(receivedMessageNotifications).toStrictEqual([]);
  });

  test('User receives 20 react notifications', () => {
    const user2MessagePrivateChannel = messageSend(
      user2.token,
      privateChannel.channelId,
      'Did you watch the lecture today?'
    );
    for (let i = 0; i < 20; i++) {
      messageReact(user.token, user2MessagePrivateChannel.messageId, 1);
      messageUnreact(user.token, user2MessagePrivateChannel.messageId, 1);
    }
    const receivedReactNotifications = reqNotifications(
      user2.token
    ).notifications;
    expect(receivedReactNotifications).toHaveLength(20);

    for (let i = 0; i < 20; i++) {
      expect(receivedReactNotifications[i].notificationMessage).toStrictEqual(
        `${userHandleStr} reacted to your message in channel Private Channel`
      );
    }
  });

  test('Non-member wil not receive notification when user was tagged by editting message', () => {
    messageEdit(user.token, dmMessage.messageId, `@${handleStr3} hello  @udud`);
    messageEdit(user.token, channelMess.messageId, `@${handleStr3} hello  @ufufu`);
    const data = reqNotifications(user3.token);
    expect(data.notifications).toStrictEqual([]);
  });

  test('Receive notification when they are tagged in channel even editting to tag them', () => {
    messageEdit(user.token, dmMessage.messageId, `@${user2HandleStr} hello`);
    messageEdit(user.token, channelMess.messageId, `@${user2HandleStr} hello @${user2HandleStr}`);
    const data = reqNotifications(user2.token);
    expect(data.notifications).toHaveLength(20);
  });
});
