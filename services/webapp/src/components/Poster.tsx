import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Movie } from '../api/public/api';

type Props = {
  className?: string,
  movie: Movie,
  url?: URL
}

type State = Record<string, never>

class Poster extends Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.render.bind(this);
  }

  render(): React.ReactNode {
    const movie = this.props.movie;
    const url = this.props.url;

    const outerClasses = this.props.className ? this.props.className + " poster" : "poster";

    const innerStyle = {
      backgroundImage: "url(" + movie.poster_url + ")"
    };

    if (url) {
      return <div className={outerClasses}>
              <Link to={url.pathname}>
                <div className="poster-inner" style={innerStyle} />
                <img src={movie.poster_url}  className="visually-hidden" alt="{movie.title} poster" />
              </Link>
            </div>;
    } else {
      return <div className={outerClasses}>
              <div className="poster-inner" style={innerStyle} />
              <img src={movie.poster_url}  className="visually-hidden" alt="{movie.title} poster" />
            </div>;
    }
  }
}

export default Poster;
