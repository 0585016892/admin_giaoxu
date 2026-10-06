// src/api/assistantApi.js

import axios from "./axios";

export const chatWithAssistant = async (message) => {
  const response = await axios.post("/assistant/chat", {
    message,
  });

  return response.data;
};
