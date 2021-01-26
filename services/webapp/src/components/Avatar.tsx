import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { User } from '../api/public/api';

type Props = {
  className?: string,
  user: User,
  url?: URL
}

type State = Record<string, never>

class Avatar extends Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.render.bind(this);
  }

  render(): React.ReactNode {
    const user = this.props.user;
    const source_url = user.avatar_url;
    const url = this.props.url?.pathname;

    let outerClasses = "avatar rounded-pill overflow-hidden shadow-sm border";
    if (this.props.className) {
      outerClasses += " " + this.props.className;
    }

    const innerStyle = {
      backgroundImage: "url(" + source_url + ")"
    };

    if (url) {
      return <div className={outerClasses}>
              <Link to={url}>
                <div className="avatar-inner w-100 rounded-pill border border-5 border-white" style={innerStyle} />
                <img src={source_url}  className="visually-hidden" alt="{user.name} avatar" />
              </Link>
            </div>;
    } else {
      return <div className={outerClasses}>
              <div className="avatar-inner w-100 rounded-pill border border-5 border-white" style={innerStyle} />
              <img src={source_url}  className="visually-hidden" alt="{user.name} avatar" />
            </div>;
    }
  }
}

export default Avatar;
