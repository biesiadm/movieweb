import { AxiosResponse } from 'axios';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { User } from '../api/public';
import { authApi } from '../config';

enum LogInState {
  Clear = "CLEAR",
  Loading = "LOADING",
  Error = "ERROR"
}

type State = {
  state: LogInState,
  email: string,
  password: string,
  error: string | null
}

class LoginPage extends Component<RouteComponentProps, State> {

  constructor(props: RouteComponentProps) {
    super(props);
    this.onSuccess.bind(this);
    this.render.bind(this);

    this.state = {
      state: LogInState.Clear,
      email: '',
      password: '',
      error: null
    }
  }

  handleGoBack(event: React.SyntheticEvent): void {
    event.preventDefault();
    const history = this.props.history;
    const canGoBack = (history.length > 1);
    if (canGoBack) {
      history.goBack();
    }
  }

  handleEmailChange(event: React.ChangeEvent<HTMLInputElement>): void {
    this.setState({
      email: event.target.value
    });
  }

  handlePasswordChange(event: React.ChangeEvent<HTMLInputElement>): void {
    this.setState({
      password: event.target.value
    });
  }

  handleSubmit(event: React.SyntheticEvent): void {
    event.preventDefault();

    this.setState({
      state: LogInState.Loading,
      error: null
    });

    const credentials = {
      username: this.state.email,
      password: this.state.password
    };


    authApi.logIn(credentials)
    .then((response: AxiosResponse<User>) => {
      this.setState({
        state: LogInState.Clear
      });
      this.onSuccess();
    })
    .catch((error) => {
      let errorMessage = "Could not log in."
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      }
      this.setState({
        state: LogInState.Error,
        error: errorMessage
      })
    });
  }

  onSuccess(): void {
    const params = new URLSearchParams(this.props.location.search);
    let target = params.get('redirect');
    if (!target) {
      target = '/';
    }
    this.props.history.push(target);
  }

  render(): React.ReactNode {
    const history = this.props.history;

    let errorMessage = null;
    if (this.state.error) {
      errorMessage = <p className="text-danger">{this.state.error}</p>;
    }

    const inputsDisabled = (this.state.state == LogInState.Loading);
    const canGoBack = (history.length > 1);
    const emailChangeHandler = this.handleEmailChange.bind(this);
    const passwordChangeHandler = this.handlePasswordChange.bind(this);
    const submitHandler = this.handleSubmit.bind(this);
    const goBackHandler = this.handleGoBack.bind(this);

    let spinner = null;
    if (this.state.state == LogInState.Loading) {
      spinner = <div className="spinner-border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>;
    }

    let backButton = null;
    if (canGoBack) {
      backButton = <button
                    className="ms-3 pb-2 btn btn-outline-link"
                    onClick={goBackHandler}
                    disabled={inputsDisabled}>
                      Go back
                  </button>;
    }

    return <div className="w-100 bg-light d-flex justify-content-center align-items-center login-screen" style={{ minHeight: '100vh' }}>
            <div className="bg-white rounded-3 shadow overflow-hidden">
              <h1 className="px-4 py-4 fs-2 text-center bg-dark"><Link to="/">Movieweb</Link></h1>
              <form className="px-5 py-4" onSubmit={e => submitHandler(e)}>
                {errorMessage}
                <div className="mb-3">
                  <label htmlFor="loginform-email" className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    id="loginform-email"
                    onChange={e => emailChangeHandler(e)}
                    required
                    disabled={inputsDisabled} />
                </div>
                <div className="mb-4">
                  <label htmlFor="loginform-password" className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-control"
                    id="loginform-password"
                    onChange={e => passwordChangeHandler(e)}
                    required
                    disabled={inputsDisabled} />
                </div>
                <div className="pt-2 mb-3 d-flex justify-content-center">
                  <button type="submit" className="btn btn-primary px-3 pb-2" disabled={inputsDisabled}>
                    Log in
                    {spinner}
                  </button>
                  {backButton}
                </div>
              </form>
            </div>
          </div>;
  }
}

withRouter(LoginPage);
export default LoginPage;
