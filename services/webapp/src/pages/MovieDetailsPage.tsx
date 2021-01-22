import React, { Component, Fragment } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { AxiosResponse } from 'axios';
import { validate as validateUuid } from 'uuid';
import PublicAPI from '../PublicAPI'
import { Movie } from '../api/public/api'
import Error from '../components/Error';
import InfoScreen, { LoadingScreen } from '../components/Screen';

type EmptyProps = RouteComponentProps<any>

type State = {
  movie: Movie | null,
  loading: boolean,
  error: unknown | null
}

class MovieDetailsPage extends Component<EmptyProps, State> {

  state: State = {
    movie: null,
    loading: true,
    error: null
  };

  constructor(props: EmptyProps) {
    super(props);
    this.render.bind(this);

    const slug_id:string = props.match.params.slug_id;
    const id = this.getUuidFromSlugId(slug_id);
    if (id == null) {
      this.state = {
        movie: null,
        loading: false,
        error: 'Invalid UUID'
      };
      return;
    }

    // Make a sample call
    PublicAPI.getMovieById(id /*'e759da3c-e934-4ebc-a794-4c3cfe59d18e'*/)
      .then((response: AxiosResponse<Movie>) => {
        this.setState({
          movie: response.data,
          loading: false,
          error: null
        });
      })
      .catch((err: unknown) => {
        console.error(err);
        this.setState({
          movie: null,
          loading: false,
          error: err ?? true
        });
      });
  }

  getUuidFromSlugId(slug_id:string): string | null {
    let parts:string[] = slug_id.split(/\s*-\s*/g);
    parts = parts.slice(Math.max(parts.length - 5, 0));
    if (parts.length != 5) {
      return null;
    }

    const uuid:string = parts.join('-');
    if (!validateUuid(uuid)) {
      return null;
    }

    return uuid;
  }

  render(): React.ReactNode {

    if (this.state.error != null) {
      const errorHandler = () => { this.props.history.goBack(); };
      errorHandler.bind(this);
      const errorCallback = {
        label: 'Go back',
        callback: errorHandler
      }
      return <Error message="Movie not found" callback={errorCallback} />;
    }

    if (this.state.loading) {
      return <LoadingScreen message="Fetching movie..." />;
    }

    const movie: Movie = this.state.movie!;
    return <section className="container">
            <div className="row mb-2">
              <div className="col-xl-8 mb-3 container">
                <div className="bg-white row">
                  <img src={movie.poster_url} alt="{movie.title} poster" className="col-md-4" />
                  <div className="col-md-8 py-5 px-5">
                    <h2>{movie.title}</h2>
                    <h3 className="text-muted">{movie.director}</h3>
                    <p className="mt-3"><span className="text-muted">Category:</span> {movie.category}</p>
                    <p><span className="text-muted">Country:</span> {movie.country}</p>
                    <p><span className="text-muted">Year:</span> {movie.year}</p>
                  </div>
                </div>
              </div>

              <div className="col-xl-4 mb-3">
                <InfoScreen className="bg-subtle h-100 py-0">
                  Your rating block
                </InfoScreen>
              </div>
            </div>

            <h2 className="my-3">Recent user ratings</h2>
            <InfoScreen className="bg-subtle h-100 py-0">
              User ratings block
            </InfoScreen>
          </section>;
  }
}

export default MovieDetailsPage;
