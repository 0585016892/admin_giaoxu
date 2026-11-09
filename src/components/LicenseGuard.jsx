import React, { useCallback, useEffect, useRef, useState } from "react";

import { useLocation } from "react-router-dom";

import axios from "../api/axios";
import LicenseExpiredPage from "../pages/license/LicenseExpiredPage";
import LoadingLogo from "./LoadingLogo";

// =========================================================
// CẤU HÌNH ROUTE
// =========================================================

const ALLOWED_PATHS = ["/", "/register", "/intro"];

// =========================================================
// HÀM KIỂM TRA PUBLIC ROUTE
// =========================================================

const checkAllowedPath = (pathname) => {
  return ALLOWED_PATHS.some((path) => {
    if (path === "/") {
      return pathname === "/";
    }

    return pathname === path || pathname.startsWith(`${path}/`);
  });
};

// =========================================================
// LICENSE GUARD
// =========================================================

const LicenseGuard = ({ children }) => {
  const location = useLocation();

  const pathname = location.pathname.toLowerCase();

  const isAllowedPath = checkAllowedPath(pathname);

  // =========================================================
  // STATE
  // =========================================================

  // Kết quả API đã hoàn thành chưa?
  const [checking, setChecking] = useState(true);

  // License hết hạn hay chưa?
  const [expired, setExpired] = useState(false);

  // Có đang hiển thị loading không?
  const [showLoading, setShowLoading] = useState(true);

  // Dùng để xác định request hiện tại.
  const requestIdRef = useRef(0);

  // Lưu route đã kiểm tra.
  const [checkedPath, setCheckedPath] = useState(null);

  // =========================================================
  // KIỂM TRA LICENSE
  // =========================================================

  useEffect(() => {
    const controller = new AbortController();

    const requestId = ++requestIdRef.current;

    let active = true;

    // Không cho request cũ thay đổi dữ liệu.
    const isCurrentRequest = () => {
      return (
        active &&
        requestId === requestIdRef.current &&
        !controller.signal.aborted
      );
    };

    const checkLicense = async () => {
      // =====================================================
      // PUBLIC ROUTES
      // =====================================================

      if (isAllowedPath) {
        if (!isCurrentRequest()) return;

        setExpired(false);
        setChecking(false);
        setShowLoading(false);
        setCheckedPath(pathname);

        return;
      }

      // =====================================================
      // CHƯA ĐĂNG NHẬP
      // =====================================================

      const token = localStorage.getItem("token");

      if (!token) {
        if (!isCurrentRequest()) return;

        setExpired(false);
        setChecking(false);
        setShowLoading(false);
        setCheckedPath(pathname);

        return;
      }

      // =====================================================
      // BẮT ĐẦU CHECK LICENSE
      // =====================================================

      setChecking(true);
      setShowLoading(true);
      setCheckedPath(null);

      try {
        const res = await axios.get("/license/me", {
          signal: controller.signal,
        });

        if (!isCurrentRequest()) return;

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
        // ===================================================

        const isExpired = !isLifetime && license?.is_expired === true;

        setExpired(isExpired);

        // ===================================================
        // LOCAL STORAGE
        // ===================================================

        if (isExpired) {
          localStorage.setItem("faidedu_license_expired", "true");
        } else {
          localStorage.removeItem("faidedu_license_expired");
        }

        // API đã xong, nhưng KHÔNG ẩn loading.
        setChecking(false);
        setCheckedPath(pathname);
      } catch (error) {
        if (!isCurrentRequest()) return;

        // ===================================================
        // BACKEND TRẢ 402
        // ===================================================

        if (error?.response?.status === 402) {
          setExpired(true);

          localStorage.setItem("faidedu_license_expired", "true");
        } else {
          // =================================================
          // NETWORK / SERVER ERROR
          // =================================================

          setExpired(false);

          localStorage.removeItem("faidedu_license_expired");

          console.error("[LICENSE_GUARD] Không kiểm tra được license:", error);
        }

        setChecking(false);
        setCheckedPath(pathname);
      }
    };

    checkLicense();

    // =====================================================
    // CLEANUP
    // =====================================================

    return () => {
      active = false;
      controller.abort();
    };
  }, [pathname, isAllowedPath]);

  // =========================================================
  // LOADING HOÀN THÀNH
  // =========================================================

  const handleLoadingComplete = useCallback(() => {
    // Chỉ ẩn nếu API của route hiện tại đã xong.
    if (checking || checkedPath !== pathname) {
      return;
    }

    setShowLoading(false);
  }, [checking, checkedPath, pathname]);

  // =========================================================
  // PUBLIC ROUTES
  // =========================================================

  if (isAllowedPath) {
    return children;
  }

  // =========================================================
  // CHƯA ĐĂNG NHẬP
  // =========================================================

  const hasToken = Boolean(localStorage.getItem("token"));

  if (!hasToken) {
    return children;
  }

  // =========================================================
  // HIỂN THỊ LOADING
  // =========================================================

  // checkedPath !== pathname ngăn việc
  // hiển thị nội dung route mới trước khi kiểm tra.
  const shouldShowLoading = showLoading || checkedPath !== pathname;

  if (shouldShowLoading) {
    return (
      <LoadingLogo
        key={pathname}
        loading={checking || checkedPath !== pathname}
        onComplete={handleLoadingComplete}
      />
    );
  }

  // =========================================================
  // LICENSE HẾT HẠN
  // =========================================================

  if (expired) {
    return <LicenseExpiredPage />;
  }

  // =========================================================
  // TRUY CẬP BÌNH THƯỜNG
  // =========================================================

  return children;
};

export default LicenseGuard;
