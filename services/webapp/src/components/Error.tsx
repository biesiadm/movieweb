import React, { Component } from 'react';

type ErrorCallback = {
    label: string,
    callback: () => void
  }

interface Props {
  header: string,
  message: string,
  callback?: ErrorCallback
}

type EmptyState = Record<string, never>

class Error extends Component<Props, EmptyState> {

  public static defaultProps = {
    header: "Oops!",
    message: "There has been an error.",
    callback: null
  };

  render(): React.ReactNode {
    const header = this.props.header;
    const message = this.props.message;

    let button = <></>;
    if (this.props.callback) {
      const buttonLabel = this.props.callback.label;
      const callback = this.props.callback.callback;
      button = <button onClick={callback} type="button" className="btn btn-primary mt-3 py-2 px-3">{buttonLabel}</button>;
    }

    return <div className="text-center pt-5">
            <h1 className="display-1">{header}</h1>
            <p className="lead">{message}</p>
            {button}
          </div>;
  }
}

export default Error;
