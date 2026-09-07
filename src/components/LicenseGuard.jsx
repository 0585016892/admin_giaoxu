import React, { useEffect, useState } from "react";
import { Spin } from "antd";
import { useLocation } from "react-router-dom";

import axios from "../api/axios";
import LicenseExpiredPage from "../pages/license/LicenseExpiredPage";

const ALLOWED_PATHS = ["/", "/register", "/intro", "/license", "/activate"];

const LicenseGuard = ({ children }) => {
  const location = useLocation();

  const [checking, setChecking] = useState(true);
  const [expired, setExpired] = useState(false);
  const [checked, setChecked] = useState(false);

  const pathname = location.pathname.toLowerCase();

  const isAllowedPath = ALLOWED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );

  useEffect(() => {
    let mounted = true;

    const checkLicense = async () => {
      // ==========================================
      // PUBLIC ROUTES
      // ==========================================

      if (isAllowedPath) {
        if (mounted) {
          setChecking(false);
          setChecked(true);
          setExpired(false);
        }

        return;
      }

      // ==========================================
      // ĐÃ CHECK LICENSE RỒI
      // Không gọi API lại khi đổi route
      // ==========================================

      if (checked) {
        if (mounted) {
          setChecking(false);
        }

        return;
      }

      // ==========================================
      // CHƯA LOGIN
      // ==========================================

      const token = localStorage.getItem("token");

      if (!token) {
        if (mounted) {
          setChecking(false);
          setChecked(true);
          setExpired(false);
        }

        return;
      }

      // ==========================================
      // CHECK LICENSE
      // ==========================================

      try {
        setChecking(true);

        const res = await axios.get("/license/me");

        const license = res?.data?.license;

        console.log("🔐 LICENSE:", license);

        const isExpired =
          license?.status === "expired" || license?.is_expired === true;

        if (!mounted) return;

        setExpired(isExpired);

        if (isExpired) {
          localStorage.setItem("faidedu_license_expired", "true");
        } else {
          localStorage.removeItem("faidedu_license_expired");
        }

        setChecked(true);
      } catch (error) {
        console.error("❌ Check license:", error);

        if (!mounted) return;

        // Backend trả 402 = license hết hạn
        if (error?.response?.status === 402) {
          setExpired(true);

          localStorage.setItem("faidedu_license_expired", "true");
        } else {
          // Không nên khóa toàn bộ app nếu
          // chỉ là lỗi mạng/server tạm thời
          setExpired(false);
        }

        setChecked(true);
      } finally {
        if (mounted) {
          setChecking(false);
        }
      }
    };

    checkLicense();

    return () => {
      mounted = false;
    };
  }, [isAllowedPath, checked]);

  // ==========================================
  // PUBLIC
  // ==========================================

  if (isAllowedPath) {
    return children;
  }

  // ==========================================
  // CHECKING LẦN ĐẦU
  // ==========================================

  if (checking && !checked) {
    return (
      <div className="license-initial-loading">
        <Spin size="large" />
      </div>
    );
  }

  // ==========================================
  // EXPIRED
  // ==========================================

  if (expired) {
    return <LicenseExpiredPage />;
  }

  // ==========================================
  // NORMAL APP
  // ==========================================

  return children;
};

export default LicenseGuard;
