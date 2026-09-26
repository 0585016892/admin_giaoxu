import React, { useCallback, useEffect, useRef, useState } from "react";

import { Spin } from "antd";

import {
  CheckCircleFilled,
  CloseCircleFilled,
  LoadingOutlined,
  ScanOutlined,
  WarningFilled,
  ClockCircleOutlined,
  IdcardOutlined,
  TeamOutlined,
} from "@ant-design/icons";

import { Scanner } from "@yudiel/react-qr-scanner";

import { scanQRCode } from "../../api/attendanceApi";

/* =========================================================
   COLORS
========================================================= */

const COLORS = {
  navy: "#173B5E",
  navyHover: "#244F78",
  gold: "#D9A441",

  background: "#F7F9FC",
  white: "#FFFFFF",

  text: "#173B5E",
  textSecondary: "#64748B",
  muted: "#94A3B8",

  border: "#E2E8F0",

  navyLight: "#EEF3F7",
  goldLight: "#FBF5E7",

  success: "#2E7D5B",
  successBg: "#EAF6F0",

  warning: "#B7791F",
  warningBg: "#FFF7E5",

  gray: "#64748B",
  grayBg: "#F1F5F9",

  danger: "#C0392B",
  dangerBg: "#FDEDEC",
};

/* =========================================================
   CONFIG
========================================================= */

const DISPLAY_TIME = {
  success: 1400,
  warning: 1800,
  error: 2000,
};

const DUPLICATE_SCAN_TIME = 2500;

/* =========================================================
   COMPONENT
========================================================= */

