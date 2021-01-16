import React, { Component } from 'react'
import { Link, NavLink, Route, Switch } from 'react-router-dom'
import { AxiosResponse } from 'axios'
import PublicAPI from './PublicAPI'
import { Movie } from './api/public/api'
import MovieCard from './components/MovieCard'
import { GenericNotFoundPage } from './pages/ErrorPage'

type EmptyProps = Record<string, never>

type AppState = {
  movies: Movie[]
}

class App extends Component<EmptyProps, AppState> {

  constructor(props: EmptyProps) {
    super(props);
    this.state = {
      movies: []
    };

    // Make a sample call
    PublicAPI.moviesGet()
      .then((response: AxiosResponse<Movie[]>) => {
        this.setState({movies: response.data})
      })
      .catch((err: unknown) => {
        console.log(err);
      });
  }

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
                        <NavLink exact to='/' className="nav-link" aria-current="page">Home</NavLink>
                      </li>
                      <li className="nav-item">
                        <NavLink to='/movies' className="nav-link" aria-current="page">Movies</NavLink>
                      </li>
                      <li className="nav-item">
                        <NavLink to='/404' className="nav-link" aria-current="page">404</NavLink>
                      </li>
                    </ul>
                  </nav>
                </div>
              </header>
              <main className="py-5 bg-light col">
              <Switch>
                <Route exact path='/'>
                  <section className="container">
                    <h1>Movieweb</h1>
                  </section>
                </Route>
                <Route exact path='/movies'>
                  <section className="container">
                    <h1>Movies</h1>
                    <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xxl-4 g-4 pt-3">
                      {this.state.movies.map((movie, i) => {
                        return <div key={movie.id} className="col-sm">
                                <MovieCard movie={movie} />
                              </div>
                      })}
                    </div>
                  </section>
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
