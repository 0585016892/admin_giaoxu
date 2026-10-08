import axios from "./axios";

// ============================================================
// ACADEMIC YEAR API
// ============================================================

const academicYearApi = {
  // ==========================================================
  // PREVIEW CREATE
  // ==========================================================

  previewCreate: async ({ fromAcademicYear, toAcademicYear }) => {
    const response = await axios.post("/academic-years/preview-create", {
      fromAcademicYear,
      toAcademicYear,
    });

    return response.data;
  },

  // ==========================================================
  // CREATE ACADEMIC YEAR
  // ==========================================================

  create: async ({ fromAcademicYear, toAcademicYear }) => {
    const response = await axios.post("/academic-years", {
      fromAcademicYear,
      toAcademicYear,
    });

    return response.data;
  },

  // ==========================================================
  // PREVIEW PROMOTION
  // ==========================================================

  previewPromotion: async ({ fromAcademicYear, toAcademicYear }) => {
    const response = await axios.post("/academic-years/preview-promotion", {
      fromAcademicYear,
      toAcademicYear,
    });

    return response.data;
  },

  // ==========================================================
  // CONFIRM PROMOTION
  // ==========================================================

  confirmPromotion: async ({ fromAcademicYear, toAcademicYear, students }) => {
    const response = await axios.post("/academic-years/confirm-promotion", {
      fromAcademicYear,
      toAcademicYear,
      students,
    });

    return response.data;
  },
};

export default academicYearApi;
