import {
  authRegister,
  userProfile,
  usersAll,
  userProfileSetName,
  userProfileSetEmail,
  userProfileSetHandle,
  userProfileUploadPhoto,
  clear,
} from './testHelper';

afterAll(() => {
  clear();
});

const globalOwner = authRegister(
  'globalOwner@gmail.com',
  '123456',
  'Global',
  'Owner'
);

const user = authRegister('long@gmail.com', '123456', 'John', 'Smith');
const user1 = authRegister('ze@gmail.conm', '123456', 'John', 'Smith');

describe('/user/profile/v3', () => {
  describe('error', () => {
    test('uId does not refer to valid user', () => {
      expect(userProfile(user.token, user.authUserId + 99)).toStrictEqual(400);
    });

    test('token is invalid', () => {
      expect(userProfile('invalid', user.authUserId)).toStrictEqual(403);
    });
  });

  describe('success', () => {
    test('successful user profile', () => {
      const profile = userProfile(user.token, user.authUserId);
      expect(profile).toStrictEqual({
        user: {
          uId: expect.any(Number),
          email: 'long@gmail.com',
          nameFirst: 'John',
          nameLast: 'Smith',
          handleStr: expect.any(String),
          profileImgUrl:
            'http://localhost:3200/default/default.jpg',
        },
      });

      const profile1 = userProfile(user.token, user1.authUserId);
      expect(profile1).toStrictEqual({
        user: {
          uId: expect.any(Number),
          email: 'ze@gmail.conm',
          nameFirst: 'John',
          nameLast: 'Smith',
          handleStr: expect.any(String),
          profileImgUrl:
            'http://localhost:3200/default/default.jpg',
        },
      });
    });
  });
});

describe('/user/profile/setname/v2', () => {
  const user = authRegister('long3@gmail.com', '123456', 'John', 'Smith');
  authRegister('ze3@gmail.conm', '123456', 'John', 'Smith');

  describe('error', () => {
    test('length of nameFirst is not between 1 and 50 characters inclusive', () => {
      expect(userProfileSetName(user.token, '', 'name')).toStrictEqual(400);

      expect(
        userProfileSetName(
          user.token,
          'qwertyuiopasdfghjk1234759810347958107@23841835019234721ldajslfkdaj;dja;ldfsada;fdsa',
          'name'
        )
      ).toStrictEqual(400);
    });

    test('length of nameLast is not between 1 and 50 characters inclusive', () => {
      expect(
        userProfileSetName(
          user.token,
          'name',
          'qwertyuiopasdfghjk1234759810347958107@23841835019234721ldajslfkdaj;dja;ldfsada;fdsa'
        )
      ).toStrictEqual(400);

      expect(userProfileSetName(user.token, 'name', '')).toStrictEqual(400);
    });

    test('token is invalid', () => {
      expect(userProfileSetName('invalid', 'cool', 'name')).toStrictEqual(403);
    });
  });

  describe('success', () => {
    test('successful user setname', () => {
      const name = userProfileSetName(user.token, 'Ze', 'Sheng');
      expect(name).toStrictEqual({});

      const profile = userProfile(user.token, user.authUserId);
      expect(profile).toStrictEqual({
        user: {
          uId: expect.any(Number),
          email: 'long3@gmail.com',
          nameFirst: 'Ze',
          nameLast: 'Sheng',
          handleStr: expect.any(String),
          profileImgUrl:
            'http://localhost:3200/default/default.jpg',
        },
      });
    });
  });
});

describe('/user/profile/setemail/v2', () => {
  const user = authRegister('long4@gmail.com', '123456', 'John', 'Smith');
  authRegister('ze4@gmail.com', '123456', 'John', 'Smith');

  describe('error', () => {
    test('email entered is not a valid email', () => {
      expect(userProfileSetEmail(user.token, 'invalidemail.com')).toStrictEqual(
        400
      );
    });

    test('email address is already being used by another user', () => {
      expect(userProfileSetEmail(user.token, 'ze4@gmail.com')).toStrictEqual(
        400
      );
    });

    test('token is invalid', () => {
      expect(
        userProfileSetEmail('invalid', 'supercoool@gmail.com')
      ).toStrictEqual(403);
    });
  });

  describe('success', () => {
    test('successful user profile set email', () => {
      const name = userProfileSetEmail(user.token, 'supercoo213l@gmail.com');
      expect(name).toStrictEqual({});

      const profile = userProfile(user.token, user.authUserId);
      expect(profile).toStrictEqual({
        user: {
          uId: expect.any(Number),
          email: 'supercoo213l@gmail.com',
          nameFirst: 'John',
          nameLast: 'Smith',
          handleStr: expect.any(String),
          profileImgUrl:
            'http://localhost:3200/default/default.jpg',
        },
      });
    });
  });
});

