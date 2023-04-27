import {
  authRegister,
  channelsCreate,
  channelInvite,
  messageSend,
  dmCreate,
  messageSendDm,
  search,
  clear,
} from './testHelper';

afterAll(() => {
  clear();
});

describe('/search/v1', () => {
  const user = authRegister('h78@gmail.com', '123456', 'John', 'Smith');
  const user2 = authRegister('user2@gmail.com', '123456', 'Liam', 'Davis');
  const user3 = authRegister('user3@gmail.com', '123456', 'Raj', 'Smith');
  const user4 = authRegister('user4@gmail.com', '123456', 'Raj2', 'Smith');

  const publicChannel = channelsCreate(user.token, 'Public Channel', true);
  channelInvite(user.token, publicChannel.channelId, user2.authUserId);
  channelInvite(user.token, publicChannel.channelId, user3.authUserId);

  const privateChannel = channelsCreate(user2.token, 'Private Channel', false);
  channelInvite(user2.token, privateChannel.channelId, user.authUserId);
  channelInvite(user2.token, privateChannel.channelId, user3.authUserId);

  const privateChannel2 = channelsCreate(user2.token, 'Private Channel2', false);
  messageSend(user2.token, privateChannel2.channelId, 'Test message 1, query word: COMP1531');

  const message1 = messageSend(user2.token, publicChannel.channelId, 'Test message 1, query word: COMP1531');
  const message2 = messageSend(user2.token, privateChannel.channelId, 'Test message 2, query word: COMP1531');
  messageSend(user.token, publicChannel.channelId, 'Test Message');
  messageSend(user2.token, publicChannel.channelId, 'What did you eat today?');

  const testDm1 = dmCreate(user2.token, [user3.authUserId]);
  const testDm2 = dmCreate(user3.token, [user2.authUserId]);
  const testDm3 = dmCreate(user.token, []);

  const dmMessage1 = messageSendDm(user2.token, testDm1.dmId, 'Test message 1, query word: COMP2521');
  const dmMess = messageSendDm(user2.token, testDm1.dmId, 'Test message 3 in Dm, query word: COMP1531');

  const dmMessage2 = messageSendDm(user3.token, testDm2.dmId, 'Test message 2, query word: COMP2521');

  messageSendDm(user.token, testDm3.dmId, 'Test message 2 in Dm, query word: COMP2521');

  test('Invalid Token', () => {
    expect(search('invalid', 'querySubstring')).toEqual(403);
  });

  test('Invalid queryStr when length is less than 1 or over 1000 characters', () => {
    const emptyQueryString = '';
    const longQueryString = 'a'.repeat(1001);
    expect(search(user.token, emptyQueryString)).toEqual(400);
    expect(search(user.token, longQueryString)).toEqual(400);
  });

  test('Non-Member search', () => {
    const queryStr = 'COMP1531';
    expect(search(user4.token, queryStr).messages).toEqual([]);
  });

  test('Correct return value: matching queryStr in channels', () => {
    const queryStr = 'COMP1531';

    expect(search(user3.token, queryStr).messages).toHaveLength(3);

    expect(search(user3.token, queryStr)).toStrictEqual({
      messages: [
        {
          messageId: message1.messageId,
          uId: user2.authUserId,
          message: 'Test message 1, query word: COMP1531',
          timeSent: expect.any(Number),
          reacts: expect.any(Array),
          isPinned: false,
        },
        {
          messageId: message2.messageId,
          uId: user2.authUserId,
          message: 'Test message 2, query word: COMP1531',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false,
        },
        {
          messageId: dmMess.messageId,
          uId: user2.authUserId,
          message: 'Test message 3 in Dm, query word: COMP1531',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false,
        },
      ],
    });
  });

  test('Correct return value: matching queryStr in DMs', () => {
    const queryStr = 'COMP2521';
    expect(search(user3.token, queryStr).messages).toHaveLength(2);
    expect(search(user3.token, queryStr)).toStrictEqual({
      messages: [
        {
          messageId: dmMessage1.messageId,
          uId: user2.authUserId,
          message: 'Test message 1, query word: COMP2521',
          timeSent: expect.any(Number),
          reacts: expect.any(Array),
          isPinned: expect.any(Boolean),
        },
        {
          messageId: dmMessage2.messageId,
          uId: user3.authUserId,
          message: 'Test message 2, query word: COMP2521',
          timeSent: expect.any(Number),
          reacts: expect.any(Array),
          isPinned: false,
        },
      ],
    });
  });
});
