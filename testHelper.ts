import { port, url } from './config.json';
import request, { HttpVerb } from 'sync-request';
import { getData, reloadData } from './dataStore';

const SERVER_URL = `${url}:${port}`;

// ========================================================================= //

// Helper functions were taken from `lab08_quiz` in `quiz.test.ts`

function requestHelper(
  method: HttpVerb,
  path: string,
  payload: object,
  token?: string
) {
  let qs = {};
  let json = {};
  if (['GET', 'DELETE'].includes(method)) {
    qs = payload;
  } else {
    // PUT/POST
    json = payload;
  }

  let headers = {};
  if (token) {
    headers = { token };
  }
  const res = request(method, SERVER_URL + path, { qs, json, headers });

  if (res.statusCode !== 200) {
    // Return error code number instead of object in case of error.
    // (just for convenience)
    return res.statusCode;
  }
  return JSON.parse(res.getBody() as string);
}

// ========================================================================= //

// Auth

export function authLogin(email: string, password: string) {
  return requestHelper('POST', '/auth/login/v3', { email, password });
}

export function authRegister(
  email: string,
  password: string,
  nameFirst: string,
  nameLast: string
) {
  return requestHelper('POST', '/auth/register/v3', {
    email,
    password,
    nameFirst,
    nameLast,
  });
}

export function authLogout(token: string) {
  return requestHelper('POST', '/auth/logout/v2', {}, token);
}

export function authResetPasswordRequest(email: string) {
  return requestHelper('POST', '/auth/passwordreset/request/v1', { email });
}

export function authResetPassword(resetCode: string, newPassword: string) {
  return requestHelper('POST', '/auth/passwordreset/reset/v1', {
    resetCode,
    newPassword,
  });
}

// ========================================================================= //

// Channels

export function channelsCreate(token: string, name: string, isPublic: boolean) {
  return requestHelper(
    'POST',
    '/channels/create/v3',
    { name, isPublic },
    token
  );
}

export function channelsList(token: string) {
  return requestHelper('GET', '/channels/list/v3', {}, token);
}

export function channelsListAll(token: string) {
  return requestHelper('GET', '/channels/listall/v3', {}, token);
}

// ========================================================================= //

// Channel

export function channelDetails(token: string, channelId: number) {
  return requestHelper('GET', '/channel/details/v3', { channelId }, token);
}

export function channelJoin(token: string, channelId: number) {
  return requestHelper('POST', '/channel/join/v3', { channelId }, token);
}

export function channelInvite(token: string, channelId: number, uId: number) {
  return requestHelper('POST', '/channel/invite/v3', { channelId, uId }, token);
}

export function channelMessages(
  token: string,
  channelId: number,
  start: number
) {
  return requestHelper(
    'GET',
    '/channel/messages/v3',
    {
      channelId,
      start,
    },
    token
  );
}

export function channelLeave(token: string, channelId: number) {
  return requestHelper('POST', '/channel/leave/v2', { channelId }, token);
}

export function channelAddOwner(token: string, channelId: number, uId: number) {
  return requestHelper(
    'POST',
    '/channel/addowner/v2',
    {
      channelId,
      uId,
    },
    token
  );
}

export function channelRemoveOwner(
  token: string,
  channelId: number,
  uId: number
) {
  return requestHelper(
    'POST',
    '/channel/removeowner/v2',
    {
      channelId,
      uId,
    },
    token
  );
}

// ========================================================================= //

// User

export function userProfile(token: string, uId: number) {
  return requestHelper('GET', '/user/profile/v3', { uId }, token);
}

export function userProfileSetName(
  token: string,
  nameFirst: string,
  nameLast: string
) {
  return requestHelper(
    'PUT',
    '/user/profile/setname/v2',
    { nameFirst, nameLast },
    token
  );
}

export function userProfileSetEmail(token: string, email: string) {
  return requestHelper('PUT', '/user/profile/setemail/v2', { email }, token);
}

export function userProfileSetHandle(token: string, handleStr: string) {
  return requestHelper(
    'PUT',
    '/user/profile/sethandle/v2',
    { handleStr },
    token
  );
}

export function usersAll(token: string) {
  return requestHelper('GET', '/users/all/v2', {}, token);
}

export function userProfileUploadPhoto(
  token: string,
  imgUrl: string,
  xStart: number,
  yStart: number,
  xEnd: number,
  yEnd: number
) {
  return requestHelper(
    'POST',
    '/user/profile/uploadphoto/v1',
    { imgUrl, xStart, yStart, xEnd, yEnd },
    token
  );
}

// ========================================================================= //

// Message

