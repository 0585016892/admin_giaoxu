import axios from "./axios";

export const checkFeedback = async (email) => {
  const res = await axios.get("/contact-messages/check-feedback", {
    params: { email },
  });

  return res.data;
};

export const sendFeedback = async (data) => {
  const res = await axios.post("/contact-messages", data);

  return res.data;
};
