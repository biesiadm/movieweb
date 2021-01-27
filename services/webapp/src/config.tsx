import axios, { AxiosInstance } from "axios";
import { MoviesApiFactory, ReviewsApiFactory, UsersApiFactory } from './api/public/api'
import { Configuration } from './api/public/configuration';

const BASE_URL = 'http://localhost:8080';
const API_URL = 'http://localhost:8081';

const axiosInstance: AxiosInstance = axios.create({
  responseType: "json"
});

const moviesApi = MoviesApiFactory(
  new Configuration(),
  API_URL,
  axiosInstance
);

const reviewsApi = ReviewsApiFactory(
  new Configuration(),
  API_URL,
  axiosInstance
);

const usersApi = UsersApiFactory(
  new Configuration(),
  API_URL,
  axiosInstance
);

export { BASE_URL, moviesApi, reviewsApi, usersApi };
