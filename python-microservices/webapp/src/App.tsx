import {Component} from 'react'
import {Route, Switch} from 'react-router-dom'

import NotFound from './components/NotFound';

class App extends Component<{}, {}> {

  render() {
    return <div className='app container'>
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
  }
}

export default App
