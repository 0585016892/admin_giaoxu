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
   DISPLAY TIME & TIMEOUTS
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

const QRCodeScanner = ({ open, classId, onSuccess, onFinishAttendance }) => {
  const [processing, setProcessing] = useState(false);
  const [scanMessage, setScanMessage] = useState(null);

  const processingRef = useRef(false);
  const lastScanRef = useRef({ token: null, time: 0 });
  const messageTimeoutRef = useRef(null);
  const mountedRef = useRef(false);

  const clearMessageTimeout = useCallback(() => {
    if (messageTimeoutRef.current) {
      clearTimeout(messageTimeoutRef.current);
      messageTimeoutRef.current = null;
    }
  }, []);

  const resetScanner = useCallback(() => {
    clearMessageTimeout();
    processingRef.current = false;
    setProcessing(false);
    setScanMessage(null);
    lastScanRef.current = { token: null, time: 0 };
  }, [clearMessageTimeout]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      clearMessageTimeout();
      processingRef.current = false;
    };
  }, [clearMessageTimeout]);

  useEffect(() => {
    if (!open) {
      resetScanner();
    }
  }, [open, resetScanner]);

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

  const showMessage = useCallback(
    (data, duration) => {
      if (!mountedRef.current) return;
      clearMessageTimeout();
      setScanMessage(data);

      messageTimeoutRef.current = setTimeout(() => {
        if (!mountedRef.current) return;
        setScanMessage(null);
        processingRef.current = false;
        setProcessing(false);
        messageTimeoutRef.current = null;
      }, duration);
    },
    [clearMessageTimeout],
  );

  const handleScan = useCallback(
    async (detectedCodes) => {
      if (!open || processingRef.current) return;

      if (!Array.isArray(detectedCodes) || detectedCodes.length === 0) return;
      const rawValue = detectedCodes[0]?.rawValue;
      if (!rawValue || typeof rawValue !== "string") return;

      const qrToken = rawValue.trim();
      if (!qrToken) return;

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

      const now = Date.now();
      const isDuplicate =
        lastScanRef.current.token === qrToken &&
        now - lastScanRef.current.time < DUPLICATE_SCAN_TIME;

      if (isDuplicate) return;

      lastScanRef.current = { token: qrToken, time: now };
      processingRef.current = true;
      setProcessing(true);
      clearMessageTimeout();
      setScanMessage(null);

      try {
        const response = await scanQRCode({
          qr_token: qrToken,
          class_id: Number(classId),
        });

        const data = response?.data || response;

        if (typeof onSuccess === "function") {
          try {
            await onSuccess(data);
          } catch {
            // Ignore parent error
          }
        }

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
    [open, classId, onSuccess, showMessage, clearMessageTimeout, vibrate],
  );

  const getMessageClass = () => {
    if (!scanMessage) return "";
    switch (scanMessage.type) {
      case "success":
        return "scanner-alert-success";
      case "warning":
        return "scanner-alert-warning";
      default:
        return "scanner-alert-danger";
    }
  };

  const getMessageIcon = () => {
    if (!scanMessage) return null;
    switch (scanMessage.type) {
      case "success":
        return <CheckCircleFilled className="scanner-icon-success" />;
      case "warning":
        return <WarningFilled className="scanner-icon-warning" />;
      default:
        return <CloseCircleFilled className="scanner-icon-danger" />;
    }
  };

  const renderResultOverlay = () => {
    if (!scanMessage) return null;
    const {
      title,
      message: resultMessage,
      student,
      class: classData,
      attendance,
    } = scanMessage;

    return (
      <div className={`scanner-overlay ${getMessageClass()}`}>
        <div className="scanner-card">
          <div className="scanner-card-icon">{getMessageIcon()}</div>
          <h3 className="scanner-card-title">{title}</h3>

          {student?.name && (
            <div className="scanner-student-box">
              <p className="scanner-student-name">{student.name}</p>
              {student?.code && (
                <div className="scanner-student-code">
                  <IdcardOutlined /> Mã: {student.code}
                </div>
              )}
            </div>
          )}

          {classData?.name && (
            <p className="scanner-class-info">
              <TeamOutlined /> Lớp: {classData.name}
            </p>
          )}

          {attendance?.check_in_time && (
            <div className="scanner-time-badge">
              <ClockCircleOutlined />
              <span>
                {scanMessage.type === "warning"
                  ? "Đã vào lúc: "
                  : "Điểm danh lúc: "}
                {String(attendance.check_in_time).slice(0, 5)}
              </span>
            </div>
          )}

          {resultMessage && (
            <p className="scanner-result-msg">{resultMessage}</p>
          )}
        </div>
      </div>
    );
  };

  if (!open) {
    return <div className="scanner-closed-box"></div>;
  }

  return (
    <>
      <style>{`
        .scanner-container {
          position: relative;
          width: 100%;
          height: 520px;
          overflow: hidden;
          border-radius: 24px;
          background-color: #fff1f5;
          border: 1.5px solid #fbcfe8;
          box-shadow: 0 20px 35px -10px rgba(244, 114, 182, 0.25);
          display: flex;
          flex-direction: column;
          font-family: inherit;
        }

        .scanner-video-wrapper {
          position: relative;
          flex: 1;
          width: 100%;
          height: 100%;
          overflow: hidden;
          background: #18181b;
        }

        .scanner-viewfinder {
          position: absolute;
          inset: 0;
          pointer-events: none;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }

        .scanner-frame-box {
          position: relative;
          width: 256px;
          height: 256px;
          border: 1.5px solid rgba(255, 255, 255, 0.25);
          border-radius: 28px;
          overflow: hidden;
          box-shadow: 0 0 40px rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 192, 203, 0.08);
          backdrop-filter: blur(3px);
        }

        .scanner-corner {
          position: absolute;
          width: 32px;
          height: 32px;
          border-color: #f472b6;
          border-style: solid;
          margin: 8px;
        }
        .scanner-corner-tl { top: 0; left: 0; border-width: 4px 0 0 4px; border-radius: 12px 0 0 0; }
        .scanner-corner-tr { top: 0; right: 0; border-width: 4px 4px 0 0; border-radius: 0 12px 0 0; }
        .scanner-corner-bl { bottom: 0; left: 0; border-width: 0 0 4px 4px; border-radius: 0 0 0 12px; }
        .scanner-corner-br { bottom: 0; right: 0; border-width: 0 4px 4px 0; border-radius: 0 0 12px 0; }

        @keyframes laserScanPastel {
          0% { top: 10%; opacity: 0.3; }
          50% { opacity: 1; }
          100% { top: 90%; opacity: 0.3; }
        }

        .scanner-laser {
          position: absolute;
          left: 12px;
          right: 12px;
          height: 2.5px;
          background: linear-gradient(90deg, transparent, #fbcfe8, #f472b6, #fbcfe8, transparent);
          box-shadow: 0 0 16px #f472b6, 0 0 6px #fbcfe8;
          animation: laserScanPastel 2s ease-in-out infinite alternate;
          pointer-events: none;
        }

        .scanner-hint {
          margin-top: 24px;
          padding: 10px 20px;
          background: rgba(255, 241, 245, 0.9);
          backdrop-filter: blur(8px);
          border-radius: 9999px;
          color: #be185d;
          font-size: 13px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 10px;
          border: 1px solid #fbcfe8;
          box-shadow: 0 10px 15px -3px rgba(244, 114, 182, 0.2);
        }

        .scanner-live-badge {
          position: absolute;
          top: 16px;
          left: 16px;
          z-index: 20;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 14px;
          border-radius: 9999px;
          background: rgba(255, 241, 245, 0.85);
          backdrop-filter: blur(8px);
          border: 1px solid #fbcfe8;
          color: #be185d;
          font-size: 12px;
          box-shadow: 0 4px 10px rgba(244, 114, 182, 0.15);
        }

        .scanner-live-dot {
          width: 9px;
          height: 9px;
          border-radius: 50%;
          background-color: #ec4899;
          box-shadow: 0 0 8px #f472b6;
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        .scanner-processing-overlay {
          position: absolute;
          inset: 0;
          z-index: 30;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: rgba(255, 241, 245, 0.9);
          backdrop-filter: blur(8px);
          gap: 14px;
        }

        .scanner-processing-box {
          width: 64px;
          height: 64px;
          border-radius: 20px;
          background: #fce7f3;
          border: 1px solid #fbcfe8;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 16px rgba(244, 114, 182, 0.15);
        }

        .scanner-processing-text {
          color: #be185d;
          font-size: 14px;
          font-weight: 700;
        }

        /* OVERLAY KẾT QUẢ PASTEL */
        @keyframes scannerFadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }

        .scanner-overlay {
          position: absolute;
          inset: 0;
          z-index: 30;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          backdrop-filter: blur(12px);
          animation: scannerFadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        /* Pastel gradients cho các trạng thái */
        .scanner-alert-success { background: linear-gradient(135deg, rgba(52, 211, 153, 0.95), rgba(16, 185, 129, 0.98)); }
        .scanner-alert-warning { background: linear-gradient(135deg, rgba(251, 191, 36, 0.95), rgba(245, 158, 11, 0.98)); }
        .scanner-alert-danger { background: linear-gradient(135deg, rgba(251, 113, 133, 0.95), rgba(244, 63, 94, 0.98)); }

        .scanner-card {
          width: 100%;
          max-width: 360px;
          overflow: hidden;
          color: #fff;
          box-shadow: 0 25px 50px -12px rgba(244, 114, 182, 0.4);
          border-radius: 28px;
          padding: 24px;
          text-align: center;
          border: 1px solid rgba(255, 255, 255, 0.3);
          position: relative;
        }

        @keyframes bounceShort {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }

        .scanner-card-icon {
          font-size: 56px;
          margin-bottom: 12px;
          animation: bounceShort 1s ease-in-out infinite;
        }
        .scanner-icon-success { color: #d1fae5; }
        .scanner-icon-warning { color: #fef3c7; }
        .scanner-icon-danger { color: #ffe4e6; }

        .scanner-card-title {
          font-size: 22px;
          font-weight: 800;
          margin-bottom: 4px;
          letter-spacing: -0.025em;
        }

        .scanner-student-box {
          margin: 16px 0;
          padding: 14px 16px;
          background: rgba(0, 0, 0, 0.15);
          border-radius: 18px;
          backdrop-filter: blur(4px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .scanner-student-name {
          font-size: 18px;
          font-weight: 700;
          line-height: 1.3;
        }

        .scanner-student-code {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-top: 8px;
          padding: 4px 12px;
          background: rgba(255, 255, 255, 0.15);
          border-radius: 9999px;
          font-size: 12px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.95);
        }

        .scanner-class-info {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.95);
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-weight: 500;
        }

        .scanner-time-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 16px;
          border-radius: 9999px;
          background: rgba(0, 0, 0, 0.2);
          font-size: 12px;
          font-weight: 700;
          margin-bottom: 12px;
          border: 1px solid rgba(255, 255, 255, 0.15);
        }

        .scanner-result-msg {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.95);
          line-height: 1.5;
          margin-top: 4px;
        }

        /* TRẠNG THÁI ĐÓNG CAMERA */
       
        /* FOOTER PASTEL */
        .scanner-footer {
          background-color: #fff1f5;
          padding: 16px 20px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          font-size: 12px;
          color: #db2777;
          border-top: 1px solid #fbcfe8;
        }

        .scanner-footer-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .scanner-footer-status {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .scanner-status-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          box-shadow: 0 2px 4px rgba(244, 114, 182, 0.3);
        }
        .scanner-status-dot.processing { background-color: #fbbf24; animation: pulse 1s infinite; }
        .scanner-status-dot.message { background-color: #f472b6; }
        .scanner-status-dot.ready { background-color: #34d399; }

        .scanner-footer-text {
          font-weight: 700;
          color: #9d174d;
        }

        .scanner-auto-badge {
          font-size: 11px;
          color: #059669;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .scanner-footer-note {
          font-size: 11px;
          color: #db2777;
          opacity: 0.8;
          font-style: italic;
          margin-top: 2px;
        }
      `}</style>

      <div className="scanner-container">
        {/* CAMERA VIEW */}
        <div className="scanner-video-wrapper">
          <Scanner
            onScan={handleScan}
            allowMultiple
            scanDelay={300}
            constraints={{ facingMode: "environment" }}
            styles={{
              container: { width: "100%", height: "100%" },
              video: { width: "100%", height: "100%", objectFit: "cover" },
            }}
          />

          {/* VIEW-FINDER FRAME */}
          <div className="scanner-viewfinder">
            <div className="scanner-frame-box">
              <div className="scanner-corner scanner-corner-tl" />
              <div className="scanner-corner scanner-corner-tr" />
              <div className="scanner-corner scanner-corner-bl" />
              <div className="scanner-corner scanner-corner-br" />

              {!processing && !scanMessage && <div className="scanner-laser" />}
            </div>

            {!processing && !scanMessage && (
              <div className="scanner-hint">
                <ScanOutlined style={{ color: "#db2777", fontSize: "16px" }} />
                <span>Đưa mã QR học sinh vào giữa khung hình</span>
              </div>
            )}
          </div>

          {/* LIVE BADGE */}
          <div className="scanner-live-badge">
            <span className="scanner-live-dot" />
            <span style={{ fontWeight: 700 }}>Đang quét trực tiếp</span>
          </div>

          {/* PROCESSING OVERLAY */}
          {processing && !scanMessage && (
            <div className="scanner-processing-overlay">
              <div className="scanner-processing-box">
                <Spin
                  indicator={
                    <LoadingOutlined
                      style={{ fontSize: 32, color: "#f472b6" }}
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

          {/* RESULT OVERLAY */}
          {renderResultOverlay()}
        </div>

        {/* FOOTER STATUS BAR */}
        <div className="scanner-footer">
          <div className="scanner-footer-top">
            <div className="scanner-footer-status">
              <span
                className={`scanner-status-dot ${
                  processing ? "processing" : scanMessage ? "message" : "ready"
                }`}
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
