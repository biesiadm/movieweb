import { AxiosResponse } from 'axios';
import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { CreateMovie, Movie, User } from '../api/public';
import Poster from '../components/Poster';
import { moviesApi } from '../config';

enum CreateState {
  Clear = "CLEAR",
  Loading = "LOADING",
  Error = "ERROR"
}

interface Props extends RouteComponentProps {
  user: User | null
}

type State = {
  state: CreateState,
  movie: CreateMovie,
  error: string | null
}

class AddMoviePage extends Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.render.bind(this);

    this.state = {
      state: CreateState.Clear,
      movie: {
        title: '',
        poster_url: ''
      },
      error: null
    }
  }

  componentDidMount(): void {
    if (!this.props.user?.id) {
      this.props.history.push('/');
    }
  }

  handleSubmit(event: React.SyntheticEvent): void {
    event.preventDefault();

    this.setState({
      state: CreateState.Loading,
      error: null
    });

    moviesApi.addMovie(this.state.movie)
      .then((response: AxiosResponse<Movie>) => {
        const movie = response.data;
        const url = '/movies/' + movie.slug + '-' + movie.id;
        this.props.history.push(url);
      })
      .catch((error: any) => {
        let errorMessage = "Could not create movie."
        if (error.response?.data?.detail) {
          errorMessage = error.response.data.detail[0].msg;
        }
        this.setState({
          state: CreateState.Error,
          error: errorMessage
        })
      });
  }

  // TODO(kantoniak): Single event handler

  handlePosterUrlChange(event: React.ChangeEvent<HTMLInputElement>): void {
    event.preventDefault();
    const movie = { ...this.state.movie };
    movie.poster_url = event.target.value;
    this.setState({ movie: movie });
  }

  handleBackgroundUrlChange(event: React.ChangeEvent<HTMLInputElement>): void {
    event.preventDefault();
    const movie = { ...this.state.movie };
    movie.background_url = event.target.value;
    this.setState({ movie: movie });
  }

  handleTitleChange(event: React.ChangeEvent<HTMLInputElement>): void {
    event.preventDefault();
    const movie = { ...this.state.movie };
    movie.title = event.target.value;
    this.setState({ movie: movie });
  }

  handleDirectorChange(event: React.ChangeEvent<HTMLInputElement>): void {
    event.preventDefault();
    const movie = { ...this.state.movie };
    movie.director = event.target.value;
    this.setState({ movie: movie });
  }

  handleCategoryChange(event: React.ChangeEvent<HTMLInputElement>): void {
    event.preventDefault();
    const movie = { ...this.state.movie };
    movie.category = event.target.value;
    this.setState({ movie: movie });
  }

  handleCountryChange(event: React.ChangeEvent<HTMLInputElement>): void {
    event.preventDefault();
    const movie = { ...this.state.movie };
    movie.country = event.target.value;
    this.setState({ movie: movie });
  }

  handleYearChange(event: React.ChangeEvent<HTMLInputElement>): void {
    event.preventDefault();
    const movie = { ...this.state.movie };
    movie.year = parseInt(event.target.value);
    this.setState({ movie: movie });
  }

  render(): React.ReactNode {
    return <div>
            {this.renderPreview()}
            {this.renderForm()}
          </div>;
  }

  renderPreview(): React.ReactNode {
    const movie = this.state.movie;
    const background_url = movie.background_url || '';
    const featuredStyle = {
      backgroundImage: "linear-gradient(90deg, rgba(20,23,26,1) 0%, rgba(20,23,26,0.8) 8rem, rgba(20,23,26,0.8) calc(100% - 8rem), rgba(20,23,26,1) 100%), url(" + background_url + ")",
      backgroundSize: "cover",
      backgroundPosition: "center center"
    };
    return <section className="bg-darker movie-page-header">
            <div className="container">
              <div className="py-4 pt-3 py-lg-5 pt-lg-4 extra-5" style={featuredStyle}>
                <h3 className="text-white-50 pb-3 extra-5-padded">Add movie - preview</h3>
                <div className="row extra-5-padded">
                  <div className="col-xl-8 mr-5">
                    <div className="row gx-5">
                      <div className="col-md-3 col-xl-4 featured-center">
                        <Poster movie={movie as Movie} className="featured-poster rounded bg-white" />
                      </div>
                      <div className="col-md-9 col-xl-8">
                        <div className="pt-3 text-light">
                          <h3 className="display-6 text-white featured-title">{movie.title || 'Movie title'}</h3>
                          <h4 className="text-light">{movie.director || 'Director'}</h4>
                          <p className="mt-4"><span className="text-muted">Category:</span> {movie.category || 'Category'}</p>
                          <p><span className="text-muted">Country:</span> {movie.country || 'Country'}</p>
                          <p><span className="text-muted">Year:</span> {movie.year || '1000'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>;
  }

  renderForm(): React.ReactNode {
    const inputsDisabled = (this.state.state == CreateState.Loading);
    const submitHandler = this.handleSubmit.bind(this);
    const posterUrlChangeHandler = this.handlePosterUrlChange.bind(this);
    const bgUrlChangeHandler = this.handleBackgroundUrlChange.bind(this);
    const titleChangeHandler = this.handleTitleChange.bind(this);
    const directorChangeHandler = this.handleDirectorChange.bind(this);
    const categoryChangeHandler = this.handleCategoryChange.bind(this);
    const countryChangeHandler = this.handleCountryChange.bind(this);
    const yearChangeHandler = this.handleYearChange.bind(this);

    let errorMessage = null;
    if (this.state.error) {
      errorMessage = <p className="text-danger">{this.state.error}</p>;
    }

    let spinner = null;
    if (this.state.state == CreateState.Loading) {
      spinner = <div className="spinner-border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>;
    }

    return <section className="container pt-4">
            <form className="py-3 addmovie-form" onSubmit={e => submitHandler(e)}>
              {errorMessage}
              <div className="mb-3">
                <label htmlFor="addmovieform-posterurl" className="form-label">Poster URL</label>
                <input
                  type="url"
                  className="form-control"
                  id="addmovieform-posterurl"
                  onChange={e => posterUrlChangeHandler(e)}
                  required
                  disabled={inputsDisabled} />
              </div>
              <div className="mb-3">
                <label htmlFor="addmovieform-bgurl" className="form-label">Background URL</label>
                <input
                  type="url"
                  className="form-control"
                  id="addmovieform-bgurl"
                  onChange={e => bgUrlChangeHandler(e)}
                  required
                  disabled={inputsDisabled} />
              </div>
              <div className="mb-3">
                <label htmlFor="addmovieform-title" className="form-label">Title</label>
                <input
                  type="text"
                  className="form-control"
                  id="addmovieform-title"
                  onChange={e => titleChangeHandler(e)}
                  required
                  disabled={inputsDisabled} />
              </div>
              <div className="mb-3">
                <label htmlFor="addmovieform-director" className="form-label">Director</label>
                <input
                  type="text"
                  className="form-control"
                  id="addmovieform-director"
                  onChange={e => directorChangeHandler(e)}
                  required
                  disabled={inputsDisabled} />
              </div>
              <div className="mb-3">
                <label htmlFor="addmovieform-category" className="form-label">Category</label>
                <input
                  type="text"
                  className="form-control"
                  id="addmovieform-category"
                  onChange={e => categoryChangeHandler(e)}
                  required
                  disabled={inputsDisabled} />
              </div>
              <div className="mb-3">
                <label htmlFor="addmovieform-country" className="form-label">Country</label>
                <input
                  type="text"
                  className="form-control"
                  id="addmovieform-country"
                  onChange={e => countryChangeHandler(e)}
                  required
                  disabled={inputsDisabled} />
              </div>

              <div className="mb-4">
                <label htmlFor="addmovieform-year" className="form-label">Year</label>
                <input
                  type="number"
                  className="form-control"
                  id="addmovieform-year"
                  onChange={e => yearChangeHandler(e)}
                  required
                  disabled={inputsDisabled} />
              </div>
              <button type="submit" className="btn btn-primary px-3 pb-2" disabled={inputsDisabled}>
                Save
                {spinner}
              </button>
            </form>
          </section>;
  }
}

export default AddMoviePage;
