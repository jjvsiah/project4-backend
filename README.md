# COMP1531 Major Project

**✨ 🥜  UNSW Memes 🥜 ✨**

## Contents

[[_TOC_]]

## 0. Aims:

1. Demonstrate effective use of software development tools to build full-stack end-user applications.
2. Demonstrate effective use of static testing, dynamic testing, and user testing to validate and verify software systems.
3. Understand key characteristics of a functioning team in terms of understanding professional expectations, maintaining healthy relationships, and managing conflict.
4. Demonstrate an ability to analyse complex software systems in terms of their data model, state model, and more.
5. Understand the software engineering life cycle in the context of modern and iterative software development practices in order to elicit requirements, design systems thoughtfully, and implement software correctly.
6. Demonstrate an understanding of how to use version control and continuous integration to sustainably integrate code from multiple parties.

## 1. Overview

UNSW's revenue has been going down, despite the absolutely perfect MyExperience feedback.

Realising the bright potential of its students to recreate existing products they pay for, UNSW has tasked me (Hayden), and my army of COMP1531 students with recreating **<a href="https://www.microsoft.com/en-au/microsoft-teams/group-chat-software">Microsoft Teams</a>**.

The 22T3 cohort of COMP1531 students will build the **backend Javascript server** for a new communication platform, **UNSW Memes** (or just **Memes** for short). We plan to task future COMP6080 students to build the frontend for Memes, something you won't have to worry about.

**UNSW Memes** is the questionably-named communication tool that allows you to share, communicate, and collaborate virtually on a meme-like budget.

We have already specified a **common interface** for the frontend and backend to operate on. This allows both courses to go off and do their own development and testing under the assumption that both parties will comply with the common interface. This is the interface **you are required to use**.

The specific capabilities that need to be built for this project are described in the interface at the bottom. This is clearly a lot of features, but not all of them are to be implemented at once.

UNSW thanks you for doing your part in saving them approximately $100 per student, per year, despite making you pay for this course. 😊

(For legal reasons, this is a joke).

## 2. Iteration 0: Getting Started

Now complete!

## 3. Iteration 1: Basic Functionality and Tests

Now complete!

## 4. Iteration 2: Building a Web Server

Now complete!

## 5. Iteration 3: Completing the Lifecycle

Now complete!

## 6. Iteration 4: Extending Functionality
In iteration 4, you'll be working alone to implement:
* 2 additional functionalities (in the same format as iteration 3)
* Bonus features of your choice!

Your tutor is not required to provide any assistance with the bonus features section, as it's intended for high-achieving students.

You should create any new features using TypeScript, but you do not need to ensure the code produces no typechecking errors. 

If you wish to implement new bonus features that extend upon previous iteration’s functionality that is currently broken in your groups repo, please contact your tutor as assistance and advice will be handled on a case-by-case basis.

As a rough guide, if you would like high marks in this section you should expect to spend at least 20 hours on your bonus functionality (not including the 2 additional functionalities). 

**NOTE:** A brief explanation of your additions must be written in a file <code>extra.md</code>, please fill out the given template to ensure your tutor can mark your bonus features correctly.

Here are some suggestions for extra features. Depending on the complexity of your features chosen, you may choose to do multiple. If you come up with a new idea which is not one of the suggestions, you **MUST** get approval from your tutor before **Friday 10pm** of week 10.

1. **New Features** - Implement one or more of the features you have elicited in your Requirements & Design document from iteration 3.

2. Frontend - **Hangman on Frontend**

    * After a game of Hangman has been started, any user in the channel can type "/guess X" where X is an individual letter. If that letter is contained in the word or phrase they're trying to guess, the app should indicate where it occurs. If it does not occur, more of the hangman is drawn. 
    
    * There is a lot of flexibility in how you achieve this. It can be done only by modifying the backend and relying on messages to communicate the state of the game (e.g. after making a guess, the "Hangman" posts a message with a drawing of the hangman in ASCII/emoji art). Alternatively, you can modify the frontend, if you want to experiment with fancier graphics.

    * The app should use words and phrases from an external source, not just a small handful hardcoded into the app. One suitable source is `/usr/share/dict/words` available on Unix-based systems

    * Note that this part of the specification is deliberately open-ended. You're free to make your own creative choices in exactly how the game should work, as long as the end result is something that could be fairly described as Hangman.

