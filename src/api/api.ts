import axios from "axios";

/** Setup an API instance */
export const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "https://api.tgpm.world/",
  proxy: false,
  withCredentials: false,
  paramsSerializer: {indexes: null}
});

axiosInstance.interceptors.response.use(
  res => res,
  err => {
    const status = err.response?.status;
    const message = err.response?.data?.detail ?? err.message ?? "Unknown error";
    return Promise.reject(new Error(status ? `[${status}] ${message}` : message));
  }
);
