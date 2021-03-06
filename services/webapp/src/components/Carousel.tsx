import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Movie } from '../api/public/api';
import { BASE_URL } from '../config';
import Poster from './Poster';

type Props = {
  id: string
  movies: Movie[]
}

type State = Record<string, never>

class Carousel extends Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.render.bind(this);
  }

  render(): React.ReactNode {
    const id = this.props.id;
    const movies = this.props.movies;
    return <div id={id} className="carousel carousel-dark slide carousel-fade carousel-featured container" data-bs-ride="carousel">
            <h2 className="text-white-50 small mb-0">Latest movies</h2>
            <div className="carousel-inner">
              {movies.map((movie: Movie, index: number) => {
                let slideClasses = "carousel-item pt-5 pb-4 pb-lg-5";
                if (index == 1) {
                  slideClasses += " active";
                }
                const url = new URL(BASE_URL + '/movies/' + movie.slug + '-' + movie.id);
                let slideStyle = {};
                if (movie.background_url) {
                  slideStyle = {
                    backgroundImage: "linear-gradient(90deg, rgba(20,23,26,1) 0%, rgba(20,23,26,0.8) 8rem, rgba(20,23,26,0.8) calc(100% - 8rem), rgba(20,23,26,1) 100%), url(" + movie.background_url + ")",
                    backgroundSize: "cover",
                    backgroundPosition: "center center"
                  };
                }
                return <div key={movie.id} className={slideClasses} style={slideStyle}>
                        <div className="row gx-5">
                          <div className="col-md-3">
                            <Poster movie={movie} url={url} className="featured-poster rounded" />
                          </div>
                          <div className="col-md-9">
                            <div className="pt-3 px-3 px-md-0">
                              <h3 className="display-3 text-white featured-title">{movie.title}</h3>
                              <p className="display-6 text-light">{movie.director}</p>
                              <p className="display-6 text-light">{movie.country}, {movie.year}</p>
                              <p className="mt-4"><Link to={url.pathname} className="btn btn-primary btn-lg">Details</Link></p>
                            </div>
                          </div>
                        </div>
                      </div>;
              })}
            </div>
            <a className="carousel-control-prev" href={`#${id}`} role="button" data-bs-slide="prev">
              <span className="carousel-control-prev-icon" aria-hidden="true"></span>
              <span className="visually-hidden">Previous</span>
            </a>
            <a className="carousel-control-next" href={`#${id}`} role="button" data-bs-slide="next">
              <span className="carousel-control-next-icon" aria-hidden="true"></span>
              <span className="visually-hidden">Next</span>
            </a>
          </div>;
  }
}

export default Carousel;