export function messageSend(token: string, channelId: number, message: string) {
  return requestHelper(
    'POST',
    '/message/send/v2',
    {
      channelId,
      message,
    },
    token
  );
}

export function messageEdit(token: string, messageId: number, message: string) {
  return requestHelper(
    'PUT',
    '/message/edit/v2',
    {
      messageId,
      message,
    },
    token
  );
}

export function messageRemove(token: string, messageId: number) {
  return requestHelper('DELETE', '/message/remove/v2', { messageId }, token);
}

export function messageSendDm(token: string, dmId: number, message: string) {
  return requestHelper('POST', '/message/senddm/v2', { dmId, message }, token);
}

export function messageReact(
  token: string,
  messageId: number,
  reactId: number
) {
  return requestHelper(
    'POST',
    '/message/react/v1',
    {
      messageId,
      reactId,
    },
    token
  );
}

export function messagePin(token: string, messageId: number) {
  return requestHelper('POST', '/message/pin/v1', { messageId }, token);
}

export function messageUnpin(token: string, messageId: number) {
  return requestHelper('POST', '/message/unpin/v1', { messageId }, token);
}

export function messageUnreact(
  token: string,
  messageId: number,
  reactId: number
) {
  return requestHelper(
    'POST',
    '/message/unreact/v1',
    {
      messageId,
      reactId,
    },
    token
  );
}

export function messageShare(
  token: string,
  ogMessageId: number,
  message: string,
  channelId: number,
  dmId: number
) {
  return requestHelper(
    'POST',
    '/message/share/v1',
    { ogMessageId, message, channelId, dmId },
    token
  );
}

export function messageSendLater(
  token: string,
  channelId: number,
  message: string,
  timeSent: number
) {
  return requestHelper(
    'POST',
    '/message/sendlater/v1',
    { channelId, message, timeSent },
    token
  );
}

export function messageSendLaterDm(
  token: string,
  dmId: number,
  message: string,
  timeSent: number
) {
  return requestHelper(
    'POST',
    '/message/sendlaterdm/v1',
    { dmId, message, timeSent },
    token
  );
}

// ========================================================================= //

// Dm

export function dmCreate(token: string, uIds: number[]) {
  return requestHelper('POST', '/dm/create/v2', { uIds }, token);
}

export function dmList(token: string) {
  return requestHelper('GET', '/dm/list/v2', {}, token);
}

export function dmRemove(token: string, dmId: number) {
  return requestHelper('DELETE', '/dm/remove/v2', { dmId }, token);
}

export function dmDetails(token: string, dmId: number) {
  return requestHelper('GET', '/dm/details/v2', { dmId }, token);
}

export function dmLeave(token: string, dmId: number) {
  return requestHelper('POST', '/dm/leave/v2', { dmId }, token);
}

export function dmMessages(token: string, dmId: number, start: number) {
  return requestHelper('GET', '/dm/messages/v2', { dmId, start }, token);
}

export function getResetCode(email: string) {
  reloadData();
  const data = getData();
  const user = data.users.find((u) => u.email === email);
  const resetCode = user.resetCode;

  return resetCode;
}

// ========================================================================= //

// Search

export function search(token: string, queryStr: string) {
  return requestHelper('GET', '/search/v1', { queryStr }, token);
}

// ========================================================================= //

// Notifications

export function reqNotifications(token: string) {
  return requestHelper('GET', '/notifications/get/v1', {}, token);
}

// ========================================================================= //

// Standup

export function standupStart(token: string, channelId: number, length: number) {
  return requestHelper(
    'POST',
    '/standup/start/v1',
    { channelId, length },
    token
  );
}

export function standupActive(token: string, channelId: number) {
  return requestHelper('GET', '/standup/active/v1', { channelId }, token);
}

export function standupSend(token: string, channelId: number, message: string) {
  return requestHelper(
    'POST',
    '/standup/send/v1',
    { channelId, message },
    token
  );
}

// ========================================================================= //

// Admin

export function adminUserRemove(token: string, uId: number) {
  return requestHelper('DELETE', '/admin/user/remove/v1', { uId }, token);
}

export function adminUserPermissionChange(
  token: string,
  uId: number,
  permissionId: number
) {
  return requestHelper(
    'POST',
    '/admin/userpermission/change/v1',
    { uId, permissionId },
    token
  );
}

// ========================================================================= //

// Clear

export function clear() {
  return requestHelper('DELETE', '/clear/v1', {});
}

// ========================================================================= //

// Use to tell program waiting for an amount of time
export function sleep(time: number) {
  const timeNow = Date.now();
  while (timeNow + time >= Date.now()) {
    // waiting
  }
}
