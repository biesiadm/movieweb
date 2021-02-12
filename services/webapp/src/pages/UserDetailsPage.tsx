import { AxiosPromise, AxiosResponse } from 'axios';
import React, { Component } from 'react';
import { PeopleFill, StarFill } from 'react-bootstrap-icons';
import { Link, RouteComponentProps } from 'react-router-dom';
import { BASE_URL, ReviewListResponse, UserListResponse } from '../config';
import { usersApi } from '../config'
import { ListInfo, SortDir, User } from '../api/public/api'
import Avatar from '../components/Avatar';
import Error from '../components/Error';
import FollowButton from '../components/FollowButton';
import { LoadingScreen } from '../components/Screen';
import { ReviewList, UserList } from '../components/EntryList';
import { PaginatedResponse } from '../utils';
import { Emitter, Event } from '../events';

interface Props extends RouteComponentProps<{login: string}> {
  user: User | null
}

type State = {
  user: User | null,
  loading: boolean,
  error: unknown | null,
  followersPromise?: () => AxiosPromise<UserListResponse>,
  followsPromise?: () => AxiosPromise<UserListResponse>,
  topReviewsPromise?: () => AxiosPromise<ReviewListResponse>,
  recentReviewsPromise?: () => AxiosPromise<ReviewListResponse>,
  totalRatings: number,
  totalFollowers: number,
  totalFollowed: number
}

class UserDetailsPage extends Component<Props, State> {
  state: State = {
    user: null,
    loading: true,
    error: null,
    totalRatings: 0,
    totalFollowers: 0,
    totalFollowed: 0
  };

  constructor(props: Props) {
    super(props);
    this.render.bind(this);
  }

  async componentDidMount(): Promise<void> {
    const login:string = this.props.match.params.login?.trim().toLowerCase();
    if (login == null) {
      this.setState({
        user: null,
        loading: false,
        error: 'No such user'
      });
      return Promise.resolve();
    }

    this.addEventListeners();

    try {
      const userResp = await usersApi.getUserById(login);
      const user = userResp.data;
      const followersPromise = () => usersApi.getFollowers(user.id, 8, 0, 'created', SortDir.Desc);
      const followsPromise = () => usersApi.getFollowedBy(user.id, 8, 0, 'created', SortDir.Desc);
      const topReviewsPromise = () => usersApi.getUserReviews(user.id, 8, 0, 'rating', SortDir.Desc);
      const recentReviewsPromise = () => usersApi.getUserReviews(user.id, 8, 0, 'created', SortDir.Desc);
      // TODO(kantoniak): set initial follow button state
      this.setState({
        user: user,
        loading: false,
        error: null,
        followersPromise: followersPromise,
        followsPromise: followsPromise,
        topReviewsPromise: topReviewsPromise,
        recentReviewsPromise: recentReviewsPromise
      });

      // Update top counters
      Promise.all([
        recentReviewsPromise().then((resp: PaginatedResponse) => resp.data.info),
        followersPromise().then((resp: PaginatedResponse) => resp.data.info),
        followsPromise().then((resp: PaginatedResponse) => resp.data.info)
      ]).then((infos: ListInfo[]) => {
        this.setState({
          totalRatings: infos[0].totalCount || 0,
          totalFollowers: infos[1].totalCount || 0,
          totalFollowed: infos[2].totalCount || 0
        })
      })

    } catch (err) {
      this.setState({
        user: null,
        loading: false,
        error: err ?? true
      });
    }

    return Promise.resolve();
  }

  componentWillUnmount() {
    this.removeEventListeners();
  }

  addEventListeners() {
    Emitter.on(Event.Follow, (user: User, follower: User) => {
      const sameUser = (user.id === this.state.user?.id);
      const sameFollower = (follower.id === this.props.user?.id);
      if (!sameUser || !sameFollower) {
        return;
      }
      this.setState({
        totalFollowers: this.state.totalFollowers + 1,
      });
    });
    Emitter.on(Event.Unfollow, (user: User, follower: User) => {
      const sameUser = (user.id === this.state.user?.id);
      const sameFollower = (follower.id === this.props.user?.id);
      if (!sameUser || !sameFollower) {
        return;
      }
      this.setState({
        totalFollowers: this.state.totalFollowers - 1,
      });
    });
  }

  removeEventListeners() {
    Emitter.off(Event.Follow);
    Emitter.off(Event.Unfollow);
  }

  render(): React.ReactNode {

    if (this.state.loading) {
      return <LoadingScreen message="Loading user..." />;
    }

    if (this.state.user !== null) {
      const loggedInUser = this.props.user;
      const user: User = this.state.user;
      const followersPromise = this.state.followersPromise!;
      const followsPromise = this.state.followsPromise!;
      const topReviewsPromise = this.state.topReviewsPromise!;
      const recentReviewsPromise = this.state.recentReviewsPromise!;
      const profileUrl = new URL(BASE_URL + '/users/' + user.login);

      let followButton = null;
      if (loggedInUser && loggedInUser?.id != user.id) {
        followButton = <FollowButton user={user} follower={loggedInUser!} className="ms-4" />;
      }

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
                          {followButton}
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
                    <li className="list-inline-item me-5"><StarFill color="#F0A96E" className="mb-1" /> {this.state.totalRatings} ratings</li>
                    <li className="list-inline-item me-5"><PeopleFill color="#F0A96E" className="mb-1" /> {this.state.totalFollowers} followers</li>
                    <li className="list-inline-item"><PeopleFill color="#F0A96E" className="mb-1" /> {this.state.totalFollowed} followed</li>
                  </ul>
                </div>
              </section>
              <section className="container">
                <h2 className="my-3">Top rated movies</h2>
                <ReviewList promise={topReviewsPromise} className="preview-grid" />
                <h2 className="my-3 pt-4">Recent reviews</h2>
                <ReviewList promise={recentReviewsPromise} className="preview-grid" />
                <h2 className="my-3 pt-4">Followers</h2>
                <UserList promise={followersPromise} className="promo-grid" />
                <h2 className="my-3 pt-4">{user.name} follows</h2>
                <UserList promise={followsPromise} className="promo-grid" />
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
