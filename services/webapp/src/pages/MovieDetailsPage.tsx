import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { AxiosResponse } from 'axios';
import { validate as validateUuid } from 'uuid';
import PublicAPI from '../PublicAPI'
import { Movie } from '../api/public/api'
import Error from '../components/Error';
import InfoScreen, { LoadingScreen } from '../components/Screen';

type Props = RouteComponentProps<{
  slug_id: string
}>

type State = {
  movie: Movie | null,
  loading: boolean,
  error: unknown | null
}

class MovieDetailsPage extends Component<Props, State> {

  state: State = {
    movie: null,
    loading: true,
    error: null
  };

  constructor(props: Props) {
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

    if (this.state.loading) {
      return <LoadingScreen message="Fetching movie..." />;
    }

    if (this.state.movie !== null) {
      const movie: Movie = this.state.movie;
      const featuredStyle = {
        backgroundImage: "linear-gradient(90deg, rgba(20,23,26,1) 0%, rgba(20,23,26,0.8) 8rem, rgba(20,23,26,0.8) calc(100% - 8rem), rgba(20,23,26,1) 100%), url(" + movie.background_url + ")",
        backgroundSize: "cover",
        backgroundPosition: "center center"
      };
      return <div>
              <section className="bg-darker movie-page-header">
                <div className="container">
                  <div className="py-4 py-lg-5 extra-5" style={featuredStyle}>
                    <div className="row extra-5-padded">
                      <div className="col-xl-8 mr-5">
                        <div className="row gx-5">
                          <div className="col-md-3 col-xl-4 featured-center">
                            <img src={movie.poster_url} className="rounded w-100 featured-poster" alt="{movie.title} poster" />
                          </div>
                          <div className="col-md-9 col-xl-8">
                            <div className="pt-3 text-light">
                              <h3 className="display-6 text-white featured-title">{movie.title}</h3>
                              <h4 className="text-light">{movie.director}</h4>
                              <p className="mt-4"><span className="text-muted">Category:</span> {movie.category}</p>
                              <p><span className="text-muted">Country:</span> {movie.country}</p>
                              <p><span className="text-muted">Year:</span> {movie.year}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col-xl-4 pt-4 pt-lg-5 pt-xl-0 ps-xl-5">
                        <InfoScreen className="bg-subtle h-100 py-0">
                          Your rating block
                        </InfoScreen>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
              <section className="container pt-4">
                <h2 className="my-3">Recent user ratings</h2>
                <InfoScreen className="bg-subtle h-100 py-0">
                  User ratings block
                </InfoScreen>
              </section>
            </div>;

    } else { // this.state.error != null

      const errorHandler = () => { this.props.history.goBack(); };
      errorHandler.bind(this);
      const errorCallback = {
        label: 'Go back',
        callback: errorHandler
      }
      return <Error message="Movie not found" callback={errorCallback} />;
    }
  }
}

export default MovieDetailsPage;
