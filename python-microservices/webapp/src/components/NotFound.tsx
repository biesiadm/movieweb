import React, { FunctionComponent } from 'react';
import { Link } from 'react-router-dom';

type EmptyState = Record<string, never>

const NotFound: FunctionComponent<EmptyState> = () =>
  <div className='text-center'>
    <h1 className="display-1">404</h1>
    <p className="lead">We could&apos;t find what you&apos;re looking for.</p>
    <p><Link to='/' className="btn btn-primary mt-3 py-2 px-3" role="button">Homepage</Link></p>
  </div>

export default NotFound
