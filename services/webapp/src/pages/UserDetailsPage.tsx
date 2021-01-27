import React, { Component } from 'react';
import { BinocularsFill, PeopleFill, StarFill } from 'react-bootstrap-icons';
import { Link, RouteComponentProps } from 'react-router-dom';
import { AxiosResponse } from 'axios';
import { BASE_URL } from '../config';
import PublicAPI from '../PublicAPI'
import { User } from '../api/public/api'
import Error from '../components/Error';
import InfoScreen, { LoadingScreen } from '../components/Screen';
import Avatar from '../components/Avatar';

type Props = RouteComponentProps<{
  login: string
}>

type State = {
  user: User | null,
  followers: User[],
  loading: boolean,
  error: unknown | null
}

class UserDetailsPage extends Component<Props, State> {

  state: State = {
    user: null,
    followers: [],
    loading: true,
    error: null
  };

  constructor(props: Props) {
    super(props);
    this.render.bind(this);

    const login:string = props.match.params.login?.trim().toLowerCase();
    if (login == null) {
      this.state = {
        user: null,
        followers: [],
        loading: false,
        error: 'No such user'
      };
      return;
    }

    // Make a sample call
    PublicAPI.getUserById(login)
      .then((response: AxiosResponse<User>) => {
        this.setState({
          user: response.data,
          loading: false,
          error: null
        });
      })
      .catch((err: unknown) => {
        console.error(err);
        this.setState({
          user: null,
          loading: false,
          error: err ?? true
        });
      });

    // Followers
    // TODO(kantoniak): Fetch followers
    PublicAPI.getUsers(8, 0)
      .then((response: AxiosResponse<User[]>) => {
        this.setState({ followers: response.data });
      });
  }

  render(): React.ReactNode {

    if (this.state.loading) {
      return <LoadingScreen message="Loading user..." />;
    }

    if (this.state.user !== null) {
      const user: User = this.state.user;
      const followers: User[] = this.state.followers;
      const profileUrl = new URL(BASE_URL + '/users/' + user.login);
      return <div>
              <section className="bg-darker">
                <div className="container py-4 pt-lg-3 pb-lg-0">
                  <div className="row g-4">
                    <div className="col-md-2 col-lg-3 col-xxl-2 user-details-page-avatar">
                      <div className="m-lg-2">
                        <Avatar url={profileUrl} user={user} />
                      </div>
                    </div>
                    <div className="col-md-10 col-lg-9 col-xxl-10">
                      <div className="pt-lg-4">
                        <h3 className="display-6 flex-wrap text-white display-6 text-white heading-with-btn align-items-center justify-content-start">
                          <Link to={profileUrl.pathname} className="text-white text-decoration-none">{user.name}</Link>
                          <a className="badge badge-btn badge-btn-light d-inline-flex ms-4 align-items-center pt-2 text-decoration-none">
                            Follow
                            <BinocularsFill className="ms-2 mb-1 me-1" color="#212529" />
                          </a>
                        </h3>
                        <h4 className="text-muted">{user.login}</h4>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
              <section className="container">
                <div className="row g-4 flex-row-reverse">
                  <ul className="col-lg-9 col-xxl-10 fs-5 text-muted pt-3 list-inline user-details-page-summary">
                    <li className="list-inline-item me-5"><StarFill color="#F0A96E" className="mb-1" /> 0 ratings</li>
                    <li className="list-inline-item me-5"><PeopleFill color="#F0A96E" className="mb-1" /> 0 followers</li>
                    <li className="list-inline-item"><PeopleFill color="#F0A96E" className="mb-1" /> 0 following</li>
                  </ul>
                </div>
              </section>
              <section className="container">
                <h2 className="my-3">Top rated movies</h2>
                <InfoScreen className="bg-subtle h-100 py-0">
                  User ratings block
                </InfoScreen>
                <h2 className="my-3 pt-4">Recent ratings</h2>
                <InfoScreen className="bg-subtle h-100 py-0">
                  User ratings block
                </InfoScreen>
                <h2 className="my-3 pt-4">Followers</h2>
                <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xxl-4 g-4 preview-grid">
                  {followers.map((user: User) => {
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
                </div>
              </section>
            </div>;

    } else { // this.state.error != null

      const errorHandler = () => { this.props.history.goBack(); };
      errorHandler.bind(this);
      const errorCallback = {
        label: 'Go back',
        callback: errorHandler
      }
      return <Error message="User not found" callback={errorCallback} />;
    }
  }
}

export default UserDetailsPage;
