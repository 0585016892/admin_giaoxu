import React, { useCallback, useEffect, useRef, useState } from "react";

import { Card, Spin, Tag, Typography } from "antd";

import {
  CheckCircleFilled,
  CloseCircleFilled,
  LoadingOutlined,
  ScanOutlined,
  WarningFilled,
  ClockCircleOutlined,
  CameraOutlined,
} from "@ant-design/icons";

import { Scanner } from "@yudiel/react-qr-scanner";

import { scanQRCode } from "../../api/attendanceApi";

const { Text } = Typography;

/* =========================================================
   COLORS
========================================================= */

const COLORS = {
  primary: "#FF8FAB",

  success: "#059669",
  successBg: "#ECFDF5",
  successBorder: "#A7F3D0",

  warning: "#D97706",
  warningBg: "#FFFBEB",
  warningBorder: "#FDE68A",

  danger: "#E11D48",
  dangerBg: "#FFF1F2",
  dangerBorder: "#FECDD3",
};

/* =========================================================
   DISPLAY TIME
========================================================= */

const DISPLAY_TIME = {
  success: 1500,
  warning: 1800,
  error: 2200,
};

/* =========================================================
   DUPLICATE SCAN
========================================================= */

const DUPLICATE_SCAN_TIME = 2500;

/* =========================================================
   COMPONENT
========================================================= */

