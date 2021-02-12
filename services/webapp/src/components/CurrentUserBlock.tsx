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
      return <div className="flex-shrink-0">
              <p>Howdy, {user.name}!</p>
            </div>;
    } else {
      const logInPath: string = getLogInPath(this.props.location);
      return <Link to={logInPath} className="btn btn-primary flex-shrink-0">Log in</Link>;
    }
  }
}

export default withRouter(CurrentUserBlock);
