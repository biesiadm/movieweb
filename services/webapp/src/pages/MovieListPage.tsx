import React, { Component } from 'react';
import { AxiosResponse } from 'axios'
import { moviesApi } from '../config'
import { Movie } from '../api/public/api'
import MovieCard from '../components/MovieCard'

type EmptyProps = Record<string, never>

type State = {
  movies: Movie[]
}

class MovieListPage extends Component<EmptyProps, State> {

  state = {
    movies: []
  };

  constructor(props: EmptyProps) {
    super(props);

    // Make a sample call
    moviesApi.getMovies()
      .then((response: AxiosResponse<Movie[]>) => {
        this.setState({ movies: response.data });
      })
      .catch((err: unknown) => {
        console.log(err);
      });
  }

  render(): React.ReactNode {
    const movies = this.state.movies;
    return <section className="container pt-5">
            <h1>Movies</h1>
            <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xxl-4 g-4 pt-3">
              {movies.map((movie: Movie) => {
                return <div key={movie.id} className="col-sm">
                        <MovieCard movie={movie} />
                      </div>;
              })}
            </div>
          </section>;
  }
}

export default MovieListPage;
