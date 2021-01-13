import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { Movie } from '../api/public/api'

type Props = {
  movie: Movie
}

type EmptyState = Record<string, never>

class MovieCard extends Component<Props, EmptyState> {
  render(): React.ReactNode {
    return <div className="card shadow-sm">
            <div className="row g-0">
              <div className="col-md-4">
                <Link to="/movies/slug-here">
                  <img src="https://fwcdn.pl/fpo/10/39/1039/7517880.3.jpg" className="card-img-top" alt="{this.props.movie.title} poster" />
                </Link>
              </div>
              <div className="col-md-8">
                <div className="card-body">
                  <h5 className="card-title">{this.props.movie.title}</h5>
                  <h6 className="card-subtitle mb-2 text-muted">{this.props.movie.director}</h6>
                  <p className="card-text text-muted small mb-0">{this.props.movie.country}, {this.props.movie.year}</p>
                  <p className="card-text text-muted small"><Link to="/movies/slug-here">Details</Link></p>
                </div>
              </div>
            </div>
          </div>
  }
}

export default MovieCard;
