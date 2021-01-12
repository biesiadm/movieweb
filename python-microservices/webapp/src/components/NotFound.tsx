import React, { FunctionComponent } from 'react';
import { Link } from 'react-router-dom';

type EmptyState = Record<string, never>

const NotFound: FunctionComponent<EmptyState> = () =>
  <div className='text-center'>
    <h1>404</h1>
    <p><Link to='/'>Home</Link></p>
  </div>

export default NotFound
