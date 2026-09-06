import React, { useEffect, useRef, useState } from "react";
import {
  ArrowRightOutlined,
  PlayCircleFilled,
  CheckCircleFilled,
  BookFilled,
  QrcodeOutlined,
  PlaySquareFilled,
  FileTextFilled,
  TrophyFilled,
  GlobalOutlined,
  HeartFilled,
  SafetyCertificateFilled,
  RocketFilled,
  SearchOutlined,
  TeamOutlined,
  PhoneFilled,
  MailFilled,
  FacebookFilled,
  CloseOutlined,
  StarFilled,
  ThunderboltFilled,
  AppstoreFilled,
  SmileFilled,
  RiseOutlined,
  MenuOutlined,
  PlayCircleOutlined,
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
} from "antd";

import { motion, useInView } from "motion/react";

import logoWeb from "../../assets/images/logoweb.png";
import dashboard from "../../assets/images/dashboard-mockup.png";
import qrScanner from "../../assets/images/qr-scanner-ui.png";
import gameUi from "../../assets/images/game-quiz-ui.png";

const { Title, Paragraph, Text } = Typography;
const { useBreakpoint } = Grid;

/* =========================================================
   COLORS - WHITE & PASTEL PINK ONLY
========================================================= */

const COLORS = {
  primary: "#F06292",
  primaryDark: "#E84378",
  primaryDeep: "#C93463",

  pink: "#F48FB1",
  pinkLight: "#FCE4EC",
  pinkSoft: "#FFF5F8",
  pinkUltraLight: "#FFF9FB",

  rose: "#FFB6C9",
  roseLight: "#FFE1EA",

  lavenderPink: "#F7DDE7",

  text: "#4A3039",
  textDark: "#352028",
  muted: "#9B7B87",

  white: "#FFFFFF",
};

/* =========================================================
   SMOOTH SCROLL
========================================================= */

const scrollToSection = (id) => {
  const element = document.getElementById(id);

  if (element) {
    const headerOffset = 85;

    const elementPosition =
      element.getBoundingClientRect().top + window.pageYOffset;

    const offsetPosition = elementPosition - headerOffset;

    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth",
    });
  }
};

/* =========================================================
   ANIMATION VARIANTS
========================================================= */

