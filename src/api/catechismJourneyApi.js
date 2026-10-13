import api from "./axios";

const BASE_URL = "/catechism-journey";

export const getJourneyClasses = async () => {
  const response = await api.get(`${BASE_URL}/classes`);
  return response.data;
};

export const getClassJourney = async (classId) => {
  const response = await api.get(`${BASE_URL}/classes/${classId}`);

  return response.data;
};
