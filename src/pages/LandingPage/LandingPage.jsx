import React, { useEffect, useState } from "react";
import {
  ArrowRightOutlined,
  PlayCircleFilled,
  BookFilled,
  QrcodeOutlined,
  PlaySquareFilled,
  HeartFilled,
  PhoneFilled,
  MailFilled,
  FacebookFilled,
  MenuOutlined,
  CrownFilled,
  CheckOutlined,
  SafetyCertificateFilled,
  TeamOutlined,
  ThunderboltFilled,
  CalendarOutlined,
  CloudOutlined,
  BarChartOutlined,
  ReadOutlined,
} from "@ant-design/icons";
import {
  Button,
  ConfigProvider,
  Grid,
  Space,
  Typography,
  Modal,
  Divider,
  Drawer,
  Collapse,
} from "antd";
import { motion, AnimatePresence, useScroll, useSpring } from "motion/react";
import logoWeb from "../../assets/images/logoweb.png";
import dashboard from "../../assets/images/dashboard-mockup.png";
import qrScanner from "../../assets/images/qr-scanner-ui.png";
import gameUi from "../../assets/images/game-quiz-ui.png";
import SEO from "../../components/SEO";

const { Title, Paragraph } = Typography;
const { useBreakpoint } = Grid;

const C = {
  blue: "#2878B5",
  cyan: "#43A6C6",
  gold: "#F4B942",
  ink: "#183A50",
  muted: "#698294",
  paper: "#F7FBFC",
  line: "#DCEBF0",
  paleBlue: "#E9F7FC",
  paleGold: "#FFF5D8",
  green: "#20977D",
};
const shell = { width: "min(1180px, calc(100% - 44px))", margin: "0 auto" };
const enter = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
  }),
};
const jump = (id) =>
  document
    .getElementById(id)
    ?.scrollIntoView({ behavior: "smooth", block: "start" });