3. Frontend - **Dark Mode** - Modify the frontend code so that on the flip of a switch in the navbar, the website can change to "dark mode" with a colour scheme of your choosing.

4. Frontend - **LaTEX / Markdown Support** - Modify the frontend code so that messages in channels and DMs can be rendered in LaTEX and/or Markdown.

5. **Databases** - Implementing persistence using a form of database via `typeorm` or other.

6. **Docker** - Dockerise this repo (backend) and the frontend repo, ensuring data is persistent. There is no need to deploy your project if this is successful.

7. **New Idea!** - Something you've thought of that doesn't fit into any of the suggestions above. Please email/talk to your tutor for approval on this first.

### 6.1 Your New Repo - What Has Changed?
At the start of iteration 4, you will be given a personal repository, which is a direct copy of your group's `master` branch. You will still be able to access your group repository, e.g. to view code on other branches, however you should NOT make any changes here (nor should you need to). 

Since this iteration is individual, you will be completing iteration 4 in this newly created, personal repo. Click [here](https://cgi.cse.unsw.edu.au/~cs1531/redirect/?path=COMP1531/23T1/students/_/iter4-project-backend) to access it.

In this iteration, you may approve your own merge requests after a self-review and a passing pipeline, since you are unable to share code with your peers for review. You can push directly to the `master` branch, however we recommend you continue to use merge requests as they are considered in the manual marking of iteration 4 (see [Git & Project Management](#-5.8.-Marking-Criteria)).

Any backend bonus features added do not need to work with the supplied frontend, i.e. editing the supplied frontend to integrate your new backend features is not necessary.

In addition, no specific marks will be awarded for linting or meet a minimum coverage checking requirement, however it is recommended you continue to use these tools as they will be considered in the manual style marking of iteration 4 (see [Code Quality](#-5.8.-Marking-Criteria)).

New code added in iteration 4 will be style marked, and any old code (from iteration 3 or earlier) will not impact this marking.

### 6.2 Video presentation
As part of the bonus features section of this iteration, you are required to film a 2 minute video demonstrating what you have created.

In this video, you should: 
* Explain what you have implemented and how it works
* Why you chose that feature
* Include a demonstration of it working/running successfully

We recommend submitting a screen-recording - it's a bonus if your face is in it! E.g. using <a href="https://www.canva.com/en_au/help/talking-presentations/">Canva's Present and record mode</a>.

You should upload your video to the <a href="https://flip.com/c6ba723b">COMP1531 Flipgrid</a>. Please login using Microsoft, with your zID email.

<img src="images/login.png" width="300">

When submitting a response to the 'Bonus Features' topic in Flipgrid, use the 'Upload Clip' button in the top right-hand corner of the recording screen to submit your own video. 

<img src="images/upload.png" width="200">

**NOTE:** Please add your zID in the caption section of the video upload process for marking purposes.

<img src="images/caption.png" width="500">

You should have received an email invite to join this Flipgrid group - you should select login with Microsoft and use your zID. If you have access troubles, please post on the forum.

### 6.3. Marking Criteria

<table>
  <tr>
    <th>Section</th>
    <th>Weighting</th>
    <th>Criteria</th>
  </tr>
  <tr>
    <td>Automarking (Testing & Implementation)</td>
    <td>25%</td>
    <td><ul>
      <li>Correct implementation of specified functions</li>
      <li>Correctly written tests based on the specification requirements</li>
    </ul></td>
  </tr>
  <tr>
    <td>Bonus features</td>
    <td>60%</td>
    <td><ul>
      <li>Features chosen demonstrate adequate technical difficulty (at least 20 hours of work)</li>
      <li>Bonus featues are creative and are not decided as a group but worked on independently</li>
      <li>Features chosen are relevant to software engineering concepts and theory learnt in the course</li>
      <li>Engaging presentation of bonus features, within the 2 minute time limit</li>
    </ul></td>
  </tr>
  <tr>
    <td>Code Quality</td>
    <td>10%</td>
    <td><ul>
      <li>Demonstrated an understanding of good test coverage (indepedent of `nyc` output)</li>
      <li>Demonstrated an understanding of the importance of <b>clarity</b> in communicating the purpose of tests and code</li>
      <li>Demonstrated an understanding of thoughtful test <b>design</b></li>
      <li>Appropriate use of Javascript data structures (arrays, objects, etc.)</li>
      <li>Appropriate style and documentation, as described in section 8.4</li>
      <li>Appropriate application of good software design practices</li>
    </ul>
  </td>
  </tr>
  <tr>
    <td>Git & Project Management</td>
    <td>5%</td>
    <td><ul>
      <li>Meaningful and informative git commit names being used</li>
      <li>At least 2 merge requests into master made</li>
      <li>Use of issue board on GitLab or other approved tracking mechanism to manage tasks</li>
    </ul>
  </td>
  </tr>
</table>

The formula used for automarking in this iteration is:

`Mark = 40*i + 60*b`
(Mark equals 40% of `i` plus 60% of `b`)

Where:
 * `i` is the mark you receive for implementing the new iteration 4 features correctly.
 * `b` is the score you recieve for your bonus features, which are manual marked.

### 6.4. Submission

This iteration's due date described in section 7. Note there will be no demonstration for iteration 4.

## 7. Interface specifications

### 7.1. Input/Output types

#### 7.1.1. Iteration 0+ Input/Output Types
<table>
  <tr>
    <th>Variable name</th>
    <th>Type</th>
  </tr>
  <tr>
    <td>named exactly <b>email</b></td>
    <td>string</td>
  </tr>
  <tr>
    <td>has suffix <b>id</b></td>
    <td>integer</td>
  </tr>
  <tr>
    <td>contains substring <b>password</b></td>
    <td>string</td>
  </tr>
  <tr>
    <td>named exactly <b>message</b></td>
    <td>string</td>
  </tr>
  <tr>
    <td>named exactly <b>start</b></td>
    <td>integer</td>
  </tr>
  <tr>
    <td>contains substring <b>name</b></td>
    <td>string</td>
  </tr>
  <tr>
    <td>has prefix <b>is</b></td>
    <td>boolean</td>
  </tr>
</table>

#### 7.1.2. Iteration 1+ Input/Output Types

<table>
  <tr>
    <th>Variable name</th>
    <th>Type</th>
  </tr>
  <tr>
    <td>named exactly <b>email</b></td>
    <td>string</td>
  </tr>
  <tr>
    <td>has suffix <b>id</b></td>
    <td>integer</td>
  </tr>
  <tr>
    <td>named exactly <b>length</b></td>
    <td>integer</td>
  </tr>
  <tr>
    <td>named exactly <b>start</b></td>
    <td>integer</td>
  </tr>
  <tr>
    <td>contains substring <b>password</b></td>
    <td>string</td>
  </tr>
  <tr>
    <td>named exactly <b>message</b></td>
    <td>string</td>
  </tr>
  <tr>
    <td>contains substring <b>name</b></td>
    <td>string</td>
  </tr>
  <tr>
    <td>has prefix <b>is</b></td>
    <td>boolean</td>
  </tr>
  <tr>
    <td>has prefix <b>time</b></td>
    <td>integer (unix timestamp in seconds), <a href="https://stackoverflow.com/questions/9756120/how-do-i-get-a-utc-timestamp-in-javascript">[check this out]</a></td>
  </tr>
  <tr>
    <td>(outputs only) named exactly <b>messages</b></td>
    <td>Array of objects, where each object contains types { messageId, uId, message, timeSent }</td>
  </tr>
  <tr>
    <td>(outputs only) named exactly <b>channels</b></td>
    <td>Array of objects, where each object contains types { channelId, name }</td>
  </tr>
  <tr>
    <td>has suffix <b>Str</b></td>
    <td>string</td>
  </tr>
  <tr>
    <td>(outputs only) named exactly <b>user</b></td>
    <td>Object containing uId, email, nameFirst, nameLast, handleStr</td>
  </tr>
  <tr>
    <td>(outputs only) name ends in <b>members</b></td>
    <td>Array of objects, where each object contains types of <b>user</b></td>
  </tr>
  <tr>
    <td>(outputs only) named exactly <b>users</b></td>
    <td>Array of objects, where each object contains types of <b>user</b></td>
  </tr>
</table>

#### 7.1.4. Iteration 3+ Input/Output Types
<table>
  <tr>
    <th>Variable name</th>
    <th>Type</th>
  </tr>
  <tr>
    <td>contains substring <b>code</b></td>
    <td>string</td>
  </tr>
  <tr>
    <td>has suffix <b>Id</b></td>
    <td>integer</td>
  </tr>
  <tr>
    <td>has prefix <b>num</b></td>
    <td>integer</td>
  </tr>
  <tr>
    <td>has suffix <b>Rate</b></td>
    <td>float between 0 and 1 inclusive</td>
  </tr>
  <tr>
    <td>has suffix <b>End</b></td>
    <td>integer</td>
  </tr>
  <tr>
    <td>has suffix <b>Start</b></td>
    <td>integer</td>
  </tr>
  <tr>
    <td>has suffix <b>Url</b></td>
    <td>string</td>
  </tr>
  <tr>
    <td>(outputs only) name ends in <b>reacts</b></td>
    <td>Array of objects, where each object contains types { reactId, uIds, isThisUserReacted } where: 
      <ul>
        <li>reactId is the id of a react</li>
        <li>uIds is an array of user id's of people who've reacted for that react</li>
        <li>isThisUserReacted is whether or not the authorised user (user making the request) currently has one of the reacts to this message</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>(outputs only) named exactly <b>notifications</b></td>
    <td>Array of objects, where each object contains types { channelId, dmId, notificationMessage } where 
      <ul>
        <li>channelId is the id of the channel that the event happened in, and is <code>-1</code> if it is being sent to a DM</li>
        <li>dmId is the DM that the event happened in, and is <code>-1</code> if it is being sent to a channel</li>
        <li>notificationMessage is a string of the following format for each trigger action:</li>
        <ul>
          <li>tagged: "{User’s handle} tagged you in {channel/DM name}: {first 20 characters of the message}"</li>
          <li>reacted message: "{User’s handle} reacted to your message in {channel/DM name}"</li>
          <li>added to a channel/DM: "{User’s handle} added you to {channel/DM name}"</li>
        </ul>
      </ul>
    </td>
  </tr>
  <tr>
    <td>(Iteration 3+) (outputs only) named exactly <b>user</b></td>
    <td>Object containing uId, email, nameFirst, nameLast, handleStr, profileImgUrl</td>
  </tr>
  <tr>
    <td>(Iteration 3+) (outputs only) named exactly <b>messages</b></td>
    <td>Array of objects, where each object contains types { messageId, uId, message, timeSent, reacts, isPinned  }</td>
  </tr>
</table>

#### 7.1.5. Iteration 4 Input/Output Types
<table>
  <tr>
    <th>Variable name</th>
    <th>Type</th>
  </tr>
  <tr>
    <td>(outputs only) named exactly <b>userStats</b></td>
    <td> Object of shape {<br />
    &emsp;channelsJoined: [{numChannelsJoined, timeStamp}],<br/>
    &emsp;dmsJoined: [{numDmsJoined, timeStamp}], <br />
    &emsp;messagesSent: [{numMessagesSent, timeStamp}], <br />
    &emsp;involvementRate <br />
    }
    </td>
  </tr>
  <tr>
    <td>(outputs only) named exactly <b>workspaceStats</b></td>
    <td> Object of shape {<br />
    &emsp;channelsExist: [{numChannelsExist, timeStamp}], <br />
    &emsp;dmsExist: [{numDmsExist, timeStamp}], <br />
    &emsp;messagesExist: [{numMessagesExist, timeStamp}], <br />
    &emsp;utilizationRate <br />
    }
    </td>
  </tr>
</table>

### 7.2. Interface
#### 7.2.4. Iteration 4 Interface
All return values should be an object, with keys identically matching the names in the table below, along with their respective values.

**IMPORTANT NOTE**: All of the following routes require a `token` in their header. You should raise a `403 Error` when the `token` passed in is invalid.

<table>
  <tr>
    <th>Name & Description</th>
    <th>HTTP Method</th>
    <th style="width:18%">Data Types</th>
    <th style="width:32%">Exceptions</th>
  </tr>
  <tr>
    <td><code>user/stats/v1</code><br /><br />Fetches the required statistics about this user's use of UNSW Memes.</td>
    <td style="font-weight: bold; color: green;">GET</td>
    <td><b>Query Parameters:</b><br /><code>( )</code><br /><br /><b>Return type if no error:</b><br /><code>{ userStats }</code></td>
    <td>N/A</td>
  </tr>
  <tr>
    <td><code>users/stats/v1</code><br /><br />Fetches the required statistics about the workspace's use of UNSW Memes.</td>
    <td style="font-weight: bold; color: green;">GET</td>
    <td><b>Query Parameters:</b><br /><code>( )</code><br /><br /><b>Return type if no error:</b><br /><code>{ workspaceStats }</code></td>
    <td>N/A</td>
  </tr>
</table>

### 7.3. Valid email format
To check an email is valid, you may use the following package and function.

```javascript
import validator from 'validator';

validator.isEmail('foo@bar.com');
```
### 7.4. Testing
A common question asked throughout the project is usually "How can I test this?" or "Can I test this?". In any situation, most things can be tested thoroughly. However, some things can only be tested sparsely, and on some other rare occasions, some things can't be tested at all. A challenge of this project is for you to use your discretion to figure out what to test, and how much to test. Often, you can use the functions you've already written to test new functions in a black-box manner.

### 7.5. Permissions
There are TWO different types of permissions: global permissions and channel/DM-specific permissions. A user's primary permissions are their global permissions. Then the channel/DM permissions are layered on top.

* Global permissions
   1) Owners (permission ID 1), who can also modify other owners' permissions
   2) Members (permission ID 2), who do not have any special permissions
 * Channel/DM permissions
   1) Owners of the channel/DM
   2) Members of the channel/DM

Additional Rules:
* Global permissions
  * All Memes users are global members by default, except for the very first user who signs up, who is a global owner
* Channel permissions
  * A global owner has the same permissions as a channel owner in every channel they're part of. They do not become a channel owner unless explicitly added as one (by a channel owner, or themselves). Hence, if they are removed as a global owner (and are not a channel owner), they will no longer have those channel owner permissions.
* DM permissions
  * A global owner does NOT gain owner permissions in DMs they're part of. The only users with owner permissions in DMs are the original creators of each DM.

### 7.6. User Sessions
Iteration 2 introduces the concept of <b>sessions</b>. With sessions, when a user logs in or registers, they receive a "token" (think of it like a ticket to a concert). These tokens are stored on the web browser (something the frontend handles), and nearly every time that user wants to make a request to the server, they will pass this "token" as part of this request. In this way, the server is able to take this token, look at it (like checking a ticket), and figure out who the user is.

The difference between an <code>authUserId</code> and a <code>token</code> is that an <code>authUserId</code> is a permanent identifier of a user, whereas a new token is generated upon each new login for a user.

A token (to represent a session) for iteration 2 can be as simple a randomly generated number (converted to a string as per the interface specifications) and stored as one of many possible sessions against a specific user.

In this structure, this also means it's possible to "log out" a particular user's session without logging out other sessions. I.e. One user can log in on two different browser tabs, click logout on tab 1, but still functionally use the website on tab 2.

### 7.8. Working with the frontend
There is a SINGLE repository available for all students at https://gitlab.cse.unsw.edu.au/COMP1531/23T1/project-frontend. You can clone this frontend locally. If you'd like to modify the frontend repo (i.e. teach yourself some frontend), please FORK the repository (this includes for bonus features).

If you run the frontend at the same time as your express server is running on the backend, then you can power the frontend via your backend.

Please note: The frontend may have very slight inconsistencies with expected behaviour outlined in the specification. Our automarkers will be running against your compliance to the specification. The frontend is there for further testing and demonstration.

#### 7.8.1. Example implementation
A working example of the frontend can be used at https://comp1531frontend.gitlab.io/unswmemes. This is not a gospel implementation that dictates the required behaviour for all possible occurrences. Our implementation will make reasonable assumptions just as yours will, and they might be different, and that's fine. However, you may use this implementation as a guide for how your backend should behave in the case of ambiguities in the spec.

The data is reset occasionally, but you can use this link to play around and get a feel for how the application should behave.

#### 7.8.2. Error raising
Either a `400 (Bad Request)` or `403 (Forbidden)` is thrown when something goes wrong. A `400` error refers to issues with user input, whereas a `403` error refers to issues with authorisation. All of these cases are listed in the **Interface** table. If input implies that both errors should be thrown, throw a `403` error.

One exception is that even though it's not listed in the table, for all routes (except `auth/register`, `auth/login`, `auth/passwordreset/request` and `auth/passwordreset/reset`), a `403` error is thrown when the token passed in is invalid.

For errors to be appropriately raised on the frontend, they must be thrown as follows:

```javascript
if (true) { // condition here
    throw HTTPError(403, "description")
}
```

The quality of the descriptions will not be assessed, but you must modify your errors to this format.

There has also been a middleware handler added to your `server.ts` file to take care of errors encountered. The `middleware-http-errors`[https://www.npmjs.com/package/middleware-http-errors] package is custom-made for COMP1531 students, used as follows:

```javascript
app.use(errorHandler());
```

### 7.9. Secure Sessions & Passwords
Passwords must be stored in an **encrypted** form.

You must **hash** tokens in iteration 3, and pass them through a custom `token` HTTP Header (rather than passing them plainly as `GET/DELETE` parameters).

In this model, you will replace `token` query and body parameters with a `token` HTTP header when dealing with requests/routes only. You shouldn't remove `token` parameters from backend functions, as they must perform the validity checks.

You can access HTTP headers like so:
```javascript
const token = req.header('token');
```

A sample flow logging a user in might be as follows (other flows exist too):
1. Client makes a valid `auth/login` call
2. Server generates `token` and `hashOf(token+secret)`
3. Server returns the hash as the `token` value in the response's body.

A sample flow creating a channel might be as follows:
1. Client makes a valid `channel/create` call
2. Server gets `token` hash in th request's HTTP header
3. Server passes `token` hash to the relevant backend function to compare to the stored `token`, determining if it's a valid session.

**Why hash tokens?**
If we hash tokens (combined with a global secret) before storing them, and an attacker gets access to our backend of active sessions (i.e. our list of valid tokens), they won't be able to determine the client-side token (as they don't know the hash function or secret added to the token). 

**Why pass tokens as a HTTP header?**
Any query parameters (those used by `GET/DELETE` functions) can be read in plaintext by an eavesdropper spying on your HTTP requests. Hence, by passing an authentication token as a query parameter, we're allowing an attacker to intercept our request, steal our token and impersonate other users! On the other hand, HTTP headers are encrypted (as long as you use HTTPS protocol), meaning an eavesdropper won't be able to read token values.

While this safely protects sessions from server-side attacks (accessing our persistent data) and man-in-the-middle attacks (intercepting our HTTP requests), it doesn't protect against client-side attacks (stealing a token on the client-side, after the HTTP header has been decoded and received by the user). 

**You do not need to worry about mitigating client-side attacks**, but you can read more about industry-standard session management <a href="https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html#secure-attribute">here</a>.

### 7.10. Analytics
COMP6080 students have implemented analytics pages for users and for the Memes workspace on the frontend, and now these pages need data. Your task is to add backend functionality that keeps track of these metrics:

For users:
  * The number of channels the user is a part of
  * The number of DMs the user is a part of
  * The number of messages the user has sent
  * The user's involvement, as defined by this pseudocode: `sum(numChannelsJoined, numDmsJoined, numMsgsSent)/sum(numChannels, numDms, numMsgs)`. If the denominator is 0, involvement should be 0. If the involvement is greater than 1, it should be capped at 1.

For the Memes workspace:
  * The number of channels that exist currently
  * The number of DMs that exist currently
  * The number of messages that exist currently
  * The workspace's utilization, which is a ratio of the number of users who have joined at least one channel/DM to the current total number of users, as defined by this pseudocode: `numUsersWhoHaveJoinedAtLeastOneChannelOrDm / numUsers`

As UNSW is very interested in its users' engagement, the analytics must be **time-series data**. This means every change to the above metrics (excluding `involvementRate` and `utilizationRate`) must be timestamped, rather than just the most recent change. For users, the first data point should be 0 for all metrics at the time that their account was created. Similarly, for the workspace, the first data point should be 0 for all metrics at the time that the first user registers. The first element in each array should be the first metric. The latest metric should be the last element in the array.

For users, the number of channels and DMs that they are a part of can increase and decrease over time, however the number of messages sent will only increase (the removal of messages does not affect it).

For the workspace, `numMsgs` is the number of messages that exist at the current time, and should decrease when messages are removed, or when `dm/remove` is called. Messages which have not been sent yet with `message/sendlater` or `message/sendlaterdm` are not included, and `standup/send` messages only count when the final packaged standup message from `standup/start` has been sent. `numChannels` will never decrease as there is no way to remove channels, and `numDms` will only decrease when `dm/remove` is called.

In addition to keeping track of these metrics, you are required to implement two new endpoints, `user/stats` and `users/stats`.

## 8. Due Dates and Weightings

| Iteration | Due date                               | Demonstration to tutor(s)     | Assessment weighting (%) |
| --------- | -------------------------------------- | ----------------------------- | ------------------------ |
| 0         | 10pm Friday 24th February (**week 2**) | No demonstration              | 5% of project mark       |
| 1         | 10pm Friday 10th March  (**week 4**)   | In YOUR **week 5** laboratory | 30% of project mark      |
| 2         | 10pm Friday 31st March (**week 7**)    | In YOUR **week 8** laboratory | 35% of project mark      |
| 3         | 10pm Monday 17th April (**week 10**)   | No demonstration              | 30% of project mark      |
| 4         | 10pm Friday 28th April (**week 11**)   | Video presentation            | 30% of course mark       |

### 8.1. Submission & Late Penalties

There is no late penalty, as we do not accept late submissions. You will be assessed on the most recent version of your work at the due date and time.

To submit your work, open up a CSE terminal and run:

` $ 1531 submit [iteration] [zID]`

For example:

` $ 1531 submit iteration1 z5555555`

This will submit a copy of your latest git commit to our systems for automarking. 

NOTE: Our automarking will be run on your master branch at the time of submission, the `1531 submit` command is for record-keeping purposes only.

If the deadline is approaching and you have features that are either untested or failing their tests, **DO NOT MERGE IN THOSE MERGE REQUESTS**. In some cases, your tutor will look at unmerged branches and may allocate some reduced marks for incomplete functionality, but `master` should only contain working code.

Minor isolated fixes are not allowed for iteration 4.

## 9. Individual Contribution
Iteration 4 is marked individually, there is no group contribution mark for this iteration.

### 9.1. Project check-in
There is no group check-in for iteration 4.

You will instead have an individual check-in with your tutor (5-10min) where you discuss your choice of bonus feature(s), if any. Remember, your tutor must approve bonus features that aren't from the suggested list in section 6.

### 9.2. Tutorial contributions
From weeks 2 onward, your individual project mark may be reduced if you do not satisfy the following:
* Attend all tutorials
* Participate in tutorials by asking questions and offering answers
* [online only] Have your web cam on for the duration of the tutorial and lab

We're comfortable with you missing or disengaging with 1 tutorial per term, but for anything more than that please email your tutor. If you cannot meet one of the above criteria, you will likely be directed to special consideration.

These are easy marks. They are marks assumed that you will receive automatically, and are yours to lose if you neglect them.

### 9.3. Documentation contribution
In terms of code documentation, your functions such as `authRegister`, `channelInvite`, `userProfile`, etc. are required to contain comments in JSDoc format, including paramters and return values:

```javascript
/**
  * <Brief description of what the function does>
  * 
  * @param {data type} name - description of paramter
  * @param {data type} name - description of parameter
  * ...
  * 
  * @returns {data type} - description of condition for return
  * @returns {data type} - description of condition for return
*/
```

In each iteration you will be assessed on ensuring that every relevant function in the specification is appropriately documented.

## 10. Automarking & Leaderboard
### 10.1. Automarking

Each iteration consists of an automarking component. The particular formula used to calculate this mark is specific to the iteration (and detailed above).

When running your code or tests as part of the automarking, we place a 2.5 minute timer on the running of your tests. This is more than enough time to complete everything unless you're doing something very wrong or silly with your code. As long as your tests take under 2.5 minutes to run on the pipeline, you don't have to worry about it potentially taking longer when we run automarking.

### 10.2. Leaderboard
There will be no leaderboard in iteration 4.

## 11. Plagiarism

The work you and your group submit must be your own work. Submission of work partially or completely derived from any other person or jointly written with any other person is not permitted. The penalties for such an offence may include negative marks, automatic failure of the course and possibly other academic discipline. Assignment submissions will be examined both automatically and manually for such submissions.

Relevant scholarship authorities will be informed if students holding scholarships are involved in an incident of plagiarism or other misconduct.

Do not provide or show your project work to any other person, except for your group and the teaching staff of COMP1531. If you knowingly provide or show your assignment work to another person for any reason, and work derived from it is submitted, you may be penalized, even if the work was submitted without your knowledge or consent. This may apply even if your work is submitted by a third party unknown to you.

Note: you will not be penalized if your work has the potential to be taken without your consent or knowledge.
