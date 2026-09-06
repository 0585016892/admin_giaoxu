import { useEffect, useState } from "react";
import axios from "axios";
import { Spin } from "antd";
import ApiErrorPage from "./ApiError";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

function ApiChecker({ children }) {
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    const checkApi = async () => {
      try {
        await axios.get(`${API_URL}`, {
          timeout: 5000,
        });

        setStatus("success");
      } catch (error) {
        console.error("API không khả dụng:", error);
        setStatus("error");
      }
    };

    checkApi();
  }, []);

  if (status === "checking") {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (status === "error") {
    return <ApiErrorPage />;
  }

  return children;
}

export default ApiChecker;
