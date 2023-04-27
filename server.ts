import express, { json, Request, Response } from 'express';
import { echo } from './echo';
import morgan from 'morgan';
import config from './config.json';
import cors from 'cors';

import errorHandler from 'middleware-http-errors';
import { reloadData } from './dataStore';

import {
  authLoginV3,
  authRegisterV3,
  authLogoutV2,
  generateHash,
  authPasswordResetRequest,
  authPasswordReset,
} from './auth';

import {
  dmCreateV2,
  dmListV2,
  dmRemoveV2,
  dmDetailsV2,
  dmLeaveV2,
  dmMessagesV2,
} from './dm';

import {
  channelsCreateV3,
  channelsListV3,
  channelsListAllV3,
} from './channels';

import {
  channelDetailsV3,
  channelJoinV3,
  channelInviteV3,
  channelMessagesV3,
  channelLeaveV2,
  channelAddOwnerV2,
  channelRemoveOwnerV2,
} from './channel';
import { clearV1 } from './other';

import {
  messageSendV2,
  messageEditV2,
  messageSendDmV2,
  messageRemoveV2,
  messageReactV1,
  messageUnreactV1,
  messagePinV1,
  messageUnpinV1,
  messageSendLaterV1,
  messageSendLaterDmV1,
  messageShareV1,
} from './message';

import {
  userProfileV3,
  usersAllV2,
  userProfileSetNameV2,
  userProfileSetEmailV2,
  userProfileSetHandleV2,
  userProfileUploadPhotoV1,
} from './users';
import { getNotificationsV1 } from './notifications';
import { standupStartV1, standupActiveV1, standupSendV1 } from './standup';

import { adminUserRemoveV1, adminUserPermissionChangeV1 } from './admin';

import { searchV1 } from './search';

// Set up web app
const app = express();
// Use middleware that allows us to access the JSON body of requests
app.use(json());
// Use middleware that allows for access from other domains
app.use(cors());
// for logging errors (print to terminal)
app.use(morgan('dev'));

const PORT: number = parseInt(process.env.PORT || config.port);
const HOST: string = process.env.IP || 'localhost';

// Example get request
app.get('/echo', (req: Request, res: Response, next) => {
  const data = req.query.echo as string;
  return res.json(echo(data));
});

// ========================================================================= //

// Auth

app.post('/auth/login/v3', (req: Request, res: Response, next) => {
  const { email, password } = req.body;

  res.json(authLoginV3(email, password));
});

app.post('/auth/register/v3', (req: Request, res: Response, next) => {
  console.log('Print to terminal: newUser is coming');
  const { email, password, nameFirst, nameLast } = req.body;

  res.json(authRegisterV3(email, password, nameFirst, nameLast));
});

app.post('/auth/logout/v2', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const hashedToken = generateHash(token);

  res.json(authLogoutV2(hashedToken));
});

app.post(
  '/auth/passwordreset/request/v1',
  (req: Request, res: Response, next) => {
    const { email } = req.body;

    res.json(authPasswordResetRequest(email));
  }
);

app.post(
  '/auth/passwordreset/reset/v1',
  (req: Request, res: Response, next) => {
    const { resetCode, newPassword } = req.body;

    res.json(authPasswordReset(resetCode, newPassword));
  }
);

// ========================================================================= //

// Channels

app.post('/channels/create/v3', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const hashedToken = generateHash(token);

  const { name, isPublic } = req.body;

  res.json(channelsCreateV3(hashedToken, name, isPublic));
});

app.get('/channels/list/v3', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const hashedToken = generateHash(token);

  res.json(channelsListV3(hashedToken));
});

app.get('/channels/listAll/v3', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const hashedToken = generateHash(token);

  res.json(channelsListAllV3(hashedToken));
});

// ========================================================================= //

// Channel

app.get('/channel/details/v3', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const hashedToken = generateHash(token);
  const channelId = req.query.channelId as string;

  res.json(channelDetailsV3(hashedToken, parseInt(channelId)));
});

