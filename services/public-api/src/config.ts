import axios, { AxiosInstance } from "axios";
import { Algorithm } from 'jsonwebtoken';
import { MoviesApiFactory } from './api/movies/api';
import { Configuration as MoviesApiConfiguration } from './api/movies/configuration';
import { RelationshipsApiFactory as RelationsApiFactory } from './api/relations/api';
import { Configuration as RelationsApiConfiguration } from './api/relations/configuration';
import { ReviewsApiFactory } from './api/reviews/api';
import { Configuration as ReviewsApiConfiguration } from './api/reviews/configuration';
import { LoginApiFactory, UsersApiFactory } from './api/users/api';
import { Configuration as UsersApiConfiguration } from './api/users/configuration';

const corsConfig = {
  origin: new RegExp('localhost'),
  credentials: true
};

const sessionConfig = {
  // FIXME(kantoniak): Hardcoded secret
  secret: 'session-secret',
  resave: false,
  saveUninitialized: true,
  cookie: {
      httpOnly: true,
      //secure: true, // Set only if HTTPS
      domain: 'localhost'
  }
  // TODO(kantoniak): Set up a secure store (Redis?) for prod. `express-session` uses memory by default.
};

const tokenConfig = {
  // FIXME(kantoniak): Hardcoded secret
  secret: 'my-secret-key',
  options: {
    algorithms: [<Algorithm>"HS256"]
  }
};

const axiosInstance: AxiosInstance = axios.create({
  responseType: "json"
});

const moviesApi = MoviesApiFactory(
  new MoviesApiConfiguration(),
  "http://movies:80",
  axiosInstance
);

const relsApi = RelationsApiFactory(
  new RelationsApiConfiguration(),
  "http://relationships:80",
  axiosInstance
);

const reviewsApi = ReviewsApiFactory(
  new ReviewsApiConfiguration(),
  "http://reviews:80",
  axiosInstance
);

const usersApiConfig = new UsersApiConfiguration();
const usersApi = UsersApiFactory(
  usersApiConfig,
  "http://users:80",
  axiosInstance
);

const loginApi = LoginApiFactory(
  usersApiConfig,
  "http://users:80",
  axiosInstance
);

export { loginApi, moviesApi, relsApi, reviewsApi, usersApi, corsConfig, sessionConfig, tokenConfig };
