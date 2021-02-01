import React, { Component } from 'react';
import { EmptyState } from '../utils';
import { withRouter, RouteComponentProps } from 'react-router-dom';

interface Props extends RouteComponentProps {
  opt?: string
}

class LoginPage extends Component<Props, EmptyState> {

  render(): React.ReactNode {
    const history = this.props.history;
    return <div className="w-100 bg-light d-flex justify-content-center align-items-center login-screen" style={{ minHeight: '100vh' }}>
            <div className="bg-white rounded-3 shadow overflow-hidden">
              <h1 className="px-4 py-4 fs-2 text-center bg-dark" style={{ color: '#F0A96E' }}>Movieweb</h1>
              <form className="px-5 py-4">
                <p className="text-danger">Invalid credentials.</p>
                <div className="mb-3">
                  <label htmlFor="loginform-login" className="form-label">Login</label>
                  <input type="text" className="form-control" id="loginform-login" required />
                </div>
                <div className="mb-4">
                  <label htmlFor="loginform-password" className="form-label">Password</label>
                  <input type="password" className="form-control" id="loginform-password" required />
                </div>
                <div className="pt-2 mb-3 d-flex justify-content-center">
                  <button type="submit" className="btn btn-primary px-3 pb-2">
                    Log in
                    <div className="spinner-border" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </button>
                  <button onClick={history.goBack} className="ms-3 pb-2 btn btn-outline-link">Go back</button>
                </div>
              </form>
            </div>
          </div>;
  }
}

withRouter(LoginPage);
export default LoginPage;
