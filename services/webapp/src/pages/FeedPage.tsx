import { AxiosPromise } from 'axios';
import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { User } from '../api/public';
import { ReviewList } from '../components/EntryList';
import { usersApi, ReviewListResponse } from '../config';

interface Props extends RouteComponentProps {
  user: User | null
}

type State = {
  initialPromise?: () => AxiosPromise<ReviewListResponse>,
};

class FeedPage extends Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.render.bind(this);
    this.state = {};
  }

  componentDidMount(): void {
    if (!this.props.user?.id) {
      this.props.history.push('/');
      return;
    }

    const user = this.props.user!;
    this.setState({
      initialPromise: () => usersApi.getUserReviewFeed(user.id, 8, 0)
    });
  }

  render(): React.ReactNode {
    const initialPromise = this.state.initialPromise;

    let reviewList = null;
    if (initialPromise) {
      reviewList = <ReviewList promise={initialPromise} />;
    }

    return <section className="container pt-4">
            <h2 className="mt-3 mb-4">Your updates</h2>
            {reviewList}
          </section>;
  }
}

export default FeedPage;
