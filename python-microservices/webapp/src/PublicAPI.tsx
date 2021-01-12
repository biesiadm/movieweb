import axios, { AxiosInstance } from "axios";
import { DefaultApiFactory } from './api/public/api'
import { Configuration } from './api/public/configuration';

const axiosInstance: AxiosInstance = axios.create({
  responseType: "json"
});

// TODO(kantoniak): Use public API once we have it
export default DefaultApiFactory(
  new Configuration(),
  process.env.REACT_APP_API_URL,
  axiosInstance
);
