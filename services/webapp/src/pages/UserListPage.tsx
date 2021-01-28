import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { AxiosResponse } from 'axios'
import { BASE_URL } from '../config';
import { usersApi } from '../config'
import { User } from '../api/public/api'
import { ErrorScreen, LoadingScreen } from '../components/Screen';

type Props = {
  loadingMessage: string,
  errorMessage: string,
  retryButtonLabel: string
}

type State = {
  state: RequestState,
  entries: User[],
}

enum RequestState {
  Loading = "LOADING",
  Error = "ERROR",
  Finished = "FINISHED"
}

class UserListPage extends Component<Props, State> {

  public static defaultProps = {
    loadingMessage: "Loading...",
    errorMessage: "Could not fetch users",
    retryButtonLabel: "Retry"
  };

  state = {
    state: RequestState.Loading,
    entries: []
  };

  constructor(props: Props) {
    super(props);
    this.componentDidMount.bind(this);
    this.loadEntries.bind(this);
    this.render.bind(this);
    this.renderMovieList.bind(this);
  }

  componentDidMount() {
    this.loadEntries();
  }

  loadEntries() {
    this.setState({
      state: RequestState.Loading,
      entries: []
    });

    usersApi.getUsers()
    .then((response: AxiosResponse<User[]>) => this.setState({
      state: RequestState.Finished,
      entries: response.data
    }))
    .catch(this.setState({
      state: RequestState.Error
    }));
  }

  render(): React.ReactNode {

    let userList = null;
    switch (this.state.state) {
      case RequestState.Loading:
        userList = <LoadingScreen message={this.props.loadingMessage} />;
        break;

      case RequestState.Finished:
        userList = this.renderMovieList();
        break;

      default:
        const errorHandler = this.loadEntries;
        const errorCallback = {
          label: this.props.retryButtonLabel,
          callback: errorHandler.bind(this)
        }
        userList = <ErrorScreen message={this.props.errorMessage} callback={errorCallback} />;
        break;
    }

    return <section className="container pt-5">
            <h1>Users</h1>
            {userList}
          </section>;
  }

  renderMovieList(): React.ReactNode {
    const users = this.state.entries;
    return <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xxl-4 g-4 pt-3">
            {users.map((user: User) => {
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
            })}
          </div>;
  }
}

export default UserListPage;