app.post('/channel/join/v3', (req: Request, res: Response, next) => {
  const { channelId } = req.body;
  const token = req.header('token');
  const hashedToken = generateHash(token);

  res.json(channelJoinV3(hashedToken, channelId));
});

app.post('/channel/invite/v3', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const hashedToken = generateHash(token);
  const { channelId, uId } = req.body;

  res.json(channelInviteV3(hashedToken, channelId, uId));
});

app.get('/channel/messages/v3', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const hashedToken = generateHash(token);
  const channelId = req.query.channelId as string;
  const start = req.query.start as string;

  res.json(
    channelMessagesV3(hashedToken, parseInt(channelId), parseInt(start))
  );
});

app.post('/channel/leave/v2', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const hashedToken = generateHash(token);
  const { channelId } = req.body;

  res.json(channelLeaveV2(hashedToken, channelId));
});

app.post('/channel/addowner/v2', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const hashedToken = generateHash(token);
  const { channelId, uId } = req.body;

  res.json(channelAddOwnerV2(hashedToken, channelId, uId));
});

app.post('/channel/removeowner/v2', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const hashedToken = generateHash(token);
  const { channelId, uId } = req.body;

  res.json(channelRemoveOwnerV2(hashedToken, channelId, uId));
});

// ========================================================================= //

// Message

app.post('/message/send/v2', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const hashedToken = generateHash(token);
  const { channelId, message } = req.body;

  res.json(messageSendV2(hashedToken, channelId, message));
});

app.post('/message/senddm/v2', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const hashedToken = generateHash(token);
  const { dmId, message } = req.body;

  res.json(messageSendDmV2(hashedToken, dmId, message));
});

app.put('/message/edit/v2', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const hashedToken = generateHash(token);
  const { messageId, message } = req.body;

  res.json(messageEditV2(hashedToken, messageId, message));
});

app.delete('/message/remove/v2', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const hashedToken = generateHash(token);
  const messageId = parseInt(req.query.messageId as string);

  res.json(messageRemoveV2(hashedToken, messageId));
});

app.post('/message/react/v1', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const hashedToken = generateHash(token);
  const { messageId, reactId } = req.body;

  res.json(messageReactV1(hashedToken, messageId, reactId));
});

app.post('/message/unreact/v1', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const hashedToken = generateHash(token);
  const { messageId, reactId } = req.body;

  res.json(messageUnreactV1(hashedToken, messageId, reactId));
});

app.post('/message/pin/v1', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const hashedToken = generateHash(token);
  const { messageId } = req.body;

  res.json(messagePinV1(hashedToken, messageId));
});

app.post('/message/unpin/v1', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const hashedToken = generateHash(token);
  const { messageId } = req.body;

  res.json(messageUnpinV1(hashedToken, messageId));
});

app.post('/message/share/v1', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const hashedToken = generateHash(token);
  const { ogMessageId, message, channelId, dmId } = req.body;

  res.json(messageShareV1(hashedToken, ogMessageId, message, channelId, dmId));
});

app.post('/message/sendlater/v1', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const hashedToken = generateHash(token);
  const { channelId, message, timeSent } = req.body;

  res.json(messageSendLaterV1(hashedToken, channelId, message, timeSent));
});

app.post('/message/sendlaterdm/v1', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const hashedToken = generateHash(token);
  const { dmId, message, timeSent } = req.body;

  res.json(messageSendLaterDmV1(hashedToken, dmId, message, timeSent));
});

// ========================================================================= //

// Dm

app.post('/dm/create/v2', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const hashedToken = generateHash(token);

  const { uIds } = req.body;

  res.json(dmCreateV2(hashedToken, uIds));
});

app.get('/dm/list/v2', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const hashedToken = generateHash(token);

  res.json(dmListV2(hashedToken));
});

app.delete('/dm/remove/v2', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const hashedToken = generateHash(token);

  const dmId = parseInt(req.query.dmId as string);

  res.json(dmRemoveV2(hashedToken, dmId));
});

app.get('/dm/details/v2', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const hashedToken = generateHash(token);

  const dmId = parseInt(req.query.dmId as string);

  res.json(dmDetailsV2(hashedToken, dmId));
});

