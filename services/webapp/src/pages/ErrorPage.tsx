import React, { Component } from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';

interface Props extends RouteComponentProps {
  header: string,
  message: string
}

type EmptyState = Record<string, never>

class ErrorPage extends Component<Props, EmptyState> {

  public static defaultProps = {
    header: "Oops!",
    message: "There has been an error."
  };

  render(): React.ReactNode {
    const history = this.props.history;
    const header = this.props.header;
    const message = this.props.message;
    return <div className="text-center pt-5">
            <h1 className="display-1">{header}</h1>
            <p className="lead">{message}</p>
            <button onClick={history.goBack} type="button" className="btn btn-primary mt-3 py-2 px-3">Go back</button>
          </div>
  }
}

withRouter(ErrorPage);

class GenericNotFoundPage extends ErrorPage {
  public static defaultProps = {
    header: "404",
    message: "We couldn't find what you're looking for."
  };
}

export { GenericNotFoundPage };
