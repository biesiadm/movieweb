import React, { Component, ReactNode } from 'react';

type InfoScreenProps = {
  className: string,
  children: ReactNode
}
type EmptyState = Record<string, never>

class InfoScreen extends Component<InfoScreenProps, EmptyState> {

  render(): React.ReactNode {
    return <div className={`d-flex justify-content-center align-items-center py-5 text-secondary ${this.props.className}`}>
            {this.props.children}
          </div>;
  }
}

type LoadingScreenProps = {
  className: string,
  message: string
}

class LoadingScreen extends Component<LoadingScreenProps, EmptyState> {

  public static defaultProps = {
    className: "",
    message: "Loading..."
  };

  render(): React.ReactNode {
    const message = this.props.message;
    return <InfoScreen className={this.props.className}>
            <div className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></div>
            <p className="mb-0">{message}</p>
          </InfoScreen>;
  }
}

type ErrorScreenCallback = {
  label: string,
  callback: () => void
}

type ErrorScreenProps = {
  className: string,
  message: string,
  callback?: ErrorScreenCallback
}

class ErrorScreen extends Component<ErrorScreenProps, EmptyState> {

  public static defaultProps = {
    className: "",
    message: "Error",
    callback: undefined
  };

  render(): React.ReactNode {
    const message = this.props.message;

    let button = <></>;
    if (this.props.callback) {
      const button_label = this.props.callback.label;
      const callback = this.props.callback.callback;
      button = <button onClick={callback} type="button" className="btn btn-secondary btn-xs mt-2">{button_label}</button>;
    }

    return <InfoScreen className={`flex-column ${this.props.className}`}>
            <p className="small mb-0">{message}</p>
            {button}
          </InfoScreen>;
  }
}

export default InfoScreen;
export { LoadingScreen, ErrorScreen };
