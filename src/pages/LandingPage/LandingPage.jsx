import React, { useState, useEffect } from "react";
import {
  ArrowRightOutlined,
  PlayCircleFilled,
  BookFilled,
  QrcodeOutlined,
  PlaySquareFilled,
  HeartFilled,
  RocketFilled,
  PhoneFilled,
  MailFilled,
  FacebookFilled,
  StarFilled,
  ThunderboltFilled,
  MenuOutlined,
  CrownFilled,
  CheckOutlined,
  GiftFilled,
  FireFilled,
  UpOutlined,
} from "@ant-design/icons";

import {
  Button,
  Card,
  ConfigProvider,
  Grid,
  Space,
  Tag,
  Typography,
  Modal,
  Divider,
  Drawer,
  Collapse,
  Avatar,
} from "antd";

import { motion, AnimatePresence, useScroll, useSpring } from "motion/react";

import logoWeb from "../../assets/images/logoweb.png";
import dashboard from "../../assets/images/dashboard-mockup.png";
import qrScanner from "../../assets/images/qr-scanner-ui.png";
import gameUi from "../../assets/images/game-quiz-ui.png";

const { Title, Paragraph, Text } = Typography;
const { useBreakpoint } = Grid;

/* =========================================================
   PALETTE MẦU MỚI: HIGH-CONTRAST VIBRANT PASTEL
========================================================= */
const BRAND = {
  primary: "#FF3366", // Hồng Vibrant CTA
  primaryGlow: "rgba(255, 51, 102, 0.4)",
  primaryDark: "#D81B60",
  secondary: "#7C4DFF", // Tím Cyberpunk accent
  accentYellow: "#FFD166", // Vàng Neon
  neonGreen: "#00E676",
  darkBg: "#0F080D",
  softBg: "#FFF2F6",
  cardBg: "#FFFFFF",
  textMain: "#1F1116",
  textMuted: "#7A626A",
  border: "rgba(255, 51, 102, 0.18)",
};

const scrollToSection = (id) => {
  const element = document.getElementById(id);
  if (element) {
    const headerOffset = 90;
    const elementPosition =
      element.getBoundingClientRect().top + window.pageYOffset;
    window.scrollTo({
      top: elementPosition - headerOffset,
      behavior: "smooth",
    });
  }
};

/* =========================================================
   ANIMATION VARIANTS (MOTION REVOLUTION)
========================================================= */
const fadeUpVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      delay: i * 0.1,
      ease: [0.215, 0.61, 0.355, 1],
    },
  }),
};

