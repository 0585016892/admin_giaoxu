import React, { useCallback, useEffect, useRef, useState } from "react";

import { Button, Card, Modal, Space, Spin, Tag, Typography } from "antd";

import {
  CameraOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
  LoadingOutlined,
  ScanOutlined,
  WarningFilled,
  ClockCircleOutlined,
} from "@ant-design/icons";

import { Scanner } from "@yudiel/react-qr-scanner";

import { scanQRCode } from "../../api/attendanceApi";

const { Text, Title } = Typography;

/**
 * =========================================================
 * COLORS
 * =========================================================
 */

const COLORS = {
  primary: "#6366F1",

  accentPink: "#F472B6",

  accentYellow: "#FBBF24",

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

/**
 * =========================================================
 * DISPLAY TIME
 * =========================================================
 */

const DISPLAY_TIME = {
  success: 1500,
  warning: 1800,
  error: 2200,
};

/**
 * =========================================================
 * DUPLICATE SCAN
 * =========================================================
 */

const DUPLICATE_SCAN_TIME = 2500;

/**
 * =========================================================
 * COMPONENT
 * =========================================================
 */

const QRCodeScanner = ({
  open,
  onClose,
  classId,
  onSuccess,
  onFinishAttendance,
}) => {
  /**
   * =======================================================
   * STATE
   * =======================================================
   */

  const [processing, setProcessing] = useState(false);

  const [scanMessage, setScanMessage] = useState(null);

  /**
   * =======================================================
   * REFS
   * =======================================================
   */

  const processingRef = useRef(false);

  const lastScanRef = useRef({
    token: null,
    time: 0,
  });

  const messageTimeoutRef = useRef(null);

  const mountedRef = useRef(false);

  /**
   * =======================================================
   * CLEAR MESSAGE TIMEOUT
   * =======================================================
   */

  const clearMessageTimeout = useCallback(() => {
    if (messageTimeoutRef.current) {
      clearTimeout(messageTimeoutRef.current);

      messageTimeoutRef.current = null;
    }
  }, []);

  /**
   * =======================================================
   * RESET SCANNER
   * =======================================================
   */

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

  /**
   * =======================================================
   * MOUNT
   * =======================================================
   */

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;

      clearMessageTimeout();

      processingRef.current = false;
    };
  }, [clearMessageTimeout]);

  /**
   * =======================================================
   * RESET WHEN CLOSED
   * =======================================================
   */

  useEffect(() => {
    if (!open) {
      resetScanner();
    }
  }, [open, resetScanner]);

  /**
   * =======================================================
   * VIBRATE
   * =======================================================
   */

  const vibrate = (pattern) => {
    try {
      if (
        typeof navigator !== "undefined" &&
        typeof navigator.vibrate === "function"
      ) {
        navigator.vibrate(pattern);
      }
    } catch (error) {
      console.warn("VIBRATE ERROR:", error);
    }
  };

  /**
   * =======================================================
   * SHOW MESSAGE
   * =======================================================
   */

  const showMessage = (data, duration) => {
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

      /**
       * Sau khi hiển thị kết quả
       * cho phép quét học sinh tiếp theo.
       */

      messageTimeoutRef.current = null;
    }, duration);
  };

  /**
   * =======================================================
   * HANDLE SCAN
   * =======================================================
   */

  const handleScan = async (detectedCodes) => {
    /**
     * Scanner không mở
     */

    if (!open) {
      return;
    }

    /**
     * Đang xử lý request
     */

    if (processingRef.current) {
      return;
    }

    /**
     * Không có QR
     */

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

    /**
     * Chưa chọn lớp
     */

    if (!classId) {
      processingRef.current = true;

      showMessage(
        {
          type: "error",

          title: "Chưa chọn lớp nha!",

          message: "Vui lòng chọn lớp trước khi quét mã QR nhé.",
        },

        DISPLAY_TIME.error,
      );

      vibrate([150, 100, 150]);

      return;
    }

    /**
     * Chống scanner đọc
     * cùng một QR liên tục.
     */

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

    /**
     * Bắt đầu xử lý
     */

    processingRef.current = true;

    setProcessing(true);

    clearMessageTimeout();

    setScanMessage(null);

    try {
      /**
       * GỌI API
       */

      const response = await scanQRCode({
        qr_token: qrToken,

        class_id: Number(classId),
      });

      const data = response?.data || response;

      console.log("========== QR API SUCCESS ==========");

      console.log(data);

      console.log("====================================");

      /**
       * Cập nhật AttendancePage
       */

      if (typeof onSuccess === "function") {
        try {
          await onSuccess(data);
        } catch (callbackError) {
          console.error("QR onSuccess ERROR:", callbackError);
        }
      }

      /**
       * Hiển thị thành công
       */

      showMessage(
        {
          type: "success",

          title: "Điểm danh siêu đỉnh! 🎉",

          message: data?.message || "Học sinh đã điểm danh thành công.",

          student: data?.student || null,

          class: data?.class || null,

          attendance: data?.attendance || null,
        },

        DISPLAY_TIME.success,
      );

      vibrate(120);
    } catch (error) {
      console.error("QR SCAN ERROR:", error);

      const status = error?.response?.status;

      const data = error?.response?.data || {};

      /**
       * ===================================================
       * ĐÃ ĐIỂM DANH
       * ===================================================
       */

      if (status === 409 || data?.code === "ALREADY_ATTENDED") {
        showMessage(
          {
            type: "warning",

            title: "Ái chà, điểm danh rồi! ⏰",

            message: data?.message || "Học sinh này đã điểm danh hôm nay rồi.",

            student: data?.student || null,

            class: data?.class || null,

            attendance: data?.attendance || null,
          },

          DISPLAY_TIME.warning,
        );

        vibrate([100, 80, 100]);

        return;
      }

      /**
       * ===================================================
       * SAI LỚP
       * ===================================================
       */

      if (
        data?.code === "STUDENT_NOT_IN_CLASS" ||
        data?.message === "Học sinh này không thuộc lớp đang điểm danh"
      ) {
        showMessage(
          {
            type: "class_error",

            title: "Nhầm lớp mất rồi! 🎒",

            message: data?.message || "Học sinh này không thuộc lớp đang chọn.",

            student: data?.student || null,

            class: data?.class || null,
          },

          DISPLAY_TIME.error,
        );

        vibrate([150, 100, 150]);

        return;
      }

      /**
       * ===================================================
       * QR KHÔNG HỢP LỆ
       * ===================================================
       */

      if (data?.code === "INVALID_QR" || data?.code === "INVALID_QR_TOKEN") {
        showMessage(
          {
            type: "error",

            title: "Mã QR lạ quá! ❓",

            message: data?.message || "Mã QR không hợp lệ hoặc đã cũ.",
          },

          DISPLAY_TIME.error,
        );

        vibrate([150, 100, 150]);

        return;
      }

      /**
       * ===================================================
       * KHÔNG TÌM THẤY HỌC SINH
       * ===================================================
       */

      if (status === 404 || data?.code === "STUDENT_NOT_FOUND") {
        showMessage(
          {
            type: "error",

            title: "Không tìm thấy bé! 🔍",

            message: data?.message || "Không tìm thấy học sinh từ mã QR này.",

            student: data?.student || null,
          },

          DISPLAY_TIME.error,
        );

        vibrate([150, 100, 150]);

        return;
      }

      /**
       * ===================================================
       * LỖI KHÁC
       * ===================================================
       */

      showMessage(
        {
          type: "error",

          title: "Có chút trục trặc! 🥺",

          message:
            data?.message || error?.message || "Không thể điểm danh lúc này.",

          student: data?.student || null,

          class: data?.class || null,
        },

        DISPLAY_TIME.error,
      );

      vibrate([150, 100, 150]);
    }
  };

  /**
   * =======================================================
   * FINISH ATTENDANCE
   * =======================================================
   */

  const handleFinishAttendance = async () => {
    /**
     * AttendancePage sẽ quyết định:
     *
     * - đóng luôn
     * - hoặc confirm học sinh vắng
     */

    if (typeof onFinishAttendance === "function") {
      try {
        await onFinishAttendance();
      } catch (error) {
        console.error("FINISH ATTENDANCE ERROR:", error);
      }

      return;
    }

    /**
     * Fallback nếu không truyền callback
     */

    resetScanner();

    onClose?.();
  };

  /**
   * =======================================================
   * MESSAGE CONFIG
   * =======================================================
   */

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

  /**
   * =======================================================
   * RESULT OVERLAY
   * =======================================================
   */

  const renderResultOverlay = () => {
    if (!scanMessage) {
      return null;
    }

    const config = getMessageConfig();

    const {
      title,
      message,
      student,
      class: classData,
      attendance,
    } = scanMessage;

    return (
      <div
        style={{
          position: "absolute",

          left: 20,

          right: 20,

          bottom: 20,

          zIndex: 30,

          animation:
            "chibiBounceIn 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        }}
      >
        <Card
          bordered={false}
          styles={{
            body: {
              padding: 22,
            },
          }}
          style={{
            borderRadius: 26,

            background: config.background,

            border: `2px solid ${config.border}`,

            boxShadow: "0 12px 30px rgba(99, 102, 241, 0.18)",
          }}
        >
          <Space
            align="start"
            size={16}
            style={{
              width: "100%",
            }}
          >
            <div
              style={{
                fontSize: 38,

                color: config.color,

                lineHeight: 1,

                marginTop: 2,
              }}
            >
              {config.icon}
            </div>

            <div
              style={{
                flex: 1,

                minWidth: 0,
              }}
            >
              <Text
                strong
                style={{
                  display: "block",

                  fontSize: 18,

                  color: config.color,

                  fontFamily: "Nunito, Quicksand, sans-serif",
                }}
              >
                {title}
              </Text>

              {student?.name && (
                <Text
                  strong
                  style={{
                    display: "block",

                    marginTop: 6,

                    fontSize: 20,

                    color: "#1E293B",
                  }}
                >
                  ✨ {student.name}
                </Text>
              )}

              {student?.code && (
                <Text
                  type="secondary"
                  style={{
                    display: "block",

                    marginTop: 3,

                    fontSize: 14,
                  }}
                >
                  Mã học sinh: {student.code}
                </Text>
              )}

              {classData?.name && (
                <Text
                  type="secondary"
                  style={{
                    display: "block",

                    marginTop: 3,

                    fontSize: 14,
                  }}
                >
                  Lớp: {classData.name}
                </Text>
              )}

              {attendance?.check_in_time && (
                <Tag
                  color={scanMessage.type === "success" ? "success" : "warning"}
                  icon={<ClockCircleOutlined />}
                  style={{
                    marginTop: 10,

                    borderRadius: 14,

                    padding: "4px 12px",

                    fontWeight: 600,

                    fontSize: 13,
                  }}
                >
                  {scanMessage.type === "warning"
                    ? "Đã vào lúc "
                    : "Điểm danh lúc "}

                  {String(attendance.check_in_time).slice(0, 5)}
                </Tag>
              )}

              {message && (
                <Text
                  type="secondary"
                  style={{
                    display: "block",

                    marginTop: 8,

                    fontSize: 13,

                    lineHeight: 1.5,
                  }}
                >
                  {message}
                </Text>
              )}
            </div>
          </Space>
        </Card>
      </div>
    );
  };

  /**
   * =======================================================
   * RENDER
   * =======================================================
   */

  return (
    <>
      <style>
        {`
          @keyframes chibiBounceIn {
            0% {
              opacity: 0;
              transform: scale(0.8) translateY(20px);
            }

            70% {
              transform: scale(1.03) translateY(-4px);
            }

            100% {
              opacity: 1;
              transform: scale(1) translateY(0);
            }
          }

          @keyframes chibiPulse {
            0% {
              transform: scale(1);
            }

            50% {
              transform: scale(1.05);
            }

            100% {
              transform: scale(1);
            }
          }

          .chibi-modal .ant-modal-content {
            border-radius: 32px !important;
            overflow: hidden;
            background: #FFFDF9 !important;
            box-shadow: 0 25px 50px rgba(99, 102, 241, 0.2) !important;
            border: 3px solid #E0E7FF;
          }

          .chibi-modal .ant-modal-header {
            background: transparent !important;
            padding: 24px 28px 12px 28px !important;
            border-bottom: none !important;
          }

          .chibi-modal .ant-modal-body {
            padding: 12px 28px 28px 28px !important;
          }
        `}
      </style>

      <Modal
        open={open}
        onCancel={handleFinishAttendance}
        footer={null}
        centered
        width={620}
        destroyOnClose
        maskClosable={false}
        className="chibi-modal"
        title={
          <Space size={10}>
            <div
              style={{
                width: 42,

                height: 42,

                borderRadius: "50%",

                background: "#EEF2FF",

                display: "flex",

                alignItems: "center",

                justifyContent: "center",

                color: COLORS.primary,

                fontSize: 20,
              }}
            >
              <CameraOutlined />
            </div>

            <span
              style={{
                fontFamily: "Nunito, Quicksand, sans-serif",

                fontSize: 20,

                fontWeight: 700,

                color: "#334155",
              }}
            >
              Quét QR Điểm Danh 🌸
            </span>
          </Space>
        }
      >
        <div>
          {/* CAMERA */}

          <div
            style={{
              position: "relative",

              width: "100%",

              height: 440,

              overflow: "hidden",

              borderRadius: 28,

              background: "#1E293B",

              border: "3px solid #E2E8F0",
            }}
          >
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

            {/* QR FRAME */}

            <div
              style={{
                position: "absolute",

                inset: 0,

                pointerEvents: "none",

                display: "flex",

                justifyContent: "center",

                alignItems: "center",
              }}
            >
              <div
                style={{
                  width: 260,

                  height: 260,

                  border: `4px dashed ${COLORS.accentYellow}`,

                  borderRadius: 32,

                  boxShadow: "0 0 0 9999px rgba(30, 41, 59, 0.45)",

                  animation: "chibiPulse 3s infinite ease-in-out",
                }}
              />
            </div>

            {/* PROCESSING */}

            {processing && !scanMessage && (
              <div
                style={{
                  position: "absolute",

                  inset: 0,

                  zIndex: 20,

                  background: "rgba(255, 253, 249, 0.88)",

                  backdropFilter: "blur(6px)",

                  display: "flex",

                  alignItems: "center",

                  justifyContent: "center",
                }}
              >
                <Card
                  bordered={false}
                  style={{
                    borderRadius: 24,

                    textAlign: "center",

                    minWidth: 180,

                    boxShadow: "0 12px 30px rgba(0,0,0,0.1)",

                    border: "2px solid #E0E7FF",
                  }}
                >
                  <Spin
                    indicator={
                      <LoadingOutlined
                        style={{
                          fontSize: 36,

                          color: COLORS.primary,
                        }}
                        spin
                      />
                    }
                  />

                  <div
                    style={{
                      marginTop: 12,
                    }}
                  >
                    <Text
                      strong
                      style={{
                        color: COLORS.primary,

                        fontSize: 15,
                      }}
                    >
                      Đang xác nhận... ✨
                    </Text>
                  </div>
                </Card>
              </div>
            )}

            {/* RESULT */}

            {renderResultOverlay()}
          </div>

          {/* GUIDE */}

          {!scanMessage && (
            <div
              style={{
                textAlign: "center",

                marginTop: 18,
              }}
            >
              <Title
                level={5}
                style={{
                  marginBottom: 4,

                  color: "#475569",

                  fontSize: 16,
                }}
              >
                <ScanOutlined
                  style={{
                    color: COLORS.primary,
                  }}
                />{" "}
                Đưa mã QR vào khung hình nha!
              </Title>

              <Text
                type="secondary"
                style={{
                  fontSize: 14,
                }}
              >
                Hệ thống sẽ tự động ghi nhận và chuyển tiếp học sinh tiếp theo.
              </Text>
            </div>
          )}

          {/* STATUS */}

          <div
            style={{
              marginTop: 16,

              padding: "12px 16px",

              borderRadius: 18,

              background: "#F1F5F9",

              border: "1px solid #E2E8F0",

              textAlign: "center",
            }}
          >
            <Space size={10}>
              <span
                style={{
                  width: 11,

                  height: 11,

                  borderRadius: "50%",

                  display: "inline-block",

                  background: processing
                    ? COLORS.warning
                    : scanMessage?.type === "error" ||
                        scanMessage?.type === "class_error"
                      ? COLORS.danger
                      : COLORS.success,

                  boxShadow: processing
                    ? "0 0 0 4px rgba(217, 119, 6, 0.15)"
                    : "0 0 0 4px rgba(5, 150, 105, 0.15)",
                }}
              />

              <Text
                type="secondary"
                style={{
                  fontSize: 14,

                  fontWeight: 500,
                }}
              >
                {processing && !scanMessage
                  ? "Đang xử lý thông tin..."
                  : scanMessage
                    ? "Đang hiển thị kết quả..."
                    : "Sẵn sàng đón học sinh tiếp theo ✨"}
              </Text>
            </Space>
          </div>

          {/* FINISH BUTTON */}

          <Button
            size="large"
            block
            onClick={handleFinishAttendance}
            style={{
              height: 52,

              borderRadius: 18,

              marginTop: 16,

              background: "#EEF2FF",

              borderColor: "#C7D2FE",

              color: COLORS.primary,

              fontWeight: 700,

              fontSize: 15,

              boxShadow: "0 4px 14px rgba(99, 102, 241, 0.12)",
            }}
          >
            Đóng máy quét 🌻
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default QRCodeScanner;