const fadeUp = {
  hidden: {
    opacity: 0,
    y: 50,
  },

  visible: {
    opacity: 1,
    y: 0,

    transition: {
      duration: 0.75,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const fadeLeft = {
  hidden: {
    opacity: 0,
    x: -60,
  },

  visible: {
    opacity: 1,
    x: 0,

    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const fadeRight = {
  hidden: {
    opacity: 0,
    x: 60,
  },

  visible: {
    opacity: 1,
    x: 0,

    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const staggerContainer = {
  hidden: {},

  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const scaleIn = {
  hidden: {
    opacity: 0,
    scale: 0.85,
  },

  visible: {
    opacity: 1,
    scale: 1,

    transition: {
      duration: 0.65,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

/* =========================================================
   ANIMATED COUNTER
========================================================= */

const AnimatedCounter = ({ value, suffix = "", duration = 1800 }) => {
  const ref = useRef(null);

  const isInView = useInView(ref, {
    once: true,
    amount: 0.5,
  });

  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    let startTime = null;

    const animate = (currentTime) => {
      if (!startTime) {
        startTime = currentTime;
      }

      const progress = Math.min((currentTime - startTime) / duration, 1);

      const easeOut = 1 - Math.pow(1 - progress, 4);

      const currentValue = Math.floor(easeOut * value);

      setCount(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isInView, value, duration]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
};

/* =========================================================
   FLOATING BLOB
========================================================= */

const FloatingBlob = ({ size, color, top, left, right, bottom, delay = 0 }) => (
  <motion.div
    animate={{
      y: [0, -20, 0],
      x: [0, 10, 0],
      scale: [1, 1.08, 1],
    }}
    transition={{
      duration: 7,
      repeat: Infinity,
      delay,
      ease: "easeInOut",
    }}
    style={{
      position: "absolute",
      width: size,
      height: size,
      top,
      left,
      right,
      bottom,
      borderRadius: "50%",
      background: color,
      filter: "blur(5px)",
      opacity: 0.55,
      pointerEvents: "none",
    }}
  />
);

/* =========================================================
   SECTION HEADER
========================================================= */

const SectionHeader = ({
  eyebrow,
  title,
  highlight,
  description,
  isMobile,
}) => {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{
        once: true,
        amount: 0.2,
      }}
      style={{
        textAlign: "center",
        maxWidth: 750,
        margin: "0 auto",
      }}
    >
      <Tag
        bordered={false}
        style={{
          margin: 0,
          padding: "8px 16px",
          borderRadius: 999,
          background: COLORS.pinkLight,
          color: COLORS.primaryDark,
          fontSize: 10,
          fontWeight: 900,
          letterSpacing: 1.5,
        }}
      >
        {eyebrow}
      </Tag>

      <Title
        level={2}
        style={{
          margin: "16px 0 12px",
          fontSize: isMobile ? 32 : 48,
          lineHeight: 1.15,
          letterSpacing: -1.5,
          color: COLORS.textDark,
          fontWeight: 900,
        }}
      >
        {title}{" "}
        {highlight && (
          <span
            style={{
              color: COLORS.primary,
            }}
          >
            {highlight}
          </span>
        )}
      </Title>

      {description && (
        <Paragraph
          style={{
            margin: 0,
            color: COLORS.muted,
            fontSize: 14,
            lineHeight: 1.8,
          }}
        >
          {description}
        </Paragraph>
      )}
    </motion.div>
  );
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

const LandingPage = () => {
  const screens = useBreakpoint();

  const isMobile = !screens.md;
  const isTablet = screens.md && !screens.lg;

  const [videoOpen, setVideoOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const containerWidth = isMobile
    ? "calc(100% - 32px)"
    : isTablet
      ? "calc(100% - 60px)"
      : "calc(100% - 80px)";

  const maxWidth = 1200;

  const featureColumns = isMobile
    ? "repeat(2, 1fr)"
    : screens.lg
      ? "repeat(3, 1fr)"
      : "repeat(2, 1fr)";

  const statsColumns = isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)";

  const handleLogin = () => {
    window.location.href = "https://giaolyso.site";
  };

  const handleMenuClick = (id) => {
    setDrawerOpen(false);

    setTimeout(() => {
      scrollToSection(id);
    }, 100);
  };

  const navItems = [
    {
      label: "Trang chủ",
      id: "hero",
    },
    {
      label: "Giới thiệu",
      id: "about",
    },
    {
      label: "Tính năng",
      id: "features",
    },
    {
      label: "Thống kê",
      id: "stats",
    },
    {
      label: "Trải nghiệm",
      id: "experience",
    },
    {
      label: "Liên hệ",
      id: "contact",
    },
  ];

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: COLORS.primary,

          borderRadius: 18,

          fontFamily:
            '"Be Vietnam Pro", Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        },

        components: {
          Button: {
            controlHeight: 48,
            borderRadius: 999,
            fontWeight: 800,
          },

          Card: {
            borderRadiusLG: 26,
          },

          Modal: {
            borderRadiusLG: 28,
          },
        },
      }}
    >
      <div
        style={{
          minHeight: "100vh",
          overflow: "hidden",
          background:
            "linear-gradient(180deg,#FFF9FB 0%,#FFFFFF 45%,#FFF8FA 100%)",
          color: COLORS.text,
        }}
      >
        {/* =================================================
            HEADER
        ================================================= */}

        <motion.header
          initial={{
            opacity: 0,
            y: -30,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.7,
          }}
          style={{
            position: "sticky",
            top: 0,
            zIndex: 1000,

            height: isMobile ? 68 : 78,

            background: "rgba(255,255,255,.82)",

            borderBottom: "1px solid rgba(240,98,146,.10)",

            backdropFilter: "blur(20px)",

            WebkitBackdropFilter: "blur(20px)",
          }}
        >
          <div
            style={{
              width: containerWidth,
              maxWidth,
              height: "100%",

              margin: "auto",

              display: "flex",

              alignItems: "center",

              justifyContent: "space-between",

              gap: 20,
            }}
          >
            {/* LOGO */}

            <motion.div
              whileHover={{
                scale: 1.03,
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 11,
                cursor: "pointer",
              }}
              onClick={() => scrollToSection("hero")}
            >
              <div
                style={{
                  width: isMobile ? 44 : 52,
                  height: isMobile ? 44 : 52,

                  display: "grid",
                  placeItems: "center",

                  borderRadius: 17,

                  background: "#fff",

                  boxShadow: "0 10px 30px rgba(240,98,146,.13)",

                  border: "1px solid rgba(240,98,146,.10)",
                }}
              >
                <img
                  src={logoWeb}
                  alt="FaithEdu"
                  style={{
                    width: "82%",
                    height: "82%",
                    objectFit: "contain",
                  }}
                />
              </div>

              {!isMobile && (
                <div>
                  <div
                    style={{
                      color: COLORS.primaryDark,
                      fontSize: 22,
                      lineHeight: 1,
                      fontWeight: 900,
                    }}
                  >
                    FaithEdu
                  </div>

                  <div
                    style={{
                      marginTop: 5,
                      color: COLORS.muted,
                      fontSize: 9,
                      fontWeight: 600,
                    }}
                  >
                    Số hóa giáo lý · Kết nối đức tin
                  </div>
                </div>
              )}
            </motion.div>

            {/* DESKTOP NAV */}

            {!isMobile && (
              <nav
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 3,
                  marginLeft: "auto",
                }}
              >
                {navItems.map((item) => (
                  <motion.button
                    key={item.id}
                    whileHover={{
                      y: -2,
                      background: COLORS.pinkLight,
                    }}
                    whileTap={{
                      scale: 0.96,
                    }}
                    onClick={() => scrollToSection(item.id)}
                    style={{
                      border: 0,
                      background: "transparent",

                      color: COLORS.text,

                      padding: "10px 13px",

                      borderRadius: 999,

                      cursor: "pointer",

                      fontSize: 12,

                      fontWeight: 700,
                    }}
                  >
                    {item.label}
                  </motion.button>
                ))}
              </nav>
            )}

            {/* ACTION */}

            <Space size={8}>
              {!isMobile && (
                <motion.button
                  whileHover={{
                    scale: 1.08,
                    rotate: -5,
                  }}
                  whileTap={{
                    scale: 0.9,
                  }}
                  style={{
                    width: 42,
                    height: 42,

                    borderRadius: "50%",

                    border: 0,

                    background: COLORS.pinkLight,

                    color: COLORS.primaryDark,

                    cursor: "pointer",
                  }}
                >
                  <SearchOutlined />
                </motion.button>
              )}

              {isMobile ? (
                <Button
                  type="text"
                  icon={<MenuOutlined />}
                  onClick={() => setDrawerOpen(true)}
                  style={{
                    fontSize: 20,
                    color: COLORS.primaryDark,
                  }}
                />
              ) : (
                <Button
                  type="primary"
                  onClick={handleLogin}
                  style={{
                    border: 0,

                    background: "linear-gradient(135deg,#F48FB1,#EC5F91)",

                    boxShadow: "0 10px 25px rgba(240,98,146,.25)",
                  }}
                >
                  Đăng nhập
                </Button>
              )}
            </Space>
          </div>
        </motion.header>

        {/* =================================================
            MOBILE MENU
        ================================================= */}

        <Drawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          placement="right"
          width={280}
          title={
            <Space>
              <img
                src={logoWeb}
                alt="FaithEdu"
                style={{
                  width: 38,
                  height: 38,
                  objectFit: "contain",
                }}
              />

              <Text
                strong
                style={{
                  color: COLORS.primaryDark,
                  fontSize: 18,
                }}
              >
                FaithEdu
              </Text>
            </Space>
          }
        >
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
                onClick={() => handleMenuClick(item.id)}
                style={{
                  height: 48,
                  textAlign: "left",
                  color: COLORS.text,
                  fontWeight: 700,
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
                border: 0,
                background: "linear-gradient(135deg,#F48FB1,#EC5F91)",
              }}
            >
              Đăng nhập FaithEdu
            </Button>
          </Space>
        </Drawer>

        {/* =================================================
            HERO
        ================================================= */}

        <section
          id="hero"
          style={{
            position: "relative",

            overflow: "hidden",

            padding: isMobile ? "70px 0 90px" : "95px 0 115px",

            background:
              "radial-gradient(circle at 80% 20%,rgba(255,198,216,.55),transparent 30%),radial-gradient(circle at 5% 80%,rgba(255,225,234,.75),transparent 28%),linear-gradient(180deg,#FFF9FB,#FFF3F7)",
          }}
        >
          <FloatingBlob size={320} color="#FFD6E3" top={-140} right={-110} />

          <FloatingBlob
            size={220}
            color="#FFE6EE"
            bottom={-100}
            left={-80}
            delay={1}
          />

          <div
            style={{
              position: "relative",
              zIndex: 2,

              width: containerWidth,
              maxWidth,

              margin: "auto",

              display: "grid",

              gridTemplateColumns: isMobile ? "1fr" : "0.9fr 1.1fr",

              alignItems: "center",

              gap: isMobile ? 55 : 70,
            }}
          >
            {/* HERO TEXT */}

            <motion.div variants={fadeLeft} initial="hidden" animate="visible">
              <Tag
                bordered={false}
                style={{
                  padding: "9px 16px",

                  borderRadius: 999,

                  background: COLORS.pinkLight,

                  color: COLORS.primaryDark,

                  fontWeight: 900,

                  fontSize: 10,

                  letterSpacing: 1.4,
                }}
              >
                ✦ NỀN TẢNG GIÁO LÝ SỐ ✦
              </Tag>

              <Title
                style={{
                  margin: "22px 0 20px",

                  fontSize: isMobile ? 44 : "clamp(54px,5vw,72px)",

                  lineHeight: 1.03,

                  letterSpacing: -2.5,

                  fontWeight: 900,

                  color: COLORS.textDark,
                }}
              >
                Giáo lý hiện đại.
                <br />
                Đức tin{" "}
                <span
                  style={{
                    color: COLORS.primary,
                  }}
                >
                  sống động.
                </span>
                <br />
                Cùng với{" "}
                <span
                  style={{
                    color: COLORS.primaryDark,
                  }}
                >
                  FaithEdu
                </span>
              </Title>

              <Paragraph
                style={{
                  maxWidth: 570,

                  marginBottom: 0,

                  color: COLORS.muted,

                  fontSize: isMobile ? 14 : 15,

                  lineHeight: 1.9,
                }}
              >
                FaithEdu là nền tảng hỗ trợ số hóa công tác giáo lý, giúp giáo
                lý viên quản lý lớp học, học viên, bài học, điểm danh và hoạt
                động tương tác trong một hệ thống hiện đại và trực quan.
              </Paragraph>

              <Space
                wrap
                size={12}
                style={{
                  marginTop: 30,
                }}
              >
                <motion.div
                  whileHover={{
                    y: -3,
                    scale: 1.03,
                  }}
                  whileTap={{
                    scale: 0.97,
                  }}
                >
                  <Button
                    type="primary"
                    size="large"
                    icon={<ArrowRightOutlined />}
                    iconPosition="end"
                    onClick={() => scrollToSection("features")}
                    style={{
                      border: 0,

                      paddingInline: 24,

                      background: "linear-gradient(135deg,#F48FB1,#EC5F91)",

                      boxShadow: "0 14px 30px rgba(240,98,146,.28)",
                    }}
                  >
                    Khám phá ngay
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
                    icon={
                      <PlayCircleFilled
                        style={{
                          color: COLORS.primary,
                          fontSize: 22,
                        }}
                      />
                    }
                    onClick={() => setVideoOpen(true)}
                    style={{
                      border: 0,

                      background: "#fff",

                      color: COLORS.text,

                      boxShadow: "0 8px 25px rgba(240,98,146,.10)",
                    }}
                  >
                    Xem video giới thiệu
                  </Button>
                </motion.div>
              </Space>

              {/* HERO MINI CARDS */}

              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                style={{
                  display: "grid",

                  gridTemplateColumns: isMobile ? "1fr" : "repeat(3,1fr)",

                  gap: 10,

                  marginTop: 35,
                }}
              >
                {[
                  {
                    icon: <HeartFilled />,

                    title: "Dễ sử dụng",

                    desc: "Giao diện trực quan",
                  },

                  {
                    icon: <SafetyCertificateFilled />,

                    title: "An toàn",

                    desc: "Dữ liệu ổn định",
                  },

                  {
                    icon: <RocketFilled />,

                    title: "Hiện đại",

                    desc: "Công nghệ mới",
                  },
                ].map((item) => (
                  <motion.div
                    key={item.title}
                    variants={fadeUp}
                    whileHover={{
                      y: -5,
                      scale: 1.02,
                    }}
                    style={{
                      display: "flex",

                      alignItems: "center",

                      gap: 10,

                      padding: 12,

                      borderRadius: 18,

                      background: "rgba(255,255,255,.75)",

                      border: "1px solid rgba(240,98,146,.10)",
                    }}
                  >
                    <div
                      style={{
                        width: 38,
                        height: 38,

                        display: "grid",
                        placeItems: "center",

                        borderRadius: 13,

                        background: COLORS.pinkLight,

                        color: COLORS.primary,

                        fontSize: 18,
                      }}
                    >
                      {item.icon}
                    </div>

                    <div>
                      <div
                        style={{
                          fontSize: 11,

                          fontWeight: 800,

                          color: COLORS.textDark,
                        }}
                      >
                        {item.title}
                      </div>

                      <div
                        style={{
                          marginTop: 2,

                          fontSize: 9,

                          color: COLORS.muted,
                        }}
                      >
                        {item.desc}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* HERO DASHBOARD */}

            <motion.div
              variants={fadeRight}
              initial="hidden"
              animate="visible"
              style={{
                position: "relative",
              }}
            >
              <motion.div
                whileHover={{
                  y: -8,
                  scale: 1.01,
                }}
                transition={{
                  type: "spring",
                  stiffness: 180,
                }}
                style={{
                  padding: 10,

                  borderRadius: 30,

                  background: "rgba(255,255,255,.85)",

                  boxShadow: "0 30px 80px rgba(240,98,146,.18)",

                  border: "1px solid rgba(255,255,255,.9)",
                }}
              >
                <img
                  src={dashboard}
                  alt="FaithEdu Dashboard"
                  style={{
                    width: "100%",
                    display: "block",
                    borderRadius: 22,
                  }}
                />
              </motion.div>

              {/* FLOAT CARD 1 */}

              <motion.div
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                style={{
                  position: "absolute",

                  top: isMobile ? -10 : 40,

                  left: isMobile ? -5 : -35,

                  padding: "13px 17px",

                  borderRadius: 18,

                  background: "rgba(255,255,255,.95)",

                  boxShadow: "0 18px 40px rgba(240,98,146,.16)",

                  border: "1px solid rgba(240,98,146,.12)",

                  fontSize: 10,

                  fontWeight: 800,

                  color: COLORS.textDark,
                }}
              >
                <HeartFilled
                  style={{
                    color: COLORS.primary,
                  }}
                />
                <br />
                Học hôm nay
                <br />
                <span
                  style={{
                    color: COLORS.primary,
                  }}
                >
                  Vững đức tin mai sau
                </span>
              </motion.div>

              {/* FLOAT CARD 2 */}

              <motion.div
                animate={{
                  y: [0, 10, 0],
                }}
                transition={{
                  duration: 4.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                style={{
                  position: "absolute",

                  bottom: isMobile ? -10 : 35,

                  right: isMobile ? -5 : -30,

                  padding: "13px 17px",

                  borderRadius: 18,

                  background: "#fff",

                  boxShadow: "0 18px 40px rgba(240,98,146,.16)",

                  border: "1px solid rgba(240,98,146,.12)",

                  fontSize: 10,

                  fontWeight: 800,

                  color: COLORS.textDark,
                }}
              >
                <ThunderboltFilled
                  style={{
                    color: COLORS.primary,
                  }}
                />
                <br />
                Công nghệ hiện đại
                <br />
                <span
                  style={{
                    color: COLORS.primary,
                  }}
                >
                  Lan tỏa yêu thương
                </span>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* =================================================
            ABOUT
        ================================================= */}

        <section
          id="about"
          style={{
            padding: isMobile ? "80px 0" : "115px 0",

            background: "#fff",
          }}
        >
          <div
            style={{
              width: containerWidth,
              maxWidth,
              margin: "auto",
            }}
          >
            <SectionHeader
              eyebrow="VỀ FAITHEDU"
              title="Không chỉ là phần mềm,"
              highlight="mà là người bạn đồng hành"
              description="FaithEdu được xây dựng với mong muốn giúp công tác giáo lý trở nên đơn giản, hiện đại và gần gũi hơn với thế hệ trẻ."
              isMobile={isMobile}
            />

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{
                once: true,
              }}
              style={{
                marginTop: 55,

                display: "grid",

                gridTemplateColumns: isMobile ? "1fr" : "repeat(3,1fr)",

                gap: 20,
              }}
            >
              {[
                {
                  icon: <HeartFilled />,

                  number: "01",

                  title: "Lấy con người làm trung tâm",

                  desc: "Công nghệ chỉ là công cụ. Giá trị lớn nhất của FaithEdu là giúp giáo lý viên có thêm thời gian để quan tâm và đồng hành cùng các em.",
                },

                {
                  icon: <RocketFilled />,

                  number: "02",

                  title: "Ứng dụng công nghệ",

                  desc: "Số hóa các công việc thủ công, tối ưu quản lý lớp học và mang đến trải nghiệm học giáo lý hiện đại hơn.",
                },

                {
                  icon: <GlobalOutlined />,

                  number: "03",

                  title: "Kết nối cộng đoàn",

                  desc: "Tạo một hệ thống kết nối giữa giáo xứ, giáo lý viên, học viên và các hoạt động mục vụ.",
                },
              ].map((item) => (
                <motion.div
                  key={item.number}
                  variants={fadeUp}
                  whileHover={{
                    y: -10,
                  }}
                >
                  <Card
                    bordered={false}
                    style={{
                      height: "100%",

                      minHeight: 270,

                      padding: 5,

                      borderRadius: 26,

                      background: "linear-gradient(180deg,#FFFFFF,#FFF8FA)",

                      boxShadow: "0 15px 45px rgba(240,98,146,.08)",

                      border: "1px solid rgba(240,98,146,.08)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",

                        justifyContent: "space-between",

                        alignItems: "flex-start",
                      }}
                    >
                      <div
                        style={{
                          width: 64,
                          height: 64,

                          display: "grid",
                          placeItems: "center",

                          borderRadius: 20,

                          background: COLORS.pinkLight,

                          color: COLORS.primary,

                          fontSize: 27,
                        }}
                      >
                        {item.icon}
                      </div>

                      <span
                        style={{
                          fontSize: 34,

                          fontWeight: 900,

                          color: COLORS.roseLight,
                        }}
                      >
                        {item.number}
                      </span>
                    </div>

                    <Title
                      level={4}
                      style={{
                        margin: "25px 0 12px",

                        color: COLORS.textDark,

                        fontSize: 18,

                        fontWeight: 900,
                      }}
                    >
                      {item.title}
                    </Title>

                    <Paragraph
                      style={{
                        margin: 0,

                        color: COLORS.muted,

                        fontSize: 13,

                        lineHeight: 1.8,
                      }}
                    >
                      {item.desc}
                    </Paragraph>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* =================================================
            FEATURES
        ================================================= */}

        <section
          id="features"
          style={{
            padding: isMobile ? "80px 0" : "115px 0",

            background: COLORS.pinkUltraLight,
          }}
        >
          <div
            style={{
              width: containerWidth,
              maxWidth,
              margin: "auto",
            }}
          >
            <SectionHeader
              eyebrow="HỆ SINH THÁI FAITHEDU"
              title="Một nền tảng."
              highlight="Đầy đủ công cụ."
              description="Tất cả những gì giáo lý viên cần để quản lý, giảng dạy và tạo nên những giờ học giáo lý sinh động."
              isMobile={isMobile}
            />

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{
                once: true,
                amount: 0.1,
              }}
              style={{
                display: "grid",

                gridTemplateColumns: featureColumns,

                gap: 18,

                marginTop: 55,
              }}
            >
              {[
                {
                  icon: <BookFilled />,

                  title: "Bài học giáo lý",

                  desc: "Quản lý nội dung bài học, tài liệu và câu hỏi theo từng khối lớp.",
                },

                {
                  icon: <TeamOutlined />,

                  title: "Quản lý học viên",

                  desc: "Theo dõi thông tin, quá trình học tập và lịch sử tham gia.",
                },

                {
                  icon: <QrcodeOutlined />,

                  title: "Điểm danh QR",

                  desc: "Điểm danh nhanh chóng, trực quan và chính xác bằng QR Code.",
                },

                {
                  icon: <PlaySquareFilled />,

                  title: "Trò chơi tương tác",

                  desc: "Biến giờ học giáo lý trở nên sinh động và thú vị hơn.",
                },

                {
                  icon: <FileTextFilled />,

                  title: "Kiểm tra & đánh giá",

                  desc: "Tạo đề kiểm tra, theo dõi kết quả và đánh giá tiến trình.",
                },

                {
                  icon: <TrophyFilled />,

                  title: "Thành tích học tập",

                  desc: "Ghi nhận sự cố gắng và tạo động lực cho các em.",
                },
              ].map((item, index) => (
                <motion.div
                  key={item.title}
                  variants={scaleIn}
                  whileHover={{
                    y: -10,
                    scale: 1.02,
                  }}
                >
                  <Card
                    bordered={false}
                    style={{
                      height: "100%",

                      minHeight: isMobile ? 205 : 230,

                      textAlign: "center",

                      background: "#fff",

                      border: "1px solid rgba(240,98,146,.09)",

                      boxShadow: "0 10px 35px rgba(240,98,146,.06)",
                    }}
                    styles={{
                      body: {
                        padding: isMobile ? 22 : 28,
                      },
                    }}
                  >
                    <motion.div
                      animate={{
                        y: [0, -5, 0],
                        rotate: [0, 2, 0],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        delay: index * 0.2,
                      }}
                      style={{
                        width: 72,
                        height: 72,

                        margin: "0 auto 20px",

                        display: "grid",
                        placeItems: "center",

                        borderRadius: 23,

                        background: COLORS.pinkLight,

                        color: COLORS.primary,

                        fontSize: 30,

                        boxShadow: "0 12px 25px rgba(240,98,146,.12)",
                      }}
                    >
                      {item.icon}
                    </motion.div>

                    <Title
                      level={4}
                      style={{
                        margin: 0,

                        color: COLORS.textDark,

                        fontSize: 16,

                        fontWeight: 900,
                      }}
                    >
                      {item.title}
                    </Title>

                    <Paragraph
                      style={{
                        margin: "10px 0 0",

                        color: COLORS.muted,

                        fontSize: 12,

                        lineHeight: 1.8,
                      }}
                    >
                      {item.desc}
                    </Paragraph>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* =================================================
            STATS
        ================================================= */}

        <section
          id="stats"
          style={{
            position: "relative",

            padding: isMobile ? "80px 0" : "110px 0",

            background: "linear-gradient(135deg,#FCE4EC,#FFF7FA)",

            overflow: "hidden",
          }}
        >
          <FloatingBlob size={260} color="#FFD1E0" top={-100} left={-100} />

          <FloatingBlob
            size={240}
            color="#FFE2EB"
            bottom={-120}
            right={-80}
            delay={1}
          />

          <div
            style={{
              position: "relative",
              zIndex: 2,

              width: containerWidth,
              maxWidth,

              margin: "auto",
            }}
          >
            <SectionHeader
              eyebrow="FAITHEDU TRONG NHỮNG CON SỐ"
              title="Cùng nhau tạo nên"
              highlight="những thay đổi tích cực"
              description="Mỗi con số là một hành trình, một nỗ lực và một bước tiến trong công cuộc số hóa giáo lý."
              isMobile={isMobile}
            />

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{
                once: true,
              }}
              style={{
                display: "grid",

                gridTemplateColumns: statsColumns,

                gap: 15,

                marginTop: 50,
              }}
            >
              {[
                {
                  icon: <TeamOutlined />,

                  value: 500,

                  suffix: "+",

                  label: "Học viên",
                },

                {
                  icon: <BookFilled />,

                  value: 100,

                  suffix: "+",

                  label: "Bài học",
                },

                {
                  icon: <PlaySquareFilled />,

                  value: 20,

                  suffix: "+",

                  label: "Trò chơi",
                },

                {
                  icon: <HeartFilled />,

                  value: 100,

                  suffix: "%",

                  label: "Tâm huyết",
                },
              ].map((item) => (
                <motion.div
                  key={item.label}
                  variants={fadeUp}
                  whileHover={{
                    y: -8,
                    scale: 1.02,
                  }}
                  style={{
                    padding: isMobile ? "25px 15px" : "35px 20px",

                    textAlign: "center",

                    borderRadius: 25,

                    background: "rgba(255,255,255,.8)",

                    border: "1px solid rgba(255,255,255,.9)",

                    boxShadow: "0 15px 40px rgba(240,98,146,.10)",
                  }}
                >
                  <div
                    style={{
                      width: 58,
                      height: 58,

                      margin: "0 auto 15px",

                      display: "grid",
                      placeItems: "center",

                      borderRadius: 20,

                      background: COLORS.pinkLight,

                      color: COLORS.primary,

                      fontSize: 25,
                    }}
                  >
                    {item.icon}
                  </div>

                  <div
                    style={{
                      color: COLORS.primaryDark,

                      fontSize: isMobile ? 32 : 42,

                      lineHeight: 1,

                      fontWeight: 900,
                    }}
                  >
                    <AnimatedCounter value={item.value} suffix={item.suffix} />
                  </div>

                  <div
                    style={{
                      marginTop: 10,

                      color: COLORS.muted,

                      fontSize: 12,

                      fontWeight: 700,
                    }}
                  >
                    {item.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* =================================================
            QR EXPERIENCE
        ================================================= */}

        <section
          id="experience"
          style={{
            padding: isMobile ? "80px 0" : "115px 0",

            background: "#fff",
          }}
        >
          <div
            style={{
              width: containerWidth,
              maxWidth,

              margin: "auto",

              display: "grid",

              gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",

              alignItems: "center",

              gap: isMobile ? 55 : 90,
            }}
          >
            {/* IMAGE */}

            <motion.div
              variants={fadeLeft}
              initial="hidden"
              whileInView="visible"
              viewport={{
                once: true,
              }}
              style={{
                position: "relative",
              }}
            >
              <motion.div
                whileHover={{
                  y: -8,
                  rotate: 0,
                }}
                style={{
                  padding: 10,

                  borderRadius: 30,

                  background: COLORS.pinkSoft,

                  boxShadow: "0 30px 70px rgba(240,98,146,.13)",

                  transform: "rotate(-1.5deg)",
                }}
              >
                <img
                  src={qrScanner}
                  alt="Điểm danh QR"
                  style={{
                    width: "100%",
                    display: "block",
                    borderRadius: 22,
                  }}
                />
              </motion.div>

              <motion.div
                animate={{
                  y: [0, -9, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                }}
                style={{
                  position: "absolute",

                  right: -15,

                  top: 35,

                  padding: "14px 17px",

                  borderRadius: 18,

                  background: "#fff",

                  boxShadow: "0 15px 35px rgba(240,98,146,.15)",

                  fontSize: 10,

                  fontWeight: 800,

                  color: COLORS.textDark,
                }}
              >
                <CheckCircleFilled
                  style={{
                    color: COLORS.primary,
                  }}
                />
                &nbsp; Điểm danh thành công
              </motion.div>
            </motion.div>

            {/* TEXT */}

            <motion.div
              variants={fadeRight}
              initial="hidden"
              whileInView="visible"
              viewport={{
                once: true,
              }}
            >
              <Tag
                bordered={false}
                style={{
                  padding: "8px 15px",

                  borderRadius: 999,

                  background: COLORS.pinkLight,

                  color: COLORS.primaryDark,

                  fontWeight: 900,

                  fontSize: 10,
                }}
              >
                ĐIỂM DANH THÔNG MINH
              </Tag>

              <Title
                style={{
                  margin: "18px 0",

                  fontSize: isMobile ? 36 : 50,

                  lineHeight: 1.12,

                  fontWeight: 900,

                  color: COLORS.textDark,

                  letterSpacing: -1.5,
                }}
              >
                Quét một lần.
                <br />
                <span
                  style={{
                    color: COLORS.primary,
                  }}
                >
                  Ghi nhận ngay.
                </span>
              </Title>

              <Paragraph
                style={{
                  color: COLORS.muted,

                  fontSize: 14,

                  lineHeight: 1.9,
                }}
              >
                Không cần gọi tên từng em, không cần sổ điểm danh thủ công.
                FaithEdu giúp việc quản lý chuyên cần trở nên nhanh chóng và
                chính xác hơn.
              </Paragraph>

              <Space
                direction="vertical"
                size={14}
                style={{
                  marginTop: 20,
                }}
              >
                {[
                  "Mỗi học viên sở hữu mã QR riêng",
                  "Ghi nhận có mặt, vắng và đi muộn",
                  "Tự động thống kê tỷ lệ chuyên cần",
                  "Quản lý lịch sử theo từng buổi học",
                ].map((text) => (
                  <motion.div
                    key={text}
                    whileHover={{
                      x: 7,
                    }}
                    style={{
                      display: "flex",

                      alignItems: "center",

                      gap: 10,

                      fontSize: 13,

                      color: COLORS.text,
                    }}
                  >
                    <CheckCircleFilled
                      style={{
                        color: COLORS.primary,

                        fontSize: 18,
                      }}
                    />

                    {text}
                  </motion.div>
                ))}
              </Space>
            </motion.div>
          </div>
        </section>

        {/* =================================================
            GAME SECTION
        ================================================= */}

        <section
          style={{
            padding: isMobile ? "80px 0" : "115px 0",

            background: COLORS.pinkUltraLight,
          }}
        >
          <div
            style={{
              width: containerWidth,
              maxWidth,

              margin: "auto",

              display: "grid",

              gridTemplateColumns: isMobile ? "1fr" : "0.9fr 1.1fr",

              alignItems: "center",

              gap: isMobile ? 55 : 80,
            }}
          >
            {/* TEXT */}

            <motion.div
              variants={fadeLeft}
              initial="hidden"
              whileInView="visible"
              viewport={{
                once: true,
              }}
            >
              <Tag
                bordered={false}
                style={{
                  padding: "8px 15px",

                  borderRadius: 999,

                  background: COLORS.pinkLight,

                  color: COLORS.primaryDark,

                  fontWeight: 900,

                  fontSize: 10,
                }}
              >
                GIÁO LÝ QUA TRÒ CHƠI
              </Tag>

              <Title
                style={{
                  margin: "18px 0",

                  color: COLORS.textDark,

                  fontSize: isMobile ? 36 : 50,

                  fontWeight: 900,

                  lineHeight: 1.12,
                }}
              >
                Học giáo lý.
                <br />
                <span
                  style={{
                    color: COLORS.primary,
                  }}
                >
                  Không còn nhàm chán.
                </span>
              </Title>

              <Paragraph
                style={{
                  color: COLORS.muted,

                  fontSize: 14,

                  lineHeight: 1.9,
                }}
              >
                Những trò chơi tương tác giúp các em tiếp cận kiến thức giáo lý
                theo cách gần gũi hơn, tạo sự hứng thú và ghi nhớ kiến thức một
                cách tự nhiên.
              </Paragraph>

              <motion.div
                whileHover={{
                  y: -3,
                  scale: 1.03,
                }}
                style={{
                  display: "inline-block",

                  marginTop: 20,
                }}
              >
                <Button
                  type="primary"
                  icon={<ArrowRightOutlined />}
                  iconPosition="end"
                  onClick={() =>
                    (window.location.href = "https://giaolyso.site")
                  }
                  style={{
                    border: 0,

                    background: "linear-gradient(135deg,#F48FB1,#EC5F91)",

                    boxShadow: "0 12px 25px rgba(240,98,146,.25)",
                  }}
                >
                  Trải nghiệm FaithEdu
                </Button>
              </motion.div>
            </motion.div>

            {/* GAME IMAGE */}

            <motion.div
              variants={fadeRight}
              initial="hidden"
              whileInView="visible"
              viewport={{
                once: true,
              }}
              style={{
                position: "relative",
              }}
            >
              <motion.div
                whileHover={{
                  y: -8,
                  rotate: 0,
                }}
                style={{
                  padding: 10,

                  borderRadius: 30,

                  background: "#fff",

                  boxShadow: "0 30px 70px rgba(240,98,146,.13)",

                  transform: "rotate(1deg)",
                }}
              >
                <img
                  src={gameUi}
                  alt="Trò chơi FaithEdu"
                  style={{
                    width: "100%",
                    display: "block",
                    borderRadius: 22,
                  }}
                />
              </motion.div>

              <motion.div
                animate={{
                  y: [0, -10, 0],
                  rotate: [0, 2, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                }}
                style={{
                  position: "absolute",

                  right: -10,

                  top: -15,

                  padding: "13px 17px",

                  borderRadius: 18,

                  background: "#fff",

                  border: "1px solid rgba(240,98,146,.12)",

                  boxShadow: "0 15px 35px rgba(240,98,146,.14)",

                  fontSize: 11,

                  fontWeight: 900,

                  color: COLORS.primaryDark,
                }}
              >
                <StarFilled />
                &nbsp; Học mà chơi
                <br />
                Chơi mà nhớ!
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* =================================================
            WHY FAITHEDU
        ================================================= */}

        <section
          style={{
            padding: isMobile ? "80px 0" : "110px 0",

            background: "#fff",
          }}
        >
          <div
            style={{
              width: containerWidth,
              maxWidth,
              margin: "auto",
            }}
          >
            <SectionHeader
              eyebrow="TẠI SAO LÀ FAITHEDU?"
              title="Được xây dựng dành riêng cho"
              highlight="công tác giáo lý"
              description="Không phải một phần mềm quản lý thông thường. FaithEdu được thiết kế từ những nhu cầu thực tế của môi trường giáo lý."
              isMobile={isMobile}
            />

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{
                once: true,
              }}
              style={{
                display: "grid",

                gridTemplateColumns: isMobile ? "1fr" : "repeat(3,1fr)",

                gap: 20,

                marginTop: 55,
              }}
            >
              {[
                {
                  icon: <SmileFilled />,

                  title: "Thân thiện",

                  desc: "Dễ làm quen ngay cả với người không rành công nghệ.",
                },

                {
                  icon: <AppstoreFilled />,

                  title: "Tất cả trong một",

                  desc: "Quản lý lớp học, học viên, điểm danh, bài học và trò chơi.",
                },

                {
                  icon: <RiseOutlined />,

                  title: "Luôn phát triển",

                  desc: "FaithEdu liên tục được cải tiến dựa trên nhu cầu thực tế.",
                },
              ].map((item) => (
                <motion.div
                  key={item.title}
                  variants={fadeUp}
                  whileHover={{
                    y: -8,
                  }}
                  style={{
                    display: "flex",

                    gap: 18,

                    padding: 25,

                    borderRadius: 25,

                    background: COLORS.pinkUltraLight,

                    border: "1px solid rgba(240,98,146,.08)",
                  }}
                >
                  <div
                    style={{
                      minWidth: 55,
                      height: 55,

                      display: "grid",
                      placeItems: "center",

                      borderRadius: 18,

                      background: COLORS.pinkLight,

                      color: COLORS.primary,

                      fontSize: 24,
                    }}
                  >
                    {item.icon}
                  </div>

                  <div>
                    <Title
                      level={4}
                      style={{
                        margin: "2px 0 8px",

                        color: COLORS.textDark,

                        fontSize: 16,

                        fontWeight: 900,
                      }}
                    >
                      {item.title}
                    </Title>

                    <Paragraph
                      style={{
                        margin: 0,

                        color: COLORS.muted,

                        fontSize: 12,

                        lineHeight: 1.8,
                      }}
                    >
                      {item.desc}
                    </Paragraph>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* =================================================
            CTA
        ================================================= */}

        <section
          style={{
            padding: isMobile ? "20px 0 90px" : "30px 0 120px",

            background: "#fff",
          }}
        >
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.94,
            }}
            whileInView={{
              opacity: 1,
              scale: 1,
            }}
            viewport={{
              once: true,
            }}
            transition={{
              duration: 0.8,
            }}
            style={{
              position: "relative",

              overflow: "hidden",

              width: containerWidth,

              maxWidth,

              minHeight: isMobile ? 380 : 390,

              margin: "auto",

              padding: isMobile ? "40px 25px" : "65px 60px",

              display: "flex",

              flexDirection: "column",

              alignItems: "center",

              justifyContent: "center",

              textAlign: "center",

              borderRadius: 38,

              background:
                "linear-gradient(135deg,#FFE1EA 0%,#FBB6CC 50%,#F48FB1 100%)",

              boxShadow: "0 30px 70px rgba(240,98,146,.20)",
            }}
          >
            <FloatingBlob
              size={250}
              color="rgba(255,255,255,.45)"
              top={-100}
              right={-50}
            />

            <FloatingBlob
              size={200}
              color="rgba(255,255,255,.35)"
              bottom={-100}
              left={-50}
              delay={1}
            />

            <Tag
              bordered={false}
              style={{
                position: "relative",
                zIndex: 2,

                padding: "8px 16px",

                borderRadius: 999,

                background: "rgba(255,255,255,.6)",

                color: COLORS.primaryDark,

                fontSize: 10,

                fontWeight: 900,
              }}
            >
              BẮT ĐẦU HÀNH TRÌNH CỦA BẠN
            </Tag>

            <Title
              style={{
                position: "relative",
                zIndex: 2,

                maxWidth: 800,

                margin: "18px 0 25px",

                color: COLORS.textDark,

                fontSize: isMobile ? 31 : 48,

                lineHeight: 1.2,

                fontWeight: 900,
              }}
            >
              Cùng xây dựng một cộng đoàn giáo lý hiện đại hơn,
              <br />
              yêu thương hơn mỗi ngày.
            </Title>

            <Space
              wrap
              size={12}
              style={{
                position: "relative",
                zIndex: 2,
              }}
            >
              <motion.div
                whileHover={{
                  y: -4,
                  scale: 1.04,
                }}
              >
                <Button
                  size="large"
                  type="primary"
                  onClick={handleLogin}
                  icon={<ArrowRightOutlined />}
                  iconPosition="end"
                  style={{
                    border: 0,

                    background: COLORS.primaryDark,

                    boxShadow: "0 12px 25px rgba(201,52,99,.25)",
                  }}
                >
                  Bắt đầu với FaithEdu
                </Button>
              </motion.div>

              <motion.div
                whileHover={{
                  y: -4,
                }}
              >
                <Button
                  size="large"
                  onClick={() => setVideoOpen(true)}
                  icon={<PlayCircleOutlined />}
                  style={{
                    border: 0,

                    background: "rgba(255,255,255,.85)",

                    color: COLORS.primaryDark,
                  }}
                >
                  Xem giới thiệu
                </Button>
              </motion.div>
            </Space>
          </motion.div>
        </section>

        {/* =================================================
            CONTACT
        ================================================= */}

        <section
          id="contact"
          style={{
            padding: isMobile ? "70px 0" : "90px 0",

            background: COLORS.pinkUltraLight,
          }}
        >
          <div
            style={{
              width: containerWidth,
              maxWidth,

              margin: "auto",
            }}
          >
            <SectionHeader
              eyebrow="LIÊN HỆ"
              title="Kết nối với"
              highlight="FaithEdu"
              description="Bạn có ý tưởng, góp ý hoặc muốn đồng hành cùng dự án? Hãy liên hệ với chúng tôi."
              isMobile={isMobile}
            />

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{
                once: true,
              }}
              style={{
                marginTop: 45,

                display: "grid",

                gridTemplateColumns: isMobile ? "1fr" : "repeat(3,1fr)",

                gap: 18,
              }}
            >
              {/* PHONE */}

              <motion.a
                href="tel:0336041807"
                variants={fadeUp}
                whileHover={{
                  y: -8,
                  scale: 1.02,
                }}
                style={{
                  textDecoration: "none",
                }}
              >
                <Card
                  bordered={false}
                  style={{
                    textAlign: "center",

                    background: "#fff",

                    border: "1px solid rgba(240,98,146,.10)",

                    boxShadow: "0 10px 35px rgba(240,98,146,.07)",
                  }}
                >
                  <div
                    style={{
                      width: 62,
                      height: 62,

                      margin: "0 auto 17px",

                      display: "grid",
                      placeItems: "center",

                      borderRadius: 21,

                      background: COLORS.pinkLight,

                      color: COLORS.primary,

                      fontSize: 26,
                    }}
                  >
                    <PhoneFilled />
                  </div>

                  <Title
                    level={4}
                    style={{
                      margin: 0,

                      color: COLORS.textDark,

                      fontSize: 16,
                    }}
                  >
                    Điện thoại
                  </Title>

                  <Text
                    style={{
                      display: "block",

                      marginTop: 8,

                      color: COLORS.primaryDark,

                      fontWeight: 800,
                    }}
                  >
                    0336 041 807
                  </Text>
                </Card>
              </motion.a>

              {/* EMAIL */}

              <motion.a
                href="mailto:tranhung6829@gmail.com"
                variants={fadeUp}
                whileHover={{
                  y: -8,
                  scale: 1.02,
                }}
                style={{
                  textDecoration: "none",
                }}
              >
                <Card
                  bordered={false}
                  style={{
                    textAlign: "center",

                    background: "#fff",

                    border: "1px solid rgba(240,98,146,.10)",

                    boxShadow: "0 10px 35px rgba(240,98,146,.07)",
                  }}
                >
                  <div
                    style={{
                      width: 62,
                      height: 62,

                      margin: "0 auto 17px",

                      display: "grid",
                      placeItems: "center",

                      borderRadius: 21,

                      background: COLORS.pinkLight,

                      color: COLORS.primary,

                      fontSize: 26,
                    }}
                  >
                    <MailFilled />
                  </div>

                  <Title
                    level={4}
                    style={{
                      margin: 0,

                      color: COLORS.textDark,

                      fontSize: 16,
                    }}
                  >
                    Email
                  </Title>

                  <Text
                    style={{
                      display: "block",

                      marginTop: 8,

                      color: COLORS.primaryDark,

                      fontSize: 12,

                      fontWeight: 700,
                    }}
                  >
                    tranhung6829@gmail.com
                  </Text>
                </Card>
              </motion.a>

              {/* FACEBOOK */}

              <motion.a
                href="https://www.facebook.com/tran.khanh.hung.770881"
                target="_blank"
                rel="noopener noreferrer"
                variants={fadeUp}
                whileHover={{
                  y: -8,
                  scale: 1.02,
                }}
                style={{
                  textDecoration: "none",
                }}
              >
                <Card
                  bordered={false}
                  style={{
                    textAlign: "center",

                    background: "#fff",

                    border: "1px solid rgba(240,98,146,.10)",

                    boxShadow: "0 10px 35px rgba(240,98,146,.07)",
                  }}
                >
                  <div
                    style={{
                      width: 62,
                      height: 62,

                      margin: "0 auto 17px",

                      display: "grid",
                      placeItems: "center",

                      borderRadius: 21,

                      background: COLORS.pinkLight,

                      color: COLORS.primary,

                      fontSize: 26,
                    }}
                  >
                    <FacebookFilled />
                  </div>

                  <Title
                    level={4}
                    style={{
                      margin: 0,

                      color: COLORS.textDark,

                      fontSize: 16,
                    }}
                  >
                    Facebook
                  </Title>

                  <Text
                    style={{
                      display: "block",

                      marginTop: 8,

                      color: COLORS.primaryDark,

                      fontWeight: 700,
                    }}
                  >
                    Trần Khánh Hưng
                  </Text>
                </Card>
              </motion.a>
            </motion.div>
          </div>
        </section>

        {/* =================================================
            FOOTER
        ================================================= */}

        <footer
          style={{
            padding: isMobile ? "55px 0 25px" : "65px 0 25px",

            background: "#FFF7FA",

            borderTop: "1px solid rgba(240,98,146,.10)",
          }}
        >
          <div
            style={{
              width: containerWidth,
              maxWidth,

              margin: "auto",
            }}
          >
            <div
              style={{
                display: "grid",

                gridTemplateColumns: isMobile ? "1fr" : "1.3fr 1fr 1fr",

                gap: isMobile ? 35 : 50,
              }}
            >
              {/* BRAND */}

              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <img
                    src={logoWeb}
                    alt="FaithEdu"
                    style={{
                      width: 54,
                      height: 54,

                      objectFit: "contain",
                    }}
                  />

                  <div>
                    <div
                      style={{
                        fontSize: 23,

                        color: COLORS.primaryDark,

                        fontWeight: 900,
                      }}
                    >
                      FaithEdu
                    </div>

                    <div
                      style={{
                        fontSize: 10,

                        color: COLORS.muted,

                        marginTop: 3,
                      }}
                    >
                      Số hóa giáo lý · Kết nối đức tin
                    </div>
                  </div>
                </div>

                <Paragraph
                  style={{
                    maxWidth: 360,

                    marginTop: 20,

                    color: COLORS.muted,

                    fontSize: 12,

                    lineHeight: 1.8,
                  }}
                >
                  FaithEdu mong muốn ứng dụng công nghệ để hỗ trợ công tác giáo
                  lý, giúp việc quản lý và giảng dạy trở nên hiện đại, trực quan
                  và hiệu quả hơn.
                </Paragraph>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,

                    color: COLORS.primaryDark,

                    fontWeight: 800,

                    fontSize: 12,
                  }}
                >
                  <GlobalOutlined />
                  giaolyso.site
                </div>
              </div>

              {/* QUICK LINKS */}

              <div>
                <Text
                  strong
                  style={{
                    color: COLORS.textDark,

                    fontSize: 14,
                  }}
                >
                  Khám phá
                </Text>

                <Space
                  direction="vertical"
                  size={11}
                  style={{
                    display: "flex",

                    marginTop: 18,
                  }}
                >
                  {navItems.map((item) => (
                    <motion.button
                      key={item.id}
                      whileHover={{
                        x: 5,
                        color: COLORS.primary,
                      }}
                      onClick={() => scrollToSection(item.id)}
                      style={{
                        width: "fit-content",

                        border: 0,

                        padding: 0,

                        background: "transparent",

                        color: COLORS.muted,

                        cursor: "pointer",

                        fontSize: 12,

                        textAlign: "left",
                      }}
                    >
                      {item.label}
                    </motion.button>
                  ))}
                </Space>
              </div>

              {/* CONTACT INFO */}

              <div>
                <Text
                  strong
                  style={{
                    color: COLORS.textDark,

                    fontSize: 14,
                  }}
                >
                  Thông tin liên hệ
                </Text>

                <Space
                  direction="vertical"
                  size={15}
                  style={{
                    display: "flex",

                    marginTop: 18,
                  }}
                >
                  <a
                    href="tel:0336041807"
                    style={{
                      display: "flex",

                      alignItems: "center",

                      gap: 10,

                      color: COLORS.muted,

                      fontSize: 12,
                    }}
                  >
                    <PhoneFilled
                      style={{
                        color: COLORS.primary,
                      }}
                    />
                    0336 041 807
                  </a>

                  <a
                    href="mailto:tranhung6829@gmail.com"
                    style={{
                      display: "flex",

                      alignItems: "center",

                      gap: 10,

                      color: COLORS.muted,

                      fontSize: 12,
                    }}
                  >
                    <MailFilled
                      style={{
                        color: COLORS.primary,
                      }}
                    />
                    tranhung6829@gmail.com
                  </a>

                  <a
                    href="https://www.facebook.com/tran.khanh.hung.770881"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "flex",

                      alignItems: "center",

                      gap: 10,

                      color: COLORS.muted,

                      fontSize: 12,
                    }}
                  >
                    <FacebookFilled
                      style={{
                        color: COLORS.primary,
                      }}
                    />
                    Trần Khánh Hưng
                  </a>
                </Space>
              </div>
            </div>

            <Divider
              style={{
                margin: isMobile ? "35px 0 20px" : "50px 0 20px",

                borderColor: "rgba(240,98,146,.10)",
              }}
            />

            <div
              style={{
                display: "flex",

                flexDirection: isMobile ? "column" : "row",

                alignItems: "center",

                justifyContent: "space-between",

                gap: 12,

                textAlign: isMobile ? "center" : "left",
              }}
            >
              <Text
                style={{
                  color: "#B697A3",

                  fontSize: 10,
                }}
              >
                © {new Date().getFullYear()} FaithEdu. All rights reserved.
              </Text>

              <Text
                style={{
                  color: "#B697A3",

                  fontSize: 10,
                }}
              >
                Made with{" "}
                <HeartFilled
                  style={{
                    color: COLORS.primary,
                  }}
                />{" "}
                HT Deverloper
              </Text>
            </div>
          </div>
        </footer>

        {/* =================================================
            FLOATING ACTION
        ================================================= */}

        <motion.div
          initial={{
            opacity: 0,
            scale: 0.5,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          transition={{
            delay: 1.5,
            type: "spring",
          }}
          whileHover={{
            scale: 1.12,
            rotate: -5,
          }}
          whileTap={{
            scale: 0.9,
          }}
          onClick={() => scrollToSection("hero")}
          style={{
            position: "fixed",

            zIndex: 999,

            right: isMobile ? 18 : 28,

            bottom: isMobile ? 18 : 28,

            width: 54,
            height: 54,

            display: "grid",
            placeItems: "center",

            borderRadius: "50%",

            background: "linear-gradient(135deg,#F48FB1,#EC5F91)",

            color: "#fff",

            fontSize: 21,

            cursor: "pointer",

            boxShadow: "0 15px 35px rgba(240,98,146,.35)",
          }}
        >
          <RocketFilled />
        </motion.div>

        {/* =================================================
            VIDEO MODAL
        ================================================= */}

        <Modal
          open={videoOpen}
          onCancel={() => setVideoOpen(false)}
          footer={null}
          centered
          width={isMobile ? "92%" : 850}
          closeIcon={
            <CloseOutlined
              style={{
                color: COLORS.primaryDark,
              }}
            />
          }
          styles={{
            content: {
              padding: 0,
              overflow: "hidden",
              borderRadius: 28,
            },

            body: {
              padding: 0,
            },
          }}
        >
          <div
            style={{
              padding: isMobile ? 25 : 35,

              textAlign: "center",

              background: "linear-gradient(180deg,#FFF9FB,#FFFFFF)",
            }}
          >
            <div
              style={{
                width: 70,
                height: 70,

                margin: "0 auto 18px",

                display: "grid",
                placeItems: "center",

                borderRadius: "50%",

                background: COLORS.pinkLight,

                color: COLORS.primary,

                fontSize: 34,
              }}
            >
              <PlayCircleFilled />
            </div>

            <Title
              level={3}
              style={{
                margin: "0 0 10px",

                color: COLORS.textDark,

                fontWeight: 900,
              }}
            >
              FaithEdu – Giáo lý số
            </Title>

            <Paragraph
              style={{
                color: COLORS.muted,

                marginBottom: 25,
              }}
            >
              Video giới thiệu FaithEdu sẽ được cập nhật tại đây.
            </Paragraph>

            {/* VIDEO PLACEHOLDER */}

            <div
              style={{
                position: "relative",

                width: "100%",

                aspectRatio: "16 / 9",

                display: "flex",

                flexDirection: "column",

                alignItems: "center",

                justifyContent: "center",

                borderRadius: 22,

                background: "linear-gradient(135deg,#FCE4EC,#FFD6E3)",

                border: "2px dashed rgba(240,98,146,.25)",
              }}
            >
              <motion.div
                animate={{
                  scale: [1, 1.08, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
                style={{
                  width: 80,
                  height: 80,

                  display: "grid",
                  placeItems: "center",

                  borderRadius: "50%",

                  background: "#fff",

                  color: COLORS.primary,

                  fontSize: 38,

                  boxShadow: "0 12px 30px rgba(240,98,146,.18)",
                }}
              >
                <PlayCircleFilled />
              </motion.div>

              <Text
                style={{
                  marginTop: 15,

                  color: COLORS.primaryDark,

                  fontWeight: 800,
                }}
              >
                VIDEO GIỚI THIỆU FAITHEDU
              </Text>

              <Text
                style={{
                  marginTop: 5,

                  color: COLORS.muted,

                  fontSize: 11,
                }}
              >
                Bạn có thể thêm YouTube, Vimeo hoặc video MP4 tại đây
              </Text>
            </div>

            <div
              style={{
                marginTop: 22,
              }}
            >
              <Button
                type="primary"
                onClick={() => setVideoOpen(false)}
                style={{
                  border: 0,

                  paddingInline: 25,

                  background: "linear-gradient(135deg,#F48FB1,#EC5F91)",
                }}
              >
                Đóng
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </ConfigProvider>
  );
};

export default LandingPage;
