import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { AxiosResponse } from 'axios'
import { BASE_URL } from '../config';
import PublicAPI from '../PublicAPI'
import { User } from '../api/public/api'

type EmptyProps = Record<string, never>

type State = {
  users: User[]
}

class UserListPage extends Component<EmptyProps, State> {

  state = {
    users: []
  };

  constructor(props: EmptyProps) {
    super(props);

    // Make a sample call
    PublicAPI.getUsers()
      .then((response: AxiosResponse<User[]>) => {
        this.setState({ users: response.data });
      })
      .catch((err: unknown) => {
        console.log(err);
      });
  }

  render(): React.ReactNode {
    const users = this.state.users;
    return <section className="container pt-5">
            <h1>Users</h1>
            <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xxl-4 g-4 pt-3">
              {users.map((user: User) => {
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
          </section>;
  }
}

export default UserListPage;
