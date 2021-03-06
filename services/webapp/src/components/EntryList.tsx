import React, { Component } from 'react';
import { AxiosPromise, AxiosResponse } from 'axios';
import { MovieListResponse, ReviewListResponse, UserListResponse } from '../config';
import { Movie, Review, User } from '../api/public/api';
import { ErrorScreen, LoadingScreen } from '../components/Screen';
import MovieCard from './MovieCard';
import ReviewCard from './ReviewCard';
import UserCard from './UserCard';

type Props<RespT> = {
  className?: string,
  loadingMessage: string,
  errorMessage: string,
  emptyMessage: string,
  retryButtonLabel: string,
  promise: () => AxiosPromise<RespT>
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

class EntryList<T, RespT> extends Component<Props<RespT>, State<T>> {

  public static defaultProps = {
    loadingMessage: "Loading...",
    errorMessage: "Could not fetch entries.",
    emptyMessage: "No entries",
    retryButtonLabel: "Retry"
  };

  constructor(props: Props<RespT>) {
    super(props);
    this.componentDidMount.bind(this);
    this.extractData.bind(this);
    this.loadEntries.bind(this);
    this.render.bind(this);
    this.renderList.bind(this);
    this.renderEntry.bind(this);

    this.state = {
      state: RequestState.Loading,
      entries: []
    };
  }

  componentDidMount() {
    this.loadEntries();
  }

  extractData(response: AxiosResponse<RespT>): T[] {
    return ((response as unknown) as T[]);
  }

  loadEntries() {
    this.setState({
      state: RequestState.Loading,
      entries: []
    });

    this.props.promise()
    .then((response: AxiosResponse<RespT>) => {
      this.setState({
        state: RequestState.Finished,
        entries: this.extractData(response)
      })
    })
    .catch(() => {
      this.setState({
        state: RequestState.Error
      })
    });
  }

  render(): React.ReactNode {
    const retryButtonLabel = this.props.retryButtonLabel;
    const errorMessage = this.props.errorMessage;
    const loadingMessage = this.props.loadingMessage;

    const errorHandler = this.loadEntries;
    const errorCallback = {
      label: retryButtonLabel,
      callback: errorHandler.bind(this)
    }

    switch (this.state.state) {
      case RequestState.Finished:
        return this.renderList();

      case RequestState.Error:
        return <ErrorScreen message={errorMessage} callback={errorCallback} />;

      default: // case RequestState.Loading
          return <LoadingScreen message={loadingMessage} />;
    }
  }

  renderList(): React.ReactNode {
    let outerClasses = "row row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xxl-4 g-4";
    if (this.props.className) {
      outerClasses += " " + this.props.className;
    }

    const entries = this.state.entries;
    if (entries.length) {
      return <div className={outerClasses}>
              {entries.map(this.renderEntry)}
            </div>;
    } else {
      return <div className={outerClasses}>
              <p>{this.props.emptyMessage}</p>
            </div>;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  renderEntry(entry: T): React.ReactNode {
    return null;
  }
}

class MovieList extends EntryList<Movie, MovieListResponse> {

  public static defaultProps = {
    loadingMessage: "Loading...",
    errorMessage: "Could not fetch movies.",
    emptyMessage: "No movies",
    retryButtonLabel: "Retry"
  };

  extractData(response: AxiosResponse<MovieListResponse>): Movie[] {
    return response.data.movies;
  }

  renderEntry(movie: Movie): React.ReactNode {
    return <div key={movie.id} className="col-sm">
            <MovieCard movie={movie} />
          </div>;
  }
}

class ReviewList extends EntryList<Review, ReviewListResponse> {

  public static defaultProps = {
    loadingMessage: "Loading...",
    errorMessage: "Could not fetch reviews.",
    emptyMessage: "No reviews",
    retryButtonLabel: "Retry"
  };

  extractData(response: AxiosResponse<ReviewListResponse>): Review[] {
    return response.data.reviews;
  }

  renderEntry(review: Review): React.ReactNode {
    return <div key={review.id} className="col-sm">
            <ReviewCard review={review} />
          </div>;
  }
}

class UserList extends EntryList<User, UserListResponse> {

  public static defaultProps = {
    loadingMessage: "Loading...",
    errorMessage: "Could not fetch users.",
    emptyMessage: "No users",
    retryButtonLabel: "Retry"
  };

  extractData(response: AxiosResponse<UserListResponse>): User[] {
    return response.data.users;
  }

  renderEntry(user: User): React.ReactNode {
    return <div key={user.id} className="col-sm">
            <UserCard user={user} />
          </div>;
  }
}

export { MovieList, ReviewList, UserList };
