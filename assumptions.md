# Assumptions

> Assumptions with asteriks are intended to be marked

## channels.js: channelsCreateV1

- When a new channel is created, the user `authUserId` in `channelsCreateV1` is automatically assigned as the owner of that channel.\*\*
- It is assumed that channel names may not be unique but the channelId for each channel is unique. Therefore, the channelName alone cannot be used as a unique identifier for a channel, and it is necessary to use the channelId to retrieve specific channels.\*\*

## channel.js: channelMessagesV1

- Assume start cannot be positive, and start must intially start at 0.\*\*
- Assume the end index is exclusive. Suppose we have 52 messages and we have start index at 0, then our end index would be 50. Then, the function will show messages from index 0 to 49.\*\*

## user.js: userProfileV1

- Assume that `authUserId` and `uId` can have the same value, indicating that the authorized user is accessing their own profile. \*\*

## channel.js: channelInviteV1

- Assume that authUserId and uId can not have the same value, indicating that the authorized user cannot invitetheir own profile. \*\*
