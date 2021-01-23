import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route } from 'react-router-dom';

import App from './App';

const router: JSX.Element =
  <Router>
    <Route component={App} />
  </Router>

ReactDOM.render(
  router,
  document.getElementsByTagName('body')[0]
)