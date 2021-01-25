import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Movie } from '../api/public/api';
import { BASE_URL } from '../config';
import Poster from './Poster';

type Props = {
  movie: Movie
}

type State = {
  details_url: URL
}

class MovieCard extends Component<Props, State> {

  constructor(props: Props) {
    super(props);

    this.computeState.bind(this);
    this.handleChange.bind(this);
    this.render.bind(this);

    this.state = this.computeState();
  }

  computeState = (): State => {
    const movie = this.props.movie;
    const details_url = new URL(BASE_URL + '/movies/' + movie.slug + '-' + movie.id);
    return {
      details_url: details_url
    };
  }

  // Update details URL when props change
  handleChange = (): void => {
    this.setState(this.computeState());
  };

  render(): React.ReactNode {
    const movie = this.props.movie;
    const url = this.state.details_url;
    return <div className="card shadow-sm overflow-hidden">
            <div className="row g-0">
              <div className="col-md-4">
                <Poster movie={movie} url={url} className="card-img-top" />
              </div>
              <div className="col-md-8">
                <div className="card-body">
                  <h5 className="card-title">{movie.title}</h5>
                  <h6 className="card-subtitle mb-2 text-muted">{movie.director}</h6>
                  <p className="card-text text-muted small mb-0">{movie.country}, {movie.year}</p>
                  <p className="card-text text-muted small"><Link to={url}>Details</Link></p>
                </div>
              </div>
            </div>
          </div>
  }
}

export default MovieCard;
