import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { AxiosPromise, AxiosResponse } from 'axios';
import { User } from '../api/public/api';
import { BASE_URL } from '../config';
import { ErrorScreen, LoadingScreen } from '../components/Screen';

type Props<T> = {
  loadingMessage: string,
  errorMessage: string,
  retryButtonLabel: string,
  promise: () => AxiosPromise<T[]>
}

type State<T> = {
  state: RequestState,
  entries: T[],
}

enum RequestState {
  Loading = "LOADING",
  Error = "ERROR",
  Finished = "FINISHED"
}

class EntryList<T> extends Component<Props<T>, State<T>> {

  public static defaultProps = {
    loadingMessage: "Loading...",
    errorMessage: "Could not fetch users",
    retryButtonLabel: "Retry"
  };

  state = {
    state: RequestState.Loading,
    entries: []
  };

  constructor(props: Props<T>) {
    super(props);
    this.componentDidMount.bind(this);
    this.loadEntries.bind(this);
    this.render.bind(this);
    this.renderList.bind(this);
    this.renderEntry.bind(this);
  }

  componentDidMount() {
    this.loadEntries();
  }

  loadEntries() {
    this.setState({
      state: RequestState.Loading,
      entries: []
    });

    this.props.promise()
    .then((response: AxiosResponse<T[]>) => this.setState({
      state: RequestState.Finished,
      entries: response.data
    }))
    .catch(this.setState({
      state: RequestState.Error
    }));
  }

  render(): React.ReactNode {
    switch (this.state.state) {
      case RequestState.Loading:
        const loadingMessage = this.props.loadingMessage;
        return <LoadingScreen message={loadingMessage} />;

      case RequestState.Finished:
        return this.renderList();

      default:
        const retryButtonLabel = this.props.retryButtonLabel;
        const errorMessage = this.props.errorMessage;

        const errorHandler = this.loadEntries;
        const errorCallback = {
          label: retryButtonLabel,
          callback: errorHandler.bind(this)
        }
        return <ErrorScreen message={errorMessage} callback={errorCallback} />;
    }
  }

  renderList(): React.ReactNode {
    const entries = this.state.entries;
    return <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xxl-4 g-4 pt-3">
            {entries.map(this.renderEntry)}
          </div>;
  }

  renderEntry(entry: T) {
    return null;
  }
}

class UserList extends EntryList<User> {

  constructor(props: Props) {
    super(props);
    this.renderEntry.bind(this);
  }

  renderEntry(user: User) {
    const profileUrl = new URL(BASE_URL + '/users/' + user.login).pathname;
    return <div key={user.id} className="col-sm">
            <div className="card shadow-sm overflow-hidden">
              <div className="row g-0">
                <div className="col-md-4">
                  <div className="m-2">
                    <Link to={profileUrl}>
                      <div className="rounded-pill overflow-hidden shadow-sm border">
                        <img src={user.avatar_url} className="w-100 rounded-pill border border-5 border-white" />
                      </div>
                    </Link>
                  </div>
                </div>
                <div className="col-md-8">
                  <div className="card-body">
                    <h5 className="card-title">{user.name}</h5>
                    <p className="card-text text-muted small"><Link to={profileUrl}>Details</Link></p>
                  </div>
                </div>
              </div>
            </div>
          </div>;
  }
}

export { UserList };
