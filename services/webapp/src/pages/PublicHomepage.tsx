import React, { Component } from 'react';
import { ArrowRightCircleFill } from 'react-bootstrap-icons';
import { Link } from 'react-router-dom';
import { AxiosResponse } from 'axios';
import { moviesApi, reviewsApi } from '../config';
import { SortDir, Movie, Review } from '../api/public/api';
import Carousel from '../components/Carousel';
import MovieCard from '../components/MovieCard';
import ReviewCard from '../components/ReviewCard';

type Props = Record<string, never>

type State = {
  latestMovies: Movie[],
  topRatedMovies: Movie[],
  mostPopularMovies: Movie[],
  recentReviews: Review[]
}

class PublicHomepage extends Component<Props, State> {

  state = {
    latestMovies: [],
    topRatedMovies: [],
    mostPopularMovies: [],
    recentReviews: []
  };

  constructor(props: Props) {
    super(props);

    // Latest
    moviesApi.getMovies(6, 0, "year", SortDir.Desc)
      .then((response: AxiosResponse<Movie[]>) => {
        this.setState({ latestMovies: response.data });
      });

    // Top rated
    moviesApi.getMovies(8, 0, "avg_rating", SortDir.Desc)
      .then((response: AxiosResponse<Movie[]>) => {
        this.setState({ topRatedMovies: response.data });
      });

    // Most popular
    moviesApi.getMovies(8, 0, "rating_count", SortDir.Desc)
      .then((response: AxiosResponse<Movie[]>) => {
        this.setState({ mostPopularMovies: response.data });
      });

    // Latest rating
    reviewsApi.getReviews(8, 0, 'created', SortDir.Desc)
      .then((response: AxiosResponse<Review[]>) => {
        this.setState({
          recentReviews: response.data
        });
      })
  }

  render(): React.ReactNode {
    const latest = this.state.latestMovies;
    const best = this.state.topRatedMovies;
    const mostPopular = this.state.mostPopularMovies;
    const recentReviews = this.state.recentReviews;
    return <div>
            <h1 className="visually-hidden">Movieweb</h1>
            <section className="bg-darker mb-5">
              <Carousel id="homepageCarousel" movies={latest} />
            </section>
            <section className="container">
              <h2 className="mb-4 heading-with-btn">
                Top rated
                <Link to="/movies" className="text-decoration-none">
                  <span className="badge badge-btn">All movies <ArrowRightCircleFill className="ms-2" color="#F0A96E" /></span>
                </Link>
              </h2>
              <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xxl-4 g-4 preview-grid">
                {best.map((movie: Movie) => {
                  return <div key={movie.id} className="col-sm">
                          <MovieCard movie={movie} />
                        </div>;
                })}
              </div>
              <h2 className="mt-5 mb-4">Latest reviews</h2>
              <div className="row row-cols-sm-1 row-cols-md-2 row-cols-lg-3 row-cols-xxl-4 g-4 preview-grid">
                {recentReviews.map((review: Review) => {
                  return <div key={review.id} className="col-sm">
                          <ReviewCard review={review} />
                        </div>;
                })}
              </div>
              <h2 className="mt-5 mb-4 heading-with-btn">
                Most popular
                <Link to="/movies" className="text-decoration-none">
                  <span className="badge badge-btn">All movies <ArrowRightCircleFill className="ms-2" color="#F0A96E" /></span>
                </Link>
              </h2>
              <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xxl-4 g-4 preview-grid">
                {mostPopular.map((movie: Movie) => {
                  return <div key={movie.id} className="col-sm">
                          <MovieCard movie={movie} />
                        </div>;
                })}
              </div>
            </section>
          </div>;
  }
}

export default PublicHomepage;
