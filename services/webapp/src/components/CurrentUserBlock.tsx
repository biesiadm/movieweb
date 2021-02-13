import React, { Component } from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import { Link } from 'react-router-dom';
import { User } from '../api/public/api';
import { EmptyState, getLogInPath } from '../utils';

interface Props extends RouteComponentProps {
  user: User | null
}

class CurrentUserBlock extends Component<Props, EmptyState> {

  constructor(props: Props) {
    super(props);
    this.render.bind(this);
  }

  render(): React.ReactNode {
    const user = this.props.user;

    if (user) {
      const profileUrl = '/users/' + user.login;
      return <div className="flex-shrink-0 nav-item dropdown">
              <a href="#" className="nav-link dropdown-toggle text-white-50 px-0" id="userDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                <img src={user.avatar_url} className="rounded-pill ms-lg-5 me-2" alt="{user.name} avatar" style={{ 'width': '1.2rem', 'marginTop': '-0.2rem' }} />
                {user.name}
              </a>
              <ul className="dropdown-menu" aria-labelledby="userDropdown">
                <li><Link to={profileUrl} className="dropdown-item">Your profile</Link></li>
                <li><Link to="/logout" className="dropdown-item">Log out</Link></li>
              </ul>
            </div>;
    } else {
      const logInPath: string = getLogInPath(this.props.location);
      return <Link to={logInPath} className="btn btn-primary flex-shrink-0">Log in</Link>;
    }
  }
}

export default withRouter(CurrentUserBlock);
