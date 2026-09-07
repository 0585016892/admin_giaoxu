import axios from "axios";

const instance = axios.create({
  baseURL: `${process.env.REACT_APP_API_URL}/api` || "http://localhost:5000",
  timeout: 15000,
});

instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

instance.interceptors.response.use(
  (response) => response,

  (error) => {
    const status = error?.response?.status;

    const errorCode = error?.response?.data?.code;

    if (status === 402 && errorCode === "FAITHEDU_LICENSE_EXPIRED") {
      localStorage.setItem("faidedu_license_expired", "true");

      // Phát event để LicenseContext bắt được
      window.dispatchEvent(new CustomEvent("faidedu-license-expired"));
    }

    return Promise.reject(error);
  },
);

export default instance;
