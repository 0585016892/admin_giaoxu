import axios from "./axios";

const studentApi = {
  // ================================
  // STUDENTS
  // ================================

  getStudents: async (params = {}) => {
    const response = await axios.get(`students`, {
      params,
    });

    return response.data;
  },

  getStudentById: async (id) => {
    const response = await axios.get(`students/${id}`);

    return response.data;
  },

  createStudent: async (data) => {
    const response = await axios.post(`students`, data);

    return response.data;
  },

  updateStudent: async (id, data) => {
    const response = await axios.put(`students/${id}`, data);

    return response.data;
  },

  deleteStudent: async (id) => {
    const response = await axios.delete(`students/${id}`);

    return response.data;
  },

  // ================================
  // STUDENT CLASSES
  // ================================

  getStudentClasses: async (studentId) => {
    const response = await axios.get(
      `students/student-classes/student/${studentId}`,
    );

    return response.data;
  },

  createStudentClass: async (data) => {
    const response = await axios.post(`students/student-classes`, data);

    return response.data;
  },

  updateStudentClass: async (id, data) => {
    const response = await axios.put(`students/student-classes/${id}`, data);

    return response.data;
  },

  deleteStudentClass: async (id) => {
    const response = await axios.delete(`students/student-classes/${id}`);

    return response.data;
  },

  // ================================
  // STUDENT EXAMS
  // ================================

  getStudentExams: async (studentId) => {
    const response = await axios.get(
      `students/student-exams/student/${studentId}`,
    );

    return response.data;
  },

  createStudentExam: async (data) => {
    const response = await axios.post(`students/student-exams`, data);

    return response.data;
  },

  updateStudentExam: async (id, data) => {
    const response = await axios.put(`students/student-exams/${id}`, data);

    return response.data;
  },

  deleteStudentExam: async (id) => {
    const response = await axios.delete(`students/student-exams/${id}`);

    return response.data;
  },
};

export default studentApi;
