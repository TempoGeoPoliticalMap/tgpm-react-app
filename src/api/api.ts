import axios from "axios";
// import {ENV} from "@app/constants/env";

/** Setup an API instance */
export const axiosInstance = axios.create({
  // baseURL: ENV.API_HOST,
  baseURL: "https://api.tgpm.world/",
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
    "cache-control": "no-cache",
    "Access-Control-Allow-Origin": "*"
  }
});

axiosInstance.interceptors.response.use(res => res);
