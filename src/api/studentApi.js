import axiosClient from "./axios";

const studentApi = {
  getAll: () => axiosClient.get("/students"),

  getById: (id) => axiosClient.get(`/students/${id}`),

  create: (data) => axiosClient.post("/students", data),

  update: (id, data) => axiosClient.put(`/students/${id}`, data),

  delete: (id) => axiosClient.delete(`/students/${id}`),
};

export default studentApi;
