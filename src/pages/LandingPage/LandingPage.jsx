import React, { useEffect, useState } from "react";
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
  SafetyCertificateFilled,
  TeamOutlined,
  CloseOutlined,
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
   FAITHEDU BRAND COLORS
========================================================= */

const BRAND = {
  navy: "#173B5E",
  navyHover: "#244F78",
  navyDark: "#102A43",

  gold: "#D9A441",
  goldDark: "#B8872D",
  goldLight: "#FBF5E7",

  background: "#F7F9FC",
  white: "#FFFFFF",

  textMain: "#173B5E",
  textDark: "#102A43",
  textMuted: "#64748B",
  muted: "#94A3B8",

  border: "#E2E8F0",
  navyLight: "#EEF3F7",

  success: "#2E7D5B",
  successBg: "#EAF6F0",

  warning: "#B7791F",
  warningBg: "#FFF7E5",

  danger: "#C0392B",
  dangerBg: "#FDEDEC",

  darkBg: "#102A43",

  shadow: "rgba(23, 59, 94, 0.10)",
  navyGlow: "rgba(23, 59, 94, 0.18)",
  goldGlow: "rgba(217, 164, 65, 0.25)",
};

/* =========================================================
   SCROLL TO SECTION
========================================================= */

const scrollToSection = (id) => {
  const element = document.getElementById(id);

  if (!element) return;

  const headerOffset = 90;

  const elementPosition =
    element.getBoundingClientRect().top + window.pageYOffset;

  window.scrollTo({
    top: elementPosition - headerOffset,
    behavior: "smooth",
  });
};

/* =========================================================
   ANIMATION VARIANTS
========================================================= */

const fadeUpVariants = {
  hidden: {
    opacity: 0,
    y: 35,
  },

  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.65,
      delay: i * 0.1,
      ease: [0.215, 0.61, 0.355, 1],
    },
  }),
};

