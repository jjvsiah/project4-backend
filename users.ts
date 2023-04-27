import { getData, setData } from './dataStore';
import { getUserByToken, getUser } from './helper';
import { User, Data, UserProfile } from './interface';
import validator from 'validator';
import HTTPError from 'http-errors';
import sharp from 'sharp';
import request from 'sync-request';
import fs from 'fs';
import { sleep } from './helper';
import imageSize from 'image-size';
import { port, url } from './config.json';

const SERVER_URL = `${url}:${port}/`;

/**
 * For a valid user, returns information about their
 * user ID, email, first name, last name, and handle
 *
 * Returns 400 Error when any of:
 * - uId does not refer to a valid user
 *
 * Returns 403 Error when any of:
 * - `token` is invalid
 *
 * @param { string } token
 * @param { number } uId
 *
 * @returns {{ UserProfile }} - no error
 * @throws { HTTPError } - error
 */
function userProfileV3(token: string, uId: number): { user: UserProfile } {
  const authUser: User = getUserByToken(token);
  if (!authUser) {
    throw HTTPError(403, 'Invalid token');
  }

  const user: User = getUser(uId);
  if (!user) {
    throw HTTPError(400, 'uId does not refer to a valid user');
  }

  const userProfile: UserProfile = {
    uId: user.uId,
    email: user.email,
    nameFirst: user.nameFirst,
    nameLast: user.nameLast,
    handleStr: user.handleStr,
    profileImgUrl: user.profileImgUrl,
  };

  return { user: userProfile };
}

/**
 * Returns a list of all users and their associated details
 *
 * Returns 403 Error when any of:
 * - `token` is invalid
 *
 * @param { string } token
 *
 * @returns {{ UserProfile[] }} - no error
 *  @throws { HTTPError } - error
 */
function usersAllV2(token: string): { users: UserProfile[] } {
  const authUser: User = getUserByToken(token);
  if (!authUser) {
    throw HTTPError(403, 'Invalid token');
  }

  const data: Data = getData();
  const usersArray: UserProfile[] = data.users
    .filter((u) => u.permissionId !== -1)
    .map((u) => {
      return {
        uId: u.uId,
        email: u.email,
        nameFirst: u.nameFirst,
        nameLast: u.nameLast,
        handleStr: u.handleStr,
        profileImgUrl: u.profileImgUrl,
      };
    });

  return { users: usersArray };
}

/**
 * Update the authorised user's first and last name
 *
 * Returns 400 Error when any of:
 * - length of nameFirst is not between 1 and 50 characters inclusive
 * - length of nameLast is not between 1 and 50 characters inclusive
 *
 * Returns 403 Error when any of:
 * - `token` is invalid
 *
 * @param { string } token
 * @param { string } nameFirst
 * @param { string } nameLast
 *
 * @returns {{}} - no error
 * @throws { HTTPError } - error
 */
function userProfileSetNameV2(
  token: string,
  nameFirst: string,
  nameLast: string
): Record<never, string> {
  const data: Data = getData();
  const userIndex: number = data.users.indexOf(getUserByToken(token));
  if (userIndex === -1) {
    throw HTTPError(403, 'Invalid token');
  }

  if (nameFirst.length < 1 || nameFirst.length > 50) {
    throw HTTPError(400, 'nameFirst length is invalid');
  }

  if (nameLast.length < 1 || nameLast.length > 50) {
    throw HTTPError(400, 'nameLast length is invalid');
  }

  data.users[userIndex].nameFirst = nameFirst;
  data.users[userIndex].nameLast = nameLast;

  setData(data);

  return {};
}

/**
 * Update the authorised user's email address
 *
 * Returns 400 Error when any of:
 * - email entered is not a valid email
 * - email is already being used by another user
 *
 * Returns 403 Error when any of:
 * - `token` is invalid
 *
 * @param { string } token
 * @param { string } email
 *
 * @returns {{}} - no error
 * @throws { HTTPError } - error
 */
function userProfileSetEmailV2(
  token: string,
  email: string
): Record<never, string> {
  const authUser: User = getUserByToken(token);
  if (!authUser) {
    throw HTTPError(403, 'token is invalid');
  }

  if (!validator.isEmail(email)) {
    throw HTTPError(400, 'email is not a valid email address');
  }

  const data: Data = getData();
  const usedEmail = data.users.some((u) => u.email === email);
  if (usedEmail) {
    throw HTTPError(400, 'email address is already being used by another user');
  }

  const userIndex: number = data.users.indexOf(authUser);
  data.users[userIndex].email = email;
  setData(data);

  return {};
}

/**
 * Update the authorised user's handle (i.e. display name)
 *
 * Returns 400 Error when any of:
 * - length of handleStr is not between 3 and 20 characters inclusive
 * - handleStr contains non-alphanumeric characters
 * - handleStr is already used by another user
 *
 * Returns 403 Error when any of:
 * - `token` is invalid
 *
 * @param { string } token
 * @param { string } handleStr
 *
 * @returns {{}} - no error
 * @throws { HTTPError } - error
 */
