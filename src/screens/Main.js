import React, { Component } from 'react';
import axios from 'axios';
import Pusher from 'pusher-js';
import { ChatManager, TokenProvider } from '@pusher/chatkit-client';
import { Scrollbars } from 'react-custom-scrollbars';

import ReactPlayer from 'react-player'
import Peer from 'simple-peer';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

import MessageBox from '../components/MessageBox';

const CHATKIT_INSTANCE_ID = process.env.REACT_APP_CHATKIT_INSTANCE_ID;
const CHATKIT_TOKEN_PROVIDER = new TokenProvider({
  url: `https://us1.pusherplatform.io/services/chatkit_token_provider/v1/${CHATKIT_INSTANCE_ID}/token`,
});

const BASE_URL = "YOUR NGROK HTTPS URL";

const CHANNELS_APP_KEY = process.env.REACT_APP_PUSHER_APP_KEY;
const CHANNELS_APP_CLUSTER = process.env.REACT_APP_PUSHER_APP_CLUSTER;

const ice_server_config = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:global.stun.twilio.com:3478?transport=udp" }
  ]
};

class Main extends Component {

  state = {
    has_video: false,
    video_src: null,
    is_sharing: false,
    message: '',
    messages: []
  }


  constructor(props) {
    super(props);
    this.pusher = null;
    this.host_channel = null;

    this.user_channels = [];
    this.peers = [];
    this.is_initiator = false;
    this.stream = null;
  }


  onMessage = async (data) => {
    const { message } = await this._getMessage(data);

    await this.setState(prevState => ({
      messages: [...prevState.messages, message]
    }));

    setTimeout(() => {
      this.scrollComponent.scrollToBottom();
    }, 1000);

  }


  async componentDidMount() {
    const { action, username, username_to_view } = this.props.location.state;
    const room = (action == 'view') ? `room-${username_to_view}` : `room-${username}`;

    this.pusher = new Pusher(CHANNELS_APP_KEY, {
      authEndpoint: `${BASE_URL}/pusher/auth`,
      cluster: CHANNELS_APP_CLUSTER,
      encrypted: true
    });

    try {
      const { data } = await axios.post(`${BASE_URL}/login`, {
        room,
        username,
        action
      });

      this.chatkit_user_id = data.user_id;
      this.chatkit_room_id = data.room_id;

      const chatManager = new ChatManager({
        instanceLocator: `v1:us1:${CHATKIT_INSTANCE_ID}`,
        userId: this.chatkit_user_id,
        tokenProvider: CHATKIT_TOKEN_PROVIDER
      });

      let currentUser = await chatManager.connect();
      this.currentUser = currentUser;

      await this.currentUser.subscribeToRoomMultipart({
        roomId: this.chatkit_room_id,
        hooks: {
          onMessage: this.onMessage
        },
        messageLimit: 10
      });

    } catch (err) {
      console.log("chatkit error: ", err);
    }

    this.is_initiator = (action === 'share') ? true : false;

    if (action === 'view') {
      this._initializePeerConnection(username_to_view);

      const my_channel = this.pusher.subscribe(`private-user-${username}`);

      my_channel.bind("pusher:subscription_succeeded", (status) => {
        my_channel.bind('client-peer-data', (data) => {
          const user = this.peers.find(item => {
            return item.username === data.username;
          });

          if (user && data) {
            user.peer.signal(JSON.parse(data.peer_data));
          }
        });

        my_channel.bind('client-stream-ended', ({ username }) => {
          alert(`${username}'s stream has ended.`);
          this.props.history.goBack();
        });
      });
    }
  }



  _getMessage = async ({ id, sender, parts, createdAt }) => {
    const text_parts = parts.filter(part => part.partType === 'inline');

    const msg_data = {
      _id: id,
      text: text_parts[0].payload.content,
      createdAt: new Date(createdAt),
      user: {
        _id: sender.id.toString(),
        name: sender.name
      }
    }

    return {
      message: msg_data
    }
  }


