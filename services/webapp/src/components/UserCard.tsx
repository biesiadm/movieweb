import React, { Component } from 'react';
import { User } from '../api/public/api';
import { BASE_URL } from '../config';
import { EmptyState } from '../utils';
import Avatar from './Avatar';

type Props = {
  user: User
}

class UserCard extends Component<Props, EmptyState> {

  render(): React.ReactNode {
    const user = this.props.user;
    const profileUrl = new URL(BASE_URL + '/users/' + user.login);
    return <div className="card shadow-sm overflow-hidden p-3">
            <div className="row g-2">
              <div className="col-3 col-sm-2 col-md-3">
                <Avatar url={profileUrl} user={user} className="px-0" />
              </div>
              <div className="col-9 col-sm-10 col-md-9 d-flex flex-column justify-content-center ps-2">
                <h3 className="fs-5 mb-0">{user.name}</h3>
                <small className="d-inline-block w-100 text-muted text-truncate">{user.login}</small>
              </div>
            </div>
          </div>
  }
}

export default UserCard;
