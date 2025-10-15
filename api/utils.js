import axios from "axios";
import axiosRetry from "axios-retry";

const axiosInstance = axios.create();

axiosRetry(axiosInstance, {
  retries: 3,
  retryDelay: () => 100,
  retryCondition: (error) =>
    error.response?.status === 429 || axiosRetry.isRetryableError(error),
});

export const fetchData = async (url) => {
  try {
    const { data } = await axiosInstance.get(url);
    return data;
  } catch (err) {
    console.error(`Error fetching from ${url}:`, err.message);
    return null;
  }
};