const QRCodeScanner = ({ open, classId, onSuccess, onFinishAttendance }) => {
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
     CAMERA OFF
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
      if (!open) {
        return;
      }

      if (processingRef.current) {
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

      /* =====================================================
         CLASS
      ===================================================== */

      if (!classId) {
        processingRef.current = true;

        showMessage(
          {
            type: "error",
            title: "Chưa chọn lớp",
            message: "Vui lòng chọn lớp trước khi quét mã QR.",
          },
          DISPLAY_TIME.error,
        );

        vibrate([150, 100, 150]);

        return;
      }

      /* =====================================================
         DUPLICATE CAMERA SCAN
      ===================================================== */

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

      /* =====================================================
         PROCESSING
      ===================================================== */

      processingRef.current = true;

      setProcessing(true);

      clearMessageTimeout();
      setScanMessage(null);

      try {
        /* ===================================================
           API
        =================================================== */

        const response = await scanQRCode({
          qr_token: qrToken,
          class_id: Number(classId),
        });

        const data = response?.data || response;

        /* ===================================================
           PARENT
        =================================================== */

        if (typeof onSuccess === "function") {
          try {
            await onSuccess(data);
          } catch {
            // Parent error should not break scanner
          }
        }

        /* ===================================================
           SUCCESS
        =================================================== */

        showMessage(
          {
            type: "success",

            title: "Điểm danh thành công",

            message: data?.message || "Học sinh đã được ghi nhận.",

            student: data?.student || null,

            class: data?.class || null,

            attendance: data?.attendance || null,
          },

          DISPLAY_TIME.success,
        );

        vibrate(120);
      } catch (error) {
        const status = error?.response?.status;

        const data = error?.response?.data || {};

        /* ===================================================
           ALREADY ATTENDED
        =================================================== */

        if (status === 409 || data?.code === "ALREADY_ATTENDED") {
          showMessage(
            {
              type: "warning",

              title: "Học sinh đã điểm danh",

              message:
                data?.message ||
                "Học sinh này đã được điểm danh và không thể thay đổi.",

              student: data?.student || null,

              class: data?.class || null,

              attendance: data?.attendance || null,
            },

            DISPLAY_TIME.warning,
          );

          vibrate([100, 80, 100]);

          return;
        }

        /* ===================================================
           WRONG CLASS
        =================================================== */

        if (
          data?.code === "STUDENT_NOT_IN_CLASS" ||
          data?.message === "Học sinh này không thuộc lớp đang điểm danh"
        ) {
          showMessage(
            {
              type: "class_error",

              title: "Học sinh không thuộc lớp",

              message:
                data?.message || "Học sinh này không thuộc lớp đang chọn.",

              student: data?.student || null,

              class: data?.class || null,
            },

            DISPLAY_TIME.error,
          );

          vibrate([150, 100, 150]);

          return;
        }

        /* ===================================================
           INVALID QR
        =================================================== */

        if (data?.code === "INVALID_QR" || data?.code === "INVALID_QR_TOKEN") {
          showMessage(
            {
              type: "error",

              title: "Mã QR không hợp lệ",

              message:
                data?.message || "Mã QR không hợp lệ hoặc đã hết hiệu lực.",
            },

            DISPLAY_TIME.error,
          );

          vibrate([150, 100, 150]);

          return;
        }

        /* ===================================================
           STUDENT NOT FOUND
        =================================================== */

        if (status === 404 || data?.code === "STUDENT_NOT_FOUND") {
          showMessage(
            {
              type: "error",

              title: "Không tìm thấy học sinh",

              message: data?.message || "Không tìm thấy học sinh từ mã QR này.",

              student: data?.student || null,
            },

            DISPLAY_TIME.error,
          );

          vibrate([150, 100, 150]);

          return;
        }

        /* ===================================================
           OTHER ERROR
        =================================================== */

        showMessage(
          {
            type: "error",

            title: "Không thể điểm danh",

            message:
              data?.message || error?.message || "Đã xảy ra lỗi khi điểm danh.",

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

  /* =======================================================
     RESULT CONFIG
  ======================================================= */

  const getMessageConfig = () => {
    if (!scanMessage) {
      return null;
    }

    switch (scanMessage.type) {
      case "success":
        return {
          color: COLORS.success,
          background: COLORS.successBg,
          border: COLORS.successBorder,
          icon: <CheckCircleFilled />,
        };

      case "warning":
        return {
          color: COLORS.warning,
          background: COLORS.warningBg,
          border: COLORS.warningBorder,
          icon: <WarningFilled />,
        };

      default:
        return {
          color: COLORS.danger,
          background: COLORS.dangerBg,
          border: COLORS.dangerBorder,
          icon: <CloseCircleFilled />,
        };
    }
  };

  /* =======================================================
     RESULT
  ======================================================= */

  const renderResult = () => {
    if (!scanMessage) {
      return null;
    }

    const config = getMessageConfig();

    const {
      title,
      message: resultMessage,
      student,
      class: classData,
      attendance,
    } = scanMessage;

    return (
      <div className="inline-qr-result">
        <Card
          bordered={false}
          className="inline-qr-result-card"
          style={{
            background: config.background,

            border: `2px solid ${config.border}`,
          }}
        >
          <div className="inline-qr-result-inner">
            <div
              className="inline-qr-result-icon"
              style={{
                color: config.color,
              }}
            >
              {config.icon}
            </div>

            <div className="inline-qr-result-content">
              <Text
                strong
                className="inline-qr-result-title"
                style={{
                  color: config.color,
                }}
              >
                {title}
              </Text>

              {student?.name && (
                <Text strong className="inline-qr-student-name">
                  {student.name}
                </Text>
              )}

              {student?.code && (
                <Text type="secondary" className="inline-qr-meta">
                  Mã học viên: {student.code}
                </Text>
              )}

              {classData?.name && (
                <Text type="secondary" className="inline-qr-meta">
                  Lớp: {classData.name}
                </Text>
              )}

              {attendance?.check_in_time && (
                <Tag
                  color={scanMessage.type === "success" ? "success" : "warning"}
                  icon={<ClockCircleOutlined />}
                  className="inline-qr-time"
                >
                  {scanMessage.type === "warning"
                    ? "Đã vào lúc "
                    : "Điểm danh lúc "}

                  {String(attendance.check_in_time).slice(0, 5)}
                </Tag>
              )}

              {resultMessage && (
                <Text type="secondary" className="inline-qr-message">
                  {resultMessage}
                </Text>
              )}
            </div>
          </div>
        </Card>
      </div>
    );
  };

  /* =======================================================
     CAMERA OFF
  ======================================================= */

  if (!open) {
    return (
      <div className="qr-camera-off-state">
        <div className="qr-camera-off-icon">
          <CameraOutlined />
        </div>

        <strong>Camera đang tắt</strong>

        <span>Bật quét QR để bắt đầu điểm danh học viên.</span>
      </div>
    );
  }

  /* =======================================================
     CAMERA
  ======================================================= */

  return (
    <div className="inline-qr-scanner">
      <div className="inline-qr-camera">
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

        <div className="inline-qr-overlay" />

        <div className="inline-qr-live">
          <span />
          Camera đang hoạt động
        </div>

        <div className="inline-qr-frame-wrapper">
          <div className="inline-qr-frame">
            <i className="corner top-left" />
            <i className="corner top-right" />
            <i className="corner bottom-left" />
            <i className="corner bottom-right" />
          </div>
        </div>

        {!processing && !scanMessage && (
          <div className="inline-qr-hint">
            <ScanOutlined />

            <span>Đưa mã QR vào khung</span>
          </div>
        )}

        {processing && !scanMessage && (
          <div className="inline-qr-processing">
            <div className="inline-qr-processing-card">
              <Spin
                indicator={
                  <LoadingOutlined
                    spin
                    style={{
                      fontSize: 30,
                      color: COLORS.primary,
                    }}
                  />
                }
              />

              <strong>Đang xác nhận...</strong>
            </div>
          </div>
        )}

        {renderResult()}
      </div>

      <div className="inline-qr-status">
        <span
          className={`inline-qr-status-dot ${
            processing ? "processing" : scanMessage ? scanMessage.type : "ready"
          }`}
        />

        <span>
          {processing && !scanMessage
            ? "Đang xử lý thông tin..."
            : scanMessage
              ? "Đang hiển thị kết quả..."
              : "Sẵn sàng quét học viên tiếp theo"}
        </span>
      </div>

      {typeof onFinishAttendance === "function" && (
        <div className="qr-finish-note">
          Khi tắt camera, hệ thống sẽ tự động ghi <b>Vắng</b> cho học sinh chưa
          được điểm danh.
        </div>
      )}
    </div>
  );
};

export default QRCodeScanner;
