import {
  authRegister,
  channelsCreate,
  standupStart,
  standupActive,
  standupSend,
  clear,
} from './testHelper';

const TIMEFINISH = { timeFinish: expect.any(Number) };

afterAll(() => {
  clear();
});

describe('/standup/start/v1', () => {
  const user = authRegister('email@gmail.com', '123456', 'first', 'last');
  const channel = channelsCreate(user.token, 'channel', true);

  const user1 = authRegister('email1@gmail.com', '123456', 'first', 'last');
  const channel1 = channelsCreate(user1.token, 'channel1', true);

  describe('error', () => {
    test('channelId is invalid', () => {
      const error = standupStart(user.token, channel.channelId + 999, 10);
      expect(error).toStrictEqual(400);
    });

    test('length is negative', () => {
      const error = standupStart(user.token, channel.channelId, -10);
      expect(error).toStrictEqual(400);
    });

    test('channelId is valid but authorised user is not a member of the channel', () => {
      const error = standupStart(user.token, channel1.channelId, 10);
      expect(error).toStrictEqual(403);
    });

    test('token is invalid', () => {
      const error = standupStart('invalid token', channel1.channelId, 10);
      expect(error).toStrictEqual(403);
    });

    test('active standup already running', () => {
      const start = standupStart(user.token, channel.channelId, 10);
      expect(start).toEqual(TIMEFINISH);

      const error = standupStart(user.token, channel.channelId, 10);
      expect(error).toStrictEqual(400);
    });
  });

  describe('success', () => {
    test('success standup start', () => {
      const start = standupStart(user1.token, channel1.channelId, 10);
      expect(start).toEqual(TIMEFINISH);
    });
  });
});

describe('/standup/active/v1', () => {
  const user = authRegister('email@mail.com', '123456', 'first', 'last');
  const channel = channelsCreate(user.token, 'channel', true);

  const user1 = authRegister('email1@mail.com', '123456', 'first', 'last');
  const channel1 = channelsCreate(user1.token, 'channel1', true);

  describe('error', () => {
    test('channelId is invalid', () => {
      const error = standupActive(user1.token, channel.channelId + 999);
      expect(error).toStrictEqual(400);
    });

    test('channelId is valid but authorised user is not a member of the channel', () => {
      const error = standupActive(user.token, channel1.channelId);
      expect(error).toStrictEqual(403);
    });

    test('token is invalid', () => {
      const error = standupActive('invalid', channel.channelId);
      expect(error).toStrictEqual(403);
    });
  });

  describe('success', () => {
    test('standup is inactive', () => {
      const active = standupActive(user.token, channel.channelId);
      expect(active).toEqual({
        isActive: false,
        timeFinish: -1,
      });
    });

    test('standup is active', () => {
      const start = standupStart(user.token, channel.channelId, 10);
      expect(start).toEqual(TIMEFINISH);

      const active = standupActive(user.token, channel.channelId);
      expect(active).toEqual({
        isActive: true,
        timeFinish: expect.any(Number),
      });
    });
  });
});

describe('/standup/send/v1', () => {
  const user = authRegister('emaasdf@mail.com', '123456', 'first', 'last');
  const channel = channelsCreate(user.token, 'channel', true);

  const user1 = authRegister('gmacodfl1@mail.com', '123456', 'first', 'last');
  const channel1 = channelsCreate(user1.token, 'channel1', true);

  describe('error', () => {
    test('channelId is invalid', () => {
      const error = standupSend(
        user1.token,
        channel.channelId + 999,
        'message'
      );
      expect(error).toStrictEqual(400);
    });

    test('length of message is more than 1000 characters', () => {
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
      const error = standupSend(user.token, channel.channelId, longString);
      expect(error).toStrictEqual(400);
    });

    test('an active standup is not currently running in the channel', () => {
      const error = standupSend(user.token, channel.channelId, 'message');
      expect(error).toStrictEqual(400);
    });

    test('channelId is valid but authorised user is not a member of the channel', () => {
      const error = standupSend(user.token, channel1.channelId, 'hi');
      expect(error).toStrictEqual(403);
    });

    test('token is invalid', () => {
      const error = standupSend('invalid', channel.channelId, 'cool');
      expect(error).toStrictEqual(403);
    });
  });

  describe('success', () => {
    test('success standup send', async () => {
      const start = standupStart(user.token, channel.channelId, 4);
      expect(start).toStrictEqual(TIMEFINISH);

      await new Promise((resolve) => setTimeout(resolve, 2500));
      const send = standupSend(user.token, channel.channelId, 'message');
      expect(send).toEqual({});

      await new Promise((resolve) => setTimeout(resolve, 1600));
    });
  });
});