function userProfileSetHandleV2(
  token: string,
  handleStr: string
): Record<string, never> {
  const authUser: User = getUserByToken(token);
  if (!authUser) {
    throw HTTPError(403, 'Invalid token');
  }

  if (handleStr.length < 3 || handleStr.length > 20) {
    throw HTTPError(
      400,
      'handleStr length is not between 3 and 20 characters inclusive'
    );
  }

  const alphanumericRegex = /^[a-zA-Z0-9]+$/;
  if (!alphanumericRegex.test(handleStr)) {
    throw HTTPError(
      400,
      'handleStr contains characters that are not alphanumeric'
    );
  }

  const data: Data = getData();
  const usedHandle = data.users.some((user) => user.handleStr === handleStr);
  if (usedHandle) {
    throw HTTPError(400, 'handle is already being used by another user');
  }

  const userIndex: number = data.users.indexOf(authUser);
  data.users[userIndex].handleStr = handleStr;
  setData(data);

  return {};
}

/**
 * Given a URL of an image on the internet, crops the image within bounds
 * (xStart, yStart) and (xEnd, yEnd). Position (0,0) is the top left.
 * Please note: the URL needs to be a non-https URL
 * (it should just have "http://" in the URL).
 * We will only test with non-https URLs.
 *
 * Returns 400 Error when any of:
 * - imgUrl returns an HTTP status other than 200, or any other errors
 *   occur when attempting to retrieve the image,
 * - any of xStart, yStart, xEnd, yEnd are not within the dimensions of
 *   the image at the URL,
 * - xEnd is less than or equal to xStart or yEnd is less than or equal to yStart,
 * - image uploaded is not a JPG.
 *
 * Returns 403 Error when any of:
 * - token is invalid
 *
 * @param { string } imgUrl
 * @param { number } xStart
 * @param { number } yStart
 * @param { number } xEnd
 * @param { number } yEnd
 *
 * @returns {{}} - no error
 * @throws { HTTPError } - error
 */
function userProfileUploadPhotoV1(
  token: string,
  imgUrl: string,
  xStart: number,
  yStart: number,
  xEnd: number,
  yEnd: number
): Record<string, never> {
  if (xEnd <= xStart || yEnd <= yStart) {
    throw HTTPError(400, 'invalid crop dimensions');
  }

  const authUser: User = getUserByToken(token);
  if (!authUser) {
    throw HTTPError(403, 'invalid token');
  }

  const data = getData();
  const userIndex = data.users.indexOf(authUser);

  cropImage(imgUrl, xStart, yStart, xEnd, yEnd, userIndex);

  return {};
}

// Helper

const IMAGE_PATH = 'avatar/';

function loadImage(url: string) {
  const extension = url.split('.').pop();

  if (extension !== 'jpg' && extension !== 'jpeg') {
    throw HTTPError(400, 'Image must be JPG file');
  }

  const folderName = 'avatar';

  if (!fs.existsSync(folderName)) {
    // If folder doesn't exist, create it
    fs.mkdirSync(folderName);
  }

  let filePath;

  try {
    const res = request('GET', url);
    const body = res.getBody();

    const imgName = Math.random().toString(36).substring(3, 8) + '.jpg';
    filePath = IMAGE_PATH + imgName;

    fs.writeFileSync(filePath, body, { flag: 'w' });
  } catch (e) {
    throw HTTPError(400, 'Cannot access');
  }

  return filePath;
}

function cropImage(
  imgUrl: string,
  xStart: number,
  yStart: number,
  xEnd: number,
  yEnd: number,
  userIndex: number
) {
  const inputFilePath = loadImage(imgUrl);

  const outputFilePath =
    IMAGE_PATH + Math.random().toString(36).substring(3, 8) + '.jpg';

  const dimensions = imageSize(inputFilePath);

  if (
    xStart >= dimensions.width ||
    xEnd >= dimensions.width ||
    yStart >= dimensions.height ||
    yEnd >= dimensions.height
  ) {
    throw HTTPError(400, 'Out of bound');
  }

  // Load the input image
  try {
    sharp(inputFilePath)
      // Crop the image using the given coordinates
      .extract({
        left: xStart,
        top: yStart,
        width: xEnd - xStart,
        height: yEnd - yStart,
      })
      // Write the output image to file
      .toFile(outputFilePath)
      .then(() => console.log('Image cropped successfully'));

    sleep(20);

    fs.renameSync(outputFilePath, inputFilePath);

    const data = getData();

    const croppedImgUrl = SERVER_URL + inputFilePath;

    data.users[userIndex].profileImgUrl = croppedImgUrl;

    setData(data);
  } catch (e) {
    throw HTTPError(400, 'Failed to crop');
  }
}

export {
  userProfileV3,
  usersAllV2,
  userProfileSetNameV2,
  userProfileSetEmailV2,
  userProfileSetHandleV2,
  userProfileUploadPhotoV1,
};
