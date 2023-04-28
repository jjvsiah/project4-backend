import { getData, setData } from './dataStore';
import { AuthLogin, User, Data, AuthRegister } from './interface';
import validator from 'validator';
import crypto from 'crypto';
import HTTPError from 'http-errors';
import nodemailer from 'nodemailer';
import {
  getUserByEmail,
  generateToken,
  generateUserHandle,
  getUserByToken,
} from './helper';

import { port, url } from './config.json';

const SERVER_URL = `${url}:${port}/`;

const GLOBAL_SECRET_KEY = 'gscke';

/**
 * Given a registered user's email and password,
 * returns their `authUserId` value.
 *
 * 400 Error when any of:
 * - `email` entered does not belong to a user
 * - `password` is not correct
 *
 * 403 Error when any of:
 * - `token` is invalid
 *
 * @param { string } email
 * @param  { string } password
 *
 * @returns {{ token: string, authUserId: number }} - no error
 * @throws { HTTPError } - error
 */
function authLoginV3(email: string, password: string): AuthLogin {
  const user: User = getUserByEmail(email);
  if (!user) {
    throw HTTPError(400, 'Invalid email');
  }

  if (user.password !== hashPassword(password)) {
    throw HTTPError(400, 'Invalid password');
  }

  const token = generateToken();
  const hashedToken = generateHash(token);
  const data: Data = getData();
  const userIndex: number = data.users.indexOf(user);
  data.users[userIndex].token.push(hashedToken);
  setData(data);

  return { token: token, authUserId: user.uId };
}

/**
 * Given a user's first and last name, email address, and password,
 * creates a new account for them and returns a new authUserId.
 * A unique handle will be generated for each registered user.
 *
 * The user handle is created as follows:
 * - First, generate a concatenation of their casted-to-lowercase alphanumeric (a-z0-9)
 *   first name and last name (i.e. make lowercase then remove non-alphanumeric characters).
 * - If the concatenation is longer than 20 characters, it is cut off at 20 characters.
 * - If this handle is already taken by another user, append the concatenated names with
 *   the smallest number (starting from 0) that forms a new handle that isn't already taken.
 * - The addition of this final number may result in the handle exceeding the 20 character limit
 *   (the handle 'abcdefghijklmnopqrst0' is allowed if the handle 'abcdefghijklmnopqrst' is
 *   already taken).
 *
 * 400 Error when any of
 * - `email` entered is not a valid email (more in section 4.3)
 * - `email` address is already being used by another user
 * - `length` of password is less than 6 characters
 * - `length` of nameLast is not between 1 and 50 characters inclusive

 * @param { string } email
 * @param { string } password
 * @param { string } nameFirst
 * @param { string } nameLast
 *
 * @returns {{ token: string, authUserId: number }} - no error
 * @throws { HTTPError } - error
 */
function authRegisterV3(
  email: string,
  password: string,
  nameFirst: string,
  nameLast: string
): AuthRegister {
  const data: Data = getData();

  if (!validInformation(email, password, nameFirst, nameLast)) {
    throw HTTPError(400, 'Invalid email or password or nameFirst or nameLast');
  }

  const id = data.users.length + 1;
  const handle: string = generateUserHandle(nameFirst, nameLast);
  const token: string = generateToken();
  const hashedToken = generateHash(token);
  let permissionId = 2;

  if (data.globalOwnersId.length === 0) {
    data.globalOwnersId.push(id);
    permissionId = 1;
  }

  const defaultImgUrl = SERVER_URL + 'default/default.jpg';

  const newUser: User = {
    uId: id,
    email: email,
    password: hashPassword(password),
    nameFirst: nameFirst,
    nameLast: nameLast,
    handleStr: handle,
    token: [hashedToken],
    resetCode: null,
    permissionId,
    notifications: [],
    profileImgUrl: defaultImgUrl,
    accountCreationTime: Date.now() / 1000
  };

  data.users.push(newUser);
  setData(data);

  return { token: token, authUserId: id };
}

// ========================================================================= //

// Helper functions

/**
 * Given an active token, invalidates the token to log the user out.
 *
 * 403 Error when any of:
 *  - token is invalid
 *
 * @param { number } token
 *
 * @returns {{}} - no error
 * @throws { HTTPError } - error
 */
