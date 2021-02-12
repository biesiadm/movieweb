import React, { Component } from 'react';
import { Link, NavLink, Route, RouteComponentProps, Switch } from 'react-router-dom';

import { EmptyProps } from './utils';
import { Emitter, Event } from './events';
import { User } from './api/public';
import CurrentUserBlock from './components/CurrentUserBlock';
import { GenericNotFoundPage } from './pages/ErrorPage';
import LoginPage from './pages/LoginPage';
import LogoutPage from './pages/LogoutPage';
import MovieListPage from './pages/MovieListPage';
import MovieDetailsPage from './pages/MovieDetailsPage';
import PublicHomepage from './pages/PublicHomepage';
import UserListPage from './pages/UserListPage';
import UserDetailsPage from './pages/UserDetailsPage';

type State = {
  user: User | null
}

class App extends Component<EmptyProps, State> {

  constructor(props: EmptyProps) {
    super(props);
    this.componentDidMount.bind(this);
    this.componentWillUnmount.bind(this);

    this.state = {
      user: null
    }
  }

  render(): React.ReactNode {
    return <Switch>
      <Route exact path='/login' component={LoginPage} />
      <Route exact path='/logout' component={LogoutPage} />
      <Route>
        {this.renderApp()}
      </Route>
    </Switch>;
  }

  componentDidMount() {
    // Load user from localStorage when loading page
    const userString = window.localStorage.getItem('currentUser');
    if (userString) {
      this.setState({
        user: JSON.parse(userString)
      });
    }

    // FIXME(kantoniak): Handle refresh tokens and sync localStorage

    Emitter.on(Event.LogIn, (user: User) => {
      window.localStorage.setItem('currentUser', JSON.stringify(user));
      this.setState({ user: user });
    });
    Emitter.on(Event.LogOut, (user: User) => {
      window.localStorage.removeItem('currentUser');
      this.setState({ user: null });
    });
  }

  componentWillUnmount() {
    Emitter.off(Event.LogIn);
    Emitter.off(Event.LogOut);
  }

  renderApp(): React.ReactNode {
    const user = this.state.user;
    return  <div className="d-flex flex-column">
              <header id="main-menu" className="navbar navbar-expand-lg navbar-dark bg-dark">
                <div className="container">
                  <Link to='/' className="navbar-brand">Movieweb</Link>
                  <button className="navbar-toggler collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#main-menu-collapse" aria-controls="main-menu-collapse" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                  </button>
                  <nav className="collapse navbar-collapse" id="main-menu-collapse">
                    <ul className="navbar-nav me-auto">
                      <li className="nav-item">
                        <NavLink to='/movies' className="nav-link" aria-current="page">Movies</NavLink>
                      </li>
                      <li className="nav-item">
                        <NavLink to='/users' className="nav-link" aria-current="page">Users</NavLink>
                      </li>
                    </ul>
                    <CurrentUserBlock user={user} />
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
                <Route exact
                  key={location.pathname}
                  path='/users/:login'
                  render={(props: RouteComponentProps<{login: string}>) => <UserDetailsPage {...props} user={user}/>} />
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
