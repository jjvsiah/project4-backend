import {
  channelsCreate,
  channelsList,
  channelsListAll,
  authRegister,
  clear,
} from './testHelper';

const CHANNELID = { channelId: expect.any(Number) };

afterAll(() => {
  clear();
});

describe('/channels/create/v3', () => {
  const user = authRegister('long@gmail.com', '123456', 'John', 'Smith');
  const user1 = authRegister('ze@gmail.com', '123456', 'John', 'Smith');

  describe('error', () => {
    test('length of name is less than 1', () => {
      expect(channelsCreate(user.token, '', true)).toStrictEqual(400);
    });

    test('length of name  is greater than 20', () => {
      expect(
        channelsCreate(user.token, 'thischannelnameiswaytoolongtoolong', false)
      ).toStrictEqual(400);
    });

    test('token is invalid', () => {
      expect(channelsCreate('0', 'channel1', true)).toStrictEqual(403);
    });
  });

  describe('success', () => {
    test('success channelId', () => {
      const channel1 = channelsCreate(user.token, 'channel1', true);
      expect(channel1).toStrictEqual(CHANNELID);

      const channel2 = channelsCreate(user1.token, 'channel2', false);
      expect(channel2).toStrictEqual(CHANNELID);
    });
  });
});

describe('/channels/list/v3', () => {
  const user = authRegister('long123@gmail.com', '123456', 'John', 'Smith');
  const user1 = authRegister('ze123@gmail.com', '123456', 'John', 'Smith');

  describe('error', () => {
    test('token is invalid', () => {
      expect(channelsList('0')).toStrictEqual(403);
    });
  });

  describe('success', () => {
    test('empty list', () => {
      const list = channelsList(user.token);
      expect(list).toStrictEqual({ channels: [] });
    });

    test('public channel', () => {
      const channel1 = channelsCreate(user.token, 'channel1', true);
      expect(channel1).toStrictEqual(CHANNELID);

      const list = channelsList(user.token);
      expect(list).toStrictEqual({
        channels: [{ channelId: expect.any(Number), name: expect.any(String) }],
      });
    });

    test('private channel', () => {
      const channel2 = channelsCreate(user1.token, 'channel2', false);
      expect(channel2).toStrictEqual(CHANNELID);

      const list = channelsList(user1.token);
      expect(list).toStrictEqual({
        channels: [{ channelId: expect.any(Number), name: expect.any(String) }],
      });
    });
  });
});

describe('/channels/listall/v3', () => {
  const user = authRegister('zesh3g@gmail.com', 'ldafdaskfj', 'John', 'Smith');
  const user1 = authRegister('cool124@gmail.com', 'ld123356j', 'John', 'Smith');

  describe('error', () => {
    test('token is invalid', () => {
      expect(channelsListAll('0')).toStrictEqual(403);
    });
  });

  describe('success', () => {
    test('empty list', () => {
      const list = channelsList(user.token);
      expect(list).toStrictEqual({ channels: [] });
    });

    test('succesful list all', () => {
      const channel1 = channelsCreate(user.token, 'channel1', true);
      const channel2 = channelsCreate(user1.token, 'channel2', false);
      expect(channel1).toStrictEqual(CHANNELID);
      expect(channel2).toStrictEqual(CHANNELID);

      const list = channelsListAll(user.token);

      expect(list).toStrictEqual({
        channels: [
          { channelId: expect.any(Number), name: expect.any(String) },
          { channelId: expect.any(Number), name: expect.any(String) },
          { channelId: expect.any(Number), name: expect.any(String) },
          { channelId: expect.any(Number), name: expect.any(String) },
          { channelId: expect.any(Number), name: expect.any(String) },
          { channelId: expect.any(Number), name: expect.any(String) },
        ],
      });
    });
  });
});
