const express = require("express");
const bodyParser = require("body-parser");
const Pusher = require("pusher");
const cors = require("cors");
const Chatkit = require("@pusher/chatkit-server");
const randomId = require('random-id');

require("dotenv").config();

const rooms = [];
const users = [];

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

var pusher = new Pusher({
  appId: process.env.CHANNELS_APP_ID,
  key: process.env.CHANNELS_APP_KEY,
  secret: process.env.CHANNELS_APP_SECRET,
  cluster: process.env.CHANNELS_APP_CLUSTER
});

const chatkit = new Chatkit.default({
  instanceLocator: `v1:us1:${process.env.CHATKIT_INSTANCE_ID}`,
  key: process.env.CHATKIT_SECRET_KEY
});

const createUser = async (username) => {
  const existing_user = users.find(usr => usr.name == username);
  if (!existing_user) {
    const user_id = randomId(10);
    try {
      const user = await chatkit.createUser({
        id: user_id,
        name: username
      });

      users.push({
        id: user_id,
        name: username
      });
    } catch (err) {
      if (err.error === "services/chatkit/user_already_exists") {
        console.log("user already exists: ", err);
      } else {
        console.log("error occurred: ", err);
      }
    }
    return user_id;
  }
  return existing_user.id;
};

app.get("/", (req, res) => {
  res.send("all is well...");
});

app.post("/pusher/auth", (req, res) => {
  const socketId = req.body.socket_id;
  const channel = req.body.channel_name;
  var auth = pusher.authenticate(socketId, channel);
  return res.send(auth);
});


app.post("/login", async (req, res) => {
  const { room, username, action } = req.body;

  const existing_room = rooms.find(c => c.name === room);
  if (!existing_room) {

    const user_id = await createUser(username);
    if (action == 'share') {
      try {
        const created_room = await chatkit.createRoom({
          creatorId: user_id,
          name: room
        });

        rooms.push({
          id: created_room.id,
          name: room
        });

        return res.json({
          user_id,
          room_id: created_room.id.toString()
        });
      } catch (err) {
        console.log("error creating room: ", err);
      }
    }

  } else {
    const user_id = await createUser(username);

    return res.json({
      user_id,
      room_id: existing_room.id
    });
  }

  return res.status(500).send("invalid user");
});


var port = process.env.PORT || 5000;
app.listen(port);