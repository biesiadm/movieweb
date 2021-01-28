import React, { Component } from 'react';
import { MovieList } from '../components/EntryList';
import { moviesApi } from '../config'

type EmptyProps = Record<string, never>
type EmptyState = Record<string, never>

class MovieListPage extends Component<EmptyProps, EmptyState> {

  render(): React.ReactNode {
    return <section className="container pt-5">
            <h1>Movies</h1>
            <MovieList promise={moviesApi.getMovies} className="pt-3" />
          </section>;
  }
}

export default MovieListPage;
