import axios from "./axios";

const getMe = async () => {
  try {
    const response = await axios.get("/parent/me");
    return response;
  } catch (error) {
    console.error("GET PARENT ME ERROR:", error);
    return {
      success: false,
      message: "Không thể tải thông tin tài khoản phụ huynh",
    };
  }
};

const getChildren = async () => {
  try {
    const response = await axios.get("/parent/children");
    return response;
  } catch (error) {
    console.error("GET PARENT CHILDREN ERROR:", error);
    return {
      success: false,
      message: "Không thể tải danh sách con",
    };
  }
};

const getChild = async (studentId) => {
  try {
    if (!studentId) {
      return {
        success: false,
        message: "Thiếu mã học sinh",
      };
    }

    const response = await axios.get(`/parent/children/${studentId}`);

    return response;
  } catch (error) {
    console.error("GET CHILD DETAIL ERROR:", error);
    return {
      success: false,
      message: "Không thể tải thông tin học sinh",
    };
  }
};

const getChildAttendance = async (studentId, params = {}) => {
  try {
    if (!studentId) {
      return {
        success: false,
        message: "Thiếu mã học sinh",
      };
    }

    const response = await axios.get(
      `/parent/children/${studentId}/attendance`,
      {
        params,
      },
    );

    return response;
  } catch (error) {
    console.error("GET CHILD ATTENDANCE ERROR:", error);
    return {
      success: false,
      message: "Không thể tải dữ liệu điểm danh",
    };
  }
};

const getChildResults = async (studentId, params = {}) => {
  try {
    if (!studentId) {
      return {
        success: false,
        message: "Thiếu mã học sinh",
      };
    }

    const response = await axios.get(`/parent/children/${studentId}/results`, {
      params,
    });

    return response;
  } catch (error) {
    console.error("GET CHILD RESULTS ERROR:", error);
    return {
      success: false,
      message: "Không thể tải kết quả học tập",
    };
  }
};

const getChildSchedule = async (studentId) => {
  try {
    if (!studentId) {
      return {
        success: false,
        message: "Thiếu mã học sinh",
      };
    }

    const response = await axios.get(`/parent/children/${studentId}/schedule`);

    return response;
  } catch (error) {
    console.error("GET CHILD SCHEDULE ERROR:", error);
    return {
      success: false,
      message: "Không thể tải lịch học",
    };
  }
};

const getChildCertificates = async (studentId) => {
  try {
    if (!studentId) {
      return {
        success: false,
        message: "Thiếu mã học sinh",
      };
    }

    const response = await axios.get(
      `/parent/children/${studentId}/certificates`,
    );

    return response;
  } catch (error) {
    console.error("GET CHILD CERTIFICATES ERROR:", error);
    return {
      success: false,
      message: "Không thể tải chứng chỉ",
    };
  }
};

const parentApi = {
  getMe,
  getChildren,
  getChild,
  getChildAttendance,
  getChildResults,
  getChildSchedule,
  getChildCertificates,
};

export default parentApi;
