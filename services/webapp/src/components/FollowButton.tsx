import React, { Component } from 'react';
import { BinocularsFill } from 'react-bootstrap-icons';
import { User } from '../api/public/api';

type Props = {
  className?: string,
  user: User
}

type State = {
  following: boolean,
  loading: boolean
}

class FollowButton extends Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.handleClick.bind(this);
    this.render.bind(this);

    this.state = {
      following: false,
      loading: false
    }
  }

  handleClick(e: React.SyntheticEvent): void {
    e.preventDefault();

    this.setState({
      loading: true
    });

    new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, 500)
    })
    .then(() => {
      this.setState({
        loading: false,
        following: !this.state.following
      })
    });
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
