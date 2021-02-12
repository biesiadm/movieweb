import React, { Component } from 'react';
import { ArrowRightCircleFill } from 'react-bootstrap-icons';
import { Link } from 'react-router-dom';
import { AxiosResponse } from 'axios';
import { moviesApi, reviewsApi, MovieListResponse } from '../config';
import { SortDir, Movie } from '../api/public/api';
import Carousel from '../components/Carousel';
import { MovieList, ReviewList } from '../components/EntryList';
import { EmptyProps } from '../utils';

type State = {
  latestMovies: Movie[]
}

class PublicHomepage extends Component<EmptyProps, State> {

  state = {
    latestMovies: []
  };

  constructor(props: EmptyProps) {
    super(props);

    // Latest
    moviesApi.getMovies(6, 0, "year", SortDir.Desc)
      .then((response: AxiosResponse<MovieListResponse>) => {
        this.setState({ latestMovies: response.data.movies });
      });
  }

  render(): React.ReactNode {
    const latestMovies = this.state.latestMovies;
    const topRatedPromise = () => moviesApi.getMovies(8, 0, "avg_rating", SortDir.Desc);
    const recentReviewsPromise = () => reviewsApi.getReviews(8, 0, 'created', SortDir.Desc);
    const mostPopularPromise = () => moviesApi.getMovies(8, 0, "rating_count", SortDir.Desc);
    return <div>
            <h1 className="visually-hidden">Movieweb</h1>
            <section className="bg-darker mb-5">
              <Carousel id="homepageCarousel" movies={latestMovies} />
            </section>
            <section className="container">
              <h2 className="mb-4 heading-with-btn">
                Top rated
                <Link to="/movies" className="text-decoration-none">
                  <span className="badge badge-btn">All movies <ArrowRightCircleFill className="ms-2" color="#F0A96E" /></span>
                </Link>
              </h2>
              <MovieList promise={topRatedPromise} className="preview-grid" />
              <h2 className="mt-5 mb-4">Latest reviews</h2>
              <ReviewList promise={recentReviewsPromise} className="preview-grid" />
              <h2 className="mt-5 mb-4 heading-with-btn">
                Most popular
                <Link to="/movies" className="text-decoration-none">
                  <span className="badge badge-btn">All movies <ArrowRightCircleFill className="ms-2" color="#F0A96E" /></span>
                </Link>
              </h2>
              <MovieList promise={mostPopularPromise} className="preview-grid" />
            </section>
          </div>;
  }
}

export default PublicHomepage;
