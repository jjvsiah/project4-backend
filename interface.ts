export interface Notification {
  channelId: number;
  dmId: number;
  notificationMessage: string;
}

export interface User {
  uId: number;
  email: string | null;
  password: string | null;
  nameFirst: string;
  nameLast: string;
  handleStr: string | null;
  token: string[];
  resetCode: string | null;
  permissionId: number;
  notifications: Notification[];
  profileImgUrl: string | null;
}

export interface Member {
  uId: number;
  email: string;
  nameFirst: string;
  nameLast: string;
  handleStr: string;
  profileImgUrl: string | null;
}

export interface React {
  reactId: number;
  uIds: number[];
  isThisUserReacted: boolean;
}

export interface Message {
  messageId: number;
  uId: number;
  channelId: number;
  dmId: number;
  message: string;
  timeSent: number;
  reacts: React[];
  isPinned: boolean;
}

export interface Standup {
  ownerId: number;
  isActive: boolean;
  timeFinish: number;
  queue: string[];
}

export interface Channel {
  ownersId: number[];
  channelId: number;
  name: string;
  isPublic: boolean;
  members: Member[];
  standup: Standup | null;
}

export interface Dm {
  dmCreatorId: number;
  dmId: number;
  dmName: string;
  dmMembers: Member[];
}

export interface Data {
  globalOwnersId: number[];
  users: User[];
  channels: Channel[];
  messages: Message[];
  dms: Dm[];
}

export interface AuthLogin {
  token: string;
  authUserId: number;
}

export interface AuthRegister {
  token: string;
  authUserId: number;
}

export interface ChannelsList {
  channelId: number;
  name: string;
}

export interface Messages {
  messageId: number;
  uId: number;
  message: string;
  timeSent: number;
  reacts: React[];
  isPinned: boolean;
}

export interface ChannelMessages {
  messages: Messages[];
  start: number;
  end: number;
}

export interface ChannelDetails {
  name: string;
  isPublic: boolean;
  ownerMembers: Member[];
  allMembers: Member[];
}

export interface DmList {
  dmId: number;
  name: string;
}

export interface DmMessage {
  messageId: number;
  uId: number;
  message: string;
  timeSent: number;
  reacts: React[];
  isPinned: boolean;
}

export interface DmMessages {
  messages: DmMessage[];
  start: number;
  end: number;
}

export interface DmDetails {
  name: string;
  members: Member[];
}

export interface UserProfile {
  uId: number;
  email: string;
  nameFirst: string;
  nameLast: string;
  handleStr: string;
  profileImgUrl: string | null;
}

export interface StandupActive {
  isActive: boolean;
  timeFinish: number | null;
}