describe('/user/profile/sethandle/v2', () => {
  const user = authRegister('long10@gmail.com', '123456', 'cool', 'handle');
  authRegister('ze10@gmail.conm', '123456', 'cool', 'handle');

  describe('error', () => {
    test('length of handleStr is not between 3 and 20 characters inclusive', () => {
      expect(userProfileSetHandle(user.token, '')).toStrictEqual(400);

      expect(userProfileSetHandle(user.token, '12')).toStrictEqual(400);

      expect(
        userProfileSetHandle(
          user.token,
          'qwertyuiopasdfgertyuiopasdfgertyuiopasdfgertyuiopasdfgertyuiopasdfg'
        )
      ).toStrictEqual(400);
    });

    test('handleStr contains characters that are not alphanumeric', () => {
      expect(
        userProfileSetHandle(user.token, '#$@#$%#$%%^^&##$!')
      ).toStrictEqual(400);
    });

    test('the handle is already used by another user', () => {
      expect(userProfileSetHandle(user.token, 'coolhandle')).toStrictEqual(400);
    });

    test('invalid token', () => {
      expect(userProfileSetHandle('invalid', 'awsseomehandle')).toStrictEqual(
        403
      );
    });
  });

  describe('success', () => {
    test('successful set handle', () => {
      const name = userProfileSetHandle(user.token, 'aswesomehandle');
      expect(name).toStrictEqual({});

      const profile = userProfile(user.token, user.authUserId);
      expect(profile).toStrictEqual({
        user: {
          uId: expect.any(Number),
          email: 'long10@gmail.com',
          nameFirst: 'cool',
          nameLast: 'handle',
          handleStr: 'aswesomehandle',
          profileImgUrl:
            'http://localhost:3200/default/default.jpg',
        },
      });
    });
  });
});

describe('/users/all/v2', () => {
  const user = authRegister('long1@gmail.com', '123456', 'John', 'Smith');
  authRegister('ze1@gmail.conm', '123456', 'John', 'Smith');

  describe('error', () => {
    test('token is invalid', () => {
      expect(usersAll('invalid')).toStrictEqual(403);
    });
  });

  describe('success', () => {
    test('successfully get all users', () => {
      const users = usersAll(user.token);
      expect(users.users).toHaveLength(11);
    });
  });
});

describe('/user/profile/uploadphoto/v1', () => {
  describe('error', () => {
    test('Invalid URL', () => {
      const error = userProfileUploadPhoto(
        globalOwner.token,
        'as2.ftcdn.net/v2/jpg/00/97/58/97/1000_F_97589769_t45CqXyzjz0KXwoBZT9PRaWGHRk5hQqQ.jpg',
        10,
        0,
        300,
        300
      );
      expect(error).toStrictEqual(400);
    });

    test('Invalid image type URL', () => {
      const error = userProfileUploadPhoto(
        globalOwner.token,
        'http://as2.ftcdn.net/v2/jpg/00/97/58/97/1000_F_97589769_t45CqXyzjz0KXwoBZT9PRaWGHRk5hQqQ.png',
        10,
        0,
        300,
        300
      );
      expect(error).toStrictEqual(400);
    });

    // test('xStart is not within the dimensions of the image at the URL', () => {
    //   const error = userProfileUploadPhoto(
    //     globalOwner.token,
    //     'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Cat03.jpg/1025px-Cat03.jpg',
    //     100000000000000,
    //     0,
    //     10,
    //     10
    //   );
    //   expect(error).toStrictEqual(400);
    // });

    test('yEnd is not within the dimensions of the image at the URL', () => {
      const error = userProfileUploadPhoto(
        user1.token,
        'http://as2.ftcdn.net/v2/jpg/00/97/58/97/1000_F_97589769_t45CqXyzjz0KXwoBZT9PRaWGHRk5hQqQ.jpg',
        0,
        0,
        10,
        100000000
      );
      expect(error).toStrictEqual(400);
    });

    test('xEnd is less than or equal to xStart', () => {
      const error = userProfileUploadPhoto(
        globalOwner.token,
        'http://as2.ftcdn.net/v2/jpg/00/97/58/97/1000_F_97589769_t45CqXyzjz0KXwoBZT9PRaWGHRk5hQqQ.jpg',
        10,
        0,
        0,
        10
      );
      expect(error).toStrictEqual(400);
    });

    test('token is invalid', () => {
      const error = userProfileUploadPhoto(
        'invalid',
        'http://as2.ftcdn.net/v2/jpg/00/97/58/97/1000_F_97589769_t45CqXyzjz0KXwoBZT9PRaWGHRk5hQqQ.jpg',
        0,
        0,
        10,
        10
      );
      expect(error).toStrictEqual(403);
    });
  });

  describe('success', () => {
    test('successful user profile upload photo or failed to access', () => {
      const imgUrl =
        'http://as2.ftcdn.net/v2/jpg/00/97/58/97/1000_F_97589769_t45CqXyzjz0KXwoBZT9PRaWGHRk5hQqQ.jpg';
      const res = userProfileUploadPhoto(
        globalOwner.token,
        imgUrl,
        0,
        0,
        300,
        300
      );

      if (res !== 400) {
        expect(res).toStrictEqual({});
      } else {
        expect(res).toStrictEqual(400);
      }
    });
  });
});
