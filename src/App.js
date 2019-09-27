import React from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import Login from './screens/Login';
import Main from './screens/Main';

const App = () => {
  return (
    <Router>
      <div>
        <Route path="/" exact component={Login} />
        <Route path="/main" exact component={Main} />
      </div>
    </Router>
  );
}
//

export default App;