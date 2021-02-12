import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { LoadingScreen } from '../components/Screen';
import { authApi } from '../config';
import { Emitter, UserEvent } from '../events';
import { EmptyState } from '../utils';

class LogoutPage extends Component<RouteComponentProps, EmptyState> {

  constructor(props: RouteComponentProps) {
    super(props);
    this.componentDidMount.bind(this);
    this.onSuccess.bind(this);
    this.render.bind(this);
  }

  componentDidMount(): void {
    authApi.logOut()
    .then(this.onSuccess)
    .catch(() => this.props.history.push('/'));
  }

  onSuccess(): void {
    Emitter.emit(UserEvent.LogOut);
    this.props.history.push('/');
  }

  render(): React.ReactNode {
    return <LoadingScreen message="Loading user..." />;
  }
}

export default LogoutPage;
