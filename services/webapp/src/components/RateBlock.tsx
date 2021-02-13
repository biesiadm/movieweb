import { AxiosResponse } from 'axios';
import React, { Component } from 'react';
import { Star, StarFill } from 'react-bootstrap-icons';
import { RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';
import TimeAgo from 'react-timeago';
import { CreateReview, Movie, Review, User } from '../api/public';
import { reviewsApi } from '../config';
import { getLogInPath } from '../utils';

enum ReviewState {
  New = "NEW",
  Saving = "SAVING",
  Saved = "SAVED",
  Clearing = "CLEARING"
}

interface Props extends RouteComponentProps {
  className?: string,
  movie: Movie,
  user: User | null
}

type State = {
  state: ReviewState,
  hoveredStars: null | number,
  review: {
    rating: null | number,
    comment: null | string,
    created: null | string
  }
  reviewObject: Review | null
}

class RateBlock extends Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.hoverStars.bind(this);
    this.leaveStars.bind(this);
    this.handleCommentChange.bind(this);
    this.saveReview.bind(this);
    this.clearReview.bind(this);
    this.render.bind(this);

    if (props.movie.review) {
      const review = props.movie.review;
      this.state = {
        state: ReviewState.Saved,
        hoveredStars: null,
        review: {
          rating: review.rating,
          comment: review.comment || null,
          created: review.created
        },
        reviewObject: review
      }
    } else {
      this.state = {
        state: ReviewState.New,
        hoveredStars: null,
        review: {
          rating: null,
          comment: null,
          created: null
        },
        reviewObject: null
      }
    }
  }

  hoverStars(stars: number): void {
    if (this.state.state != ReviewState.New) {
      return;
    }

    this.setState({
      hoveredStars: stars
    })
  }

  setStars(stars: number): void {
    if (this.state.state != ReviewState.New) {
      return;
    }

    this.setState({
      review: {
        rating: stars,
        comment: this.state.review.comment,
        created: null
      }
    })
  }

  leaveStars():void {
    this.setState({
      hoveredStars: null
    })
  }

  handleCommentChange(event: React.ChangeEvent<HTMLTextAreaElement>):void {
    this.setState({
      review: {
        rating: this.state.review.rating,
        comment: event.target.value,
        created: null
      }
    });
  }

  saveReview():void {
    if (!this.props.user) {
      return;
    }

    this.setState({
      state: ReviewState.Saving,
      review: {
        rating: this.state.review.rating,
        comment: this.state.review.comment,
        created: (new Date()).toString()
      }
    })


    const create: CreateReview = {
      user_id: this.props.user.id,
      movie_id: this.props.movie.id,
      rating: this.state.review.rating!
    };
    if (this.state.review.comment) {
      create.comment = this.state.review.comment;
    }
    reviewsApi.addReview(create)
      .then((resp: AxiosResponse<Review>) => {
        const reviewObject: Review = resp.data;
        this.setState({
          state: ReviewState.Saved,
          review: {
            rating: reviewObject.rating,
            comment: reviewObject.comment || null,
            created: reviewObject.created
          },
          reviewObject: reviewObject
        })
      })
      .catch(() => {
        this.setState({
          state: ReviewState.New,
          review: {
            rating: this.state.review.rating,
            comment: this.state.review.comment,
            created: null
          }
        })
      });
  }

  clearReview():void {
    if (!this.state?.reviewObject?.id) {
      return;
    }

    this.setState({
      state: ReviewState.Clearing
    })

    reviewsApi.removeReview(this.state.reviewObject.id)
      .then(() => {
        this.setState({
          state: ReviewState.New,
          review: {
            rating: null,
            comment: null,
            created: null
          }
        })
      })
      .catch(() => {
        this.setState({
          state: ReviewState.Saved
        })
      });
  }

  render(): React.ReactNode {
    if (this.props.user) {
      return this.renderBlock();
    } else {
      return this.renderLogInRedirect();
    }
  }

  renderLogInRedirect(): React.ReactNode {
    let outerClasses = "rating-block bg-white";
    if (this.props.className) {
      outerClasses += " " + this.props.className;
    }

    const logInPath: string = getLogInPath(this.props.location);

    return <div className={outerClasses}>
            <div className="py-3 px-4 border-bottom d-flex align-items-center justify-content-between">
              <h4 className="my-2 d-flex align-items-center">
                Your rating
              </h4>
            </div>
            <div className="p-4 d-flex flex-column align-items-center">
              <p>Log in to rate movies!</p>
              <Link to={logInPath} className="btn btn-primary mb-2">Log in</Link>
            </div>
          </div>;
  }

  renderBlock(): React.ReactNode {
    const loading = [ReviewState.Saving, ReviewState.Clearing].includes(this.state.state);
    const review = this.state.review;

    let outerClasses = "rating-block bg-white";
    if (this.props.className) {
      outerClasses += " " + this.props.className;
    }

    let spinner = null;
    if (loading) {
      spinner = <div className="spinner-border text-muted" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>;
    }

    let saveButton = null;
    if (this.state.state == ReviewState.New && review.rating) {
      saveButton = <a className="btn btn-outline-secondary text-small" onClick={this.saveReview.bind(this)}>Save</a>;
    }

    let clearButton = null;
    if (this.state.state == ReviewState.Saved) {
      clearButton = <a className="btn btn-outline-secondary text-small" onClick={this.clearReview.bind(this)}>Clear</a>;
    }

    let rating = review.rating ? review.rating : 0;
    if (this.state.state == ReviewState.New && this.state.hoveredStars) {
      rating = this.state.hoveredStars;
    }
    const ratingLabel = (rating > 0 ? rating : "?");

    const emptyStars = [];
    for (let i=0; i<10; i++) {
      emptyStars.push(
        <div key={`star-${i}`}
          onClick={this.setStars.bind(this, i+1)}
          onMouseEnter={this.hoverStars.bind(this, i+1)}>
            <StarFill className="filled" />
            <Star className="empty" />
          </div>
      );
    }

    let commentSpace = null;
    if (this.state.state == ReviewState.New) {
      const value = review.comment ? review.comment : '';
      const changeHandler = this.handleCommentChange.bind(this);
      commentSpace = <div className="pt-2">
                      <textarea
                        value={value}
                        className="w-100 border-0"
                        placeholder="Add a comment..."
                        style={{ minHeight: "6rem" }}
                        onChange={e => changeHandler(e)} />
                    </div>;
    } else {
      let time = null;
      if (review.created) {
        time = <p className="text-muted mb-0">
                <small>
                  <TimeAgo date={review.created} />
                </small>
              </p>;
      }
      let comment = null;
      if (review.comment) {
        comment = <p className="mb-0">{review.comment}</p>;
      }
      commentSpace = <div className="pt-2">
          {time}
          {comment}
        </div>;
    }

    return <div className={outerClasses}>
            <div className="py-3 px-4 border-bottom d-flex align-items-center justify-content-between">
              <h4 className="my-2 d-flex align-items-center">
                Your rating
                {spinner}
              </h4>
              {clearButton}
              {saveButton}
            </div>
            <div className="p-4">
              <div className="row g-2 align-items-center justify-content-start">
                <span className="fs-2 col mt-0 rating-block-number">{ratingLabel}</span>
                <div className="col flex-grow-0 mt-0 d-flex rating-block-stars" data-rating={rating} onMouseLeave={this.leaveStars.bind(this)}>
                  {emptyStars}
                </div>
              </div>
              {commentSpace}
            </div>
          </div>;
  }
}

export default RateBlock;
