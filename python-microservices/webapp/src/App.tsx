import React, { Component } from 'react'
import { Route, Switch } from 'react-router-dom'
import { AxiosResponse } from 'axios'
import PublicAPI from './PublicAPI'
import { Movie } from './api-model/api'

import NotFound from './components/NotFound';

type AppProps = {
    movies: Movie[]
}

type EmptyState = Record<string, never>

class App extends Component<AppProps, EmptyState> {
  static defaultProps = {
    movies: []
  }

  constructor(props: AppProps) {
    super(props)

    // Make a sample call
    PublicAPI.readMoviesMoviesGet()
      .then((response: AxiosResponse<Movie[]>) => {
        console.log(response.data);
      })
      .catch((err: unknown) => {
        console.log(err);
      });
  }

  render(): React.ReactNode {
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
