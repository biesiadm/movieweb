import React, {Component} from 'react'
import {Route, Switch} from 'react-router-dom'
import axios from 'axios'

import NotFound from './components/NotFound';

class App extends Component {
  constructor (props) {
    super(props)
    this.state = {}
  }

  render() {
    return (
      <div className='App container'>
        <Switch>
          <Route exact path='/'>
            <div className="container text-center">
              <h1>Movieweb</h1>
            </div>
          </Route>
          <Route>
            <NotFound />
          </Route>
        </Switch>
      </div>
    )
  }
}

export default App
