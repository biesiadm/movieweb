import React, { Component } from 'react';
import { Star, StarFill } from 'react-bootstrap-icons';
import TimeAgo from 'react-timeago';
import { Review } from '../api/public/api';
import { BASE_URL } from '../config';
import { EmptyState } from '../utils';
import Avatar from './Avatar';
import Poster from './Poster';

type Props = {
  review: Review
}

class ReviewCard extends Component<Props, EmptyState> {

  constructor(props: Props) {
    super(props);
    this.render.bind(this);
  }

  render(): React.ReactNode {
    const review = this.props.review;

    const filledStars = [];
    const emptyStars = [];
    for (let i=0; i<review.rating; i++) {
        filledStars.push(<StarFill key={`star-${i}`} color="#F0A96E" size="1.22em" className="mb-1" />);
    }
    for (let i=review.rating; i<10; i++) {
        emptyStars.push(<Star key={`star-${i}`} color="#F0A96E" size="1.22em" className="mb-1" />);
    }

    let optionalMovie = null;
    if (review.movie) {
      const movie = review.movie;
      const movieUrl = new URL(BASE_URL + '/movies/' + movie.slug + '-' + movie.id);
      optionalMovie = <div className="row g-2 px-0 border-bottom">
        <div className="col-3 col-md-4">
          <Poster movie={movie} url={movieUrl} />
        </div>
        <div className="col-9 col-md-8 d-flex flex-column justify-content-center py-3 px-3">
          <h3 className="fs-4 mb-0 d-inline">{movie.title}</h3>
          <small className="d-inline-block w-100 text-muted text-truncate">{movie.year}</small>
        </div>
      </div>;
    }

    let optionalUser = null;
    if (review.user) {
      const user = review.user;
      const profileUrl = new URL(BASE_URL + '/users/' + user.login);
      optionalUser = <div className="row g-2 pb-2 pt-2">
        <div className="col-3 col-sm-2 col-md-3">
          <Avatar url={profileUrl} user={user} className="px-0" />
        </div>
        <div className="col-9 col-sm-10 col-md-9 d-flex flex-column justify-content-center ps-2">
          <h3 className="fs-5 mb-0">{user.name}</h3>
          <small className="d-inline-block w-100 text-muted text-truncate">{user.login}</small>
        </div>
      </div>;
    }

    let optionalComment = null;
    if (review.comment) {
      optionalComment = <p className="mb-0">{review.comment}</p>;
    }

    return <div className="card shadow-sm overflow-hidden">
              {optionalMovie}
              <div className="px-4 pt-3 pb-4">
                {optionalUser}
                <div className="row g-2 align-items-center justify-content-start">
                  <span className="fs-3 col flex-grow-0">{review.rating}</span>
                  <div className="col">
                    {filledStars}
                    {emptyStars}
                  </div>
                </div>
                <p className="text-muted mb-0">
                  <small>
                    <TimeAgo date={review.created} />
                  </small>
                </p>
                {optionalComment}
              </div>
            </div>;
  }
}

export default ReviewCard;
