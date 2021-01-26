import React, { Component } from 'react'
import { Link, NavLink, Route, Switch } from 'react-router-dom'
import { GenericNotFoundPage } from './pages/ErrorPage'

import { LoadingScreen, ErrorScreen } from './components/Screen';
import MovieListPage from './pages/MovieListPage';
import MovieDetailsPage from './pages/MovieDetailsPage';
import UserListPage from './pages/UserListPage';
import UserDetailsPage from './pages/UserDetailsPage';
import PublicHomepage from './pages/PublicHomepage';

type EmptyProps = Record<string, never>
type EmptyState = Record<string, never>

class App extends Component<EmptyProps, EmptyState> {

  render(): React.ReactNode {
    return  <div className="d-flex flex-column">
              <header id="main-menu" className="navbar navbar-expand-lg navbar-dark bg-dark">
                <div className="container">
                  <Link to='/' className="navbar-brand">Movieweb</Link>
                  <button className="navbar-toggler collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#main-menu-collapse" aria-controls="main-menu-collapse" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                  </button>
                  <nav className="navbar-collapse collapse" id="main-menu-collapse">
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                      <li className="nav-item">
                        <NavLink to='/movies' className="nav-link" aria-current="page">Movies</NavLink>
                      </li>
                      <li className="nav-item">
                        <NavLink to='/users' className="nav-link" aria-current="page">Users</NavLink>
                      </li>
                    </ul>
                  </nav>
                </div>
              </header>
              <main className="pb-5 bg-light col">
              <Switch>
                <Route exact path='/' component={PublicHomepage} />
                <Route exact path='/movies' component={MovieListPage} />
                <Route exact path='/movies/:slug_id' component={MovieDetailsPage} />
                <Route exact path='/users' component={UserListPage} />
                {/* Key below is a quick fix for going from user page to another user page */}
                <Route exact key={location.pathname} path='/users/:login' component={UserDetailsPage} />
                <Route exact path='/loading' component={LoadingScreen} />
                <Route exact path='/error'>
                  <ErrorScreen className="bg-subtle" />
                </Route>
                <Route component={GenericNotFoundPage} />
              </Switch>
              </main>
              <footer className="text-muted py-5">
                <p className="container text-center my-0">
                  Copyright &copy; Movieweb 2021.
                </p>
              </footer>
            </div>
  }
}

export default App