const pulseGlow = {
  animate: {
    scale: [1, 1.03, 1],
    boxShadow: [
      "0 10px 30px rgba(255, 51, 102, 0.3)",
      "0 18px 45px rgba(255, 51, 102, 0.6)",
      "0 10px 30px rgba(255, 51, 102, 0.3)",
    ],
    transition: {
      duration: 2.5,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

const floatAnimation = (duration = 4, delay = 0) => ({
  animate: {
    y: [0, -12, 0],
    rotate: [0, 2, 0],
    transition: {
      duration,
      delay,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
});

/* =========================================================
   COUNTDOWN TIMER WITH MOTION
========================================================= */
const CountdownTimer = () => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 1,
    minutes: 24,
    seconds: 45,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0)
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const format = (n) => String(n).padStart(2, "0");

  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      {[
        { val: format(timeLeft.hours), label: "Giờ" },
        { val: format(timeLeft.minutes), label: "Phút" },
        { val: format(timeLeft.seconds), label: "Giây" },
      ].map((item, idx) => (
        <React.Fragment key={idx}>
          <motion.div
            key={item.val}
            initial={{ scale: 0.8, opacity: 0.5 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
            style={{
              background: "#12050A",
              color: BRAND.accentYellow,
              padding: "3px 9px",
              borderRadius: 8,
              fontWeight: 900,
              fontSize: 13,
              border: `1px solid rgba(255, 209, 102, 0.3)`,
              fontFamily: "monospace",
            }}
          >
            {item.val}
          </motion.div>
          {idx < 2 && <span style={{ fontWeight: 900, color: "#FFF" }}>:</span>}
        </React.Fragment>
      ))}
    </div>
  );
};

/* =========================================================
   MAIN COMPONENT
========================================================= */
const LandingPage = () => {
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const [videoOpen, setVideoOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("qr");

  // Scroll Progress Bar
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  const handleLogin = () => {
    window.location.href = "https://giaolyso.site";
  };

  const navItems = [
    { label: "Trang chủ", id: "hero" },
    { label: "Tính năng", id: "features" },
    { label: "Gói 299k", id: "pricing" },
    { label: "Đánh giá", id: "reviews" },
    { label: "Hỏi đáp", id: "faq" },
  ];

  const featureTabs = [
    {
      key: "qr",
      icon: <QrcodeOutlined />,
      title: "Điểm Danh QR Tốc Độ Cao",
      desc: "Chỉ với 0.5 giây quét mã, hệ thống tự động lưu trữ chuyên cần, cập nhật sổ điểm danh trực tuyến và gửi báo cáo về cho Giáo lý viên.",
      img: qrScanner,
      tag: "CÔNG NGHỆ BỨC PHÁ",
    },
    {
      key: "game",
      icon: <PlaySquareFilled />,
      title: "Minigame & Quiz Tương Tác",
      desc: "Biến giờ học Kinh Bổn khô khan thành các trận thi đấu trắc nghiệm hấp dẫn. Tăng 200% độ hứng thú của Thiếu Nhi khi đến lớp Giáo lý.",
      img: gameUi,
      tag: "HỌC MÀ CHƠI",
    },
    {
      key: "dash",
      icon: <BookFilled />,
      title: "Quản Lý Lớp & Sổ Giáo Án",
      desc: "Số hóa hoàn toàn sơ đồ lớp, hồ sơ Thiếu Nhi, bảng điểm thi học kỳ và sổ theo dõi tham dự Thánh Lễ dành riêng cho các Ngành.",
      img: dashboard,
      tag: "SỐ HÓA TOÀN DIỆN",
    },
  ];

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: BRAND.primary,
          borderRadius: 20,
          fontFamily: '"Be Vietnam Pro", sans-serif',
        },
      }}
    >
      {/* SCROLL PROGRESS BAR */}
      <motion.div
        style={{
          scaleX,
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: `linear-gradient(90deg, ${BRAND.primary}, ${BRAND.secondary}, ${BRAND.accentYellow})`,
          transformOrigin: "0%",
          zIndex: 9999,
        }}
      />

      <div
        style={{
          background: "#FAFAFA",
          minHeight: "100vh",
          color: BRAND.textMain,
          overflowX: "hidden",
        }}
      >
        {/* =================================================
            TOP URGENCY TICKER BANNER (MOTION FOMO)
        ================================================= */}
        <div
          style={{
            background: "linear-gradient(90deg, #12050A 0%, #2A0815 100%)",
            color: "#FFF",
            padding: "10px 16px",
            textAlign: "center",
            fontSize: 13,
            fontWeight: 700,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 14,
            flexWrap: "wrap",
            borderBottom: `1px solid ${BRAND.border}`,
          }}
        >
          <motion.span
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              color: BRAND.accentYellow,
            }}
          >
            <FireFilled style={{ color: BRAND.primary }} /> SIÊU ƯU ĐÃI KÍCH
            HOẠT VĨNH VIỄN 299K (GIẢM 70%)
          </motion.span>
          <CountdownTimer />
          <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}>
            <Button
              size="small"
              onClick={() => scrollToSection("pricing")}
              style={{
                background: `linear-gradient(135deg, ${BRAND.primary}, ${BRAND.primaryDark})`,
                color: "#FFF",
                border: 0,
                fontWeight: 900,
                borderRadius: 20,
                fontSize: 12,
                paddingInline: 16,
                boxShadow: "0 4px 15px rgba(255, 51, 102, 0.4)",
              }}
            >
              LẤY MÃ GIẢM GIÁ
            </Button>
          </motion.div>
        </div>

        {/* =================================================
            HEADER WITH GLASSMORPHISM
        ================================================= */}
        <header
          style={{
            position: "sticky",
            top: 0,
            zIndex: 1000,
            background: "rgba(255, 255, 255, 0.85)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderBottom: `1px solid ${BRAND.border}`,
            padding: "12px 0",
          }}
        >
          <div
            style={{
              maxWidth: 1200,
              margin: "auto",
              paddingInline: isMobile ? 16 : 24,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            {/* LOGO */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => scrollToSection("hero")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 14,
                  background: "#FFF",
                  boxShadow: "0 8px 20px rgba(255, 51, 102, 0.15)",
                  display: "grid",
                  placeItems: "center",
                  border: `1px solid ${BRAND.border}`,
                }}
              >
                <img
                  src={logoWeb}
                  alt="FaithEdu"
                  style={{ width: 32, height: 32, objectFit: "contain" }}
                />
              </div>
              <div>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 900,
                    color: BRAND.primaryDark,
                    leading: 1,
                  }}
                >
                  FaithEdu
                </div>
                <div
                  style={{
                    fontSize: 9,
                    fontWeight: 800,
                    color: BRAND.textMuted,
                    letterSpacing: 0.8,
                  }}
                >
                  SỐ HÓA GIÁO LÝ VĨNH VIỄN
                </div>
              </div>
            </motion.div>

            {/* NAV DESKTOP */}
            {!isMobile && (
              <Space size={28}>
                {navItems.map((item) => (
                  <motion.a
                    key={item.id}
                    whileHover={{ y: -2, color: BRAND.primary }}
                    onClick={() => scrollToSection(item.id)}
                    style={{
                      color: BRAND.textMain,
                      fontWeight: 800,
                      fontSize: 14,
                      cursor: "pointer",
                      transition: "color 0.2s",
                    }}
                  >
                    {item.label}
                  </motion.a>
                ))}
              </Space>
            )}

            {/* CTA HEADER */}
            <Space>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  type="primary"
                  onClick={handleLogin}
                  style={{
                    background: `linear-gradient(135deg, ${BRAND.primary}, ${BRAND.primaryDark})`,
                    border: 0,
                    fontWeight: 900,
                    boxShadow: "0 8px 25px rgba(255, 51, 102, 0.35)",
                    height: 44,
                    paddingInline: 24,
                    borderRadius: 22,
                  }}
                >
                  Đăng Nhập
                </Button>
              </motion.div>
              {isMobile && (
                <Button
                  type="text"
                  icon={<MenuOutlined style={{ fontSize: 22 }} />}
                  onClick={() => setDrawerOpen(true)}
                />
              )}
            </Space>
          </div>
        </header>

        {/* DRAWER MOBILE */}
        <Drawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          width={280}
          placement="right"
        >
          <Space
            direction="vertical"
            size={16}
            style={{ width: "100%", marginTop: 20 }}
          >
            {navItems.map((item) => (
              <Button
                key={item.id}
                type="text"
                block
                style={{
                  textAlign: "left",
                  fontWeight: 800,
                  height: 48,
                  fontSize: 16,
                }}
                onClick={() => {
                  setDrawerOpen(false);
                  scrollToSection(item.id);
                }}
              >
                {item.label}
              </Button>
            ))}
          </Space>
        </Drawer>

        {/* =================================================
            HERO SECTION (ANIMATED DYNAMIC GRID)
        ================================================= */}
        <section
          id="hero"
          style={{
            position: "relative",
            padding: isMobile ? "40px 0 70px" : "90px 0 120px",
            background:
              "radial-gradient(circle at 80% 20%, #FFEBF2 0%, #FAFAFA 70%)",
            overflow: "hidden",
          }}
        >
          {/* FLOATING LIGHT BLOBS */}
          <motion.div
            {...floatAnimation(6, 0)}
            style={{
              position: "absolute",
              top: "-5%",
              right: "5%",
              width: 350,
              height: 350,
              borderRadius: "50%",
              background: "rgba(255, 51, 102, 0.12)",
              filter: "blur(60px)",
              pointerEvents: "none",
            }}
          />

          <div
            style={{
              maxWidth: 1200,
              margin: "auto",
              paddingInline: isMobile ? 16 : 24,
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "1.1fr 0.9fr",
              gap: 50,
              alignItems: "center",
            }}
          >
            {/* HERO LEFT */}
            <motion.div
              initial="hidden"
              animate="visible"
              custom={0}
              variants={fadeUpVariants}
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                style={{ display: "inline-block" }}
              >
                <Tag
                  style={{
                    background: BRAND.softBg,
                    color: BRAND.primaryDark,
                    border: `1px solid ${BRAND.border}`,
                    padding: "8px 18px",
                    borderRadius: 30,
                    fontWeight: 900,
                    fontSize: 12,
                    marginBottom: 20,
                    boxShadow: "0 4px 15px rgba(255, 51, 102, 0.1)",
                  }}
                >
                  <CrownFilled
                    style={{
                      color: BRAND.accentYellow,
                      marginRight: 8,
                      fontSize: 14,
                    }}
                  />{" "}
                  NỀN TẢNG QUẢN LÝ GIÁO LÝ THẾ HỆ MỚI
                </Tag>
              </motion.div>

              <Title
                level={1}
                style={{
                  fontSize: isMobile ? 36 : 58,
                  fontWeight: 900,
                  lineHeight: 1.1,
                  letterSpacing: -1.5,
                  margin: "10px 0 22px",
                  color: BRAND.textMain,
                }}
              >
                Dạy Giáo Lý Hiện Đại. <br />
                <span
                  style={{
                    background: `linear-gradient(135deg, ${BRAND.primary}, ${BRAND.secondary})`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Sở Hữu Vĩnh Viễn 299K.
                </span>
              </Title>

              <Paragraph
                style={{
                  fontSize: 17,
                  color: BRAND.textMuted,
                  lineHeight: 1.8,
                  maxWidth: 540,
                }}
              >
                Số hóa toàn diện công tác quản lý Xứ Đoàn: Điểm danh QR siêu
                tốc, Trò chơi tương tác Kinh Bổn, Sổ liên lạc điện tử và Báo cáo
                tự động chỉ trên 1 nền tảng duy nhất.
              </Paragraph>

              {/* ACTION BUTTONS WITH MOTION */}
              <Space wrap size={16} style={{ marginTop: 16 }}>
                <motion.div {...pulseGlow}>
                  <Button
                    type="primary"
                    size="large"
                    onClick={() => scrollToSection("pricing")}
                    icon={<RocketFilled />}
                    style={{
                      height: 58,
                      paddingInline: 36,
                      borderRadius: 29,
                      fontWeight: 900,
                      fontSize: 16,
                      background: `linear-gradient(135deg, ${BRAND.primary}, ${BRAND.primaryDark})`,
                      border: 0,
                    }}
                  >
                    MUA NGAY · CHỈ 299K
                  </Button>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    size="large"
                    onClick={() => setVideoOpen(true)}
                    icon={
                      <PlayCircleFilled
                        style={{ color: BRAND.primary, fontSize: 22 }}
                      />
                    }
                    style={{
                      height: 58,
                      paddingInline: 28,
                      borderRadius: 29,
                      fontWeight: 800,
                      border: `2px solid ${BRAND.border}`,
                      background: "#FFF",
                      boxShadow: "0 10px 25px rgba(0,0,0,0.04)",
                    }}
                  >
                    Xem Demo (2 Phút)
                  </Button>
                </motion.div>
              </Space>

              {/* SOCIAL PROOF */}
              <div
                style={{
                  marginTop: 40,
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                }}
              >
                <Avatar.Group max={{ count: 4 }}>
                  <Avatar src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" />
                  <Avatar src="https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka" />
                  <Avatar src="https://api.dicebear.com/7.x/avataaars/svg?seed=John" />
                  <Avatar src="https://api.dicebear.com/7.x/avataaars/svg?seed=Maria" />
                </Avatar.Group>
                <div>
                  <div
                    style={{
                      display: "flex",
                      gap: 2,
                      color: "#FFC107",
                      fontSize: 13,
                    }}
                  >
                    {[...Array(5)].map((_, i) => (
                      <StarFilled key={i} />
                    ))}
                  </div>
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: 800,
                      color: BRAND.textMuted,
                    }}
                  >
                    Được tin dùng bởi{" "}
                    <strong style={{ color: BRAND.textMain }}>
                      50+ Giáo Xứ & 1,200+ GLV
                    </strong>
                  </Text>
                </div>
              </div>
            </motion.div>

            {/* HERO RIGHT (INTERACTIVE DASHBOARD MOCKUP) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              style={{ position: "relative" }}
            >
              <motion.div
                whileHover={{ rotateY: -5, rotateX: 5 }}
                transition={{ type: "spring", stiffness: 200 }}
                style={{
                  padding: 12,
                  borderRadius: 36,
                  background: "rgba(255, 255, 255, 0.9)",
                  boxShadow: "0 30px 80px rgba(255, 51, 102, 0.25)",
                  border: "2px solid #FFF",
                }}
              >
                <img
                  src={dashboard}
                  alt="FaithEdu Dashboard"
                  style={{ width: "100%", borderRadius: 26, display: "block" }}
                />
              </motion.div>

              {/* FLOATING MICRO BADGE 1 */}
              <motion.div
                {...floatAnimation(4, 0)}
                style={{
                  position: "absolute",
                  top: -20,
                  left: isMobile ? -10 : -30,
                  background: "#FFF",
                  padding: "12px 20px",
                  borderRadius: 22,
                  boxShadow: "0 15px 35px rgba(0,0,0,0.12)",
                  border: `1px solid ${BRAND.border}`,
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 12,
                    background: BRAND.softBg,
                    display: "grid",
                    placeItems: "center",
                    color: BRAND.primary,
                    fontSize: 18,
                  }}
                >
                  <ThunderboltFilled />
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 900,
                      color: BRAND.textMain,
                    }}
                  >
                    Điểm Danh 0.5s
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      color: BRAND.neonGreen,
                      fontWeight: 800,
                    }}
                  >
                    ● Tự động 100%
                  </div>
                </div>
              </motion.div>

              {/* FLOATING MICRO BADGE 2 */}
              <motion.div
                {...floatAnimation(5, 1)}
                style={{
                  position: "absolute",
                  bottom: -20,
                  right: isMobile ? -10 : -20,
                  background: "#12050A",
                  color: "#FFF",
                  padding: "12px 20px",
                  borderRadius: 22,
                  boxShadow: "0 15px 35px rgba(0,0,0,0.25)",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 12,
                    background: "rgba(255,209,102,0.2)",
                    display: "grid",
                    placeItems: "center",
                    color: BRAND.accentYellow,
                    fontSize: 18,
                  }}
                >
                  <CrownFilled />
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 900,
                      color: BRAND.accentYellow,
                    }}
                  >
                    Gói Vĩnh Viễn
                  </div>
                  <div style={{ fontSize: 10, color: "#FFF", fontWeight: 700 }}>
                    Chỉ 299k trọn đời
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* =================================================
            INTERACTIVE FEATURE SHOWCASE (DYNAMIC TABS)
        ================================================= */}
        <section
          id="features"
          style={{
            padding: isMobile ? "60px 0" : "110px 0",
            background: "#FFF",
          }}
        >
          <div
            style={{
              maxWidth: 1200,
              margin: "auto",
              paddingInline: isMobile ? 16 : 24,
            }}
          >
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={0}
              variants={fadeUpVariants}
              style={{
                textAlign: "center",
                maxWidth: 750,
                margin: "0 auto 50px",
              }}
            >
              <Tag
                style={{
                  background: BRAND.softBg,
                  color: BRAND.primaryDark,
                  border: 0,
                  fontWeight: 900,
                  padding: "8px 20px",
                  borderRadius: 30,
                }}
              >
                <StarFilled style={{ marginRight: 6 }} /> BỘ CÔNG CỤ ĐỘC BẢN
              </Tag>
              <Title
                level={2}
                style={{
                  fontSize: isMobile ? 30 : 44,
                  fontWeight: 900,
                  marginTop: 14,
                }}
              >
                Trải nghiệm giảng dạy{" "}
                <span style={{ color: BRAND.primary }}>hoàn toàn mới</span>
              </Title>
              <Paragraph style={{ color: BRAND.textMuted, fontSize: 16 }}>
                Loại bỏ hoàn toàn sổ sách thủ công. Tận hưởng sự tiện lợi và
                sinh động chưa từng có.
              </Paragraph>
            </motion.div>

            {/* TAB SELECTOR BUTTONS */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 14,
                flexWrap: "wrap",
                marginBottom: 40,
              }}
            >
              {featureTabs.map((tab) => {
                const isActive = activeTab === tab.key;
                return (
                  <motion.div
                    key={tab.key}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      size="large"
                      onClick={() => setActiveTab(tab.key)}
                      icon={tab.icon}
                      style={{
                        height: 52,
                        borderRadius: 26,
                        fontWeight: 900,
                        fontSize: 15,
                        border: isActive
                          ? `2px solid ${BRAND.primary}`
                          : `1px solid ${BRAND.border}`,
                        background: isActive
                          ? `linear-gradient(135deg, ${BRAND.primary}, ${BRAND.primaryDark})`
                          : "#FFF",
                        color: isActive ? "#FFF" : BRAND.textMain,
                        boxShadow: isActive
                          ? "0 10px 25px rgba(255, 51, 102, 0.35)"
                          : "none",
                      }}
                    >
                      {tab.title}
                    </Button>
                  </motion.div>
                );
              })}
            </div>

            {/* TAB CONTENT ANIMATED CARD */}
            <AnimatePresence mode="wait">
              {featureTabs.map(
                (tab) =>
                  tab.key === activeTab && (
                    <motion.div
                      key={tab.key}
                      initial={{ opacity: 0, y: 30, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -30, scale: 0.98 }}
                      transition={{ duration: 0.4 }}
                      style={{
                        background: BRAND.softBg,
                        borderRadius: 36,
                        padding: isMobile ? 24 : 50,
                        border: `1px solid ${BRAND.border}`,
                        display: "grid",
                        gridTemplateColumns: isMobile ? "1fr" : "1fr 1.2fr",
                        gap: 40,
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <Tag
                          color="magenta"
                          style={{
                            fontWeight: 900,
                            borderRadius: 12,
                            padding: "4px 12px",
                            marginBottom: 14,
                          }}
                        >
                          {tab.tag}
                        </Tag>
                        <Title
                          level={3}
                          style={{
                            fontWeight: 900,
                            fontSize: isMobile ? 24 : 32,
                            color: BRAND.textMain,
                            marginTop: 6,
                          }}
                        >
                          {tab.title}
                        </Title>
                        <Paragraph
                          style={{
                            fontSize: 16,
                            color: BRAND.textMuted,
                            lineHeight: 1.8,
                            margin: "16px 0 24px",
                          }}
                        >
                          {tab.desc}
                        </Paragraph>
                        <motion.div whileHover={{ x: 6 }}>
                          <Button
                            type="primary"
                            onClick={() => scrollToSection("pricing")}
                            style={{
                              background: BRAND.primary,
                              borderRadius: 22,
                              fontWeight: 900,
                              height: 46,
                              paddingInline: 24,
                            }}
                          >
                            Kích hoạt ngay tính năng này <ArrowRightOutlined />
                          </Button>
                        </motion.div>
                      </div>

                      <div style={{ textAlign: "center" }}>
                        <motion.img
                          whileHover={{ scale: 1.03 }}
                          transition={{ type: "spring", stiffness: 200 }}
                          src={tab.img}
                          alt={tab.title}
                          style={{
                            maxWidth: "100%",
                            maxHeight: 400,
                            borderRadius: 24,
                            boxShadow: "0 20px 50px rgba(0,0,0,0.12)",
                            objectFit: "contain",
                          }}
                        />
                      </div>
                    </motion.div>
                  ),
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* =================================================
            PRICING SECTION (HIGH-CONVERSION HERO CARD)
        ================================================= */}
        <section
          id="pricing"
          style={{
            padding: isMobile ? "70px 0" : "120px 0",
            background:
              "radial-gradient(circle at 50% 50%, #FFEBF2 0%, #FAFAFA 100%)",
            position: "relative",
          }}
        >
          <div
            style={{
              maxWidth: 1200,
              margin: "auto",
              paddingInline: isMobile ? 16 : 24,
            }}
          >
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={0}
              variants={fadeUpVariants}
              style={{
                textAlign: "center",
                maxWidth: 750,
                margin: "0 auto 50px",
              }}
            >
              <Tag
                style={{
                  background: "#12050A",
                  color: BRAND.accentYellow,
                  border: 0,
                  fontWeight: 900,
                  padding: "8px 20px",
                  borderRadius: 30,
                }}
              >
                GÓI KÍCH HOẠT ƯU ĐÃI
              </Tag>
              <Title
                level={2}
                style={{
                  fontSize: isMobile ? 32 : 46,
                  fontWeight: 900,
                  marginTop: 14,
                }}
              >
                Đầu tư 1 lần ·{" "}
                <span style={{ color: BRAND.primary }}>Sử dụng Vĩnh Viễn</span>
              </Title>
              <Paragraph style={{ color: BRAND.textMuted, fontSize: 16 }}>
                Không tốn phí gia hạn hàng năm. Đầy đủ quyền lợi nâng cấp tính
                năng mới trọn đời.
              </Paragraph>
            </motion.div>

            {/* HERO PRICING CARD */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={1}
              variants={fadeUpVariants}
              style={{ maxWidth: 650, margin: "auto" }}
            >
              <Card
                bordered={false}
                style={{
                  borderRadius: 40,
                  background: "#FFF",
                  boxShadow: "0 30px 80px rgba(255, 51, 102, 0.22)",
                  border: `3px solid ${BRAND.primary}`,
                  position: "relative",
                  overflow: "hidden",
                  padding: isMobile ? "12px" : "24px",
                }}
              >
                {/* BADGE CORNER */}
                <div
                  style={{
                    position: "absolute",
                    top: 28,
                    right: -40,
                    background: `linear-gradient(135deg, ${BRAND.primary}, ${BRAND.primaryDark})`,
                    color: "#FFF",
                    padding: "8px 45px",
                    transform: "rotate(45deg)",
                    fontWeight: 900,
                    fontSize: 11,
                    letterSpacing: 1,
                    boxShadow: "0 5px 15px rgba(0,0,0,0.2)",
                  }}
                >
                  BEST SELLER
                </div>

                <div style={{ textAlign: "center", paddingTop: 10 }}>
                  <Tag
                    icon={<CrownFilled style={{ color: BRAND.accentYellow }} />}
                    style={{
                      padding: "6px 18px",
                      borderRadius: 20,
                      background: BRAND.softBg,
                      color: BRAND.primaryDark,
                      fontWeight: 900,
                      fontSize: 13,
                      border: 0,
                    }}
                  >
                    GÓI KÍCH HOẠT VĨNH VIỄN
                  </Tag>

                  <div style={{ marginTop: 24 }}>
                    <Text
                      delete
                      style={{
                        color: "#B0A0A6",
                        fontSize: 20,
                        fontWeight: 800,
                      }}
                    >
                      999.000 VNĐ
                    </Text>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "baseline",
                        justifyContent: "center",
                        gap: 6,
                        marginTop: 4,
                      }}
                    >
                      <span
                        style={{
                          fontSize: isMobile ? 48 : 64,
                          fontWeight: 900,
                          color: BRAND.primaryDark,
                          leading: 1,
                        }}
                      >
                        299.000
                      </span>
                      <span
                        style={{
                          fontSize: 22,
                          fontWeight: 900,
                          color: BRAND.textMain,
                        }}
                      >
                        VNĐ
                      </span>
                    </div>
                    <Text
                      style={{
                        color: BRAND.primary,
                        fontWeight: 800,
                        fontSize: 14,
                        display: "block",
                        marginTop: 4,
                      }}
                    >
                      Thanh toán 1 lần duy nhất · Dùng trọn đời không phát sinh
                      phí
                    </Text>
                  </div>
                </div>

                <Divider
                  style={{ margin: "28px 0", borderColor: BRAND.border }}
                />

                <Space
                  direction="vertical"
                  size={14}
                  style={{ width: "100%", paddingInline: isMobile ? 0 : 20 }}
                >
                  {[
                    "Sử dụng vĩnh viễn không giới hạn số lượng Thiếu Nhi & Lớp học",
                    "Đầy đủ tính năng: Quét mã QR điểm danh, Game Quiz Kinh Bổn",
                    "Cập nhật miễn phí các tính năng nâng cấp trong tương lai",
                    "Lưu trữ dữ liệu an toàn 100% trên hệ thống Cloud bảo mật",
                    "Đội ngũ kỹ thuật hỗ trợ hướng dẫn sử dụng 24/7 trực tiếp",
                  ].map((text, i) => (
                    <div
                      key={i}
                      style={{ display: "flex", alignItems: "center", gap: 12 }}
                    >
                      <div
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: "50%",
                          background: BRAND.softBg,
                          color: BRAND.primary,
                          display: "grid",
                          placeItems: "center",
                          fontSize: 13,
                          flexShrink: 0,
                        }}
                      >
                        <CheckOutlined />
                      </div>
                      <Text
                        style={{
                          color: BRAND.textMain,
                          fontSize: 15,
                          fontWeight: 700,
                        }}
                      >
                        {text}
                      </Text>
                    </div>
                  ))}
                </Space>

                <div style={{ marginTop: 36, textAlign: "center" }}>
                  <motion.div {...pulseGlow}>
                    <Button
                      type="primary"
                      size="large"
                      block
                      onClick={handleLogin}
                      style={{
                        height: 58,
                        fontSize: 17,
                        fontWeight: 900,
                        border: 0,
                        background: `linear-gradient(135deg, ${BRAND.primary}, ${BRAND.primaryDark})`,
                        borderRadius: 29,
                      }}
                    >
                      KÍCH HOẠT TÀI KHOẢN NGAY CHỈ 299K
                    </Button>
                  </motion.div>

                  <Text
                    style={{
                      display: "block",
                      marginTop: 14,
                      fontSize: 12,
                      color: BRAND.textMuted,
                    }}
                  >
                    <GiftFilled
                      style={{ color: BRAND.primary, marginRight: 6 }}
                    />{" "}
                    Tặng kèm trọn bộ tài liệu Giáo Án Số chuẩn Xứ Đoàn
                  </Text>
                </div>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* =================================================
            FAQ SECTION (ACCORDION WITH MOTION)
        ================================================= */}
        <section
          id="faq"
          style={{
            padding: isMobile ? "60px 0" : "100px 0",
            background: "#FFF",
          }}
        >
          <div
            style={{
              maxWidth: 850,
              margin: "auto",
              paddingInline: isMobile ? 16 : 24,
            }}
          >
            <div style={{ textAlign: "center", marginBottom: 50 }}>
              <Tag
                style={{
                  background: BRAND.softBg,
                  color: BRAND.primaryDark,
                  border: 0,
                  fontWeight: 900,
                  padding: "6px 18px",
                  borderRadius: 20,
                }}
              >
                HỎI ĐÁP NHANH
              </Tag>
              <Title
                level={2}
                style={{
                  fontSize: isMobile ? 28 : 40,
                  fontWeight: 900,
                  marginTop: 10,
                }}
              >
                Các thắc mắc thường gặp
              </Title>
            </div>

            <Collapse
              accordion
              bordered={false}
              style={{ background: "transparent" }}
              expandIcon={({ isActive }) => (
                <UpOutlined
                  rotate={isActive ? 180 : 0}
                  style={{ color: BRAND.primary, fontWeight: 900 }}
                />
              )}
              items={[
                {
                  key: "1",
                  label: (
                    <strong style={{ fontSize: 16 }}>
                      Có đúng là chỉ thanh toán 299.000đ và dùng vĩnh viễn?
                    </strong>
                  ),
                  children: (
                    <p
                      style={{
                        color: BRAND.textMuted,
                        fontSize: 15,
                        lineHeight: 1.7,
                      }}
                    >
                      Chính xác! Đây là chương trình ưu đãi đồng hành cùng các
                      Xứ Đoàn. Bạn mua một lần duy nhất và sở hữu trọn đời tài
                      khoản mà không cần trả thêm bất kỳ khoản phí duy trì nào
                      hàng tháng hay hàng năm.
                    </p>
                  ),
                },
                {
                  key: "2",
                  label: (
                    <strong style={{ fontSize: 16 }}>
                      Giáo lý viên không giỏi công nghệ có dùng được không?
                    </strong>
                  ),
                  children: (
                    <p
                      style={{
                        color: BRAND.textMuted,
                        fontSize: 15,
                        lineHeight: 1.7,
                      }}
                    >
                      FaithEdu được thiết kế cực kỳ trực quan. Chỉ mất 5 phút
                      xem video hướng dẫn là bất kỳ Giáo lý viên nào cũng có thể
                      quét mã điểm danh và tạo trò chơi câu hỏi một cách dễ
                      dàng.
                    </p>
                  ),
                },
                {
                  key: "3",
                  label: (
                    <strong style={{ fontSize: 16 }}>
                      Dữ liệu điểm danh & học sinh có được an toàn không?
                    </strong>
                  ),
                  children: (
                    <p
                      style={{
                        color: BRAND.textMuted,
                        fontSize: 15,
                        lineHeight: 1.7,
                      }}
                    >
                      Hệ thống tự động lưu trữ và bảo mật trên nền tảng Cloud
                      tiêu chuẩn. Chỉ những tài khoản được Ban Hành Giáo / Xứ
                      Đoàn phân quyền mới có thể xem và chỉnh sửa dữ liệu.
                    </p>
                  ),
                },
              ]}
            />
          </div>
        </section>

        {/* =================================================
            FOOTER (NEO-DARK FOOTER)
        ================================================= */}
        <footer
          style={{
            background: BRAND.darkBg,
            color: "#FFF",
            padding: "70px 0 35px",
          }}
        >
          <div
            style={{
              maxWidth: 1200,
              margin: "auto",
              paddingInline: isMobile ? 16 : 24,
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr 1fr",
                gap: 40,
                marginBottom: 50,
              }}
            >
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    marginBottom: 18,
                  }}
                >
                  <img
                    src={logoWeb}
                    alt="FaithEdu"
                    style={{ width: 40, height: 40 }}
                  />
                  <span
                    style={{
                      fontSize: 24,
                      fontWeight: 900,
                      color: BRAND.primary,
                    }}
                  >
                    FaithEdu
                  </span>
                </div>
                <Paragraph
                  style={{
                    color: "#B0A0A6",
                    fontSize: 14,
                    maxWidth: 380,
                    lineHeight: 1.8,
                  }}
                >
                  Nền tảng số hóa quản lý Giáo Lý hàng đầu Việt Nam. Đổi mới
                  phương pháp truyền giảng, kết nối Đức Tin sống động cho thế hệ
                  trẻ.
                </Paragraph>
              </div>

              <div>
                <h4
                  style={{
                    color: "#FFF",
                    marginBottom: 18,
                    fontWeight: 900,
                    fontSize: 16,
                  }}
                >
                  Liên Kết Nhanh
                </h4>
                <Space direction="vertical" size={10}>
                  {navItems.map((item) => (
                    // eslint-disable-next-line jsx-a11y/anchor-is-valid
                    <a
                      key={item.id}
                      onClick={() => scrollToSection(item.id)}
                      style={{
                        color: "#B0A0A6",
                        fontSize: 14,
                        fontWeight: 600,
                      }}
                    >
                      {item.label}
                    </a>
                  ))}
                </Space>
              </div>

              <div>
                <h4
                  style={{
                    color: "#FFF",
                    marginBottom: 18,
                    fontWeight: 900,
                    fontSize: 16,
                  }}
                >
                  Thông Tin Hỗ Trợ
                </h4>
                <Space
                  direction="vertical"
                  size={12}
                  style={{ color: "#B0A0A6", fontSize: 14 }}
                >
                  <div>
                    <PhoneFilled
                      style={{ color: BRAND.primary, marginRight: 8 }}
                    />{" "}
                    Hotline: 033.604.1807
                  </div>
                  <div>
                    <MailFilled
                      style={{ color: BRAND.primary, marginRight: 8 }}
                    />{" "}
                    Email: tranhung6829@gmail.com
                  </div>
                  <div>
                    <FacebookFilled
                      style={{ color: BRAND.primary, marginRight: 8 }}
                    />{" "}
                    Fanpage: FaithEdu Việt Nam
                  </div>
                </Space>
              </div>
            </div>

            <Divider style={{ borderColor: "rgba(255,255,255,0.1)" }} />
            <div
              style={{
                textAlign: "center",
                color: "#B0A0A6",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              © {new Date().getFullYear()} FaithEdu. All rights reserved.
              Designed with <HeartFilled style={{ color: BRAND.primary }} /> for
              Faith Education.
            </div>
          </div>
        </footer>

        {/* MODAL VIDEO */}
        <Modal
          open={videoOpen}
          onCancel={() => setVideoOpen(false)}
          footer={null}
          centered
          width={800}
          destroyOnClose
        >
          <div
            style={{
              paddingTop: "56.25%",
              position: "relative",
              marginTop: 20,
            }}
          >
            <iframe
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                border: 0,
                borderRadius: 16,
              }}
              src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
              title="Demo Video"
              allowFullScreen
            />
          </div>
        </Modal>
      </div>
    </ConfigProvider>
  );
};

export default LandingPage;
