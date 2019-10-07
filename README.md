# ReactScreenshareWebRTC
A screensharing app built with React, Simple Peer, Channels, and Chatkit.

The app has the following features:

- Screensharing (Google Chrome only)
- Group chat

### Prerequisites

-   React development environment
-   [Node.js](https://nodejs.org/en/)
-   [Yarn](https://yarnpkg.com/en/)
-   [Chatkit app instance](https://pusher.com/chatkit)
-   [Channels app instance](https://pusher.com/channels)
-   [ngrok account](https://ngrok.com/)
-   [Screen Capturing Chrome extension](https://chrome.google.com/webstore/detail/screen-capturing/ajhifddimkapgcifgcodmmfdlknahffk)

## Getting Started

1.  Clone the repo:

```
git clone https://github.com/anchetaWern/ReactScreenshareWebRTC.git
cd ReactScreenshareWebRTC
```

2. Install the dependencies:

```
yarn install
cd server
yarn install
```

3. Update the `.env` and `server/.env` file:

```
REACT_APP_PUSHER_APP_KEY="YOUR CHANNELS APP KEY"
REACT_APP_PUSHER_APP_CLUSTER="YOUR CHANNELS APP CLUSTER"
REACT_APP_CHATKIT_INSTANCE_ID="YOUR CHATKIT INSTANCE LOCATOR ID (without the v1:us1:)"
```

```
CHANNELS_APP_ID="YOUR CHANNELS APP ID"
CHANNELS_APP_KEY="YOUR CHANNELS APP KEY"
CHANNELS_APP_SECRET="YOUR CHANNELS APP SECRET"
CHANNELS_APP_CLUSTER="YOUR CHANNELS APP CLUSTER"
    
CHATKIT_INSTANCE_ID="YOUR CHATKIT INSTANCE LOCATOR ID (without the v1:us1:)"
CHATKIT_SECRET_KEY="YOUR CHATKIT SECRET KEY"
```

4. Run the server:

```
node server/server.js
```

5. Update `src/screens/Main.js` file with your ngrok HTTPS URL:

```
const BASE_URL = "YOUR NGROK HTTPS URL";
```

6. Run the app:

```
npm start
```


## Built With

-   [React](https://reactjs.org/)
-   [Chatkit](https://pusher.com/chatkit)
-   [Channels](https://pusher.com/channels)
-   [Simple Peer](https://github.com/feross/simple-peer)
