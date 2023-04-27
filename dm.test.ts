import {
  authRegister,
  authLogout,
  dmCreate,
  dmList,
  dmRemove,
  dmDetails,
  dmLeave,
  dmMessages,
  messageReact,
  messageSendDm,
  clear,
} from './testHelper';

const DM = { dmId: expect.any(Number) };

describe('/dm/create/v2', () => {
  const user = authRegister('h39@gmail.com', '123456', 'John', 'Smith');
  const user2 = authRegister('h40@gmail.com', '123456', 'bJohn', 'Smith');
  const user3 = authRegister('h41@gmail.com', '123456', 'cJohn', 'Smith');
  const user4 = authRegister('h42@gmail.com', '123456', 'aJohn', 'Smith');
  const user5 = authRegister('h43@gmail.com', '123456', 'aJohn', 'Smith');
  authLogout(user3.token);

  const duplicateUser = authRegister(
    'jack.davis01@gmail.com',
    '123456!@#',
    'Jack',
    'Davis'
  );

  describe('Error cases', () => {
    test('Invalid uId in uIds', () => {
      const invalidUIds = [-500, -1000];
      const res = dmCreate(user.token, invalidUIds);
      expect(res).toStrictEqual(400);
    });

    test('Duplicate uIds in uIds', () => {
      const duplicateUIds = [
        duplicateUser.authUserId,
        user4.authUserId,
        duplicateUser.authUserId,
      ];
      const res = dmCreate(user5.token, duplicateUIds);
      expect(res).toStrictEqual(400);
    });

    test('Invalid token', () => {
      const uIds = [1, 2, 3];
      const res = dmCreate(undefined, uIds);
      expect(res).toStrictEqual(403);
    });
  });

  describe('Success cases', () => {
    test('Valid uId in uIds', () => {
      const uIds = [user2.authUserId, user3.authUserId, user4.authUserId];
      const res = dmCreate(user.token, uIds);
      expect(res).toStrictEqual(DM);
    });
  });
});

describe('/dm/list/v2', () => {
  test('Invalid token ', () => {
    expect(dmList('Invalid Token')).toStrictEqual(403);
  });

  // Need to fix this test, user.token is not a string
  test('Valid token', () => {
    const user = authRegister('user@gmail.com', '1234567', 'Jack', 'Smith');
    const user2 = authRegister('user2@gmail.com', '1234567', 'Hello', 'Smith');
    const dm = dmCreate(user.token, []);
    const dm2 = dmCreate(user.token, []);
    const result = dmList(user.token);
    const result2 = dmList(user2.token);
    expect(result2.dms).toStrictEqual([]);

    expect(result).toStrictEqual({
      dms: [
        {
          dmId: dm.dmId,
          name: 'jacksmith',
        },
        {
          dmId: dm2.dmId,
          name: expect.any(String),
        },
      ],
    });
  });
});

describe('/dm/remove/v2', () => {
  test('dmId does not refer to a valid DM', () => {
    const user = authRegister(
      'validemail@gmail.com',
      '123abc!@#',
      'John',
      'Smith'
    );
    const invalidResult = dmRemove(user.token, -1);
    expect(invalidResult).toStrictEqual(400);
  });

  const owner = authRegister(
    'elizabeth.smith12@gmail.com',
    'samplePass',
    'Elizabeth',
    'Smith'
  );
  const nonMember = authRegister(
    'william03@gmail.com',
    '123ab#',
    'William',
    'Morris'
  );
  const user = authRegister('alicia@gmail.com', 'samplePass', 'Alicia', 'Lee');
  const testDm = dmCreate(owner.token, [user.authUserId]);

  test('dmId is valid but authorised user is not DM creator', () => {
    const removalByNonOwner = dmRemove(user.token, testDm.dmId);
    expect(removalByNonOwner).toStrictEqual(403);
  });

  test('dmId is valid but authorised user is not in DM', () => {
    const removalByNonMember = dmRemove(nonMember.token, testDm.dmId);
    expect(removalByNonMember).toStrictEqual(403);
  });

  test('Invalid token', () => {
    const data = dmRemove('Invalid token', testDm.dmId);
    expect(data).toStrictEqual(403);
  });

  test('Success remove DM', () => {
    const removalByOwner = dmRemove(owner.token, testDm.dmId);
    clear();
    expect(removalByOwner).toStrictEqual({});
  });
});

describe('/dm/details/v2', () => {
  test('Token is invalid', () => {
    expect(dmDetails('Invalid Token', 1)).toEqual(403);
  });

  test('dmId does not refer to a valid DM', () => {
    const user = authRegister(
      'useremail@gmail.com',
      'password',
      'Tim',
      'Brown'
    );
    expect(dmDetails(user.token, -1)).toEqual(400);
  });

  test('dmId is valid, but authorised user isnt member of dm', () => {
    const user = authRegister('asdfemail@gmail.com', '123123', 'Kim', 'Choi');
    const dm = dmCreate(user.token, []);
    const authUser = authRegister(
      'randomemail@gmail.com',
      '124141',
      'Tom',
      'Lee'
    );
    const data = dmDetails(authUser.token, dm.dmId);
    clear();
    expect(data).toEqual(403);
  });

  test('Success list', () => {
    const user = authRegister('helloWord@gmail.com', '123123', 'Kim', 'Coi');
    const user2 = authRegister('helloWord2@gmail.com', '123123', 'dKim', 'Coi');
    const user3 = authRegister('helloWord3@gmail.com', '123123', 'aKim', 'Coi');
    const user4 = authRegister('helloWord4@gmail.com', '123123', 'cKim', 'Coi');
    const nonMember = authRegister(
      'helloWord5@gmail.com',
      '123123',
      'eKim',
      'Coi'
    );
    const memeberIds = [user2.authUserId, user3.authUserId, user4.authUserId];
    const dm = dmCreate(user.token, memeberIds);

    const data = dmDetails(user.token, dm.dmId);
    clear();
    expect(data.members).toHaveLength(4);
    expect(data.members).not.toContainEqual(nonMember);
  });
});

