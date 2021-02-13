import React, { Component } from 'react';
import { Star, StarFill } from 'react-bootstrap-icons';
import { RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';
import TimeAgo from 'react-timeago';
import { User } from '../api/public';
import { getLogInPath } from '../utils';

enum ReviewState {
  New = "NEW",
  Saving = "SAVING",
  Saved = "SAVED",
  Clearing = "CLEARING"
}

interface Props extends RouteComponentProps {
  className?: string,
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

    this.state = {
      state: ReviewState.New,
      hoveredStars: null,
      review: {
        rating: null,
        comment: null,
        created: null
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
    this.setState({
      state: ReviewState.Saving,
      review: {
        rating: this.state.review.rating,
        comment: this.state.review.comment,
        created: (new Date()).toString()
      }
    })

    new Promise((resolve) => {
      setTimeout(() => {
        resolve(null);
      }, 1000)
    })
    .then(() => {
      this.setState({
        state: ReviewState.Saved
      })
    });
  }

  clearReview():void {
    this.setState({
      state: ReviewState.Clearing
    })

    new Promise((resolve) => {
      setTimeout(() => {
        resolve(null);
      }, 1000)
    })
    .then(() => {
      this.setState({
        state: ReviewState.New,
        review: {
          rating: null,
          comment: null,
          created: null
        }
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
