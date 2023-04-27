import {
  authRegister,
  authLogin,
  authLogout,
  authResetPasswordRequest,
  clear,
  authResetPassword,
  getResetCode,
} from './testHelper';

const USER = { token: expect.any(String), authUserId: expect.any(Number) };

afterAll(() => {
  clear();
});

describe('auth/register/v3', () => {
  describe('success', () => {
    test('Success Register', () => {
      const data = authRegister('j@gmail.com', '123456', 'John', 'Smith');
      expect(data).toStrictEqual(USER);
    });
    test('User handle that is greater than 20 characters', () => {
      const data = authRegister(
        'j1234@gmail.com',
        '123456',
        'arealllylongname',
        'areallycoolname'
      );
      expect(data).toStrictEqual(USER);
    });
  });

  describe('error', () => {
    test('Invalid email', () => {
      expect(authRegister('hgmail.com', '123456', 'John', 'Smith')).toEqual(
        400
      );
    });

    test('Email is already used', () => {
      expect(authRegister('j@gmail.com', '123456', 'John', 'Smith')).toEqual(
        400
      );
    });

    test('Invalid password', () => {
      expect(
        authRegister('j2@gmail.com', '12345', 'John', 'Smith')
      ).toStrictEqual(400);
    });

    test('Invalid name length', () => {
      expect(authRegister('j2@gmail.com', '123456', '', 'Smith')).toStrictEqual(
        400
      );
    });

    test('Invalid email', () => {
      expect(
        authRegister('hgmail.com', '123456', 'John', 'Smith')
      ).toStrictEqual(400);
    });
  });
});

describe('/auth/login/v2 root test', () => {
  describe('success', () => {
    test('Success Login', () => {
      const data = authLogin('j@gmail.com', '123456');
      expect(data).toStrictEqual(USER);
    });
  });

  describe('error', () => {
    test('Invalid email', () => {
      expect(authLogin('hgmail.com', '123456')).toStrictEqual(400);
    });

    test('Unregisterd email', () => {
      expect(authLogin('h2@gmail.com', '123456')).toStrictEqual(400);
    });

    test('Invalid password', () => {
      expect(authLogin('j@gmail.com', '1234567')).toStrictEqual(400);
    });
  });
});

describe('/auth/logout/v1 root test', () => {
  const token1 = authRegister('h3@gmail.com', '123456', 'John3', 'Smith');
  const token2 = authLogin('h3@gmail.com', '123456');

  describe('error', () => {
    test('Invalid token', () => {
      expect(authLogout('-234234')).toStrictEqual(403);
    });
  });

  describe('success', () => {
    test('Success Logout with token2', () => {
      const data = authLogout(token2.token);
      expect(data).toStrictEqual({});
    });

    test('Success Logout with token 1', () => {
      const data = authLogout(token1.token);
      expect(data).toStrictEqual({});
    });

    test('Logout 1 more time', () => {
      const data = authLogout(token2.token);
      clear();
      expect(data).toStrictEqual(403);
    });
  });
});

describe('/auth/passwordreset/request/v1 root test', () => {
  describe('error', () => {
    test('Invalid email', () => {
      expect(authResetPasswordRequest('this is invalid email')).toStrictEqual(
        400
      );
    });
  });

  test('Success', () => {
    authRegister('h4@gmail.com', '123456', 'John3', 'Smith');
    expect(authResetPasswordRequest('h4@gmail.com')).toStrictEqual({});
  });
});

describe('/auth/passwordreset/reset/v1 root test', () => {
  describe('error', () => {
    test('Invalid resetCode', () => {
      expect(authResetPassword('invalid reset code', '345678')).toStrictEqual(
        400
      );
    });

    test('Invalid password length < 6', () => {
      expect(authResetPassword('tybc45', '1')).toStrictEqual(400);
    });
  });

  test('Success change password', () => {
    authRegister('h5@gmail.com', '123456', 'John5', 'Smith');
    authResetPasswordRequest('h5@gmail.com');
    const resetCode = getResetCode('h5@gmail.com');
    expect(authResetPassword(resetCode, '3456789')).toStrictEqual({});
  });
});