const QRCodeScanner = ({
  open,
  classId,
  attendanceType = "catechism",
  onSuccess,
  onFinishAttendance,
}) => {
  const [processing, setProcessing] = useState(false);
  const [scanMessage, setScanMessage] = useState(null);

  const processingRef = useRef(false);

  const lastScanRef = useRef({
    token: null,
    time: 0,
  });

  const messageTimeoutRef = useRef(null);

  const mountedRef = useRef(false);

  /* =======================================================
     CLEAR TIMEOUT
  ======================================================= */

  const clearMessageTimeout = useCallback(() => {
    if (messageTimeoutRef.current) {
      clearTimeout(messageTimeoutRef.current);
      messageTimeoutRef.current = null;
    }
  }, []);

  /* =======================================================
     RESET
  ======================================================= */

  const resetScanner = useCallback(() => {
    clearMessageTimeout();

    processingRef.current = false;

    setProcessing(false);
    setScanMessage(null);

    lastScanRef.current = {
      token: null,
      time: 0,
    };
  }, [clearMessageTimeout]);

  /* =======================================================
     MOUNT
  ======================================================= */

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;

      clearMessageTimeout();

      processingRef.current = false;
    };
  }, [clearMessageTimeout]);

  /* =======================================================
     OPEN / CLOSE
  ======================================================= */

  useEffect(() => {
    if (!open) {
      resetScanner();
    }
  }, [open, resetScanner]);

  /* =======================================================
     VIBRATE
  ======================================================= */

  const vibrate = useCallback((pattern) => {
    try {
      if (
        typeof navigator !== "undefined" &&
        typeof navigator.vibrate === "function"
      ) {
        navigator.vibrate(pattern);
      }
    } catch {
      // Ignore
    }
  }, []);

  /* =======================================================
     SHOW MESSAGE
  ======================================================= */

  const showMessage = useCallback(
    (data, duration) => {
      if (!mountedRef.current) {
        return;
      }

      clearMessageTimeout();

      setScanMessage(data);

      messageTimeoutRef.current = setTimeout(() => {
        if (!mountedRef.current) {
          return;
        }

        setScanMessage(null);

        processingRef.current = false;
        setProcessing(false);

        messageTimeoutRef.current = null;
      }, duration);
    },
    [clearMessageTimeout],
  );

  /* =======================================================
     HANDLE SCAN
  ======================================================= */

  const handleScan = useCallback(
    async (detectedCodes) => {
      if (!open || processingRef.current) {
        return;
      }

      if (!Array.isArray(detectedCodes) || detectedCodes.length === 0) {
        return;
      }

      const rawValue = detectedCodes[0]?.rawValue;

      if (!rawValue || typeof rawValue !== "string") {
        return;
      }

      const qrToken = rawValue.trim();

      if (!qrToken) {
        return;
      }

      /* =================================================
         CHECK CLASS
      ================================================= */

      if (!classId) {
        processingRef.current = true;

        showMessage(
          {
            type: "error",
            title: "Chưa chọn lớp",
            message: "Vui lòng chọn lớp học trước khi bắt đầu quét mã.",
          },
          DISPLAY_TIME.error,
        );

        vibrate([150, 100, 150]);

        return;
      }

      /* =================================================
         DUPLICATE
      ================================================= */

      const now = Date.now();

      const isDuplicate =
        lastScanRef.current.token === qrToken &&
        now - lastScanRef.current.time < DUPLICATE_SCAN_TIME;

      if (isDuplicate) {
        return;
      }

      lastScanRef.current = {
        token: qrToken,
        time: now,
      };

      processingRef.current = true;

      setProcessing(true);

      clearMessageTimeout();
      setScanMessage(null);

      /* =================================================
         API
      ================================================= */
      const normalizedAttendanceType = String(attendanceType || "")
        .trim()
        .toLowerCase();

      if (!["catechism", "mass"].includes(normalizedAttendanceType)) {
        processingRef.current = true;

        showMessage(
          {
            type: "error",
            title: "Loại điểm danh không hợp lệ",
            message: "Vui lòng chọn Giáo lý hoặc Thánh lễ trước khi quét.",
          },
          DISPLAY_TIME.error,
        );

        vibrate([150, 100, 150]);

        return;
      }

      try {
        const response = await scanQRCode({
          qr_token: qrToken,
          class_id: Number(classId),
          attendance_type: normalizedAttendanceType,
        });

        const data = response?.data || response;

        /* ===============================================
           PARENT SUCCESS
        =============================================== */

        if (typeof onSuccess === "function") {
          try {
            await onSuccess(data);
          } catch {
            // Ignore parent error
          }
        }

        /* ===============================================
           SUCCESS
        =============================================== */

        showMessage(
          {
            type: "success",

            title: "Điểm danh thành công!",

            message: data?.message || "Đã ghi nhận học sinh vào lớp.",

            student: data?.student || null,

            class: data?.class || null,

            attendance: data?.attendance || null,
          },
          DISPLAY_TIME.success,
        );

        vibrate(100);
      } catch (error) {
        const status = error?.response?.status;

        const data = error?.response?.data || {};

        /* ===============================================
           ALREADY ATTENDED
        =============================================== */

        if (status === 409 || data?.code === "ALREADY_ATTENDED") {
          showMessage(
            {
              type: "warning",

              title: "Đã điểm danh trước đó",

              message:
                data?.message || "Học sinh này đã được ghi nhận từ trước.",

              student: data?.student || null,

              class: data?.class || null,

              attendance: data?.attendance || null,
            },
            DISPLAY_TIME.warning,
          );

          vibrate([100, 60, 100]);

          return;
        }

        /* ===============================================
           NOT IN CLASS
        =============================================== */

        if (
          data?.code === "STUDENT_NOT_IN_CLASS" ||
          data?.message === "Học sinh này không thuộc lớp đang điểm danh"
        ) {
          showMessage(
            {
              type: "class_error",

              title: "Không thuộc lớp học",

              message:
                data?.message || "Học sinh này không nằm trong danh sách lớp.",

              student: data?.student || null,

              class: data?.class || null,
            },
            DISPLAY_TIME.error,
          );

          vibrate([150, 100, 150]);

          return;
        }

        /* ===============================================
           INVALID QR
        =============================================== */

        if (data?.code === "INVALID_QR" || data?.code === "INVALID_QR_TOKEN") {
          showMessage(
            {
              type: "error",

              title: "Mã QR không hợp lệ",

              message:
                data?.message || "Mã không đúng hoặc đã hết hạn sử dụng.",
            },
            DISPLAY_TIME.error,
          );

          vibrate([150, 100, 150]);

          return;
        }

        /* ===============================================
           STUDENT NOT FOUND
        =============================================== */

        if (status === 404 || data?.code === "STUDENT_NOT_FOUND") {
          showMessage(
            {
              type: "error",

              title: "Không tìm thấy học sinh",

              message: data?.message || "Không tra cứu được dữ liệu học viên.",

              student: data?.student || null,
            },
            DISPLAY_TIME.error,
          );

          vibrate([150, 100, 150]);

          return;
        }

        /* ===============================================
           GENERAL ERROR
        =============================================== */

        showMessage(
          {
            type: "error",

            title: "Lỗi hệ thống",

            message:
              data?.message ||
              error?.message ||
              "Không thể thực hiện điểm danh lúc này.",

            student: data?.student || null,

            class: data?.class || null,
          },
          DISPLAY_TIME.error,
        );

        vibrate([150, 100, 150]);
      }
    },
    [
      open,
      classId,
      attendanceType,
      onSuccess,
      showMessage,
      clearMessageTimeout,
      vibrate,
    ],
  );

  /* =======================================================
     MESSAGE STYLE
  ======================================================= */

  const getMessageStyle = () => {
    if (!scanMessage) {
      return {};
    }

    switch (scanMessage.type) {
      case "success":
        return {
          background: COLORS.success,

          icon: (
            <CheckCircleFilled
              style={{
                color: COLORS.white,
              }}
            />
          ),
        };

      case "warning":
        return {
          background: COLORS.warning,

          icon: (
            <WarningFilled
              style={{
                color: COLORS.white,
              }}
            />
          ),
        };

      default:
        return {
          background: COLORS.danger,

          icon: (
            <CloseCircleFilled
              style={{
                color: COLORS.white,
              }}
            />
          ),
        };
    }
  };

  /* =======================================================
     HIDDEN
  ======================================================= */

  if (!open) {
    return (
      <div
        style={{
          display: "none",
        }}
      />
    );
  }

  const currentAlert = getMessageStyle();

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <>
      <style>{`

        /* =====================================================
           CONTAINER
        ===================================================== */

        .scanner-container {
          position: relative;

          width: 100%;
          height: 500px;

          overflow: hidden;

          display: flex;
          flex-direction: column;

          background: ${COLORS.white};

          border: 1px solid ${COLORS.border};

          border-radius: 14px;

          font-family:
            'Be Vietnam Pro',
            'Inter',
            Arial,
            sans-serif;
        }


        /* =====================================================
           CAMERA
        ===================================================== */

        .scanner-video-wrapper {
          position: relative;

          flex: 1;

          width: 100%;
          height: 100%;

          overflow: hidden;

          background: #111827;
        }

        .scanner-video-wrapper video {
          width: 100% !important;
          height: 100% !important;

          object-fit: cover !important;

          display: block;
        }


        /* =====================================================
           VIEW FINDER
           KHÔNG CÓ Ô VUÔNG ĐỎ
        ===================================================== */

        .scanner-viewfinder {
          position: absolute;

          inset: 0;

          pointer-events: none;

          display: flex;

          flex-direction: column;

          align-items: center;

          justify-content: center;

          padding: 20px;
        }

        .scanner-frame-box {
          position: relative;

          width: 250px;
          height: 250px;

          /* Không nền */
          background: transparent;

          /* Không viền */
          border: none;

          border-radius: 0;

          display: flex;

          align-items: center;
          justify-content: center;
        }


        /* =====================================================
           GOLD CORNERS
           CHỈ GIỮ 4 GÓC VÀNG
        ===================================================== */

        .scanner-corner {
          position: absolute;

          width: 32px;
          height: 32px;


          border-style: solid;

          margin: 0;

        }

        .scanner-corner-tl {
          top: 0;
          left: 0;

          border-width:
            4px 0 0 4px;

          border-radius:
            8px 0 0 0;
        }

        .scanner-corner-tr {
          top: 0;
          right: 0;

          border-width:
            4px 4px 0 0;

          border-radius:
            0 8px 0 0;
        }

        .scanner-corner-bl {
          bottom: 0;
          left: 0;

          border-width:
            0 0 4px 4px;

          border-radius:
            0 0 0 8px;
        }

        .scanner-corner-br {
          bottom: 0;
          right: 0;

          border-width:
            0 4px 4px 0;

          border-radius:
            0 0 8px 0;
        }


        /* =====================================================
           LASER
        ===================================================== */

        @keyframes scannerLaser {
          0% {
            top: 8%;
            opacity: 0.6;
          }

          50% {
            top: 50%;
            opacity: 1;
          }

          100% {
            top: 92%;
            opacity: 0.6;
          }
        }

        .scanner-laser {
          position: absolute;

          left: 20px;
          right: 20px;

          height: 2px;

          background: ${COLORS.gold};

          box-shadow:
            0 0 6px
            rgba(217, 164, 65, 0.8);

          animation:
            scannerLaser
            2s
            ease-in-out
            infinite;

          pointer-events: none;
        }


        /* =====================================================
           HINT
        ===================================================== */

        .scanner-hint {
          margin-top: 20px;

          padding:
            9px 16px;

          display: flex;

          align-items: center;

          justify-content: center;

          gap: 8px;

          color: ${COLORS.white};

          background:
            rgba(23, 59, 94, 0.94);

          border-radius: 7px;

          font-size: 12px;

          font-weight: 600;

          box-shadow:
            0 4px 12px
            rgba(0, 0, 0, 0.2);
        }

        .scanner-hint .anticon {
          color:
            ${COLORS.gold} !important;
        }


        /* =====================================================
           LIVE BADGE
        ===================================================== */

        .scanner-live-badge {
          position: absolute;

          top: 15px;
          left: 15px;

          z-index: 20;

          display: flex;

          align-items: center;

          gap: 7px;

          padding:
            6px 12px;

          color:
            ${COLORS.white};

          background:
            rgba(23, 59, 94, 0.94);

          border-radius: 6px;

          font-size: 11px;

          font-weight: 600;

          box-shadow:
            0 3px 10px
            rgba(0, 0, 0, 0.18);
        }

        .scanner-live-dot {
          width: 7px;
          height: 7px;

          flex-shrink: 0;

          border-radius: 50%;

          background:
            ${COLORS.gold};

          box-shadow:
            0 0 6px
            rgba(217, 164, 65, 0.8);
        }


        /* =====================================================
           PROCESSING
           KHÔNG BLUR
        ===================================================== */

        .scanner-processing-overlay {
          position: absolute;

          inset: 0;

          z-index: 30;

          display: flex;

          flex-direction: column;

          align-items: center;

          justify-content: center;

          gap: 13px;

          background:
            rgba(23, 59, 94, 0.90);
        }

        .scanner-processing-box {
          width: 58px;
          height: 58px;

          display: flex;

          align-items: center;
          justify-content: center;

          border-radius: 12px;

          background:
            ${COLORS.navyHover};

          border:
            1px solid
            ${COLORS.gold};
        }

        .scanner-processing-text {
          color:
            ${COLORS.white};

          font-size: 13px;

          font-weight: 600;
        }


        /* =====================================================
           RESULT OVERLAY
           Chỉ xuất hiện khi đã có kết quả
        ===================================================== */

        .scanner-overlay {
          position: absolute;

          inset: 0;

          z-index: 30;

          display: flex;

          align-items: center;

          justify-content: center;

          padding: 20px;

          background:
            rgba(15, 23, 42, 0.70);
        }


        /* =====================================================
           RESULT CARD
        ===================================================== */

        .scanner-card {
          width: 100%;

          max-width: 360px;

          padding: 24px;

          overflow: hidden;

          color:
            ${COLORS.white};

          border-radius: 14px;

          text-align: center;

          border:
            1px solid
            rgba(255, 255, 255, 0.2);

          box-shadow:
            0 15px 35px
            rgba(0, 0, 0, 0.25);
        }

        .scanner-card-icon {
          font-size: 45px;

          line-height: 1;

          margin-bottom: 12px;
        }

        .scanner-card-title {
          margin: 0 0 5px;

          color:
            ${COLORS.white};

          font-size: 19px;

          font-weight: 800;
        }


        /* =====================================================
           STUDENT
        ===================================================== */

        .scanner-student-box {
          margin:
            16px 0;

          padding:
            12px 15px;

          background:
            rgba(0, 0, 0, 0.16);

          border-radius: 9px;

          border:
            1px solid
            rgba(255, 255, 255, 0.12);
        }

        .scanner-student-name {
          margin: 0;

          color:
            ${COLORS.white};

          font-size: 16px;

          font-weight: 700;
        }

        .scanner-student-code {
          display: inline-flex;

          align-items: center;

          gap: 5px;

          margin-top: 7px;

          padding:
            4px 9px;

          color:
            ${COLORS.white};

          background:
            rgba(0, 0, 0, 0.18);

          border-radius: 5px;

          font-size: 11px;
        }


        /* =====================================================
           CLASS
        ===================================================== */

        .scanner-class-info {
          display: flex;

          align-items: center;

          justify-content: center;

          gap: 6px;

          margin:
            0 0 11px;

          color:
            rgba(255, 255, 255, 0.92);

          font-size: 11px;

          font-weight: 500;
        }


        /* =====================================================
           TIME
        ===================================================== */

        .scanner-time-badge {
          display: inline-flex;

          align-items: center;

          gap: 6px;

          padding:
            5px 12px;

          margin-bottom: 8px;

          color:
            ${COLORS.white};

          background:
            rgba(0, 0, 0, 0.18);

          border:
            1px solid
            rgba(255, 255, 255, 0.12);

          border-radius: 5px;

          font-size: 11px;

          font-weight: 600;
        }


        /* =====================================================
           RESULT MESSAGE
        ===================================================== */

        .scanner-result-msg {
          margin:
            5px 0 0;

          color:
            rgba(255, 255, 255, 0.9);

          font-size: 11px;

          line-height: 1.5;
        }


        /* =====================================================
           FOOTER
        ===================================================== */

        .scanner-footer {
          min-height: 66px;

          display: flex;

          flex-direction: column;

          justify-content: center;

          gap: 4px;

          padding:
            11px 17px;

          background:
            ${COLORS.white};

          border-top:
            1px solid
            ${COLORS.border};
        }

        .scanner-footer-top {
          display: flex;

          align-items: center;

          justify-content: space-between;
        }

        .scanner-footer-status {
          display: flex;

          align-items: center;

          gap: 8px;
        }

        .scanner-status-dot {
          width: 8px;
          height: 8px;

          flex-shrink: 0;

          border-radius: 50%;
        }

        .scanner-status-dot.processing {
          background:
            ${COLORS.warning};
        }

        .scanner-status-dot.message {
          background:
            ${COLORS.gold};
        }

        .scanner-status-dot.ready {
          background:
            ${COLORS.success};
        }

        .scanner-footer-text {
          color:
            ${COLORS.navy};

          font-size: 11px;

          font-weight: 700;
        }

        .scanner-footer-note {
          margin: 0;

          color:
            ${COLORS.muted};

          font-size: 9px;

          font-style: italic;
        }


        /* =====================================================
           MOBILE
        ===================================================== */

        @media (max-width: 767px) {

          .scanner-container {
            height: 450px;
          }

          .scanner-frame-box {
            width: 210px;
            height: 210px;
          }

          .scanner-corner {
            width: 28px;
            height: 28px;
          }

          .scanner-hint {
            max-width: 90%;

            text-align: center;

            font-size: 11px;
          }

          .scanner-live-badge {
            top: 10px;
            left: 10px;

            padding:
              5px 9px;

            font-size: 10px;
          }

          .scanner-card {
            max-width:
              320px;

            padding:
              20px;
          }

          .scanner-card-title {
            font-size: 17px;
          }

          .scanner-student-name {
            font-size: 15px;
          }
        }

      `}</style>

      <div className="scanner-container">
        {/* =================================================
            CAMERA
        ================================================= */}

        <div className="scanner-video-wrapper">
          <Scanner
            onScan={handleScan}
            allowMultiple
            scanDelay={300}
            constraints={{
              facingMode: "environment",
            }}
            styles={{
              container: {
                width: "100%",
                height: "100%",
              },

              video: {
                width: "100%",
                height: "100%",
                objectFit: "cover",
              },
            }}
          />

          {/* ===============================================
              VIEW FINDER
          =============================================== */}

          <div className="scanner-viewfinder">
            <div className="scanner-frame-box">
              {/* 4 GÓC VÀNG - KHÔNG CÓ Ô ĐỎ */}

              {!processing && !scanMessage && <div className="scanner-laser" />}
            </div>

            {!processing && !scanMessage && (
              <div className="scanner-hint">
                <ScanOutlined />

                <span>Đưa mã QR học sinh vào giữa khung hình</span>
              </div>
            )}
          </div>

          {/* ===============================================
              LIVE
          =============================================== */}

          <div className="scanner-live-badge">
            <span className="scanner-live-dot" />

            <span>Đang quét trực tiếp</span>
          </div>

          {/* ===============================================
              PROCESSING
          =============================================== */}

          {processing && !scanMessage && (
            <div className="scanner-processing-overlay">
              <div className="scanner-processing-box">
                <Spin
                  indicator={
                    <LoadingOutlined
                      style={{
                        fontSize: 27,
                        color: COLORS.gold,
                      }}
                      spin
                    />
                  }
                />
              </div>

              <span className="scanner-processing-text">
                Đang xử lý thông tin học viên...
              </span>
            </div>
          )}

          {/* ===============================================
              RESULT
          =============================================== */}

          {scanMessage && (
            <div className="scanner-overlay">
              <div
                className="scanner-card"
                style={{
                  background: currentAlert.background,
                }}
              >
                <div className="scanner-card-icon">{currentAlert.icon}</div>

                <h3 className="scanner-card-title">{scanMessage.title}</h3>

                {/* STUDENT */}

                {scanMessage.student?.name && (
                  <div className="scanner-student-box">
                    <p className="scanner-student-name">
                      {scanMessage.student.name}
                    </p>

                    {scanMessage.student?.code && (
                      <div className="scanner-student-code">
                        <IdcardOutlined />

                        <span>Mã: {scanMessage.student.code}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* CLASS */}

                {scanMessage.class?.name && (
                  <p className="scanner-class-info">
                    <TeamOutlined />

                    <span>Lớp: {scanMessage.class.name}</span>
                  </p>
                )}

                {/* TIME */}

                {scanMessage.attendance?.check_in_time && (
                  <div className="scanner-time-badge">
                    <ClockCircleOutlined />

                    <span>
                      {scanMessage.type === "warning"
                        ? "Đã vào lúc: "
                        : "Điểm danh lúc: "}

                      {String(scanMessage.attendance.check_in_time).slice(0, 5)}
                    </span>
                  </div>
                )}

                {/* MESSAGE */}

                {scanMessage.message && (
                  <p className="scanner-result-msg">{scanMessage.message}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* =================================================
            FOOTER
        ================================================= */}

        <div className="scanner-footer">
          <div className="scanner-footer-top">
            <div className="scanner-footer-status">
              <span
                className={`
                  scanner-status-dot
                  ${
                    processing
                      ? "processing"
                      : scanMessage
                        ? "message"
                        : "ready"
                  }
                `}
              />

              <span className="scanner-footer-text">
                {processing && !scanMessage
                  ? "Đang xác nhận mã..."
                  : scanMessage
                    ? "Đang hiển thị kết quả..."
                    : "Sẵn sàng nhận diện mã tiếp theo"}
              </span>
            </div>
          </div>

          {typeof onFinishAttendance === "function" && (
            <p className="scanner-footer-note">
              * Hệ thống sẽ tự động tổng kết danh sách vắng khi đóng camera.
            </p>
          )}
        </div>
      </div>
    </>
  );
};

export default QRCodeScanner;
