import React, { useEffect, useState } from "react";
import { Alert, Button, Modal, Tag, Typography, message } from "antd";
import confetti from "canvas-confetti";
import {
  BookOutlined,
  CalendarOutlined,
  CheckCircleFilled,
  CheckCircleOutlined,
  CrownOutlined,
  FileTextOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";

import catechistApi from "../../../../api/catechistApi";
import "./AppointmentModal.css";

import backgroundAppoint from "../../../../assets/images/backgroundAppoint.png";
import mascotRight from "../../../../assets/images/mascotRight.png";
import mascotLeft from "../../../../assets/images/mascotLeft.png";
import logoXn from "../../../../assets/images/logoweb.png";

const { Title, Text, Paragraph } = Typography;

const FAITHEDU_ASSETS = {
  logo: logoXn,
  mascotLeft,
  mascotRight,
  background: backgroundAppoint,
};

const AppointmentModal = () => {
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Tải danh sách thư bổ nhiệm
  const loadAppointments = async () => {
    try {
      setLoading(true);

      const response = await catechistApi.getPendingAppointments();
      const data = response?.data?.data || [];

      setAppointments(Array.isArray(data) ? data : []);
      setCurrentIndex(0);
    } catch (error) {
      message.error(
        error?.response?.data?.message || "Không thể tải thư bổ nhiệm.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const currentAppointment = appointments[currentIndex];

  const fullName = [
    currentAppointment?.holy_name,
    currentAppointment?.full_name,
  ]
    .filter(Boolean)
    .join(" ");

  const role = currentAppointment?.role || "Giáo lý viên";
  const className = currentAppointment?.class_name || "Chưa cập nhật";
  const classCode = currentAppointment?.class_code;
  useEffect(() => {
    if (loading || !currentAppointment) return;

    // Chờ modal/card render xong rồi mới bắn
    const timer = setTimeout(() => {
      const duration = 2200;
      const animationEnd = Date.now() + duration;

      const colors = ["#D9A441", "#173B5E", "#F4D58D", "#FFFFFF", "#C89B3C"];

      const fire = () => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) return;

        confetti({
          particleCount: 7,
          angle: 60,
          spread: 65,
          startVelocity: 42,
          decay: 0.92,
          gravity: 1,
          origin: {
            x: 0.05,
            y: 0.55,
          },
          colors,
          scalar: 0.9,
        });

        confetti({
          particleCount: 7,
          angle: 120,
          spread: 65,
          startVelocity: 42,
          decay: 0.92,
          gravity: 1,
          origin: {
            x: 0.95,
            y: 0.55,
          },
          colors,
          scalar: 0.9,
        });

        requestAnimationFrame(fire);
      };

      fire();

      // Một phát nổ nhỏ ở phía trên modal
      setTimeout(() => {
        confetti({
          particleCount: 90,
          spread: 100,
          startVelocity: 35,
          gravity: 0.9,
          ticks: 180,
          scalar: 1,
          origin: {
            x: 0.5,
            y: 0.28,
          },
          colors,
        });
      }, 250);
    }, 300);

    return () => clearTimeout(timer);
  }, [loading, currentAppointment]);
  // Định dạng ngày
  const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString("vi-VN");
  };

  // Xác nhận đã nhận thư
  const handleRead = async () => {
    if (!currentAppointment?.id || confirming) return;

    const appointmentId = currentAppointment.id;

    try {
      setConfirming(true);

      await catechistApi.readAppointment(appointmentId);

      message.success("Đã xác nhận nhận thư bổ nhiệm.");

      setAppointments((previous) =>
        previous.filter((item) => item.id !== appointmentId),
      );

      setCurrentIndex(0);
    } catch (error) {
      message.error(
        error?.response?.data?.message || "Không thể xác nhận thư bổ nhiệm.",
      );
    } finally {
      setConfirming(false);
    }
  };

  if (!currentAppointment) return null;

  const firstLetter = fullName
    ? fullName.trim().split(/\s+/).slice(-1)[0].charAt(0).toUpperCase()
    : "F";

  return (
    <Modal
      open
      centered
      width={540}
      closable={false}
      maskClosable={false}
      keyboard={false}
      footer={null}
      destroyOnHidden={false}
      className="fe-appointment-modal"
    >
      <article
        className="fe-appointment-card"
        style={{
          "--fe-appointment-bg": FAITHEDU_ASSETS.background
            ? `url("${FAITHEDU_ASSETS.background}")`
            : "none",
        }}
      >
        {/* Viền trang trí */}
        <span className="fe-card-corner fe-corner-tl" />
        <span className="fe-card-corner fe-corner-tr" />
        <span className="fe-card-corner fe-corner-bl" />
        <span className="fe-card-corner fe-corner-br" />

        <div className="fe-card-decoration fe-decoration-left" />
        <div className="fe-card-decoration fe-decoration-right" />

        {/* Header */}
        <header className="fe-appointment-header">
          <div className="fe-appointment-ribbon">
            <img
              className="fe-ribbon-logo"
              src={FAITHEDU_ASSETS.logo}
              alt="FaithEdu"
            />
            <span>BỔ NHIỆM LỚP</span>
          </div>

          <div className="fe-appointment-medallion">
            <div className="fe-medallion-inner">
              {currentAppointment?.avatar ? (
                <img
                  src={`${process.env.REACT_APP_API_URL}${currentAppointment.avatar}`}
                  alt={fullName || "Giáo lý viên"}
                  className="fe-medallion-avatar"
                />
              ) : (
                <>
                  <CrownOutlined className="fe-medallion-crown" />
                  <span>{firstLetter}</span>
                </>
              )}
            </div>
          </div>
          <div className="fe-medallion-rays">
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>
          <div className="fe-appointment-celebration">
            <span>✦</span>
            <strong>CHÚC MỪNG!</strong>
            <span>✦</span>
          </div>
          <div className="fe-appointment-eyebrow">
            <CheckCircleFilled />
            <span>QUYẾT ĐỊNH BỔ NHIỆM</span>
          </div>

          <Text className="fe-appointment-subtitle">
            Ban Giáo lý trân trọng thông báo
          </Text>
        </header>

        {/* Nội dung */}
        <section className="fe-appointment-main">
          {/* Mascot bên trái: thay ảnh tại FAITHEDU_ASSETS */}
          {FAITHEDU_ASSETS.mascotLeft && (
            <img
              className="fe-appointment-mascot fe-mascot-left"
              src={FAITHEDU_ASSETS.mascotLeft}
              alt=""
              aria-hidden="true"
            />
          )}

          {/* Mascot bên phải */}
          {FAITHEDU_ASSETS.mascotRight && (
            <img
              className="fe-appointment-mascot fe-mascot-right"
              src={FAITHEDU_ASSETS.mascotRight}
              alt=""
              aria-hidden="true"
            />
          )}

          <div className="fe-appointment-recipient">
            <Text className="fe-recipient-role">{role}</Text>

            <Title level={2} className="fe-recipient-name">
              {fullName || "Giáo lý viên"}
            </Title>

            <div className="fe-recipient-class">
              <BookOutlined />
              <span>{className}</span>

              {classCode && <Tag className="fe-class-code">{classCode}</Tag>}
            </div>
          </div>

          {/* Thông tin phân công */}
          <div className="fe-appointment-info">
            <AppointmentInfoRow
              icon={<UserOutlined />}
              label="Vai trò"
              value={role}
            />

            <AppointmentInfoRow
              icon={<TeamOutlined />}
              label="Lớp"
              value={className}
            />

            <AppointmentInfoRow
              icon={<CalendarOutlined />}
              label="Năm học"
              value={currentAppointment.school_year || "—"}
            />

            <AppointmentInfoRow
              icon={<FileTextOutlined />}
              label="Ngày bổ nhiệm"
              value={formatDate(currentAppointment.assigned_date)}
            />
          </div>

          {/* Ghi chú */}
          {currentAppointment.notes && (
            <div className="fe-appointment-notes">
              <FileTextOutlined className="fe-notes-icon" />

              <div>
                <Text strong>Ghi chú</Text>
                <Paragraph>{currentAppointment.notes}</Paragraph>
              </div>
            </div>
          )}

          {/* Lời chúc */}
          <div className="fe-appointment-blessing">
            <div className="fe-blessing-divider">
              <span />
              <BookOutlined />
              <span />
            </div>

            <p>
              Xin Thiên Chúa nâng đỡ và ban ơn, giúp Anh/Chị luôn hăng say phục
              vụ trong sứ mạng giáo lý.
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="fe-appointment-footer">
          <Alert
            className="fe-appointment-alert"
            type="info"
            showIcon
            icon={<CheckCircleOutlined />}
            message="Vui lòng xác nhận sau khi đã đọc thư bổ nhiệm."
          />

          <div className="fe-appointment-footer-bottom">
            <div className="fe-appointment-counter">
              <FileTextOutlined />
              <span>
                {appointments.length > 1
                  ? `Thư ${currentIndex + 1} / ${appointments.length}`
                  : "Thư bổ nhiệm mới"}
              </span>
            </div>

            <Button
              type="primary"
              size="large"
              icon={<CheckCircleOutlined />}
              loading={confirming}
              onClick={handleRead}
              className="fe-appointment-confirm"
            >
              {confirming ? "Đang xác nhận..." : "Đã nhận bổ nhiệm"}
            </Button>
          </div>
        </footer>
      </article>
    </Modal>
  );
};

const AppointmentInfoRow = ({ icon, label, value }) => (
  <div className="fe-appointment-info-row">
    <div className="fe-info-icon">{icon}</div>
    <div className="fe-info-label">{label}</div>
    <div className="fe-info-value">{value || "—"}</div>
  </div>
);

export default AppointmentModal;
