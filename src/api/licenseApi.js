import axios from "./axios";

const licenseApi = {
  getConfig: async () => {
    const response = await axios.get("/license-regis/registration/config");

    return response?.data ?? response;
  },

  getMyRegistrations: async () => {
    const response = await axios.get("/license-regis/registration/me");

    return response?.data ?? response;
  },

  getById: async (id) => {
    const response = await axios.get(`/license-regis/registration/${id}`);

    return response?.data ?? response;
  },

  createRegistration: async (formData) => {
    const response = await axios.post("/license-regis/registration", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response?.data ?? response;
  },

  deleteRegistration: async (id) => {
    const response = await axios.delete(`/license-regis/registration/${id}`);

    return response?.data ?? response;
  },
};

export default licenseApi;
