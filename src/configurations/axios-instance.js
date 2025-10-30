import axios from "axios";
import { env } from "./environment.js";
import logger from "./logger.js";

const errorHandler = (error) => {
  if (error.response) {
    logger.error(
      `Error ${error.response.status} dari ${
        error.config.url
      }: ${JSON.stringify(error.response.data)}`
    );
  } else if (error.request) {
    logger.error(`Tidak ada respons dari: ${error.config.url}`);
  } else {
    logger.error("Error saat setup request Axios:", error.message);
  }
  return Promise.reject(error);
};

export const inventoryAPI = axios.create({
  baseURL: env.INVENTORY_URL,
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
  },
});

inventoryAPI.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

inventoryAPI.interceptors.response.use((response) => response, errorHandler);
