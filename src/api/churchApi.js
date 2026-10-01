import axios from "./axios";

// =====================================================
// GET ALL
// SEARCH + FILTER + PAGINATION
// =====================================================
export const getChurches = async (params) => {
  const res = await axios.get("/churches", { params });
  return res.data;
};

// =====================================================
// GET BY ID
// =====================================================
export const getChurchById = async (id) => {
  const res = await axios.get(`/churches/${id}`);
  return res.data;
};

// =====================================================
// CREATE
// =====================================================
export const createChurch = async (data) => {
  const res = await axios.post("/churches", data);
  return res.data;
};

// =====================================================
// UPDATE
// =====================================================
export const updateChurch = async (id, data) => {
  const res = await axios.put(`/churches/${id}`, data);
  return res.data;
};

// =====================================================
// DELETE
// =====================================================
export const deleteChurch = async (id) => {
  const res = await axios.delete(`/churches/${id}`);
  return res.data;
};

// =====================================================
// TOGGLE ACTIVE
// =====================================================
export const toggleChurchActive = async (id) => {
  const res = await axios.patch(`/churches/${id}/toggle`);

  return res.data;
};

// =====================================================
// SEARCH MAP
// NEARBY
// =====================================================
export const searchChurchMap = async (params) => {
  const res = await axios.get(`/churches/map/search`, { params });

  return res.data;
};

// =====================================================
// GET TỔNG GIÁO PHẬN
// =====================================================
export const getArchdioceses = async () => {
  const res = await axios.get("/churches/archdioceses");

  return res.data;
};

// =====================================================
// GET GIÁO PHẬN THEO TỔNG GIÁO PHẬN
// =====================================================
export const getDiocesesByParent = async (parentDioceseId) => {
  const res = await axios.get(`/churches/by-parent/${parentDioceseId}`);

  return res.data;
};

// =====================================================
// GET GIÁO HẠT THEO GIÁO PHẬN
// =====================================================
export const getDeaneriesByDiocese = async (dioceseId) => {
  const res = await axios.get(`/churches/by-diocese/${dioceseId}`);

  return res.data;
};
