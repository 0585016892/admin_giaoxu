import api from "./axios";

const BASE_URL = "/catechism-programs";

const catechismProgramApi = {
  getAll(params = {}) {
    return api.get(BASE_URL, { params });
  },

  getById(id) {
    return api.get(`${BASE_URL}/${id}`);
  },
};

export default catechismProgramApi;