app.post('/dm/leave/v2', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const hashedToken = generateHash(token);

  const { dmId } = req.body;

  res.json(dmLeaveV2(hashedToken, dmId));
});

app.get('/dm/messages/v2', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const hashedToken = generateHash(token);

  const dmId = parseInt(req.query.dmId as string);
  const start = parseInt(req.query.start as string);

  res.json(dmMessagesV2(hashedToken, dmId, start));
});

// ========================================================================= //

// Search

app.get('/search/v1', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const hashedToken = generateHash(token);

  const queryStr = req.query.queryStr as string;

  res.json(searchV1(hashedToken, queryStr));
});

// ========================================================================= //

// User

app.get('/user/profile/v3', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const hashedToken = generateHash(token);

  const uId = req.query.uId as string;

  res.json(userProfileV3(hashedToken, parseInt(uId)));
});

app.get('/users/all/v2', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const hashedToken = generateHash(token);

  res.json(usersAllV2(hashedToken));
});

app.put('/user/profile/setname/v2', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const hashedToken = generateHash(token);
  const { nameFirst, nameLast } = req.body;

  res.json(userProfileSetNameV2(hashedToken, nameFirst, nameLast));
});

app.put('/user/profile/setemail/v2', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const hashedToken = generateHash(token);
  const { email } = req.body;

  res.json(userProfileSetEmailV2(hashedToken, email));
});

app.put('/user/profile/sethandle/v2', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const hashedToken = generateHash(token);
  const { handleStr } = req.body;

  res.json(userProfileSetHandleV2(hashedToken, handleStr));
});

app.post(
  '/user/profile/uploadphoto/v1',
  (req: Request, res: Response, next) => {
    const token = req.header('token');
    const hashedToken = generateHash(token);
    const { imgUrl, xStart, yStart, xEnd, yEnd } = req.body;

    res.json(
      userProfileUploadPhotoV1(hashedToken, imgUrl, xStart, yStart, xEnd, yEnd)
    );
  }
);

app.use('/avatar', express.static('avatar'));
app.use('/default', express.static('default'));

// ========================================================================= //

// Admin

app.delete('/admin/user/remove/v1', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const hashedToken = generateHash(token);
  const uId = parseInt(req.query.uId as string);

  res.json(adminUserRemoveV1(hashedToken, uId));
});

app.post(
  '/admin/userpermission/change/v1',
  (req: Request, res: Response, next) => {
    const token = req.header('token');
    const hashedToken = generateHash(token);
    const { uId, permissionId } = req.body;

    res.json(adminUserPermissionChangeV1(hashedToken, uId, permissionId));
  }
);

// ========================================================================= //

// Notification

app.get('/notifications/get/v1', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const hashedToken = generateHash(token);

  res.json(getNotificationsV1(hashedToken));
});

// ========================================================================= //

// Standup

app.post('/standup/start/v1', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const hashedToken = generateHash(token);
  const { channelId, length } = req.body;

  res.json(standupStartV1(hashedToken, channelId, length));
});

app.get('/standup/active/v1', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const hashedToken = generateHash(token);
  const channelId = parseInt(req.query.channelId as string);

  res.json(standupActiveV1(hashedToken, channelId));
});

app.post('/standup/send/v1', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const hashedToken = generateHash(token);
  const { channelId, message } = req.body;

  res.json(standupSendV1(hashedToken, channelId, message));
});

// ========================================================================= //

// Clear

app.delete('/clear/v1', (req: Request, res: Response, next) => {
  res.json(clearV1());
});

// ========================================================================= //

// Keep this BENEATH route definitions
// handles errors nicely
app.use(errorHandler());

// ========================================================================= //

// start server
const server = app.listen(PORT, HOST, () => {
  reloadData();
  // DO NOT CHANGE THIS LINE
  console.log(`⚡️ Server started on port ${PORT} at ${HOST}`);
});

// For coverage, handle Ctrl+C gracefully
process.on('SIGINT', () => {
  server.close(() => console.log('Shutting down server gracefully.'));
});
