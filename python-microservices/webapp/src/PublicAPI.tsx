import axios, { AxiosInstance } from "axios";
import { DefaultApiFactory } from './api/public/api'
import { Configuration } from './api/public/configuration';

const axiosInstance: AxiosInstance = axios.create({
  responseType: "json"
});

export default DefaultApiFactory(
  new Configuration(),
  'http://localhost:8081',
  axiosInstance
);
