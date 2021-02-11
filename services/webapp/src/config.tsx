import axios, { AxiosInstance } from "axios";
import { MoviesApiFactory, ReviewsApiFactory, UsersApiFactory, InlineResponse200, InlineResponse2001, InlineResponse2002, InlineResponse2003 } from './api/public/api'
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

// OpenAPI generator does not pull response names from the schema. Reexporting
// under different names to avoid updating multiple places.
export type {
  InlineResponse200 as TokenResponse,
  InlineResponse2001 as MovieListResponse,
  InlineResponse2002 as ReviewListResponse,
  InlineResponse2003 as UserListResponse
};