const pulseGlow = {
  animate: {
    scale: [1, 1.015, 1],

    boxShadow: [
      "0 10px 28px rgba(23, 59, 94, 0.18)",
      "0 16px 38px rgba(23, 59, 94, 0.28)",
      "0 10px 28px rgba(23, 59, 94, 0.18)",
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
    y: [0, -10, 0],
    rotate: [0, 1.5, 0],

    transition: {
      duration,
      delay,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
});

/* =========================================================
   COUNTDOWN TIMER
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
        if (prev.seconds > 0) {
          return {
            ...prev,
            seconds: prev.seconds - 1,
          };
        }

        if (prev.minutes > 0) {
          return {
            ...prev,
            minutes: prev.minutes - 1,
            seconds: 59,
          };
        }

        if (prev.hours > 0) {
          return {
            hours: prev.hours - 1,
            minutes: 59,
            seconds: 59,
          };
        }

        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const format = (number) => String(number).padStart(2, "0");

  const items = [
    {
      val: format(timeLeft.hours),
      label: "Giờ",
    },
    {
      val: format(timeLeft.minutes),
      label: "Phút",
    },
    {
      val: format(timeLeft.seconds),
      label: "Giây",
    },
  ];

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
      }}
    >
      {items.map((item, index) => (
        <React.Fragment key={item.label}>
          <motion.div
            key={item.val}
            initial={{
              scale: 0.85,
              opacity: 0.5,
            }}
            animate={{
              scale: 1,
              opacity: 1,
            }}
            transition={{
              duration: 0.2,
            }}
            style={{
              background: "#0D2135",
              color: BRAND.gold,
              padding: "4px 9px",
              borderRadius: 7,
              fontWeight: 800,
              fontSize: 12,
              border: `1px solid rgba(217,164,65,0.3)`,
              fontFamily: "monospace",
            }}
          >
            {item.val}
          </motion.div>

          {index < 2 && (
            <span
              style={{
                color: BRAND.gold,
                fontWeight: 800,
              }}
            >
              :
            </span>
          )}
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

  const { scrollYProgress } = useScroll();

  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
  });

  /* =======================================================
     LOGIN
  ======================================================= */

  const handleLogin = () => {
    window.location.href = "https://giaolyso.site";
  };

  /* =======================================================
     NAVIGATION
  ======================================================= */

  const navItems = [
    {
      label: "Trang chủ",
      id: "hero",
    },
    {
      label: "Tính năng",
      id: "features",
    },
    {
      label: "Gói 299k",
      id: "pricing",
    },
    {
      label: "Đánh giá",
      id: "reviews",
    },
    {
      label: "Hỏi đáp",
      id: "faq",
    },
  ];

  /* =======================================================
     FEATURES
  ======================================================= */

  const featureTabs = [
    {
      key: "qr",

      icon: <QrcodeOutlined />,

      title: "Điểm Danh QR Tốc Độ Cao",

      desc: "Chỉ với 0.5 giây quét mã, hệ thống tự động lưu trữ chuyên cần, cập nhật sổ điểm danh trực tuyến và gửi báo cáo về cho Giáo lý viên.",

      img: qrScanner,

      tag: "CÔNG NGHỆ BỨT PHÁ",
    },

    {
      key: "game",

      icon: <PlaySquareFilled />,

      title: "Minigame & Quiz Tương Tác",

      desc: "Biến giờ học Kinh Bổn khô khan thành các trận thi đấu trắc nghiệm hấp dẫn. Tăng hứng thú của Thiếu Nhi khi đến lớp Giáo lý.",

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
          colorPrimary: BRAND.navy,
          borderRadius: 10,
          fontFamily: '"Be Vietnam Pro", "Inter", sans-serif',
        },

        components: {
          Button: {
            controlHeight: 42,
            fontWeight: 700,
          },

          Card: {
            borderRadiusLG: 18,
          },

          Collapse: {
            headerBg: BRAND.white,
            contentBg: BRAND.white,
          },
        },
      }}
    >
      {/* =====================================================
          SCROLL PROGRESS
      ===================================================== */}

      <motion.div
        style={{
          scaleX,

          position: "fixed",
          top: 0,
          left: 0,
          right: 0,

          height: 3,

          background: `
            linear-gradient(
              90deg,
              ${BRAND.navy},
              ${BRAND.gold}
            )
          `,

          transformOrigin: "0%",

          zIndex: 9999,
        }}
      />

      {/* =====================================================
          GLOBAL CONTAINER
      ===================================================== */}

      <div
        style={{
          minHeight: "100vh",
          background: BRAND.background,
          color: BRAND.textMain,
          overflowX: "hidden",
        }}
      >
        {/* ===================================================
            TOP PROMOTION BAR
        =================================================== */}

        <div
          style={{
            background: BRAND.darkBg,
            color: BRAND.white,

            padding: "9px 16px",

            textAlign: "center",

            fontSize: 12,

            fontWeight: 700,

            display: "flex",

            justifyContent: "center",

            alignItems: "center",

            gap: 14,

            flexWrap: "wrap",

            borderBottom: "1px solid rgba(217,164,65,0.2)",
          }}
        >
          <motion.span
            animate={{
              scale: [1, 1.04, 1],
            }}
            transition={{
              duration: 1.7,
              repeat: Infinity,
            }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              color: BRAND.gold,
            }}
          >
            <FireFilled
              style={{
                color: BRAND.gold,
              }}
            />
            SIÊU ƯU ĐÃI KÍCH HOẠT VĨNH VIỄN 299K
          </motion.span>

          <CountdownTimer />

          <motion.div
            whileHover={{
              scale: 1.04,
            }}
            whileTap={{
              scale: 0.96,
            }}
          >
            <Button
              size="small"
              onClick={() => scrollToSection("pricing")}
              style={{
                background: BRAND.gold,
                color: BRAND.navyDark,
                border: 0,

                fontWeight: 800,

                borderRadius: 7,

                fontSize: 11,

                paddingInline: 15,

                boxShadow: "0 4px 14px rgba(217,164,65,0.22)",
              }}
            >
              XEM ƯU ĐÃI
            </Button>
          </motion.div>
        </div>

        {/* ===================================================
            HEADER
        =================================================== */}

        <header
          style={{
            position: "sticky",
            top: 0,
            zIndex: 1000,

            background: "rgba(255,255,255,0.96)",

            backdropFilter: "blur(14px)",

            WebkitBackdropFilter: "blur(14px)",

            borderBottom: `1px solid ${BRAND.border}`,

            padding: "10px 0",
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
              whileHover={{
                scale: 1.02,
              }}
              whileTap={{
                scale: 0.98,
              }}
              onClick={() => scrollToSection("hero")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  width: 42,
                  height: 42,

                  borderRadius: 10,

                  background: BRAND.navyLight,

                  display: "grid",

                  placeItems: "center",

                  border: `1px solid ${BRAND.border}`,
                }}
              >
                <img
                  src={logoWeb}
                  alt="FaithEdu"
                  style={{
                    width: 31,
                    height: 31,
                    objectFit: "contain",
                  }}
                />
              </div>

              <div>
                <div
                  style={{
                    fontSize: 21,

                    fontWeight: 900,

                    color: BRAND.navy,

                    lineHeight: 1.1,
                  }}
                >
                  FaithEdu
                </div>

                <div
                  style={{
                    fontSize: 8,

                    fontWeight: 800,

                    color: BRAND.textMuted,

                    letterSpacing: 0.7,
                  }}
                >
                  SỐ HÓA GIÁO LÝ
                </div>
              </div>
            </motion.div>

            {/* DESKTOP NAV */}

            {!isMobile && (
              <Space size={28}>
                {navItems.map((item) => (
                  <motion.a
                    key={item.id}
                    whileHover={{
                      y: -1,
                    }}
                    onClick={() => scrollToSection(item.id)}
                    style={{
                      color: BRAND.textMuted,

                      fontWeight: 700,

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

            {/* HEADER CTA */}

            <Space size={8}>
              <motion.div
                whileHover={{
                  scale: 1.03,
                }}
                whileTap={{
                  scale: 0.97,
                }}
              >
                <Button
                  type="primary"
                  onClick={handleLogin}
                  style={{
                    background: BRAND.navy,

                    border: `1px solid ${BRAND.navy}`,

                    color: BRAND.white,

                    fontWeight: 700,

                    boxShadow: "0 6px 18px rgba(23,59,94,0.18)",

                    height: 42,

                    paddingInline: 22,

                    borderRadius: 9,
                  }}
                >
                  Đăng Nhập
                </Button>
              </motion.div>

              {isMobile && (
                <Button
                  type="text"
                  icon={
                    <MenuOutlined
                      style={{
                        fontSize: 21,
                        color: BRAND.navy,
                      }}
                    />
                  }
                  onClick={() => setDrawerOpen(true)}
                />
              )}
            </Space>
          </div>
        </header>

        {/* ===================================================
            MOBILE DRAWER
        =================================================== */}

        <Drawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          width={290}
          placement="right"
          closeIcon={
            <CloseOutlined
              style={{
                color: BRAND.navy,
              }}
            />
          }
          styles={{
            header: {
              borderBottom: `1px solid ${BRAND.border}`,
            },
          }}
        >
          <div
            style={{
              padding: "4px 4px 20px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 24,
              }}
            >
              <img
                src={logoWeb}
                alt="FaithEdu"
                style={{
                  width: 38,
                  height: 38,
                }}
              />

              <div>
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 900,
                    color: BRAND.navy,
                  }}
                >
                  FaithEdu
                </div>

                <div
                  style={{
                    fontSize: 10,
                    color: BRAND.textMuted,
                  }}
                >
                  SỐ HÓA GIÁO LÝ
                </div>
              </div>
            </div>

            <Space
              direction="vertical"
              size={8}
              style={{
                width: "100%",
              }}
            >
              {navItems.map((item) => (
                <Button
                  key={item.id}
                  type="text"
                  block
                  style={{
                    textAlign: "left",

                    fontWeight: 700,

                    height: 46,

                    fontSize: 15,

                    color: BRAND.textMain,

                    borderRadius: 8,
                  }}
                  onClick={() => {
                    setDrawerOpen(false);

                    scrollToSection(item.id);
                  }}
                >
                  {item.label}
                </Button>
              ))}

              <Divider />

              <Button
                type="primary"
                block
                onClick={handleLogin}
                style={{
                  height: 46,
                  background: BRAND.navy,
                  borderColor: BRAND.navy,
                  fontWeight: 700,
                }}
              >
                Đăng Nhập
              </Button>
            </Space>
          </div>
        </Drawer>

        {/* ===================================================
            HERO
        =================================================== */}

        <section
          id="hero"
          style={{
            position: "relative",

            padding: isMobile ? "55px 0 75px" : "90px 0 115px",

            background: `
              radial-gradient(
                circle at 82% 18%,
                rgba(217,164,65,0.10),
                transparent 27%
              ),
              ${BRAND.background}
            `,

            overflow: "hidden",
          }}
        >
          {/* DECORATIVE CIRCLE */}

          <motion.div
            {...floatAnimation(7)}
            style={{
              position: "absolute",

              top: "-10%",

              right: "4%",

              width: 340,

              height: 340,

              borderRadius: "50%",

              background: "rgba(23,59,94,0.07)",

              filter: "blur(55px)",

              pointerEvents: "none",
            }}
          />

          <div
            style={{
              maxWidth: 1200,

              margin: "auto",

              paddingInline: isMobile ? 16 : 24,

              display: "grid",

              gridTemplateColumns: isMobile ? "1fr" : "1.05fr 0.95fr",

              gap: isMobile ? 55 : 50,

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
                whileHover={{
                  scale: 1.02,
                }}
                style={{
                  display: "inline-block",
                }}
              >
                <Tag
                  style={{
                    background: BRAND.navyLight,

                    color: BRAND.navy,

                    border: `1px solid ${BRAND.border}`,

                    padding: "7px 15px",

                    borderRadius: 7,

                    fontWeight: 800,

                    fontSize: 11,

                    marginBottom: 18,
                  }}
                >
                  <CrownFilled
                    style={{
                      color: BRAND.gold,

                      marginRight: 7,
                    }}
                  />
                  NỀN TẢNG QUẢN LÝ GIÁO LÝ THẾ HỆ MỚI
                </Tag>
              </motion.div>

              <Title
                level={1}
                style={{
                  fontSize: isMobile ? 36 : 56,

                  fontWeight: 900,

                  lineHeight: 1.1,

                  letterSpacing: -1.5,

                  margin: "8px 0 22px",

                  color: BRAND.textMain,
                }}
              >
                Dạy Giáo Lý Hiện Đại.
                <br />
                <span
                  style={{
                    color: BRAND.goldDark,
                  }}
                >
                  Sở Hữu Vĩnh Viễn 299K.
                </span>
              </Title>

              <Paragraph
                style={{
                  fontSize: 16,

                  color: BRAND.textMuted,

                  lineHeight: 1.8,

                  maxWidth: 550,

                  marginBottom: 0,
                }}
              >
                Số hóa toàn diện công tác quản lý Xứ Đoàn: Điểm danh QR siêu
                tốc, Trò chơi tương tác Kinh Bổn, Sổ liên lạc điện tử và Báo cáo
                tự động chỉ trên một nền tảng duy nhất.
              </Paragraph>

              {/* HERO ACTIONS */}

              <Space
                wrap
                size={14}
                style={{
                  marginTop: 26,
                }}
              >
                <motion.div {...pulseGlow}>
                  <Button
                    type="primary"
                    size="large"
                    onClick={() => scrollToSection("pricing")}
                    icon={<RocketFilled />}
                    style={{
                      height: 54,

                      paddingInline: 30,

                      borderRadius: 9,

                      fontWeight: 800,

                      fontSize: 15,

                      background: BRAND.navy,

                      border: `1px solid ${BRAND.navy}`,
                    }}
                  >
                    MUA NGAY · 299K
                  </Button>
                </motion.div>

                <motion.div
                  whileHover={{
                    scale: 1.03,
                  }}
                  whileTap={{
                    scale: 0.97,
                  }}
                >
                  <Button
                    size="large"
                    onClick={() => setVideoOpen(true)}
                    icon={
                      <PlayCircleFilled
                        style={{
                          color: BRAND.navy,
                          fontSize: 20,
                        }}
                      />
                    }
                    style={{
                      height: 54,

                      paddingInline: 25,

                      borderRadius: 9,

                      fontWeight: 700,

                      border: `1px solid ${BRAND.border}`,

                      background: BRAND.white,

                      color: BRAND.navy,
                    }}
                  >
                    Xem Demo
                  </Button>
                </motion.div>
              </Space>

              {/* SOCIAL PROOF */}

              <div
                style={{
                  marginTop: 34,

                  display: "flex",

                  alignItems: "center",

                  gap: 14,
                }}
              >
                <Avatar.Group
                  max={{
                    count: 4,
                  }}
                >
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

                      color: BRAND.gold,

                      fontSize: 12,
                    }}
                  >
                    {[...Array(5)].map((_, i) => (
                      <StarFilled key={i} />
                    ))}
                  </div>

                  <Text
                    style={{
                      fontSize: 12,

                      fontWeight: 600,

                      color: BRAND.textMuted,
                    }}
                  >
                    Được tin dùng bởi{" "}
                    <strong
                      style={{
                        color: BRAND.navy,
                      }}
                    >
                      50+ Giáo Xứ & 1,200+ GLV
                    </strong>
                  </Text>
                </div>
              </div>
            </motion.div>

            {/* HERO RIGHT */}

            <motion.div
              initial={{
                opacity: 0,
                scale: 0.94,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              transition={{
                duration: 0.75,
              }}
              style={{
                position: "relative",
              }}
            >
              <motion.div
                whileHover={{
                  y: -5,
                }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                }}
                style={{
                  padding: 10,

                  borderRadius: 18,

                  background: BRAND.white,

                  boxShadow: "0 24px 60px rgba(23,59,94,0.14)",

                  border: `1px solid ${BRAND.border}`,
                }}
              >
                <img
                  src={dashboard}
                  alt="FaithEdu Dashboard"
                  style={{
                    width: "100%",

                    borderRadius: 12,

                    display: "block",
                  }}
                />
              </motion.div>

              {/* BADGE 1 */}

              <motion.div
                {...floatAnimation(4)}
                style={{
                  position: "absolute",

                  top: -18,

                  left: isMobile ? -5 : -25,

                  background: BRAND.white,

                  padding: "11px 16px",

                  borderRadius: 10,

                  boxShadow: "0 12px 30px rgba(23,59,94,0.12)",

                  border: `1px solid ${BRAND.border}`,

                  display: "flex",

                  alignItems: "center",

                  gap: 10,
                }}
              >
                <div
                  style={{
                    width: 36,

                    height: 36,

                    borderRadius: 9,

                    background: BRAND.goldLight,

                    display: "grid",

                    placeItems: "center",

                    color: BRAND.goldDark,

                    fontSize: 17,
                  }}
                >
                  <ThunderboltFilled />
                </div>

                <div>
                  <div
                    style={{
                      fontSize: 11,

                      fontWeight: 800,

                      color: BRAND.textMain,
                    }}
                  >
                    Điểm Danh 0.5s
                  </div>

                  <div
                    style={{
                      fontSize: 9,

                      color: BRAND.success,

                      fontWeight: 700,
                    }}
                  >
                    Tự động 100%
                  </div>
                </div>
              </motion.div>

              {/* BADGE 2 */}

              <motion.div
                {...floatAnimation(5, 1)}
                style={{
                  position: "absolute",

                  bottom: -18,

                  right: isMobile ? -5 : -18,

                  background: BRAND.navy,

                  color: BRAND.white,

                  padding: "11px 16px",

                  borderRadius: 10,

                  boxShadow: "0 12px 30px rgba(23,59,94,0.24)",

                  display: "flex",

                  alignItems: "center",

                  gap: 10,
                }}
              >
                <div
                  style={{
                    width: 36,

                    height: 36,

                    borderRadius: 9,

                    background: "rgba(217,164,65,0.15)",

                    display: "grid",

                    placeItems: "center",

                    color: BRAND.gold,

                    fontSize: 17,
                  }}
                >
                  <CrownFilled />
                </div>

                <div>
                  <div
                    style={{
                      fontSize: 11,

                      fontWeight: 800,

                      color: BRAND.gold,
                    }}
                  >
                    Gói Vĩnh Viễn
                  </div>

                  <div
                    style={{
                      fontSize: 9,

                      color: BRAND.white,

                      fontWeight: 600,
                    }}
                  >
                    Chỉ 299k trọn đời
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ===================================================
            FEATURES
        =================================================== */}

        <section
          id="features"
          style={{
            padding: isMobile ? "65px 0" : "105px 0",

            background: BRAND.white,
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
              viewport={{
                once: true,
              }}
              custom={0}
              variants={fadeUpVariants}
              style={{
                textAlign: "center",

                maxWidth: 750,

                margin: "0 auto 45px",
              }}
            >
              <Tag
                style={{
                  background: BRAND.navyLight,

                  color: BRAND.navy,

                  border: `1px solid ${BRAND.border}`,

                  fontWeight: 800,

                  padding: "7px 17px",

                  borderRadius: 7,
                }}
              >
                <StarFilled
                  style={{
                    color: BRAND.gold,

                    marginRight: 6,
                  }}
                />
                BỘ CÔNG CỤ ĐỘC BẢN
              </Tag>

              <Title
                level={2}
                style={{
                  fontSize: isMobile ? 29 : 42,

                  fontWeight: 900,

                  marginTop: 14,

                  color: BRAND.navy,
                }}
              >
                Trải nghiệm giảng dạy{" "}
                <span
                  style={{
                    color: BRAND.goldDark,
                  }}
                >
                  hoàn toàn mới
                </span>
              </Title>

              <Paragraph
                style={{
                  color: BRAND.textMuted,

                  fontSize: 15,

                  marginBottom: 0,
                }}
              >
                Loại bỏ hoàn toàn sổ sách thủ công. Tận hưởng sự tiện lợi và
                sinh động trong công tác Giáo lý.
              </Paragraph>
            </motion.div>

            {/* FEATURE TABS */}

            <div
              style={{
                display: "flex",

                justifyContent: "center",

                gap: 10,

                flexWrap: "wrap",

                marginBottom: 35,
              }}
            >
              {featureTabs.map((tab) => {
                const isActive = activeTab === tab.key;

                return (
                  <motion.div
                    key={tab.key}
                    whileHover={{
                      y: -2,
                    }}
                    whileTap={{
                      scale: 0.98,
                    }}
                  >
                    <Button
                      size="large"
                      onClick={() => setActiveTab(tab.key)}
                      icon={tab.icon}
                      style={{
                        height: 48,

                        borderRadius: 9,

                        fontWeight: 700,

                        fontSize: 13,

                        border: isActive
                          ? `1px solid ${BRAND.navy}`
                          : `1px solid ${BRAND.border}`,

                        background: isActive ? BRAND.navy : BRAND.white,

                        color: isActive ? BRAND.white : BRAND.textMain,

                        boxShadow: isActive
                          ? "0 7px 18px rgba(23,59,94,0.16)"
                          : "none",
                      }}
                    >
                      {tab.title}
                    </Button>
                  </motion.div>
                );
              })}
            </div>

            {/* FEATURE CONTENT */}

            <AnimatePresence mode="wait">
              {featureTabs.map(
                (tab) =>
                  tab.key === activeTab && (
                    <motion.div
                      key={tab.key}
                      initial={{
                        opacity: 0,
                        y: 20,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      exit={{
                        opacity: 0,
                        y: -20,
                      }}
                      transition={{
                        duration: 0.35,
                      }}
                      style={{
                        background: BRAND.background,

                        borderRadius: 18,

                        padding: isMobile ? 22 : 45,

                        border: `1px solid ${BRAND.border}`,

                        display: "grid",

                        gridTemplateColumns: isMobile ? "1fr" : "1fr 1.15fr",

                        gap: 38,

                        alignItems: "center",
                      }}
                    >
                      <div>
                        <Tag
                          style={{
                            background: BRAND.goldLight,

                            color: BRAND.goldDark,

                            border: "1px solid rgba(217,164,65,0.28)",

                            fontWeight: 800,

                            borderRadius: 6,

                            padding: "4px 10px",

                            marginBottom: 10,
                          }}
                        >
                          {tab.tag}
                        </Tag>

                        <Title
                          level={3}
                          style={{
                            fontWeight: 900,

                            fontSize: isMobile ? 23 : 31,

                            color: BRAND.navy,

                            margin: "6px 0 0",
                          }}
                        >
                          {tab.title}
                        </Title>

                        <Paragraph
                          style={{
                            fontSize: 15,

                            color: BRAND.textMuted,

                            lineHeight: 1.8,

                            margin: "15px 0 22px",
                          }}
                        >
                          {tab.desc}
                        </Paragraph>

                        <motion.div
                          whileHover={{
                            x: 4,
                          }}
                        >
                          <Button
                            type="primary"
                            onClick={() => scrollToSection("pricing")}
                            style={{
                              background: BRAND.navy,

                              borderColor: BRAND.navy,

                              borderRadius: 8,

                              fontWeight: 700,

                              height: 44,

                              paddingInline: 20,
                            }}
                          >
                            Kích hoạt ngay
                            <ArrowRightOutlined
                              style={{
                                marginLeft: 7,
                              }}
                            />
                          </Button>
                        </motion.div>
                      </div>

                      <div
                        style={{
                          textAlign: "center",
                        }}
                      >
                        <motion.img
                          whileHover={{
                            scale: 1.015,
                          }}
                          transition={{
                            type: "spring",
                            stiffness: 200,
                          }}
                          src={tab.img}
                          alt={tab.title}
                          style={{
                            maxWidth: "100%",

                            maxHeight: 400,

                            borderRadius: 12,

                            boxShadow: "0 18px 45px rgba(23,59,94,0.12)",

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

        {/* ===================================================
            PRICING
        =================================================== */}

        <section
          id="pricing"
          style={{
            padding: isMobile ? "70px 0" : "110px 0",

            background: BRAND.background,

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
              viewport={{
                once: true,
              }}
              custom={0}
              variants={fadeUpVariants}
              style={{
                textAlign: "center",

                maxWidth: 750,

                margin: "0 auto 45px",
              }}
            >
              <Tag
                style={{
                  background: BRAND.navy,

                  color: BRAND.gold,

                  border: 0,

                  fontWeight: 800,

                  padding: "7px 17px",

                  borderRadius: 7,
                }}
              >
                GÓI KÍCH HOẠT ƯU ĐÃI
              </Tag>

              <Title
                level={2}
                style={{
                  fontSize: isMobile ? 31 : 44,

                  fontWeight: 900,

                  marginTop: 13,

                  color: BRAND.navy,
                }}
              >
                Đầu tư 1 lần ·{" "}
                <span
                  style={{
                    color: BRAND.goldDark,
                  }}
                >
                  Sử dụng Vĩnh Viễn
                </span>
              </Title>

              <Paragraph
                style={{
                  color: BRAND.textMuted,

                  fontSize: 15,
                }}
              >
                Không tốn phí gia hạn hàng năm. Đầy đủ quyền lợi nâng cấp tính
                năng mới trọn đời.
              </Paragraph>
            </motion.div>

            {/* PRICING CARD */}

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{
                once: true,
              }}
              custom={1}
              variants={fadeUpVariants}
              style={{
                maxWidth: 650,

                margin: "auto",
              }}
            >
              <Card
                bordered={false}
                style={{
                  borderRadius: 18,

                  background: BRAND.white,

                  boxShadow: "0 25px 65px rgba(23,59,94,0.12)",

                  border: `2px solid ${BRAND.gold}`,

                  position: "relative",

                  overflow: "hidden",

                  padding: isMobile ? 8 : 18,
                }}
              >
                {/* BEST SELLER */}

                <div
                  style={{
                    position: "absolute",

                    top: 24,

                    right: -43,

                    background: BRAND.gold,

                    color: BRAND.navyDark,

                    padding: "7px 45px",

                    transform: "rotate(45deg)",

                    fontWeight: 900,

                    fontSize: 10,

                    letterSpacing: 0.7,
                  }}
                >
                  BEST SELLER
                </div>

                <div
                  style={{
                    textAlign: "center",

                    paddingTop: 8,
                  }}
                >
                  <Tag
                    icon={
                      <CrownFilled
                        style={{
                          color: BRAND.gold,
                        }}
                      />
                    }
                    style={{
                      padding: "5px 16px",

                      borderRadius: 7,

                      background: BRAND.navyLight,

                      color: BRAND.navy,

                      fontWeight: 800,

                      fontSize: 12,

                      border: `1px solid ${BRAND.border}`,
                    }}
                  >
                    GÓI KÍCH HOẠT VĨNH VIỄN
                  </Tag>

                  <div
                    style={{
                      marginTop: 22,
                    }}
                  >
                    <Text
                      delete
                      style={{
                        color: BRAND.muted,

                        fontSize: 18,

                        fontWeight: 700,
                      }}
                    >
                      999.000 VNĐ
                    </Text>

                    <div
                      style={{
                        display: "flex",

                        alignItems: "baseline",

                        justifyContent: "center",

                        gap: 5,

                        marginTop: 3,
                      }}
                    >
                      <span
                        style={{
                          fontSize: isMobile ? 46 : 60,

                          fontWeight: 900,

                          color: BRAND.navy,

                          lineHeight: 1,
                        }}
                      >
                        299.000
                      </span>

                      <span
                        style={{
                          fontSize: 20,

                          fontWeight: 800,

                          color: BRAND.textMain,
                        }}
                      >
                        VNĐ
                      </span>
                    </div>

                    <Text
                      style={{
                        color: BRAND.goldDark,

                        fontWeight: 700,

                        fontSize: 13,

                        display: "block",

                        marginTop: 5,
                      }}
                    >
                      Thanh toán 1 lần duy nhất · Dùng trọn đời
                    </Text>
                  </div>
                </div>

                <Divider
                  style={{
                    margin: "25px 0",

                    borderColor: BRAND.border,
                  }}
                />

                {/* BENEFITS */}

                <Space
                  direction="vertical"
                  size={13}
                  style={{
                    width: "100%",

                    paddingInline: isMobile ? 0 : 18,
                  }}
                >
                  {[
                    "Sử dụng vĩnh viễn không giới hạn số lượng Thiếu Nhi & Lớp học",

                    "Đầy đủ tính năng: Quét mã QR điểm danh, Game Quiz Kinh Bổn",

                    "Cập nhật miễn phí các tính năng nâng cấp trong tương lai",

                    "Lưu trữ dữ liệu an toàn trên hệ thống Cloud bảo mật",

                    "Đội ngũ kỹ thuật hỗ trợ hướng dẫn sử dụng",
                  ].map((text, index) => (
                    <div
                      key={index}
                      style={{
                        display: "flex",

                        alignItems: "center",

                        gap: 11,
                      }}
                    >
                      <div
                        style={{
                          width: 23,

                          height: 23,

                          borderRadius: "50%",

                          background: BRAND.navyLight,

                          color: BRAND.navy,

                          display: "grid",

                          placeItems: "center",

                          fontSize: 11,

                          flexShrink: 0,
                        }}
                      >
                        <CheckOutlined />
                      </div>

                      <Text
                        style={{
                          color: BRAND.textMain,

                          fontSize: 14,

                          fontWeight: 600,

                          lineHeight: 1.5,
                        }}
                      >
                        {text}
                      </Text>
                    </div>
                  ))}
                </Space>

                {/* CTA */}

                <div
                  style={{
                    marginTop: 32,

                    textAlign: "center",
                  }}
                >
                  <motion.div {...pulseGlow}>
                    <Button
                      type="primary"
                      size="large"
                      block
                      onClick={handleLogin}
                      style={{
                        height: 55,

                        fontSize: 15,

                        fontWeight: 800,

                        border: 0,

                        background: BRAND.navy,

                        borderRadius: 9,
                      }}
                    >
                      KÍCH HOẠT TÀI KHOẢN · 299K
                    </Button>
                  </motion.div>

                  <Text
                    style={{
                      display: "block",

                      marginTop: 13,

                      fontSize: 11,

                      color: BRAND.textMuted,
                    }}
                  >
                    <GiftFilled
                      style={{
                        color: BRAND.gold,

                        marginRight: 5,
                      }}
                    />
                    Tặng kèm bộ tài liệu Giáo Án Số
                  </Text>
                </div>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* ===================================================
            REVIEWS
        =================================================== */}

        <section
          id="reviews"
          style={{
            padding: isMobile ? "65px 0" : "100px 0",

            background: BRAND.white,
          }}
        >
          <div
            style={{
              maxWidth: 1100,

              margin: "auto",

              paddingInline: isMobile ? 16 : 24,
            }}
          >
            <div
              style={{
                textAlign: "center",

                marginBottom: 45,
              }}
            >
              <Tag
                style={{
                  background: BRAND.goldLight,

                  color: BRAND.goldDark,

                  border: "1px solid rgba(217,164,65,0.25)",

                  fontWeight: 800,

                  padding: "6px 15px",

                  borderRadius: 7,
                }}
              >
                <StarFilled
                  style={{
                    marginRight: 5,
                  }}
                />
                ĐÁNH GIÁ
              </Tag>

              <Title
                level={2}
                style={{
                  color: BRAND.navy,

                  fontWeight: 900,

                  fontSize: isMobile ? 29 : 40,

                  marginTop: 12,
                }}
              >
                Giáo lý viên nói gì?
              </Title>

              <Paragraph
                style={{
                  color: BRAND.textMuted,

                  fontSize: 15,
                }}
              >
                Trải nghiệm thực tế từ những người đang sử dụng FaithEdu.
              </Paragraph>
            </div>

            <div
              style={{
                display: "grid",

                gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",

                gap: 18,
              }}
            >
              {[
                {
                  name: "Giáo lý viên",
                  role: "Giáo xứ",

                  content:
                    "Giao diện rất dễ sử dụng, đặc biệt là phần điểm danh QR giúp tiết kiệm rất nhiều thời gian đầu giờ.",

                  icon: <TeamOutlined />,
                },

                {
                  name: "Phụ trách Ngành",
                  role: "Giáo lý",

                  content:
                    "Phần game tương tác làm các em hào hứng hơn rất nhiều. Giáo lý viên cũng dễ tạo nội dung.",

                  icon: <PlaySquareFilled />,
                },

                {
                  name: "Ban điều hành",
                  role: "Xứ Đoàn",

                  content:
                    "Quản lý lớp và dữ liệu tập trung giúp việc theo dõi Thiếu Nhi thuận tiện hơn trước rất nhiều.",

                  icon: <SafetyCertificateFilled />,
                },
              ].map((review, index) => (
                <motion.div
                  key={index}
                  initial={{
                    opacity: 0,
                    y: 20,
                  }}
                  whileInView={{
                    opacity: 1,
                    y: 0,
                  }}
                  viewport={{
                    once: true,
                  }}
                  transition={{
                    delay: index * 0.08,
                  }}
                >
                  <Card
                    bordered
                    style={{
                      height: "100%",

                      borderRadius: 14,

                      borderColor: BRAND.border,

                      boxShadow: "0 8px 25px rgba(23,59,94,0.05)",
                    }}
                  >
                    <div
                      style={{
                        width: 44,

                        height: 44,

                        borderRadius: 10,

                        background: BRAND.navyLight,

                        color: BRAND.navy,

                        display: "grid",

                        placeItems: "center",

                        fontSize: 19,

                        marginBottom: 15,
                      }}
                    >
                      {review.icon}
                    </div>

                    <div
                      style={{
                        display: "flex",

                        gap: 2,

                        color: BRAND.gold,

                        marginBottom: 12,
                      }}
                    >
                      {[...Array(5)].map((_, i) => (
                        <StarFilled key={i} />
                      ))}
                    </div>

                    <Paragraph
                      style={{
                        color: BRAND.textMuted,

                        lineHeight: 1.75,

                        fontSize: 14,

                        minHeight: isMobile ? "auto" : 100,
                      }}
                    >
                      “{review.content}”
                    </Paragraph>

                    <div
                      style={{
                        borderTop: `1px solid ${BRAND.border}`,

                        paddingTop: 13,

                        marginTop: 12,
                      }}
                    >
                      <Text
                        strong
                        style={{
                          display: "block",

                          color: BRAND.navy,
                        }}
                      >
                        {review.name}
                      </Text>

                      <Text
                        style={{
                          color: BRAND.muted,

                          fontSize: 12,
                        }}
                      >
                        {review.role}
                      </Text>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ===================================================
            FAQ
        =================================================== */}

        <section
          id="faq"
          style={{
            padding: isMobile ? "65px 0" : "100px 0",

            background: BRAND.background,
          }}
        >
          <div
            style={{
              maxWidth: 850,

              margin: "auto",

              paddingInline: isMobile ? 16 : 24,
            }}
          >
            <div
              style={{
                textAlign: "center",

                marginBottom: 45,
              }}
            >
              <Tag
                style={{
                  background: BRAND.navyLight,

                  color: BRAND.navy,

                  border: `1px solid ${BRAND.border}`,

                  fontWeight: 800,

                  padding: "6px 16px",

                  borderRadius: 7,
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

                  color: BRAND.navy,
                }}
              >
                Các thắc mắc thường gặp
              </Title>
            </div>

            <Collapse
              accordion
              bordered={false}
              style={{
                background: "transparent",
              }}
              expandIcon={({ isActive }) => (
                <UpOutlined
                  rotate={isActive ? 180 : 0}
                  style={{
                    color: BRAND.goldDark,

                    fontWeight: 900,
                  }}
                />
              )}
              items={[
                {
                  key: "1",

                  label: (
                    <strong
                      style={{
                        fontSize: 15,
                        color: BRAND.navy,
                      }}
                    >
                      Có đúng là chỉ thanh toán 299.000đ và dùng vĩnh viễn?
                    </strong>
                  ),

                  children: (
                    <p
                      style={{
                        color: BRAND.textMuted,

                        fontSize: 14,

                        lineHeight: 1.75,

                        marginBottom: 0,
                      }}
                    >
                      Chính xác! Đây là chương trình ưu đãi đồng hành cùng các
                      Xứ Đoàn. Bạn mua một lần duy nhất và sở hữu trọn đời tài
                      khoản mà không cần trả thêm phí duy trì hàng tháng hay
                      hàng năm.
                    </p>
                  ),
                },

                {
                  key: "2",

                  label: (
                    <strong
                      style={{
                        fontSize: 15,
                        color: BRAND.navy,
                      }}
                    >
                      Giáo lý viên không giỏi công nghệ có dùng được không?
                    </strong>
                  ),

                  children: (
                    <p
                      style={{
                        color: BRAND.textMuted,

                        fontSize: 14,

                        lineHeight: 1.75,

                        marginBottom: 0,
                      }}
                    >
                      FaithEdu được thiết kế trực quan. Giáo lý viên có thể
                      nhanh chóng làm quen với điểm danh QR, quản lý lớp và tạo
                      các hoạt động tương tác.
                    </p>
                  ),
                },

                {
                  key: "3",

                  label: (
                    <strong
                      style={{
                        fontSize: 15,
                        color: BRAND.navy,
                      }}
                    >
                      Dữ liệu điểm danh & học sinh có được an toàn không?
                    </strong>
                  ),

                  children: (
                    <p
                      style={{
                        color: BRAND.textMuted,

                        fontSize: 14,

                        lineHeight: 1.75,

                        marginBottom: 0,
                      }}
                    >
                      Hệ thống lưu trữ dữ liệu trên nền tảng Cloud và hỗ trợ
                      phân quyền tài khoản để kiểm soát việc xem và chỉnh sửa dữ
                      liệu.
                    </p>
                  ),
                },
              ]}
            />
          </div>
        </section>

        {/* ===================================================
            FOOTER
        =================================================== */}

        <footer
          style={{
            background: BRAND.darkBg,

            color: BRAND.white,

            padding: "65px 0 30px",
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

                marginBottom: 45,
              }}
            >
              {/* FOOTER BRAND */}

              <div>
                <div
                  style={{
                    display: "flex",

                    alignItems: "center",

                    gap: 11,

                    marginBottom: 16,
                  }}
                >
                  <div
                    style={{
                      width: 42,

                      height: 42,

                      borderRadius: 10,

                      background: BRAND.white,

                      display: "grid",

                      placeItems: "center",
                    }}
                  >
                    <img
                      src={logoWeb}
                      alt="FaithEdu"
                      style={{
                        width: 32,
                        height: 32,
                      }}
                    />
                  </div>

                  <span
                    style={{
                      fontSize: 23,

                      fontWeight: 900,

                      color: BRAND.white,
                    }}
                  >
                    FaithEdu
                  </span>
                </div>

                <Paragraph
                  style={{
                    color: "#B7C3CF",

                    fontSize: 14,

                    maxWidth: 400,

                    lineHeight: 1.8,

                    marginBottom: 0,
                  }}
                >
                  Nền tảng số hóa quản lý Giáo Lý. Đổi mới phương pháp truyền
                  giảng, hỗ trợ Giáo lý viên và kết nối Đức Tin sống động cho
                  thế hệ trẻ.
                </Paragraph>
              </div>

              {/* LINKS */}

              <div>
                <h4
                  style={{
                    color: BRAND.white,

                    marginBottom: 17,

                    fontWeight: 800,

                    fontSize: 15,
                  }}
                >
                  Liên Kết Nhanh
                </h4>

                <Space direction="vertical" size={9}>
                  {navItems.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => scrollToSection(item.id)}
                      style={{
                        color: "#B7C3CF",
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: "pointer",
                        background: "transparent",
                        border: "none",
                        padding: 0,
                        margin: 0,
                        fontFamily: "inherit",
                        textAlign: "left",
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </Space>
              </div>

              {/* SUPPORT */}

              <div>
                <h4
                  style={{
                    color: BRAND.white,

                    marginBottom: 17,

                    fontWeight: 800,

                    fontSize: 15,
                  }}
                >
                  Thông Tin Hỗ Trợ
                </h4>

                <Space
                  direction="vertical"
                  size={11}
                  style={{
                    color: "#B7C3CF",

                    fontSize: 13,
                  }}
                >
                  <div>
                    <PhoneFilled
                      style={{
                        color: BRAND.gold,

                        marginRight: 8,
                      }}
                    />
                    Hotline: 033.604.1807
                  </div>

                  <div>
                    <MailFilled
                      style={{
                        color: BRAND.gold,

                        marginRight: 8,
                      }}
                    />
                    Email: tranhung6829@gmail.com
                  </div>

                  <div>
                    <FacebookFilled
                      style={{
                        color: BRAND.gold,

                        marginRight: 8,
                      }}
                    />
                    Fanpage: FaithEdu Việt Nam
                  </div>
                </Space>
              </div>
            </div>

            <Divider
              style={{
                borderColor: "rgba(255,255,255,0.12)",
              }}
            />

            <div
              style={{
                textAlign: "center",

                color: "#94A3B8",

                fontSize: 12,

                fontWeight: 500,
              }}
            >
              © {new Date().getFullYear()} FaithEdu. All rights reserved.
              <span
                style={{
                  marginLeft: 5,
                }}
              >
                Designed with
              </span>
              <HeartFilled
                style={{
                  color: BRAND.gold,

                  margin: "0 5px",
                }}
              />
              <span>for Faith Education.</span>
            </div>
          </div>
        </footer>

        {/* ===================================================
            VIDEO MODAL
        =================================================== */}

        <Modal
          open={videoOpen}
          onCancel={() => setVideoOpen(false)}
          footer={null}
          centered
          width={800}
          destroyOnClose
          closeIcon={
            <CloseOutlined
              style={{
                color: BRAND.navy,
              }}
            />
          }
        >
          <div
            style={{
              paddingTop: "56.25%",

              position: "relative",

              marginTop: 18,
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

                borderRadius: 10,
              }}
              src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
              title="FaithEdu Demo"
              allowFullScreen
            />
          </div>
        </Modal>
      </div>
    </ConfigProvider>
  );
};

export default LandingPage;
