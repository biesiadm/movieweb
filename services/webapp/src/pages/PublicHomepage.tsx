import React, { Component } from 'react';
import { AxiosResponse } from 'axios';
import PublicAPI from '../PublicAPI';
import { Movie } from '../api/public/api';
import Carousel from '../components/Carousel';
import MovieCard from '../components/MovieCard';
import InfoScreen from '../components/Screen';

type Props = Record<string, never>

type State = {
  latestMovies: Movie[]
}

class PublicHomepage extends Component<Props, State> {

  state = {
    latestMovies: []
  };

  constructor(props: Props) {
    super(props);

    // Make a sample call
    PublicAPI.getMovies()
      .then((response: AxiosResponse<Movie[]>) => {
        this.setState({ latestMovies: response.data });
      })
      .catch((err: unknown) => {
        console.log(err);
      });
  }

  render(): React.ReactNode {
    const movies = this.state.latestMovies;
    return <div>
            <h1 className="visually-hidden">Movieweb</h1>
            <section className="bg-darker mb-5">
              <Carousel id="homepageCarousel" movies={movies} />
            </section>
            <section className="container">
              <h2 className="mb-4">Best movies</h2>
              <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xxl-4 g-4">
                {movies.map((movie: Movie) => {
                  return <div key={movie.id} className="col-sm">
                          <MovieCard movie={movie} />
                        </div>;
                })}
              </div>
              <h2 className="mt-5 mb-4">Latest ratings</h2>
              <InfoScreen className="bg-subtle h-100 py-0">
                User ratings block
              </InfoScreen>
            </section>
          </div>;
  }
}

export default PublicHomepage;
