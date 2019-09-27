import React, { useState } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import '../App.css';

const actions = [
  {
    id: 'share',
    label: 'Share Screen'
  },
  {
    id: 'view',
    label: 'View Screen'
  }
];

const Login = ({ history }) => {
  const [user, setLoginData] = useState({
    username: '',
    action: 'share',
    username_to_view: ''
  });

  return (
    <Container>
      <Row className="justify-content-md-center vertical-center">
        <Col xs="12" lg="3">
          <Form>
            <Form.Group controlId="username">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter username"
                value={user.username}
                onChange={(evt) => {
                  setLoginData({
                    username: evt.target.value,
                    action: user.action,
                    username_to_view: user.username_to_view
                  })
                }}
                autoFocus />
            </Form.Group>

            <Form.Label>What do you want to do?</Form.Label>
            {actions.map(opt => (
              <div key={`${opt.id}`} className="mb-3">
                <Form.Check
                  type={"radio"}
                  id={`${opt.id}`}
                  name={"action"}
                  label={`${opt.label}`}
                  onChange={evt => {
                    setLoginData({
                      username: user.username,
                      action: evt.target.id,
                      username_to_view: user.username_to_view
                    })
                  }}
                  checked={user.action == opt.id ? 'checked' : ''}
                />
              </div>
            ))}

            {
              user.action == 'view' &&
              <Form.Group controlId="username_to_view">
                <Form.Label>Username to view</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter username to view"
                  value={user.username_to_view}
                  onChange={(evt) => {
                    setLoginData({
                      username: user.username,
                      action: user.action,
                      username_to_view: evt.target.value
                    })
                  }}
                  autoFocus />
              </Form.Group>
            }

            <Button variant="primary" size="block" onClick={() => history.push('/main', user)}>
              Login
            </Button>
          </Form>

        </Col>
      </Row>

    </Container>
  );
}
//

export default Login;