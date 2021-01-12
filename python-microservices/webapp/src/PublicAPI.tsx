import axios, { AxiosInstance } from "axios";
import { MoviesApiFactory } from './api-model/api'
import { Configuration } from './api-model/configuration';

const axiosInstance: AxiosInstance = axios.create({
  responseType: "json"
});

// TODO(kantoniak): Use public API once we have it
export default MoviesApiFactory(
  new Configuration(),
  process.env.REACT_APP_API_URL,
  axiosInstance
);
