import axios, { AxiosInstance } from "axios";
import { MoviesApiFactory } from './api/movies/api';
import { Configuration as MoviesApiConfiguration } from './api/movies/configuration';
import { ReviewsApiFactory } from './api/reviews/api';
import { Configuration as ReviewsApiConfiguration } from './api/reviews/configuration';
import { LoginApiFactory, UsersApiFactory } from './api/users/api';
import { Configuration as UsersApiConfiguration } from './api/users/configuration';

const axiosInstance: AxiosInstance = axios.create({
  responseType: "json"
});

const moviesApi = MoviesApiFactory(
  new MoviesApiConfiguration(),
  "http://movies:80",
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

export { loginApi, moviesApi, reviewsApi, usersApi };
