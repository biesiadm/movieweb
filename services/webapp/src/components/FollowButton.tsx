import React, { Component } from 'react';
import { BinocularsFill } from 'react-bootstrap-icons';
import { User } from '../api/public/api';
import { usersApi } from '../config';
import { Emitter, Event } from '../events';

type Props = {
  className?: string,
  user: User,
  follower: User
}

type State = {
  following: boolean,
  loading: boolean
}

class FollowButton extends Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.handleClick.bind(this);
    this.tryFollow.bind(this);
    this.tryUnfollow.bind(this);
    this.render.bind(this);

    this.state = {
      following: false,
      loading: false
    }
  }

  handleClick(e: React.SyntheticEvent): void {
    e.preventDefault();

    if (this.state.following) {
      this.tryUnfollow();
    } else {
      this.tryFollow();
    }
  }

  tryFollow(): void {
    const user = this.props.user;
    const follower = this.props.follower;

    this.setState({
      loading: true
    });

    usersApi.addFollower(user.id, follower.id)
    .then(() => {
      this.setState({
        loading: false,
        following: true
      })
      Emitter.emit(Event.Follow, user, follower);
    })
    .catch(() => {
      this.setState({
        loading: false,
        following: false
      })
    })
  }

  tryUnfollow(): void {
    const user = this.props.user;
    const follower = this.props.follower;

    this.setState({
      loading: true
    });

    usersApi.removeFollower(user.id, follower.id)
    .then(() => {
      this.setState({
        loading: false,
        following: false
      })
      Emitter.emit(Event.Unfollow, user, follower);
    })
    .catch(() => {
      this.setState({
        loading: false,
        following: true
      })
    })
  }

  render(): React.ReactNode {
    const following = this.state.following;
    const loading = this.state.loading;

    let outerClasses = "follow-btn";
    if (following) {
      outerClasses += " following";
    }
    if (this.props.className) {
      outerClasses += " " + this.props.className;
    }

    let loadingSpinner = null;
    if (loading) {
      loadingSpinner = <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>;
    }

    const label = following ? "Following" : "Follow";
    return <a className={outerClasses} onClick={this.handleClick.bind(this)}>
            {label}
            <BinocularsFill className="ms-2 mb-1 me-1" />
            {loadingSpinner}
          </a>;
  }
}

export default FollowButton;