  render() {
    const { is_sharing, has_video, video_src, message } = this.state;
    const { action, username, username_to_view } = this.props.location.state;

    return (
      <Container>
        <Row className="justify-content-md-center vertical-center">
          <Col xs="12" lg="7">
            {
              action === 'share' &&
              <div>
                {
                  !is_sharing === true &&
                  <Button variant="primary" size="lg" block onClick={this._startScreenShare}>
                    Start Sharing
                  </Button>
                }
              </div>
            }

            {
              action === 'view' &&
              <div>
                Viewing: {username_to_view}
              </div>
            }

            <div className="video-wrapper">
              {
                has_video &&
                <ReactPlayer url={video_src} playing />
              }
            </div>
          </Col>
        </Row>
        <Row className="justify-content-md-center">
          <Col xs="12" lg="7">

            <Scrollbars
              style={{ height: 500 }}
              ref={c => {
                this.scrollComponent = c;
              }}
              autoHide={true}
            >
              <div>{this._renderMessages()}</div>
            </Scrollbars>
          </Col>
        </Row>

        <Row className="justify-content-md-center">
          <Col xs="12" lg="5">

            <Form.Group controlId="message">
              <Form.Control
                type="text"
                placeholder="Enter message"
                value={message}
                onChange={(evt) => this.setState({ message: evt.target.value })}
                autoFocus />
            </Form.Group>
          </Col>
          <Col xs="12" lg="2">
            <Button variant="primary" onClick={this._sendMessage}>Send</Button>
          </Col>
        </Row>
      </Container>
    );
  }
  //

  _renderMessages = () => {
    return this.state.messages.map(msg => {
      return (
        <MessageBox key={msg._id} msg={msg} />
      );
      //
    });
  }


  _startScreenShare = async () => {
    const { action, username, username_to_view } = this.props.location.state;

    window.getScreenId((error, sourceId, screen_constraints) => {
      navigator.getUserMedia = navigator.mozGetUserMedia || navigator.webkitGetUserMedia;
      navigator.getUserMedia(screen_constraints, (stream) => {

        this.stream = stream;
        this.stream.getVideoTracks()[0].onended = () => {

          this.user_channels.forEach((user) => {
            user.channel.trigger("client-stream-ended", {
              username: username
            });
          });

          this.props.history.goBack();
        }

        this.setState({
          is_sharing: true,
          has_video: true,
          video_src: stream
        });

      }, (error) => {
        console.error(error);
      });
    });


    const peer_options = {
      initiator: true,
      trickle: false,
      config: ice_server_config
    }

    const p = new Peer(peer_options);

    p.on("signal", data => {
      if (data) {
        this.signal = JSON.stringify(data);
      }
    });

    p.on("connect", () => {
      console.log("CONNECTED!");
    });


    this.host_channel = this.pusher.subscribe(`private-user-${username}`);

    this.host_channel.bind("pusher:subscription_succeeded", (status) => {

      this.host_channel.bind("client-initiate-signaling", (data) => {
        this._createPeer(data.username);
        const viewers_channel = this.pusher.subscribe(
          `private-user-${data.username}`
        );

        this.user_channels.push({
          username: data.username,
          channel: viewers_channel
        });

        viewers_channel.bind("pusher:subscription_succeeded", () => {
          setTimeout(() => {
            if (this.signal) {
              viewers_channel.trigger("client-peer-data", {
                username: username,
                peer_data: this.signal
              });
            }
          }, 5000);
        });
      });

      this.host_channel.bind('client-peer-data', (data) => {
        const user = this.peers.find(item => {
          return item.username === data.username;
        });

        if (user && data) {
          user.peer.signal(JSON.parse(data.peer_data));
        }
      });

    });

  }


  _createPeer = username => {
    if (this.is_initiator) {
      this._connectToPeer(username, this.stream);
    } else {
      this._connectToPeer(username);
    }
  }


  _connectToPeer = (username, stream = false) => {
    const current_user = this.props.location.state;
    let peer_options = {
      initiator: this.is_initiator,
      trickle: false,
      config: ice_server_config
    };

    if (stream) {
      peer_options.stream = stream;
    }

    const p = new Peer(peer_options);

    this.peers.push({
      username: username,
      peer: p
    });

    p.on("signal", data => {
      if (this.is_initiator && data) {
        this.signal = JSON.stringify(data);
      } else {
        const peer = this.user_channels.find(ch => {
          return ch.username === this.peer_username;
        });

        if (peer) {
          peer.channel.trigger("client-peer-data", {
            username: current_user.username,
            peer_data: JSON.stringify(data)
          });
        }
      }
    });

    p.on("connect", () => {
      console.log("CONNECTED!");
    });

    p.on("stream", (stream) => {
      this.setState({
        has_video: true,
        video_src: stream
      });
    });
  }


  _initializePeerConnection = username => {
    const current_user = this.props.location.state;

    const channel = this.pusher.subscribe(`private-user-${username}`);
    this.user_channels.push({
      username,
      channel
    });

    channel.bind("pusher:subscription_succeeded", () => {
      this._createPeer(username);
      this.peer_username = username;

      setTimeout(() => {
        channel.trigger("client-initiate-signaling", {
          username: current_user.username
        });
      }, 5000);
    });
  }


  _sendMessage = () => {
    this.currentUser.sendSimpleMessage({
      text: this.state.message,
      roomId: this.chatkit_room_id
    });

    this.setState({
      message: ''
    });
  }

}

export default Main;