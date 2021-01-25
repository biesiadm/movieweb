import React, { Component } from 'react';
import { AxiosResponse } from 'axios';
import PublicAPI from '../PublicAPI';
import { ArgSortDir, Movie } from '../api/public/api';
import Carousel from '../components/Carousel';
import MovieCard from '../components/MovieCard';
import InfoScreen from '../components/Screen';

type Props = Record<string, never>

type State = {
  latestMovies: Movie[],
  topRatedMovies: Movie[],
  mostPopularMovies: Movie[]
}

class PublicHomepage extends Component<Props, State> {

  state = {
    latestMovies: [],
    topRatedMovies: [],
    mostPopularMovies: []
  };

  constructor(props: Props) {
    super(props);

    // Latest
    PublicAPI.getMovies(6, 0, "year", ArgSortDir.Desc)
      .then((response: AxiosResponse<Movie[]>) => {
        this.setState({ latestMovies: response.data });
      });

    // Top rated
    PublicAPI.getMovies(8, 0, "avg_rating", ArgSortDir.Desc)
      .then((response: AxiosResponse<Movie[]>) => {
        this.setState({ topRatedMovies: response.data });
      });

    // Most popular
    PublicAPI.getMovies(8, 0, "rating_count", ArgSortDir.Desc)
      .then((response: AxiosResponse<Movie[]>) => {
        this.setState({ mostPopularMovies: response.data });
      });
  }

  render(): React.ReactNode {
    const latest = this.state.latestMovies;
    const best = this.state.topRatedMovies;
    const mostPopular = this.state.mostPopularMovies;
    return <div>
            <h1 className="visually-hidden">Movieweb</h1>
            <section className="bg-darker mb-5">
              <Carousel id="homepageCarousel" movies={latest} />
            </section>
            <section className="container">
              <h2 className="mb-4">Top rated</h2>
              <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xxl-4 g-4">
                {best.map((movie: Movie) => {
                  return <div key={movie.id} className="col-sm">
                          <MovieCard movie={movie} />
                        </div>;
                })}
              </div>
              <h2 className="mt-5 mb-4">Most popular</h2>
              <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xxl-4 g-4">
                {mostPopular.map((movie: Movie) => {
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