function PageLoader() {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(false), 850);
    return () => window.clearTimeout(timer);
  }, []);
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 10000,
            display: "grid",
            placeItems: "center",
            background:
              "linear-gradient(135deg,#EAF9FF 0%,#FFFFFF 52%,#FFF3D1 100%)",
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            style={{ textAlign: "center" }}
          >
            <div
              style={{
                width: 96,
                height: 96,
                margin: "0 auto 18px",
                position: "relative",
                display: "grid",
                placeItems: "center",
              }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
                style={{
                  position: "absolute",
                  inset: 0,
                  border: `3px solid ${C.blue}25`,
                  borderTopColor: C.gold,
                  borderRightColor: C.cyan,
                  borderRadius: "50%",
                }}
              />
              <div
                style={{
                  width: 70,
                  height: 70,
                  position: "relative",
                  zIndex: 1,
                  borderRadius: 23,
                  background: "#fff",
                  boxShadow: "0 12px 30px #2878B51C",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <img
                  src={logoWeb}
                  alt="FaithEdu"
                  style={{ width: 49, height: 49, objectFit: "contain" }}
                />
              </div>
            </div>
            <div
              style={{
                color: C.blue,
                fontSize: 25,
                fontWeight: 950,
                letterSpacing: -0.8,
              }}
            >
              FaithEdu
            </div>
            <div
              style={{
                color: C.muted,
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: 2,
                marginTop: 7,
              }}
            >
              KHÔNG GIAN GIÁO LÝ SỐ
            </div>
            <div
              style={{
                width: 174,
                height: 4,
                background: "#2878B51A",
                borderRadius: 10,
                overflow: "hidden",
                margin: "18px auto 0",
              }}
            >
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 0.75 }}
                style={{
                  height: "100%",
                  background: `linear-gradient(90deg,${C.cyan},${C.gold})`,
                  borderRadius: 10,
                }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function LandingPage() {
  const screens = useBreakpoint();
  const mobile = !screens.md;
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [videoOpen, setVideoOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 100, damping: 28 });
  const login = () => {
    window.location.href = "https://giaolyso.site";
  };

  const nav = [
    { label: "Nền tảng", id: "platform" },
    { label: "Tính năng", id: "features" },
    { label: "Trải nghiệm", id: "showcase" },
    { label: "Chi phí", id: "pricing" },
    { label: "Hỏi đáp", id: "faq" },
  ];
  const featureTiles = [
    {
      icon: <TeamOutlined />,
      no: "01",
      title: "Lớp học & thiếu nhi",
      desc: "Thông tin lớp, hồ sơ thiếu nhi và dữ liệu gia đình được tổ chức tập trung.",
      tone: "blue",
      span: "large",
    },
    {
      icon: <QrcodeOutlined />,
      no: "02",
      title: "Điểm danh QR",
      desc: "Ghi nhận chuyên cần trong buổi học giáo lý hoặc Thánh lễ.",
      tone: "gold",
    },
    {
      icon: <BarChartOutlined />,
      no: "03",
      title: "Báo cáo & sổ điểm",
      desc: "Theo dõi kết quả và tình hình học tập rõ ràng hơn.",
      tone: "mint",
    },
    {
      icon: <ReadOutlined />,
      no: "04",
      title: "Thư viện bài giảng",
      desc: "Lưu trữ và trình chiếu tài liệu phục vụ giờ học.",
      tone: "lavender",
    },
    {
      icon: <PlaySquareFilled />,
      no: "05",
      title: "Trò chơi tương tác",
      desc: "Làm mới giờ học bằng hoạt động và câu hỏi tương tác.",
      tone: "peach",
    },
    {
      icon: <SafetyCertificateFilled />,
      no: "06",
      title: "Văn bằng & chứng chỉ",
      desc: "Cấu hình mẫu và xuất văn bằng, chứng chỉ theo nhu cầu.",
      tone: "blue",
    },
  ];
  const screensList = [
    {
      key: "overview",
      label: "Tổng quan",
      title: "Mọi thông tin, trong một tầm nhìn",
      desc: "Theo dõi dữ liệu lớp học, thiếu nhi, giáo lý viên và kết quả trên cùng một nền tảng.",
      img: dashboard,
      icon: <BookFilled />,
    },
    {
      key: "attendance",
      label: "Điểm danh QR",
      title: "Điểm danh nhanh, bớt thao tác",
      desc: "Hỗ trợ ghi nhận chuyên cần bằng mã QR và vẫn có thể điểm danh thủ công khi cần.",
      img: qrScanner,
      icon: <QrcodeOutlined />,
    },
    {
      key: "learning",
      label: "Học tập tương tác",
      title: "Giờ giáo lý sinh động hơn",
      desc: "Kết hợp câu hỏi và trò chơi để khuyến khích thiếu nhi tham gia tích cực.",
      img: gameUi,
      icon: <PlaySquareFilled />,
    },
  ];
  const plans = [
    {
      id: "year",
      name: "FAITHEDU 1 NĂM",
      price: "599.000đ",
      unit: "/ năm",
      desc: "Dành cho giáo xứ muốn triển khai và sử dụng theo từng năm.",
      icon: <CalendarOutlined />,
      features: [
        "Sử dụng hệ thống trong thời hạn 1 năm",
        "Quản lý công việc giáo lý trên nền tảng",
        "Phù hợp với kế hoạch ngân sách theo năm",
      ],
      style: "light",
      cta: "Chọn gói 1 năm",
    },
    {
      id: "forever",
      name: "FAITHEDU VĨNH VIỄN",
      price: "2.599.000đ",
      unit: "thanh toán một lần",
      desc: "Đăng ký một lần, sử dụng lâu dài, không giới hạn thời gian.",
      icon: <CrownFilled />,
      features: [
        "Không giới hạn thời gian sử dụng",
        "Thanh toán một lần duy nhất",
        "Phù hợp với kế hoạch dài hạn",
      ],
      style: "featured",
      cta: "Chọn gói vĩnh viễn",
    },
  ];

  return (
    <>
      <SEO
        title="FaithEdu – Nền tảng quản lý giáo lý số"
        description="FaithEdu hỗ trợ giáo xứ số hóa công tác quản lý lớp giáo lý, thiếu nhi, điểm danh và tài liệu giảng dạy."
        path="/intro"
        image="/thumbnail-seo.png"
        imageAlt="FaithEdu – Nền tảng quản lý giáo lý số"
      />
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: C.blue,
            borderRadius: 16,
            fontFamily: '"Be Vietnam Pro", Inter, sans-serif',
          },
        }}
      >
        <PageLoader />
        <motion.div
          style={{
            position: "fixed",
            inset: "0 auto auto 0",
            height: 3,
            width: "100%",
            scaleX: progress,
            transformOrigin: "0%",
            background: `linear-gradient(90deg,${C.gold},${C.cyan},${C.blue})`,
            zIndex: 9999,
          }}
        />
        <style>{`
          html { scroll-behavior: smooth; }
          .fe-nav-link { color:${C.muted}; text-decoration:none; font-weight:750; font-size:13px; transition:color .2s; }
          .fe-nav-link:hover { color:${C.blue}; }
          .fe-section-label { display:inline-flex; align-items:center; gap:8px; border-radius:100px; padding:8px 13px; background:#E9F7FC; color:${C.blue}; font-size:11px; font-weight:900; letter-spacing:1px; }
          .fe-tile { transition:transform .25s, box-shadow .25s; }
          .fe-tile:hover { transform:translateY(-6px) rotate(-.3deg); box-shadow:0 20px 45px #1B597719 !important; }
          .fe-tab { border:1px solid ${C.line}; border-radius:999px; padding:11px 17px; background:white; color:${C.ink}; font-weight:800; cursor:pointer; transition:all .2s; }
          .fe-tab.active { background:${C.blue}; color:white; border-color:${C.blue}; box-shadow:0 8px 18px #2878B52A; }
          .fe-plan-check { display:flex; gap:10px; align-items:flex-start; font-size:13px; line-height:1.6; }
          @media(max-width:767px) { .fe-hide-mobile { display:none !important; } }
          @media(prefers-reduced-motion:reduce) { * { scroll-behavior:auto !important; animation-duration:.01ms !important; transition-duration:.01ms !important; } }
        `}</style>
        <main style={{ overflow: "hidden", background: C.paper, color: C.ink }}>
          {/* NAVIGATION — floating pill rather than the old full-width bar */}
          <header
            style={{
              position: "sticky",
              top: 12,
              zIndex: 1000,
              width: "min(1240px, calc(100% - 28px))",
              margin: "12px auto -82px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 14,
                padding: "12px 15px 12px 19px",
                border: "1px solid #FFFFFF",
                borderRadius: 22,
                background: "#FFFFFFE8",
                backdropFilter: "blur(20px)",
                boxShadow: "0 12px 45px #174B6610",
              }}
            >
              <a
                href="#top"
                onClick={(e) => {
                  e.preventDefault();
                  jump("top");
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  textDecoration: "none",
                  minWidth: 155,
                }}
              >
                <img
                  src={logoWeb}
                  alt="FaithEdu"
                  style={{ width: 40, height: 40, objectFit: "contain" }}
                />
                <span
                  style={{
                    color: C.blue,
                    fontSize: 21,
                    fontWeight: 950,
                    letterSpacing: -0.8,
                  }}
                >
                  FaithEdu
                </span>
              </a>
              {!mobile && (
                <nav style={{ display: "flex", alignItems: "center", gap: 25 }}>
                  {nav.map((n) => (
                    <a
                      key={n.id}
                      className="fe-nav-link"
                      href={`#${n.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        jump(n.id);
                      }}
                    >
                      {n.label}
                    </a>
                  ))}
                </nav>
              )}
              <Space size={8}>
                <Button
                  onClick={login}
                  type="primary"
                  style={{
                    height: 43,
                    borderRadius: 14,
                    fontWeight: 850,
                    paddingInline: 19,
                    boxShadow: "0 8px 20px #2878B529",
                  }}
                >
                  Đăng nhập <ArrowRightOutlined />
                </Button>
                {mobile && (
                  <Button
                    aria-label="Mở menu"
                    icon={<MenuOutlined />}
                    onClick={() => setDrawerOpen(true)}
                    style={{ height: 43, width: 43, borderRadius: 14 }}
                  />
                )}
              </Space>
            </div>
          </header>
          <Drawer
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            placement="right"
            title="Khám phá FaithEdu"
          >
            <Space direction="vertical" size={12} style={{ width: "100%" }}>
              {nav.map((n) => (
                <Button
                  block
                  key={n.id}
                  onClick={() => {
                    setDrawerOpen(false);
                    jump(n.id);
                  }}
                >
                  {n.label}
                </Button>
              ))}
              <Button block type="primary" onClick={login}>
                Đăng nhập
              </Button>
            </Space>
          </Drawer>

          {/* HERO — editorial, asymmetrical, with floating app windows */}
          <section
            id="top"
            style={{
              padding: mobile ? "128px 0 68px" : "150px 0 100px",
              position: "relative",
              background:
                "linear-gradient(125deg,#F7FCFE 0%,#EAF8FD 48%,#FFF5D9 100%)",
            }}
          >
            <div
              style={{
                position: "absolute",
                right: "-7%",
                top: "12%",
                width: mobile ? 230 : 500,
                height: mobile ? 230 : 500,
                borderRadius: "50%",
                background: "#F4B94230",
                filter: "blur(1px)",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: "-110px",
                bottom: "-110px",
                width: 300,
                height: 300,
                borderRadius: "50%",
                border: "1px solid #43A6C650",
              }}
            />
            <div
              style={{
                ...shell,
                display: "grid",
                gridTemplateColumns: mobile ? "1fr" : "0.9fr 1.1fr",
                alignItems: "center",
                gap: mobile ? 45 : 50,
                position: "relative",
              }}
            >
              <motion.div initial="hidden" animate="show" variants={enter}>
                <div className="fe-section-label">
                  <span
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      background: C.gold,
                    }}
                  />{" "}
                  NỀN TẢNG GIÁO LÝ SỐ
                </div>
                <Title
                  level={1}
                  style={{
                    color: C.ink,
                    fontSize: mobile ? 43 : 66,
                    lineHeight: 1.02,
                    letterSpacing: -2.8,
                    fontWeight: 950,
                    margin: "24px 0 20px",
                  }}
                >
                  Việc quản lý
                  <br />
                  gọn hơn.
                  <br />
                  <span style={{ color: C.blue, position: "relative" }}>
                    Giờ giáo lý
                  </span>
                  <br />
                  <span style={{ color: "#D69A12" }}>trọn vẹn hơn.</span>
                </Title>
                <Paragraph
                  style={{
                    maxWidth: 490,
                    color: C.muted,
                    fontSize: 16,
                    lineHeight: 1.9,
                  }}
                >
                  Một không gian số giúp giáo xứ tổ chức lớp học, quản lý thiếu
                  nhi, điểm danh và tài liệu giảng dạy — để dành nhiều tâm huyết
                  hơn cho hành trình đức tin.
                </Paragraph>
                <Space wrap size={12} style={{ marginTop: 14 }}>
                  <Button
                    type="primary"
                    size="large"
                    onClick={() => jump("pricing")}
                    style={{
                      height: 54,
                      borderRadius: 16,
                      paddingInline: 24,
                      fontWeight: 900,
                    }}
                  >
                    Khám phá các gói <ArrowRightOutlined />
                  </Button>
                  <Button
                    size="large"
                    onClick={() => setVideoOpen(true)}
                    icon={<PlayCircleFilled />}
                    style={{
                      height: 54,
                      borderRadius: 16,
                      paddingInline: 20,
                      fontWeight: 800,
                      background: "#FFFFFFB8",
                      borderColor: "#D6E8EF",
                    }}
                  >
                    Xem giới thiệu
                  </Button>
                </Space>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 15,
                    marginTop: 28,
                    color: C.muted,
                    fontSize: 12,
                    fontWeight: 800,
                  }}
                >
                  <span>
                    <CheckOutlined style={{ color: C.green, marginRight: 6 }} />
                    Dữ liệu tập trung
                  </span>
                  <span>
                    <CheckOutlined style={{ color: C.green, marginRight: 6 }} />
                    Điểm danh thuận tiện
                  </span>
                  <span>
                    <CheckOutlined style={{ color: C.green, marginRight: 6 }} />
                    Giao diện trực quan
                  </span>
                </div>
              </motion.div>
              <div
                style={{
                  position: "relative",
                  minWidth: 0,
                  padding: mobile ? "0 4px 38px" : "10px 0 30px 18px",
                }}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.94, rotate: 2 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ duration: 0.8, delay: 0.1 }}
                  style={{
                    background: "#fff",
                    padding: mobile ? 7 : 12,
                    borderRadius: mobile ? 22 : 30,
                    border: "1px solid #FFFFFF",
                    boxShadow: "0 30px 75px #245E741E",
                    transform: "rotate(-1deg)",
                  }}
                >
                  <img
                    src={dashboard}
                    alt="Giao diện tổng quan FaithEdu"
                    style={{
                      width: "100%",
                      display: "block",
                      borderRadius: mobile ? 16 : 22,
                    }}
                  />
                </motion.div>
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{
                    duration: 4.2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  style={{
                    position: "absolute",
                    left: mobile ? 0 : -16,
                    top: mobile ? -20 : 8,
                    display: "flex",
                    gap: 10,
                    alignItems: "center",
                    padding: "12px 15px",
                    borderRadius: 18,
                    background: "#fff",
                    boxShadow: "0 15px 38px #174B6618",
                    border: "1px solid #FFFFFF",
                  }}
                >
                  <span
                    style={{
                      width: 39,
                      height: 39,
                      borderRadius: 13,
                      background: C.paleGold,
                      display: "grid",
                      placeItems: "center",
                      color: "#D69A12",
                      fontSize: 19,
                    }}
                  >
                    <QrcodeOutlined />
                  </span>
                  <span>
                    <b style={{ display: "block", color: C.ink, fontSize: 12 }}>
                      Điểm danh QR
                    </b>
                    <small style={{ color: C.muted }}>
                      Nhanh và thuận tiện
                    </small>
                  </span>
                </motion.div>
                <motion.div
                  animate={{ y: [0, 8, 0], rotate: [1, 0, 1] }}
                  transition={{
                    duration: 4.8,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  style={{
                    position: "absolute",
                    right: mobile ? 0 : -18,
                    bottom: 0,
                    display: "flex",
                    gap: 10,
                    alignItems: "center",
                    padding: "12px 15px",
                    borderRadius: 18,
                    background: C.blue,
                    color: "#fff",
                    boxShadow: "0 15px 38px #174B6630",
                  }}
                >
                  <span
                    style={{
                      width: 39,
                      height: 39,
                      borderRadius: 13,
                      background: "#FFFFFF22",
                      display: "grid",
                      placeItems: "center",
                      color: C.gold,
                      fontSize: 19,
                    }}
                  >
                    <CloudOutlined />
                  </span>
                  <span>
                    <b style={{ display: "block", fontSize: 12 }}>FaithEdu</b>
                    <small style={{ color: "#D8F1F8" }}>
                      Một không gian quản lý
                    </small>
                  </span>
                </motion.div>
              </div>
            </div>
          </section>

          {/* SHORT VALUE STRIP */}
          <section
            aria-label="Lợi ích nổi bật"
            style={{ background: C.blue, color: "#fff", padding: "20px 0" }}
          >
            <div
              style={{
                ...shell,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 15,
              }}
            >
              {[
                [<CloudOutlined />, "Quản lý tập trung"],
                [<QrcodeOutlined />, "Điểm danh thuận tiện"],
                [<BookFilled />, "Tài liệu giảng dạy"],
                [<ThunderboltFilled />, "Tương tác sinh động"],
              ].map(([icon, label]) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    fontSize: 12,
                    fontWeight: 850,
                  }}
                >
                  <span style={{ color: C.gold, fontSize: 19 }}>{icon}</span>
                  {label}
                </div>
              ))}
            </div>
          </section>

          {/* FEATURE MOSAIC — not the previous uniform grid */}
          <section
            id="features"
            style={{
              padding: mobile ? "72px 0" : "110px 0",
              background: "#fff",
            }}
          >
            <div style={shell}>
              <motion.div
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                variants={enter}
                style={{
                  display: "flex",
                  flexDirection: mobile ? "column" : "row",
                  alignItems: mobile ? "flex-start" : "end",
                  justifyContent: "space-between",
                  gap: 22,
                  marginBottom: 34,
                }}
              >
                <div style={{ maxWidth: 670 }}>
                  <div className="fe-section-label">
                    MỘT NỀN TẢNG · NHIỀU TIỆN ÍCH
                  </div>
                  <Title
                    level={2}
                    style={{
                      color: C.ink,
                      fontWeight: 950,
                      letterSpacing: -1.5,
                      fontSize: mobile ? 34 : 49,
                      lineHeight: 1.08,
                      margin: "18px 0 0",
                    }}
                  >
                    Ít việc vụn vặt hơn.
                    <br />
                    <span style={{ color: C.blue }}>
                      Thêm thời gian đồng hành.
                    </span>
                  </Title>
                </div>
                <Paragraph
                  style={{
                    maxWidth: 390,
                    color: C.muted,
                    lineHeight: 1.9,
                    marginBottom: 4,
                  }}
                >
                  Các công cụ được gom vào cùng một nơi, giúp công tác giáo lý
                  được tổ chức rõ ràng và thuận tiện hơn.
                </Paragraph>
              </motion.div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: mobile ? "1fr" : "repeat(6, 1fr)",
                  gap: 15,
                }}
              >
                {featureTiles.map((f, i) => {
                  const backgrounds = {
                    blue: "#EAF7FC",
                    gold: "#FFF5D8",
                    mint: "#E7F8F1",
                    lavender: "#F0EDFF",
                    peach: "#FFF0E8",
                  };
                  const iconColors = {
                    blue: C.blue,
                    gold: "#D39A13",
                    mint: "#21866F",
                    lavender: "#7968D5",
                    peach: "#D47C48",
                  };
                  return (
                    <motion.div
                      key={f.no}
                      custom={i}
                      initial="hidden"
                      whileInView="show"
                      viewport={{ once: true }}
                      variants={enter}
                      className="fe-tile"
                      style={{
                        gridColumn:
                          !mobile && f.span === "large"
                            ? "span 4"
                            : !mobile
                              ? "span 2"
                              : "auto",
                        minHeight: mobile ? 205 : i === 0 ? 250 : 220,
                        padding: mobile ? 23 : 28,
                        borderRadius: 26,
                        background: backgrounds[f.tone],
                        boxShadow: "0 8px 30px #174B6608",
                        border: "1px solid #FFFFFF",
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          position: "relative",
                          zIndex: 1,
                        }}
                      >
                        <div
                          style={{
                            width: 52,
                            height: 52,
                            borderRadius: 17,
                            background: "#FFFFFFC9",
                            display: "grid",
                            placeItems: "center",
                            color: iconColors[f.tone],
                            fontSize: 23,
                            boxShadow: "0 7px 20px #174B6609",
                          }}
                        >
                          {f.icon}
                        </div>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 900,
                            letterSpacing: 1.5,
                            color: `${iconColors[f.tone]}9C`,
                          }}
                        >
                          {f.no}
                        </span>
                      </div>
                      <Title
                        level={4}
                        style={{
                          position: "relative",
                          zIndex: 1,
                          color: C.ink,
                          fontWeight: 900,
                          fontSize: 20,
                          margin: "25px 0 9px",
                        }}
                      >
                        {f.title}
                      </Title>
                      <Paragraph
                        style={{
                          position: "relative",
                          zIndex: 1,
                          maxWidth: 390,
                          color: C.muted,
                          lineHeight: 1.75,
                          margin: 0,
                        }}
                      >
                        {f.desc}
                      </Paragraph>
                      <div
                        style={{
                          position: "absolute",
                          right: -28,
                          bottom: -48,
                          width: 145,
                          height: 145,
                          borderRadius: "50%",
                          border: `1px solid ${iconColors[f.tone]}22`,
                        }}
                      />
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* PLATFORM SECTION — editorial split + selectable feature screens */}
          <section
            id="platform"
            style={{
              padding: mobile ? "68px 0 78px" : "100px 0",
              background:
                "linear-gradient(135deg,#F0FAFD 0%,#F9FCFD 60%,#FFF7E4 100%)",
            }}
          >
            <div style={shell}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: mobile ? "1fr" : ".68fr 1.32fr",
                  gap: mobile ? 28 : 65,
                  alignItems: "start",
                }}
              >
                <motion.div
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true }}
                  variants={enter}
                >
                  <div className="fe-section-label">BƯỚC VÀO KHÔNG GIAN SỐ</div>
                  <Title
                    level={2}
                    style={{
                      color: C.ink,
                      fontWeight: 950,
                      fontSize: mobile ? 33 : 43,
                      lineHeight: 1.1,
                      letterSpacing: -1.3,
                      margin: "18px 0",
                    }}
                  >
                    Dễ quan sát.
                    <br />
                    <span style={{ color: C.blue }}>Dễ thao tác.</span>
                  </Title>
                  <Paragraph style={{ color: C.muted, lineHeight: 1.9 }}>
                    Khám phá một số khu vực giao diện minh họa của FaithEdu.
                  </Paragraph>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 9,
                      marginTop: 23,
                    }}
                  >
                    {screensList.map((s) => (
                      <button
                        key={s.key}
                        onClick={() => setActiveTab(s.key)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 13,
                          textAlign: "left",
                          padding: "14px 15px",
                          borderRadius: 17,
                          border:
                            activeTab === s.key
                              ? `1px solid ${C.blue}`
                              : "1px solid transparent",
                          background:
                            activeTab === s.key ? "#FFFFFF" : "transparent",
                          boxShadow:
                            activeTab === s.key
                              ? "0 10px 28px #174B660D"
                              : "none",
                          cursor: "pointer",
                          color: C.ink,
                        }}
                      >
                        <span
                          style={{
                            width: 42,
                            height: 42,
                            flexShrink: 0,
                            display: "grid",
                            placeItems: "center",
                            borderRadius: 13,
                            background:
                              activeTab === s.key ? C.blue : "#FFFFFFB8",
                            color: activeTab === s.key ? "#fff" : C.blue,
                            fontSize: 18,
                          }}
                        >
                          {s.icon}
                        </span>
                        <span>
                          <b
                            style={{
                              display: "block",
                              fontSize: 14,
                              fontWeight: 900,
                            }}
                          >
                            {s.label}
                          </b>
                          <small style={{ color: C.muted }}>
                            Xem giao diện minh họa
                          </small>
                        </span>
                        {activeTab === s.key && (
                          <ArrowRightOutlined
                            style={{ marginLeft: "auto", color: C.blue }}
                          />
                        )}
                      </button>
                    ))}
                  </div>
                </motion.div>
                <AnimatePresence mode="wait">
                  {screensList
                    .filter((s) => s.key === activeTab)
                    .map((s) => (
                      <motion.div
                        key={s.key}
                        initial={{ opacity: 0, x: 18, scale: 0.985 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: -12 }}
                        transition={{ duration: 0.3 }}
                        style={{ minWidth: 0 }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: 10,
                            marginBottom: 12,
                          }}
                        >
                          <div
                            style={{
                              fontSize: 12,
                              fontWeight: 900,
                              letterSpacing: 1,
                              color: C.blue,
                            }}
                          >
                            FAITHEDU / {s.label.toUpperCase()}
                          </div>
                          <div style={{ display: "flex", gap: 5 }}>
                            <i
                              style={{
                                width: 7,
                                height: 7,
                                background: "#FF8178",
                                borderRadius: "50%",
                              }}
                            />
                            <i
                              style={{
                                width: 7,
                                height: 7,
                                background: C.gold,
                                borderRadius: "50%",
                              }}
                            />
                            <i
                              style={{
                                width: 7,
                                height: 7,
                                background: "#6ACBA7",
                                borderRadius: "50%",
                              }}
                            />
                          </div>
                        </div>
                        <div
                          style={{
                            padding: mobile ? 8 : 12,
                            borderRadius: 25,
                            background: "#FFFFFF",
                            border: "1px solid #FFFFFF",
                            boxShadow: "0 25px 70px #174B6618",
                          }}
                        >
                          <div
                            style={{
                              overflow: "hidden",
                              borderRadius: 16,
                              background: "#F6FBFD",
                            }}
                          >
                            <img
                              src={s.img}
                              alt={s.label}
                              style={{
                                display: "block",
                                width: "100%",
                                maxHeight: 470,
                                objectFit: "contain",
                              }}
                            />
                          </div>
                        </div>
                        <div
                          style={{
                            padding: "19px 4px 0",
                            display: "flex",
                            alignItems: mobile ? "flex-start" : "center",
                            flexDirection: mobile ? "column" : "row",
                            justifyContent: "space-between",
                            gap: 14,
                          }}
                        >
                          <div>
                            <Title
                              level={4}
                              style={{
                                color: C.ink,
                                fontWeight: 900,
                                margin: "0 0 6px",
                              }}
                            >
                              {s.title}
                            </Title>
                            <Paragraph
                              style={{
                                color: C.muted,
                                lineHeight: 1.75,
                                margin: 0,
                                maxWidth: 580,
                              }}
                            >
                              {s.desc}
                            </Paragraph>
                          </div>
                          <Button
                            type="primary"
                            onClick={() => jump("pricing")}
                            style={{
                              height: 45,
                              borderRadius: 14,
                              fontWeight: 850,
                              flexShrink: 0,
                            }}
                          >
                            Xem bảng giá <ArrowRightOutlined />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                </AnimatePresence>
              </div>
            </div>
          </section>

          {/* PRICING — two editorial plan panels */}
          <section
            id="pricing"
            style={{
              padding: mobile ? "75px 0" : "112px 0",
              background: "#fff",
              position: "relative",
            }}
          >
            <div style={shell}>
              <motion.div
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                variants={enter}
                style={{
                  maxWidth: 730,
                  margin: "0 auto 45px",
                  textAlign: "center",
                }}
              >
                <div
                  className="fe-section-label"
                  style={{ background: C.paleGold, color: "#B47C00" }}
                >
                  BẢNG GIÁ RÕ RÀNG
                </div>
                <Title
                  level={2}
                  style={{
                    color: C.ink,
                    fontWeight: 950,
                    fontSize: mobile ? 35 : 50,
                    letterSpacing: -1.5,
                    lineHeight: 1.08,
                    margin: "18px 0 12px",
                  }}
                >
                  Chọn nhịp đi phù hợp
                  <br />
                  <span style={{ color: C.blue }}>với giáo xứ của bạn.</span>
                </Title>
                <Paragraph style={{ color: C.muted, lineHeight: 1.8 }}>
                  Hai lựa chọn đơn giản theo kế hoạch sử dụng của giáo xứ.
                </Paragraph>
              </motion.div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: mobile ? "1fr" : "1fr 1fr",
                  gap: 18,
                  maxWidth: 1000,
                  margin: "0 auto",
                }}
              >
                {plans.map((p, i) => {
                  const featured = p.style === "featured";
                  return (
                    <motion.div
                      key={p.id}
                      custom={i}
                      initial="hidden"
                      whileInView="show"
                      viewport={{ once: true }}
                      variants={enter}
                      whileHover={{ y: -6 }}
                      style={{
                        borderRadius: 28,
                        padding: mobile ? 25 : 34,
                        position: "relative",
                        overflow: "hidden",
                        background: featured
                          ? "linear-gradient(145deg,#2878B5 0%,#43A6C6 100%)"
                          : "#F5FBFD",
                        border: featured
                          ? `2px solid ${C.gold}`
                          : `1px solid ${C.line}`,
                        boxShadow: featured
                          ? "0 22px 55px #2878B52B"
                          : "0 15px 40px #174B660A",
                      }}
                    >
                      {featured && (
                        <div
                          style={{
                            position: "absolute",
                            top: 0,
                            right: 0,
                            borderRadius: "0 0 0 18px",
                            background: C.gold,
                            color: C.ink,
                            padding: "10px 15px",
                            fontSize: 10,
                            fontWeight: 950,
                            letterSpacing: 1,
                          }}
                        >
                          DÀI HẠN
                        </div>
                      )}
                      <div
                        style={{
                          width: 54,
                          height: 54,
                          display: "grid",
                          placeItems: "center",
                          borderRadius: 17,
                          background: featured ? "#FFFFFF22" : "#FFFFFF",
                          color: featured ? C.gold : C.blue,
                          fontSize: 23,
                          boxShadow: "0 6px 18px #174B660B",
                        }}
                      >
                        {p.icon}
                      </div>
                      <div
                        style={{
                          color: featured ? "#D8F2FA" : C.muted,
                          fontSize: 11,
                          fontWeight: 950,
                          letterSpacing: 1.4,
                          marginTop: 23,
                        }}
                      >
                        {p.name}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "baseline",
                          flexWrap: "wrap",
                          gap: 7,
                          margin: "12px 0 10px",
                        }}
                      >
                        <span
                          style={{
                            color: featured ? "#fff" : C.ink,
                            fontSize: mobile ? 35 : 43,
                            lineHeight: 1.12,
                            fontWeight: 950,
                            letterSpacing: -1.5,
                          }}
                        >
                          {p.price}
                        </span>
                        <span
                          style={{
                            color: featured ? "#D8F2FA" : C.muted,
                            fontSize: 13,
                            fontWeight: 750,
                          }}
                        >
                          {p.unit}
                        </span>
                      </div>
                      <Paragraph
                        style={{
                          color: featured ? "#E5F6FB" : C.muted,
                          lineHeight: 1.8,
                          minHeight: 55,
                        }}
                      >
                        {p.desc}
                      </Paragraph>
                      <Divider
                        style={{
                          borderColor: featured ? "#FFFFFF38" : C.line,
                          margin: "23px 0",
                        }}
                      />
                      <Space
                        direction="vertical"
                        size={14}
                        style={{ width: "100%" }}
                      >
                        {p.features.map((f) => (
                          <div key={f} className="fe-plan-check">
                            <span
                              style={{
                                flexShrink: 0,
                                display: "grid",
                                placeItems: "center",
                                width: 22,
                                height: 22,
                                borderRadius: "50%",
                                background: featured ? "#FFFFFF22" : "#DFF5EC",
                                color: featured ? C.gold : C.green,
                                fontSize: 11,
                              }}
                            >
                              <CheckOutlined />
                            </span>
                            <span style={{ color: featured ? "#fff" : C.ink }}>
                              {f}
                            </span>
                          </div>
                        ))}
                      </Space>
                      <Button
                        block
                        size="large"
                        onClick={login}
                        style={{
                          height: 53,
                          borderRadius: 15,
                          marginTop: 30,
                          fontWeight: 950,
                          background: featured ? C.gold : C.blue,
                          color: featured ? C.ink : "#fff",
                          border: 0,
                          boxShadow: featured
                            ? "0 8px 22px #113C5729"
                            : "0 8px 22px #2878B522",
                        }}
                      >
                        {p.cta} <ArrowRightOutlined />
                      </Button>
                      <div
                        style={{
                          color: featured ? "#D8F2FA" : C.muted,
                          textAlign: "center",
                          marginTop: 13,
                          fontSize: 11,
                        }}
                      >
                        Đăng nhập để tiếp tục đăng ký
                      </div>
                    </motion.div>
                  );
                })}
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 9,
                  color: C.muted,
                  fontSize: 12,
                  textAlign: "center",
                  marginTop: 25,
                }}
              >
                <SafetyCertificateFilled
                  style={{ color: "#D39A13", fontSize: 17 }}
                />{" "}
                Vui lòng kiểm tra thông tin gói trước khi xác nhận đăng ký.
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section
            id="faq"
            style={{
              padding: mobile ? "65px 0" : "88px 0",
              background: "#F0F9FC",
            }}
          >
            <div style={{ ...shell, maxWidth: 880 }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: mobile ? "1fr" : ".7fr 1.3fr",
                  gap: 28,
                  alignItems: "start",
                }}
              >
                <div>
                  <div className="fe-section-label">HỎI ĐÁP</div>
                  <Title
                    level={2}
                    style={{
                      color: C.ink,
                      fontWeight: 950,
                      fontSize: mobile ? 34 : 43,
                      lineHeight: 1.1,
                      letterSpacing: -1.2,
                      margin: "17px 0 10px",
                    }}
                  >
                    Bạn cần biết thêm điều gì?
                  </Title>
                  <Paragraph style={{ color: C.muted, lineHeight: 1.8 }}>
                    Một vài câu hỏi thường gặp về việc sử dụng FaithEdu.
                  </Paragraph>
                </div>
                <Collapse
                  accordion
                  bordered={false}
                  style={{ background: "transparent" }}
                  expandIconPosition="end"
                  items={[
                    {
                      key: "1",
                      label: (
                        <strong style={{ color: C.ink }}>
                          Gói 1 năm và gói vĩnh viễn khác nhau thế nào?
                        </strong>
                      ),
                      children: (
                        <p
                          style={{ color: C.muted, lineHeight: 1.8, margin: 0 }}
                        >
                          Gói 1 năm có giá 599.000đ/năm. Gói vĩnh viễn có giá
                          2.599.000đ, đăng ký một lần và sử dụng lâu dài, không
                          giới hạn thời gian.
                        </p>
                      ),
                    },
                    {
                      key: "2",
                      label: (
                        <strong style={{ color: C.ink }}>
                          Tôi đăng ký hoặc quản lý tài khoản ở đâu?
                        </strong>
                      ),
                      children: (
                        <p
                          style={{ color: C.muted, lineHeight: 1.8, margin: 0 }}
                        >
                          Bạn có thể nhấn nút đăng nhập hoặc chọn gói để truy
                          cập hệ thống FaithEdu tại giaolyso.site.
                        </p>
                      ),
                    },
                    {
                      key: "3",
                      label: (
                        <strong style={{ color: C.ink }}>
                          FaithEdu hỗ trợ những công việc nào?
                        </strong>
                      ),
                      children: (
                        <p
                          style={{ color: C.muted, lineHeight: 1.8, margin: 0 }}
                        >
                          FaithEdu hỗ trợ quản lý lớp, thiếu nhi, giáo lý viên,
                          điểm danh, thư viện bài giảng, trò chơi tương tác và
                          theo dõi kết quả.
                        </p>
                      ),
                    },
                  ]}
                />
              </div>
            </div>
          </section>

          {/* FOOTER — split bright brand panel */}
          <footer
            style={{
              background: C.ink,
              color: "#fff",
              padding: mobile ? "48px 0 20px" : "66px 0 24px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                right: "-60px",
                top: "-140px",
                width: 330,
                height: 330,
                borderRadius: "50%",
                border: "1px solid #FFFFFF17",
              }}
            />
            <div style={{ ...shell, position: "relative" }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: mobile ? "1fr" : "1.4fr .7fr 1fr",
                  gap: 35,
                }}
              >
                <div>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <img
                      src={logoWeb}
                      alt="FaithEdu"
                      style={{
                        width: 48,
                        height: 48,
                        objectFit: "contain",
                        background: "#fff",
                        borderRadius: 15,
                        padding: 4,
                      }}
                    />
                    <span style={{ fontSize: 25, fontWeight: 950 }}>
                      FaithEdu
                    </span>
                  </div>
                  <Paragraph
                    style={{
                      color: "#BCD0D9",
                      lineHeight: 1.85,
                      marginTop: 16,
                      maxWidth: 360,
                    }}
                  >
                    Nền tảng giáo lý số đồng hành cùng giáo xứ trong công tác
                    quản lý và giảng dạy.
                  </Paragraph>
                  <div style={{ display: "flex", gap: 7, marginTop: 18 }}>
                    <span
                      style={{
                        background: "#FFFFFF12",
                        border: "1px solid #FFFFFF20",
                        padding: "7px 10px",
                        borderRadius: 10,
                        fontSize: 10,
                        fontWeight: 850,
                        color: "#D5EBF3",
                      }}
                    >
                      QUẢN LÝ
                    </span>
                    <span
                      style={{
                        background: "#FFFFFF12",
                        border: "1px solid #FFFFFF20",
                        padding: "7px 10px",
                        borderRadius: 10,
                        fontSize: 10,
                        fontWeight: 850,
                        color: "#D5EBF3",
                      }}
                    >
                      KẾT NỐI
                    </span>
                  </div>
                </div>
                <div>
                  <div style={{ fontWeight: 900, marginBottom: 16 }}>
                    Khám phá
                  </div>
                  <Space direction="vertical" size={11}>
                    {nav.map((n) => (
                      <button
                        key={n.id}
                        onClick={() => jump(n.id)}
                        style={{
                          border: 0,
                          background: "transparent",
                          color: "#BCD0D9",
                          padding: 0,
                          cursor: "pointer",
                          textAlign: "left",
                        }}
                      >
                        {n.label}
                      </button>
                    ))}
                  </Space>
                </div>
                <div>
                  <div style={{ fontWeight: 900, marginBottom: 16 }}>
                    Liên hệ hỗ trợ
                  </div>
                  <Space
                    direction="vertical"
                    size={13}
                    style={{ color: "#BCD0D9", fontSize: 13 }}
                  >
                    <div>
                      <PhoneFilled style={{ color: C.gold, marginRight: 9 }} />
                      033.604.1807
                    </div>
                    <div>
                      <MailFilled style={{ color: C.gold, marginRight: 9 }} />
                      tranhung6829@gmail.com
                    </div>
                    <div>
                      <FacebookFilled
                        style={{ color: C.gold, marginRight: 9 }}
                      />
                      FaithEdu Việt Nam
                    </div>
                  </Space>
                </div>
              </div>
              <Divider
                style={{ borderColor: "#FFFFFF1F", margin: "35px 0 18px" }}
              />
              <div
                style={{
                  display: "flex",
                  flexDirection: mobile ? "column" : "row",
                  justifyContent: "space-between",
                  gap: 8,
                  color: "#94B0BC",
                  fontSize: 11,
                }}
              >
                <span>
                  © {new Date().getFullYear()} FaithEdu. Bảo lưu mọi quyền.
                </span>
                <span>
                  Đồng hành cùng hành trình giáo lý{" "}
                  <HeartFilled style={{ color: C.gold, margin: "0 4px" }} />
                </span>
              </div>
            </div>
          </footer>
          <Modal
            open={videoOpen}
            onCancel={() => setVideoOpen(false)}
            footer={null}
            centered
            width={760}
            destroyOnClose
            title="Giới thiệu FaithEdu"
          >
            <div
              style={{
                padding: 20,
                background: C.paleBlue,
                borderRadius: 16,
                color: C.muted,
                lineHeight: 1.8,
              }}
            >
              FaithEdu là nền tảng hỗ trợ giáo xứ quản lý lớp giáo lý, thiếu
              nhi, giáo lý viên, điểm danh và tài liệu giảng dạy. Bạn có thể
              đăng nhập để khám phá hệ thống.
              <div style={{ marginTop: 18 }}>
                <Button type="primary" onClick={login}>
                  Truy cập FaithEdu <ArrowRightOutlined />
                </Button>
              </div>
            </div>
          </Modal>
        </main>
      </ConfigProvider>
    </>
  );
}
