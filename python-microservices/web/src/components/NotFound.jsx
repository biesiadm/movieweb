import React from 'react';
import {Link} from 'react-router-dom';

const NotFound = () => (
  <div className='text-center'>
    <h1>404</h1>
    <p><Link to='/'>Home</Link></p>
  </div>
)

export default NotFound
