import React from 'react';

const MessageBox = ({ msg }) => {
  return (
    <div className="message-row">
      <div>
        <span className="sender">{msg.user.name}</span>: <span className="message">{msg.text}</span>
      </div>
    </div>
  );
}

export default MessageBox;