describe('/dm/leave/v2', () => {
  test('Invalid token or invalid dmId provided', () => {
    const user = authRegister('someEmail@gmail.com', '123145', 'John', 'Smith');
    const dm = dmCreate(user.token, []);
    expect(dmLeave('Invalid Token', dm.dmId)).toStrictEqual(403);
    expect(dmLeave(user.token, -1)).toStrictEqual(400);
  });

  test('dmId is valid, but authorised user is not a member of dm', () => {
    const user = authRegister(
      'randomemail@gmail.com',
      '123abc!@#%',
      'Jake',
      'Renzella'
    );
    const user1 = authRegister(
      'theo.ang816@gmail.com',
      'Password',
      'Thomas',
      'Lee'
    );
    const nonMember = authRegister(
      'asdfemail@gmail.com',
      '123123',
      'Bruce',
      'Nguyen'
    );
    const dm = dmCreate(user.token, [user1.authUserId]);
    expect(dmLeave(nonMember.token, dm.dmId)).toStrictEqual(403);
  });

  test('Success left', () => {
    const user = authRegister('helloWord@gmail.com', '123123', 'Kim', 'Coi');
    const user2 = authRegister('helloWord2@gmail.com', '123123', 'dKim', 'Coi');
    const user3 = authRegister('helloWord3@gmail.com', '123123', 'aKim', 'Coi');
    const user4 = authRegister('helloWord4@gmail.com', '123123', 'cKim', 'Coi');
    const memeberIds = [user2.authUserId, user3.authUserId, user4.authUserId];
    const dm = dmCreate(user.token, memeberIds);

    expect(dmLeave(user2.token, dm.dmId)).toStrictEqual({});
    const data = dmDetails(user3.token, dm.dmId);
    clear();
    expect(data.members).toHaveLength(3);
  });
});

describe('/dm/messages/v2', () => {
  test('Invalid token', () => {
    expect(dmMessages('Invalid Token', 1, 3)).toStrictEqual(403);
  });

  test('Invalid dmId', () => {
    const user = authRegister(
      'jake13email@gmail.com',
      '123ab!@#%',
      'Jake',
      'Renzella'
    );
    const result = dmMessages(user.token, -999, 5);
    expect(result).toStrictEqual(400);
  });

  test('start index is greater than the total number of messages in the dm', () => {
    const user = authRegister(
      'randomemail@gmail.com',
      'password123*+&',
      'Emily',
      'Miller'
    );
    const user2 = authRegister(
      'asdfemail@gmail.com',
      '23231414',
      'Bruce',
      'Nguyen'
    );
    const dm = dmCreate(user.token, [user2.authUserId]);
    messageSendDm(user.token, dm.dmId, 'test message1');
    messageSendDm(user.token, dm.dmId, 'test message2');
    const res = dmMessages(user.token, dm.dmId, 5);
    expect(res).toEqual(400);
  });

  test('channel message react', () => {
    const coolUser = authRegister('coser2@gmail.com', '123456', 'User', 'Cool');
    const user3 = authRegister(
      'CoolUser3@gmail.com',
      '123456',
      'User',
      'Three'
    );
    const dm = dmCreate(coolUser.token, [user3.authUserId]);
    const send = messageSendDm(coolUser.token, dm.dmId, 'message');
    messageReact(coolUser.token, send.messageId, 1);

    const messages = dmMessages(user3.token, dm.dmId, 0);
    expect(messages).toStrictEqual({
      messages: expect.any(Array),
      start: 0,
      end: -1,
    });

    const messages1 = dmMessages(coolUser.token, dm.dmId, 0);
    expect(messages1).toStrictEqual({
      messages: expect.any(Array),
      start: 0,
      end: -1,
    });
  });

  // when a user (nonMember) attempts to retrieve messages from a DM,
  // but they are not a member of the DM.
  test('Success return and nonMember return', () => {
    const user = authRegister(
      'darrons_email@gmail.com',
      'password123*&!',
      'Darron',
      'Smith'
    );
    const nonMember = authRegister(
      'nonmember_email@gmail.com',
      'password1231',
      'Jack',
      'Davis'
    );
    const dm = dmCreate(user.token, []);
    let x = 0;
    while (x < 52) {
      messageSendDm(user.token, dm.dmId, 'test message' + x);
      ++x;
    }
    const res = dmMessages(nonMember.token, dm.dmId, 0);
    const valid50Messages = dmMessages(user.token, dm.dmId, 0);
    const data = dmMessages(user.token, dm.dmId, 3);
    clear();
    expect(res).toEqual(403);
    expect(data.messages).toHaveLength(49);
    expect(valid50Messages.messages).toHaveLength(50);
    expect(data.end).toStrictEqual(-1);
  });
});
