import axios from "./axios";

export const getVisitorStats = () => {
  return axios.get("/stats");
};

export const getVisitorChart = () => {
  return axios.get("/stats/chart");
};
