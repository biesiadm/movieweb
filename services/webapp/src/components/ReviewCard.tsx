import React, { Component } from 'react';
import { Star, StarFill } from 'react-bootstrap-icons';
import TimeAgo from 'react-timeago';
import { Review } from '../api/public/api';

type Props = {
  review: Review
}

type State = {
}

class ReviewCard extends Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.render.bind(this);
  }

  render(): React.ReactNode {
    const review = this.props.review;

    const filledStars = [];
    const emptyStars = [];
    for (let i=0; i<review.rating; i++) {
        filledStars.push(<StarFill color="#F0A96E" size="1.22em" className="mb-1" />);
    }
    for (let i=review.rating; i<10; i++) {
        emptyStars.push(<Star color="#F0A96E" size="1.22em" className="mb-1" />);
    }
    let optionalComment = null;
    if (review.comment) {
        optionalComment = <p className="mb-0">{review.comment}</p>;
    }

    return <div className="card shadow-sm overflow-hidden">
              <div className="px-4 py-3">
                {/* Optional user details go here */}
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
