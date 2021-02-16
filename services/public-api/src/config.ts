import axios, { AxiosInstance } from "axios";
import { Algorithm } from 'jsonwebtoken';
import qs from 'qs';
import { MoviesApiFactory } from './api/movies/api';
import { Configuration as MoviesApiConfiguration } from './api/movies/configuration';
import { RelationshipsApiFactory as RelationsApiFactory } from './api/relations/api';
import { Configuration as RelationsApiConfiguration } from './api/relations/configuration';
import { ReviewsApiFactory } from './api/reviews/api';
import { Configuration as ReviewsApiConfiguration } from './api/reviews/configuration';
import { LoginApiFactory, UsersApiFactory } from './api/users/api';
import { Configuration as UsersApiConfiguration } from './api/users/configuration';

const NODE_ENV = <string>process.env.NODE_ENV;
const PUBLIC_DOMAIN = <string>process.env.PUBLIC_DOMAIN;
const PUBLIC_SCHEME = <string>process.env.PUBLIC_SCHEME;
const REDIS_HOST = <string>process.env.REDIS_HOST;
const REDIS_PORT = parseInt(<string>process.env.REDIS_PORT);
const REDIS_SECRET = <string>process.env.REDIS_SECRET;
const SECRET_KEY = <string>process.env.SECRET_KEY;
export { NODE_ENV, PUBLIC_DOMAIN, PUBLIC_SCHEME };

const corsConfig = {
  origin: new RegExp(PUBLIC_DOMAIN),
  credentials: true
};

const tokenConfig = {
  secret: SECRET_KEY,
  algorithms: [<Algorithm>"HS256"]
};

const redisConfig = {
  host: REDIS_HOST,
  port: REDIS_PORT,
  password: REDIS_SECRET
};

const axiosInstance: AxiosInstance = axios.create({
  responseType: "json",
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

export { loginApi, moviesApi, relsApi, reviewsApi, usersApi, corsConfig, tokenConfig, redisConfig };