function authLogoutV2(token: string): Record<string, never> {
  const user: User = getUserByToken(token);
  if (!user) {
    throw HTTPError(403, 'Invalid token');
  }

  const data: Data = getData();
  const userIndex: number = data.users.indexOf(user);
  const tokenIndex: number = user.token.indexOf(token);
  data.users[userIndex].token.splice(tokenIndex, 1);
  setData(data);

  return {};
}

/**
 * Validates the information of a user
 * Return true if all information is valid
 * Return false if any information is invalid
 *
 * @param { string } email
 * @param { string } password
 * @param { string } nameFirst
 * @param { string } nameLast
 *
 * @returns { boolean }
 *
 */
function validInformation(
  email: string,
  password: string,
  nameFirst: string,
  nameLast: string
): boolean {
  if (
    validateEmail(email) &&
    validatePassword(password) &&
    validateName(nameFirst) &&
    validateName(nameLast)
  ) {
    return true;
  }
  return false;
}

function authPasswordResetRequest(email: string) {
  const data = getData();
  const user = getUserByEmail(email);
  if (!user) {
    throw HTTPError(400, 'Invalid email');
  }

  const limit = user.password.length - 11;

  const start = Math.floor(Math.random() * limit);
  const end = start + 10;
  const resetCode = user.password.slice(start, end);

  const userIndex = data.users.indexOf(user);
  data.users[userIndex].resetCode = resetCode;
  setData(data);

  const subject = 'Reset Password';
  const body = `Dear ${user.nameFirst},\n\n
  You have requested a password reset.\n\n
  Please use the following code to reset your password: ${resetCode}\n\n
  If you did not request a password reset, please ignore this email.\n\n
  Best regards,\n
  The Password Reset Team`;

  sendEmail(email, subject, body);

  return {};
}

function authPasswordReset(resetCode: string, newPassword: string) {
  if (!validatePassword(newPassword)) {
    throw HTTPError(400, 'Invalid password length < 6');
  }

  const data = getData();
  const validUserResetCode = data.users.find((u) => u.resetCode === resetCode);
  if (!validUserResetCode) {
    throw HTTPError(400, 'Invalid reset code!!');
  }

  const userIndex = data.users.indexOf(validUserResetCode);
  data.users[userIndex].password = hashPassword(newPassword);
  data.users[userIndex].resetCode = null;
  setData(data);

  return {};
}

/**
 * Validate name.
 * Return false length of nameLast is not between 1 and 50 characters inclusive.
 * Return true otherwise.
 *
 * @param { string } name
 *
 * @returns { boolean }
 *
 */
function validateName(name: string): boolean {
  if (name.length < 1 || name.length > 50) {
    console.log('invalid name length');
    return false;
  }
  return true;
}

/**
 * Validate password.
 * Return false length of password is less than 6 characters.
 * Return true otherwise.
 *
 * @param { string } password
 * @returns { boolean }
 *
 */
function validatePassword(password: string): boolean {
  if (password.length < 6) {
    console.log('invalid password length < 6');
    return false;
  }
  return true;
}

/**
 * Validate email.
 * Email address is already being used by another user
 * Return false if email address is invalid format
 *
 * @param { string } email
 * @returns { boolean }
 *
 */
function validateEmail(email: string): boolean {
  // Make sure the input is a valid string
  const data = getData();
  if (!validator.isEmail(email)) {
    console.log('invalid email');
    return false;
  }
  for (const user of data.users) {
    if (user.email === email) {
      console.log('Email have been used');
      return false;
    }
  }
  return true;
}

function generateHash(information: string) {
  information = information + GLOBAL_SECRET_KEY;
  const hash = crypto.createHash('sha512').update(information).digest('hex');
  return hash;
}

function hashPassword(password: string): string {
  const hash = crypto.createHash('sha256');
  hash.update(GLOBAL_SECRET_KEY + password);
  return hash.digest('hex');
}

function sendEmail(toEmail: string, subject: string, body: string) {
  const transport = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: 'comp1531resetTeam@gmail.com',
      pass: 'ikjnajnxhnhysmem',
    },
  });

  const mailOptions = {
    from: 'comp1531resetteam@gmail.com',
    to: toEmail,
    subject: subject,
    text: body,
  };
  transport.sendMail(mailOptions, (error, info) => {
    console.log('Email sent: ' + info.response);
  });
}

export {
  authLoginV3,
  authRegisterV3,
  authLogoutV2,
  authPasswordResetRequest,
  authPasswordReset,
  generateHash,
};
