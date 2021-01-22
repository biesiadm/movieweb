import axios, { AxiosInstance } from "axios";

export const axiosInstance: AxiosInstance = axios.create({
  responseType: "json"
});
