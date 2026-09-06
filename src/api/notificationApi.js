import axiosClient from "./axios";

const notificationApi = {
  // ==========================================================
  // CREATE
  // ==========================================================

  create: async (data) => {
    const response = await axiosClient.post("/notifications", data);

    return response.data;
  },

  // ==========================================================
  // GET LIST
  // ==========================================================

  getAll: async (params = {}) => {
    const response = await axiosClient.get("/notifications", {
      params,
    });

    return response.data;
  },

  // ==========================================================
  // GET TODAY
  // ==========================================================

  getToday: async () => {
    const response = await axiosClient.get("/notifications/today");

    return response.data;
  },

  // ==========================================================
  // GET DETAIL
  // ==========================================================

  getById: async (id) => {
    const response = await axiosClient.get(`/notifications/${id}`);

    return response.data;
  },

  // ==========================================================
  // MARK ONE READ
  // ==========================================================

  markAsRead: async (id) => {
    const response = await axiosClient.put(`/notifications/${id}/read`);

    return response.data;
  },

  // ==========================================================
  // MARK ALL READ
  // ==========================================================

  markAllAsRead: async () => {
    const response = await axiosClient.put("/notifications/read-all");

    return response.data;
  },

  // ==========================================================
  // DELETE ONE
  // ==========================================================

  delete: async (id) => {
    const response = await axiosClient.delete(`/notifications/${id}`);

    return response.data;
  },

  // ==========================================================
  // DELETE ALL
  // ==========================================================

  deleteAll: async () => {
    const response = await axiosClient.delete("/notifications/my/all");

    return response.data;
  },

  // ==========================================================
  // STATS
  // ==========================================================

  getStats: async () => {
    const response = await axiosClient.get("/notifications/stats");

    return response.data;
  },

  // ==========================================================
  // UNREAD COUNT
  // ==========================================================

  getUnreadCount: async () => {
    const response = await axiosClient.get("/notifications/unread-count");

    return response.data;
  },
};

export default notificationApi;
