import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import axios from "../api/axios";
import LicenseExpiredPage from "../pages/license/LicenseExpiredPage";
import LoadingLogo from "./LoadingLogo";

// =========================================================
// ROUTE ĐƯỢC PHÉP TRUY CẬP KHI LICENSE HẾT HẠN
// =========================================================

const ALLOWED_PATHS = ["/", "/register", "/intro"];

const LicenseGuard = ({ children }) => {
  const location = useLocation();

  const [checking, setChecking] = useState(true);
  const [expired, setExpired] = useState(false);
  const [progress, setProgress] = useState(0);

  const pathname = location.pathname.toLowerCase();

  // =========================================================
  // PUBLIC ROUTES
  // =========================================================

  const isAllowedPath = ALLOWED_PATHS.some((path) => {
    // "/" chỉ cho phép đúng trang "/"
    if (path === "/") {
      return pathname === "/";
    }

    return pathname === path || pathname.startsWith(`${path}/`);
  });

  // =========================================================
  // CHECK LICENSE
  // =========================================================

  useEffect(() => {
    let mounted = true;

    let progressTimer = null;

    const startProgress = () => {
      let current = 0;

      setProgress(0);

      progressTimer = setInterval(() => {
        if (!mounted) return;

        current += Math.floor(Math.random() * 8) + 3;

        // Không cho vượt quá 90% trước khi API trả kết quả
        if (current >= 90) {
          current = 90;
        }

        setProgress(current);

        if (current >= 90 && progressTimer) {
          clearInterval(progressTimer);
          progressTimer = null;
        }
      }, 120);
    };

    const finishProgress = () => {
      if (!mounted) return;

      if (progressTimer) {
        clearInterval(progressTimer);
        progressTimer = null;
      }

      setProgress(100);
    };

    const checkLicense = async () => {
      // =====================================================
      // PUBLIC ROUTES
      // =====================================================

      if (isAllowedPath) {
        if (!mounted) return;

        setExpired(false);
        setProgress(100);
        setChecking(false);

        return;
      }

      // =====================================================
      // CHƯA LOGIN
      // =====================================================

      const token = localStorage.getItem("token");

      if (!token) {
        if (!mounted) return;

        setExpired(false);
        setProgress(100);
        setChecking(false);

        return;
      }

      // =====================================================
      // BẮT ĐẦU CHECK
      // =====================================================

      try {
        if (mounted) {
          setChecking(true);
        }

        startProgress();

        const res = await axios.get("/license/me");

        const license = res?.data?.license;

        // ===================================================
        // LICENSE TYPE
        // ===================================================

        const licenseType = license?.type || license?.license_type || null;

        // ===================================================
        // LIFETIME
        // ===================================================

        const isLifetime =
          licenseType === "lifetime" || license?.is_lifetime === true;

        // ===================================================
        // EXPIRED
        //
        // Backend chịu trách nhiệm tính is_expired
        // ===================================================

        const isExpired = !isLifetime && license?.is_expired === true;

        // ===================================================
        // DEBUG
        // ===================================================

        if (!mounted) return;

        // ===================================================
        // SET EXPIRED
        // ===================================================

        setExpired(isExpired);

        // ===================================================
        // LOCAL STORAGE
        // ===================================================

        if (isExpired) {
          localStorage.setItem("faidedu_license_expired", "true");
        } else {
          localStorage.removeItem("faidedu_license_expired");
        }

        // ===================================================
        // COMPLETE PROGRESS
        // ===================================================

        finishProgress();
      } catch (error) {
        if (!mounted) return;

        // =================================================
        // BACKEND TRẢ 402
        // =================================================

        if (error?.response?.status === 402) {
          setExpired(true);

          localStorage.setItem("faidedu_license_expired", "true");
        } else {
          // =================================================
          // NETWORK / SERVER ERROR
          //
          // Không xác định được license thì không khóa app.
          // =================================================

          setExpired(false);

          localStorage.removeItem("faidedu_license_expired");
        }

        // =================================================
        // COMPLETE PROGRESS
        // =================================================

        finishProgress();
      } finally {
        if (mounted) {
          setChecking(false);
        }
      }
    };

    checkLicense();

    return () => {
      mounted = false;

      if (progressTimer) {
        clearInterval(progressTimer);
        progressTimer = null;
      }
    };
  }, [pathname, isAllowedPath]);

  // =========================================================
  // PUBLIC ROUTES
  // =========================================================

  if (isAllowedPath) {
    return children;
  }

  // =========================================================
  // CHECKING
  // =========================================================

  if (checking) {
    return (
      <div
        style={{
          width: "100%",
          height: "100vh",

          display: "flex",
          alignItems: "center",
          justifyContent: "center",

          background: "#F7F9FC",

          color: "#173B5E",

          fontSize: 15,
          fontWeight: 600,
        }}
      >
        <LoadingLogo progress={progress} />
      </div>
    );
  }

  // =========================================================
  // EXPIRED
  // =========================================================

  if (expired) {
    return <LicenseExpiredPage />;
  }

  // =========================================================
  // NORMAL APP
  // =========================================================

  return children;
};

export default LicenseGuard;
