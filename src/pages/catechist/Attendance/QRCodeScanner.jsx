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

import { scanQRCode } from "../../../api/attendanceApi";

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

   HELPER

========================================================= */

const normalizeAttendanceType = (value) => {
  const type = String(value || "")
    .trim()

    .toLowerCase();

  if (type === "mass") {
    return "mass";
  }

  if (type === "catechism") {
    return "catechism";
  }

  return null;
};

/* =========================================================

   COMPONENT

========================================================= */

const QRCodeScanner = ({
  open,

  /*

   * catechism:

   *   classId bắt buộc

   *

   * mass:

   *   classId KHÔNG bắt buộc

   *   backend tự lấy lớp của giáo lý viên

   */

  classId,

  attendanceType = "catechism",

  onSuccess,

  onFinishAttendance,
}) => {
  /* =======================================================

     STATE

  ======================================================= */

  const [processing, setProcessing] = useState(false);

  const [scanMessage, setScanMessage] = useState(null);

  /* =======================================================

     REFS

  ======================================================= */

  const processingRef = useRef(false);

  const lastScanRef = useRef({
    token: null,

    time: 0,
  });

  const messageTimeoutRef = useRef(null);

  const mountedRef = useRef(false);

  /* =======================================================

     NORMALIZED TYPE

  ======================================================= */

  const normalizedAttendanceType = normalizeAttendanceType(attendanceType);

  const isMass = normalizedAttendanceType === "mass";

  const isCatechism = normalizedAttendanceType === "catechism";

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
      /* =====================================================

         CAMERA CLOSED

      ===================================================== */

      if (!open) {
        return;
      }

      /* =====================================================

         ĐANG XỬ LÝ

      ===================================================== */

      if (processingRef.current) {
        return;
      }

      /* =====================================================

         CHECK DETECTED CODE

      ===================================================== */

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

         VALIDATE ATTENDANCE TYPE

      ===================================================== */

      if (!normalizedAttendanceType) {
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

      /* =====================================================

         CATECHISM

         Giáo lý bắt buộc phải có lớp.

      ===================================================== */

      if (isCatechism && !classId) {
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

      /*

       * MASS

       *

       * KHÔNG kiểm tra classId.

       *

       * Backend tự lấy lớp từ teacherId.

       */

      /* =====================================================

         DUPLICATE SCAN

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

         LOCK

      ===================================================== */

      processingRef.current = true;

      setProcessing(true);

      clearMessageTimeout();

      setScanMessage(null);

      /* =====================================================

         BUILD PAYLOAD

      ===================================================== */

      const payload = {
        qr_token: qrToken,

        attendance_type: normalizedAttendanceType,
      };

      /*

       * CHỈ gửi class_id với giáo lý.

       *

       * Thánh lễ:

       *   không gửi class_id

       */

      if (isCatechism) {
        payload.class_id = Number(classId);
      }

      /* =====================================================

         API

      ===================================================== */

      try {
        const response = await scanQRCode(payload);

        const data = response?.data || response;

        /* ===================================================

           PARENT SUCCESS

        =================================================== */

        if (typeof onSuccess === "function") {
          try {
            await onSuccess(data);
          } catch (parentError) {
            console.warn("[QR ATTENDANCE] onSuccess error:", parentError);
          }
        }

        /* ===================================================

           SUCCESS MESSAGE

        =================================================== */

        showMessage(
          {
            type: "success",

            title: "Điểm danh thành công!",

            message:
              data?.message ||
              (isMass
                ? "Đã ghi nhận tham dự Thánh lễ."
                : "Đã ghi nhận học sinh vào lớp."),

            student: data?.student || null,

            class: data?.class || null,

            attendance: data?.attendance || null,
          },

          DISPLAY_TIME.success,
        );

        vibrate(100);
      } catch (error) {
        console.error("[QR ATTENDANCE] error:", error);

        const status = error?.response?.status;

        const data = error?.response?.data || {};

        /* ===================================================

           ALREADY ATTENDED

        =================================================== */

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

        /* ===================================================

           TEACHER CLASS NOT FOUND

           Chủ yếu dành cho MASS.

        =================================================== */

        if (
          data?.code === "TEACHER_CLASS_NOT_FOUND" ||
          data?.code === "CLASS_NOT_FOUND_FOR_TEACHER"
        ) {
          showMessage(
            {
              type: "error",

              title: "Chưa xác định được lớp",

              message:
                data?.message ||
                "Tài khoản giáo lý viên chưa được gán lớp để điểm danh.",

              student: data?.student || null,
            },

            DISPLAY_TIME.error,
          );

          vibrate([150, 100, 150]);

          return;
        }

        /* ===================================================

           MULTIPLE TEACHER CLASSES

        =================================================== */

        if (data?.code === "MULTIPLE_CLASSES_FOR_TEACHER") {
          showMessage(
            {
              type: "error",

              title: "Có nhiều lớp được gán",

              message:
                data?.message ||
                "Giáo lý viên đang được gán nhiều lớp. Vui lòng kiểm tra lại phân công.",

              student: data?.student || null,
            },

            DISPLAY_TIME.error,
          );

          vibrate([150, 100, 150]);

          return;
        }

        /* ===================================================

           STUDENT NOT IN CLASS

        =================================================== */

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

        /* ===================================================

           INVALID QR

        =================================================== */

        if (data?.code === "INVALID_QR" || data?.code === "INVALID_QR_TOKEN") {
          showMessage(
            {
              type: "error",

              title: "Mã QR không hợp lệ",

              message: data?.message || "Mã QR không đúng hoặc không hợp lệ.",
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

              message: data?.message || "Không tra cứu được học sinh từ mã QR.",

              student: data?.student || null,
            },

            DISPLAY_TIME.error,
          );

          vibrate([150, 100, 150]);

          return;
        }

        /* ===================================================

           GENERAL ERROR

        =================================================== */

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

            attendance: data?.attendance || null,
          },

          DISPLAY_TIME.error,
        );

        vibrate([150, 100, 150]);
      }
    },

    [
      open,

      classId,

      normalizedAttendanceType,

      isMass,

      isCatechism,

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



          background: transparent;



          border: none;



          border-radius: 0;



          display: flex;



          align-items: center;

          justify-content: center;

        }





        /* =====================================================

           GOLD CORNERS

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



          border-width: 4px 0 0 4px;



          border-radius: 8px 0 0 0;

        }



        .scanner-corner-tr {

          top: 0;

          right: 0;



          border-width: 4px 4px 0 0;



          border-radius: 0 8px 0 0;

        }



        .scanner-corner-bl {

          bottom: 0;

          left: 0;



          border-width: 0 0 4px 4px;



          border-radius: 0 0 0 8px;

        }



        .scanner-corner-br {

          bottom: 0;

          right: 0;



          border-width: 0 4px 4px 0;



          border-radius: 0 0 8px 0;

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



          padding: 9px 16px;



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



          padding: 6px 12px;



          color: ${COLORS.white};



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

          margin: 16px 0;



          padding: 12px 15px;



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



          padding: 4px 9px;



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



          margin: 0 0 11px;



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



          padding: 5px 12px;



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

          margin: 5px 0 0;



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



          padding: 11px 17px;



          background:

            ${COLORS.white};



          border-top:

            1px solid ${COLORS.border};

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



            padding: 5px 9px;



            font-size: 10px;

          }



          .scanner-card {

            max-width: 320px;



            padding: 20px;

          }



          .scanner-card-title {

            font-size: 17px;

          }



          .scanner-student-name {

            font-size: 15px;

          }

        }



        /* =====================================================
           FAITHEDU SCANNER — PREMIUM CONCEPT
        ===================================================== */
        .scanner-container {
          height: clamp(430px, 66vh, 620px);
          min-height: 430px;
          border: 1px solid rgba(217, 164, 65,  0.34);
          border-radius: 22px;
          background: #0b1726;
          box-shadow: 0 18px 48px rgba(23, 59, 94, 0.18), 0 3px 10px rgba(15, 23, 42, 0.08);
          isolation: isolate;
          overflow: hidden;
          border-color: rgba(217, 164, 65, 0.42);
          box-shadow: 0 24px 60px rgba(15, 35, 58, 0.16), 0 5px 16px rgba(15, 35, 58, 0.06);
        }

        .scanner-header {
          position: relative;
          z-index: 2;
          flex: 0 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          min-height: 88px;
          padding: 15px 20px;
          color: #173b5e;
          background: linear-gradient(115deg, #ffffff 0%, #f8fbff 68%, #fffaf0 100%);
          border-bottom: 1px solid #e5edf5;
        }

        .scanner-header-brand {
          display: flex;
          align-items: center;
          gap: 13px;
          min-width: 0;
        }

        .scanner-header-icon {
          display: grid;
          place-items: center;
          flex: 0 0 48px;
          width: 48px;
          height: 48px;
          color: #f4c96b;
          font-size: 21px;
          border: 1px solid rgba(217, 164, 65, 0.42);
          border-radius: 15px;
          background: linear-gradient(145deg, #214b70, #102943);
          box-shadow: 0 7px 15px rgba(23, 59, 94, 0.16);
        }

        .scanner-header-copy { min-width: 0; }
        .scanner-eyebrow {
          display: block;
          margin-bottom: 3px;
          color: #a27624;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 1.25px;
        }
        .scanner-header-title {
          color: #173b5e;
          font-size: 17px;
          font-weight: 800;
          line-height: 1.25;
          letter-spacing: -0.35px;
        }
        .scanner-header-subtitle {
          margin-top: 4px;
          color: #718096;
          font-size: 11px;
          line-height: 1.4;
        }
        .scanner-header-mode {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          flex: 0 0 auto;
          padding: 9px 12px;
          color: #173b5e;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.6px;
          border: 1px solid #e7d5a8;
          border-radius: 999px;
          background: #fff8e8;
        }
        .scanner-header-mode-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #d9a441;
          box-shadow: 0 0 0 4px rgba(217, 164, 65, 0.13);
        }

        .scanner-video-wrapper {
          background:
            radial-gradient(ellipse at 50% 45%, rgba(36, 79, 120, 0.42), transparent 58%),
            linear-gradient(145deg, #0b1726 0%, #102943 54%, #07111f 100%);
        }

        .scanner-video-wrapper video {
          filter: saturate(0.92) contrast(1.04);
        }

        .scanner-viewfinder {
          padding: 24px;
          background: radial-gradient(ellipse at center, transparent 20%, rgba(4, 13, 25, 0.12) 72%, rgba(4, 13, 25, 0.36) 100%);
        }

        .scanner-frame-box {
          width: min( min(58vw, 290px), 290px);
          height: min( min(58vw, 290px), 290px);
          filter: drop-shadow(0 0 18px rgba(217, 164, 65, 0.12));
        }

        .scanner-corner {
          width: 38px;
          height: 38px;
          border-color: #f4c96b;
          filter: drop-shadow(0 0 5px rgba(244, 201, 107, 0.45));
        }

        .scanner-corner-tl { border-radius: 12px 0 0 0; }
        .scanner-corner-tr { border-radius: 0 12px 0 0; }
        .scanner-corner-bl { border-radius: 0 0 0 12px; }
        .scanner-corner-br { border-radius: 0 0 12px 0; }

        .scanner-laser {
          left: 12px;
          right: 12px;
          height: 2px;
          border-radius: 99px;
          background: linear-gradient(90deg, transparent, #ffe09a 18%, #f0b83e 50%, #ffe09a 82%, transparent);
          box-shadow: 0 0 12px rgba(240, 184, 62, 0.9), 0 0 28px rgba(240, 184, 62, 0.32);
        }

        .scanner-hint {
          max-width: min(92%, 420px);
          margin-top: 24px;
          padding: 11px 17px;
          border: 1px solid rgba(255, 255, 255, 0.16);
          border-radius: 999px;
          background: rgba(9, 25, 43, 0.76);
          backdrop-filter: blur(12px);
          color: #f8fafc;
          font-size: 12px;
          font-weight: 500;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
        }

        .scanner-hint .anticon { color: #f4c96b !important; font-size: 15px; }

        .scanner-live-badge {
          top: 18px;
          left: 18px;
          padding: 8px 13px;
          border: 1px solid rgba(255, 255, 255, 0.17);
          border-radius: 999px;
          background: rgba(8, 23, 39, 0.78);
          backdrop-filter: blur(12px);
          letter-spacing: 0.2px;
          box-shadow: 0 8px 22px rgba(0, 0, 0, 0.18);
        }

        .scanner-live-dot {
          background: #f4c96b;
          box-shadow: 0 0 0 4px rgba(244, 201, 107, 0.14), 0 0 10px rgba(244, 201, 107, 0.6);
        }

        .scanner-processing-overlay {
          background: rgba(7, 20, 35, 0.84);
          backdrop-filter: blur(8px);
        }

        .scanner-processing-box {
          width: 68px;
          height: 68px;
          border-radius: 20px;
          background: linear-gradient(145deg, #244f78, #173b5e);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.2);
        }

        .scanner-overlay {
          padding: 22px;
          background: rgba(3, 12, 23, 0.72);
          backdrop-filter: blur(7px);
        }

        .scanner-card {
          max-width: 390px;
          padding: 28px 26px 24px;
          border: 1px solid rgba(255, 255, 255, 0.24);
          border-radius: 22px;
          box-shadow: 0 24px 70px rgba(0, 0, 0, 0.3);
          animation: scannerCardIn 220ms ease-out;
        }

        @keyframes scannerCardIn {
          from { opacity: 0; transform: translateY(8px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .scanner-card-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 66px;
          height: 66px;
          margin: 0 auto 17px;
          border-radius: 22px;
          background: rgba(255, 255, 255, 0.15);
          font-size: 34px;
        }

        .scanner-card-title {
          margin-bottom: 9px;
          font-size: 21px;
          letter-spacing: -0.35px;
        }

        .scanner-student-box {
          margin: 18px 0 14px;
          padding: 15px 16px;
          border: 1px solid rgba(255, 255, 255, 0.18);
          border-radius: 14px;
          background: rgba(7, 20, 35, 0.18);
        }

        .scanner-student-name { font-size: 17px; line-height: 1.45; }
        .scanner-student-code { border-radius: 999px; padding: 5px 10px; }
        .scanner-class-info { font-size: 12px; }
        .scanner-time-badge { border-radius: 999px; padding: 7px 13px; }
        .scanner-result-msg { font-size: 12px; line-height: 1.65; }

        .scanner-footer {
          min-height: 76px;
          gap: 7px;
          padding: 14px 20px;
          background: linear-gradient(110deg, #ffffff 0%, #f8fafc 100%);
          border-top: 1px solid #e7edf4;
        }

        .scanner-footer-top { min-height: 20px; }
        .scanner-footer-status { gap: 10px; }
        .scanner-status-dot { width: 9px; height: 9px; }
        .scanner-status-dot.ready { box-shadow: 0 0 0 4px rgba(46, 125, 91, 0.1); }
        .scanner-footer-text { font-size: 12px; font-weight: 700; color: #173b5e; }
        .scanner-footer-note { font-size: 10px; color: #748397; line-height: 1.45; }

        @media (max-width: 767px) {
          .scanner-header { min-height: 76px; padding: 12px 14px; gap: 9px; }
          .scanner-header-icon { flex-basis: 41px; width: 41px; height: 41px; border-radius: 13px; font-size: 18px; }
          .scanner-header-brand { gap: 10px; }
          .scanner-header-title { font-size: 15px; }
          .scanner-header-subtitle { max-width: 240px; font-size: 10px; }
          .scanner-eyebrow { font-size: 8px; letter-spacing: 0.9px; }
          .scanner-header-mode { padding: 7px 9px; gap: 6px; font-size: 9px; }
          .scanner-container {
            height: min(72vh, 560px);
            min-height: 430px;
            border-radius: 17px;
          }
          .scanner-frame-box { width: min(64vw, 235px); height: min(64vw, 235px); }
          .scanner-corner { width: 30px; height: 30px; }
          .scanner-hint { margin-top: 20px; padding: 9px 13px; font-size: 11px; line-height: 1.45; }
          .scanner-live-badge { top: 12px; left: 12px; padding: 7px 11px; }
          .scanner-card { max-width: 320px; padding: 22px 18px 20px; border-radius: 18px; }
          .scanner-card-icon { width: 56px; height: 56px; border-radius: 18px; font-size: 30px; }
          .scanner-card-title { font-size: 18px; }
          .scanner-student-name { font-size: 15px; }
          .scanner-footer { min-height: 70px; padding: 12px 14px; }
          .scanner-footer-text { font-size: 11px; }
        }

        @media (max-width: 380px) {
          .scanner-header { align-items: flex-start; }
          .scanner-header-subtitle { max-width: 185px; }
          .scanner-header-mode { padding: 6px 7px; font-size: 8px; }
          .scanner-container { min-height: 400px; height: 68vh; }
          .scanner-frame-box { width: 190px; height: 190px; }
          .scanner-corner { width: 26px; height: 26px; }
          .scanner-live-badge { font-size: 9px; }
          .scanner-footer-note { font-size: 9px; }
        }

      `}</style>

      <div className="scanner-container">
        {/* HEADER — FAITHEDU PREMIUM */}
        <div className="scanner-header">
          <div className="scanner-header-brand">
            <div className="scanner-header-icon">
              <ScanOutlined />
            </div>
            <div className="scanner-header-copy">
              <span className="scanner-eyebrow">FAITHEDU · ĐIỂM DANH</span>
              <div className="scanner-header-title">Quét mã QR học sinh</div>
              <div className="scanner-header-subtitle">
                Đưa mã vào khung hình để ghi nhận tự động
              </div>
            </div>
          </div>
          <div className="scanner-header-mode">
            <span className="scanner-header-mode-dot" />
            {isMass ? "THÁNH LỄ" : "GIÁO LÝ"}
          </div>
        </div>

        {/* CAMERA */}
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
              {/* 4 GÓC VÀNG */}

              <div className="scanner-corner scanner-corner-tl" />

              <div className="scanner-corner scanner-corner-tr" />

              <div className="scanner-corner scanner-corner-bl" />

              <div className="scanner-corner scanner-corner-br" />

              {!processing && !scanMessage && <div className="scanner-laser" />}
            </div>

            {!processing && !scanMessage && (
              <div className="scanner-hint">
                <ScanOutlined />

                <span>
                  {isMass
                    ? "Đưa mã QR học sinh vào giữa khung hình"
                    : "Đưa mã QR học sinh vào giữa khung hình"}
                </span>
              </div>
            )}
          </div>

          {/* ===============================================

              LIVE

          =============================================== */}

          <div className="scanner-live-badge">
            <span className="scanner-live-dot" />

            <span>{isMass ? "Đang quét Thánh lễ" : "Đang quét trực tiếp"}</span>
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
                {isMass
                  ? "Đang xác nhận tham dự Thánh lễ..."
                  : "Đang xử lý thông tin học viên..."}
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

                {/* =====================================

                    STUDENT

                ===================================== */}

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

                {/* =====================================

                    CLASS

                ===================================== */}

                {scanMessage.class?.name && (
                  <p className="scanner-class-info">
                    <TeamOutlined />

                    <span>Lớp: {scanMessage.class.name}</span>
                  </p>
                )}

                {/* =====================================

                    TIME

                ===================================== */}

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

                {/* =====================================

                    MESSAGE

                ===================================== */}

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
                    : isMass
                      ? "Sẵn sàng nhận diện mã tiếp theo"
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
