import React, { Component } from 'react';
import { UserList } from '../components/EntryList';
import { usersApi } from '../config';
import { EmptyProps, EmptyState } from '../utils';

class UserListPage extends Component<EmptyProps, EmptyState> {

  constructor(props: EmptyProps) {
    super(props);
    this.render.bind(this);
  }

  render(): React.ReactNode {
    return <section className="container pt-5">
            <h1>Users</h1>
            <UserList promise={usersApi.getUsers} className="pt-3" />
          </section>;
  }
}

export default UserListPage;
