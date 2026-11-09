import React, { useEffect, useMemo, useState } from "react";
import { Modal, Input, Collapse, Empty } from "antd";
import {
  SearchOutlined,
  HomeOutlined,
  TeamOutlined,
  UserOutlined,
  ScanOutlined,
  BarChartOutlined,
  BookOutlined,
  QuestionCircleOutlined,
  ArrowRightOutlined,
  ArrowLeftOutlined,
  CloseOutlined,
  CheckCircleFilled,
  PlayCircleOutlined,
  SafetyCertificateOutlined,
  GlobalOutlined,
  BulbOutlined,
  FileExcelOutlined,
  QrcodeOutlined,
  InfoCircleOutlined,
  AppstoreOutlined,
  RightOutlined,
} from "@ant-design/icons";

import logoWeb from "../assets/images/logoweb.png";

// ============================================================
// COLOR SYSTEM
// ============================================================

// const COLORS = {
//   navy: "#173B5E",
//   navyDark: "#102D49",
//   gold: "#D9A441",
//   background: "#F6F8FC",
//   white: "#FFFFFF",
//   text: "#243449",
//   secondary: "#64748B",
//   border: "#E7EDF4",
// };

// ============================================================
// HELP CATEGORIES
// ============================================================

const CATEGORIES = [
  {
    key: "all",
    title: "Tất cả hướng dẫn",
    icon: <AppstoreOutlined />,
  },
  {
    key: "getting-started",
    title: "Bắt đầu sử dụng",
    icon: <HomeOutlined />,
  },
  {
    key: "classes",
    title: "Quản lý lớp học",
    icon: <TeamOutlined />,
  },
  {
    key: "students",
    title: "Quản lý học sinh",
    icon: <UserOutlined />,
  },
  {
    key: "attendance",
    title: "Điểm danh QR",
    icon: <ScanOutlined />,
  },
  {
    key: "results",
    title: "Điểm & báo cáo",
    icon: <BarChartOutlined />,
  },
];

// ============================================================
// HELP ARTICLES
// Có thể mở rộng bằng API sau này.
// ============================================================

const ARTICLES = [
  {
    id: "create-account",
    category: "getting-started",
    title: "Đăng ký tài khoản FaithEdu",
    description: "Hướng dẫn tạo tài khoản mới và xác thực email.",
    icon: <UserOutlined />,
    duration: "3 phút",
    featured: true,
    steps: [
      {
        title: "Truy cập trang đăng ký",
        content: "Mở website FaithEdu và chọn chức năng Đăng ký tài khoản.",
      },
      {
        title: "Nhập thông tin",
        content: "Điền đầy đủ các thông tin cần thiết theo biểu mẫu đăng ký.",
      },
      {
        title: "Xác thực email",
        content:
          "Kiểm tra hộp thư email, lấy mã xác thực và nhập mã vào hệ thống.",
      },
      {
        title: "Hoàn tất",
        content:
          "Sau khi xác thực thành công, đăng nhập bằng tài khoản vừa tạo.",
      },
    ],
    note: "Nên sử dụng email thật để có thể nhận mã xác thực và khôi phục mật khẩu.",
  },
  {
    id: "login",
    category: "getting-started",
    title: "Đăng nhập vào hệ thống",
    description: "Truy cập vào tài khoản quản lý giáo xứ.",
    icon: <SafetyCertificateOutlined />,
    duration: "1 phút",
    steps: [
      {
        title: "Mở FaithEdu",
        content: "Truy cập website FaithEdu và mở trang đăng nhập.",
      },
      {
        title: "Nhập thông tin",
        content: "Nhập thông tin tài khoản và mật khẩu đã đăng ký.",
      },
      {
        title: "Truy cập hệ thống",
        content: "Chọn Đăng nhập để vào giao diện phù hợp với quyền tài khoản.",
      },
    ],
  },
  {
    id: "create-class",
    category: "classes",
    title: "Tạo lớp học mới",
    description: "Tạo lớp giáo lý và quản lý thông tin lớp.",
    icon: <TeamOutlined />,
    duration: "2 phút",
    featured: true,
    steps: [
      {
        title: "Mở Quản lý lớp học",
        content: "Từ menu quản trị, chọn mục Lớp học.",
      },
      {
        title: "Chọn tạo lớp",
        content: "Nhấn chức năng tạo lớp mới.",
      },
      {
        title: "Nhập thông tin",
        content: "Điền tên lớp và những thông tin khác theo biểu mẫu.",
      },
      {
        title: "Lưu lớp học",
        content: "Kiểm tra lại thông tin và chọn Tạo mới để hoàn tất.",
      },
    ],
  },
  {
    id: "student-create",
    category: "students",
    title: "Thêm học sinh mới",
    description: "Tạo hồ sơ học sinh và phân vào lớp.",
    icon: <UserOutlined />,
    duration: "2 phút",
    featured: true,
    steps: [
      {
        title: "Mở Quản lý học sinh",
        content: "Truy cập mục quản lý học sinh từ menu.",
      },
      {
        title: "Thêm học sinh",
        content: "Chọn chức năng tạo học sinh mới.",
      },
      {
        title: "Nhập thông tin",
        content: "Điền thông tin học sinh và lựa chọn lớp phù hợp.",
      },
      {
        title: "Lưu hồ sơ",
        content: "Chọn Tạo mới và kiểm tra học sinh trong danh sách.",
      },
    ],
  },
  {
    id: "student-import",
    category: "students",
    title: "Nhập danh sách bằng Excel",
    description: "Thêm nhiều học sinh nhanh chóng từ một file Excel.",
    icon: <FileExcelOutlined />,
    duration: "4 phút",
    steps: [
      {
        title: "Tải file Excel mẫu",
        content:
          "Mở chức năng Import học sinh và tải file Excel mẫu do hệ thống cung cấp.",
      },
      {
        title: "Chuẩn bị dữ liệu",
        content: "Điền danh sách học sinh vào đúng các cột của file mẫu.",
      },
      {
        title: "Import dữ liệu",
        content: "Chọn file Excel đã chuẩn bị và tải lên hệ thống.",
      },
      {
        title: "Kiểm tra kết quả",
        content:
          "Kiểm tra danh sách sau khi nhập để phát hiện thông tin thiếu hoặc trùng.",
      },
    ],
    note: "Không nên tự ý đổi tên hoặc xóa các cột bắt buộc trong file mẫu.",
  },
  {
    id: "student-transfer",
    category: "students",
    title: "Chuyển lớp cho học sinh",
    description: "Chuyển một hoặc nhiều học sinh sang lớp khác.",
    icon: <TeamOutlined />,
    duration: "2 phút",
    steps: [
      {
        title: "Mở danh sách học sinh",
        content: "Truy cập Quản lý học sinh và tìm học sinh cần chuyển.",
      },
      {
        title: "Chọn học sinh",
        content: "Chọn một học sinh hoặc nhiều học sinh cần chuyển lớp.",
      },
      {
        title: "Chọn lớp mới",
        content: "Sử dụng chức năng chuyển lớp và chọn lớp đích.",
      },
      {
        title: "Xác nhận",
        content: "Kiểm tra danh sách và xác nhận thao tác chuyển lớp.",
      },
    ],
  },
  {
    id: "qr-attendance",
    category: "attendance",
    title: "Điểm danh bằng mã QR",
    description: "Quét mã QR để ghi nhận sự hiện diện của học sinh.",
    icon: <ScanOutlined />,
    duration: "3 phút",
    featured: true,
    steps: [
      {
        title: "Chuẩn bị mã QR",
        content: "Mở thông tin QR của học sinh hoặc chuẩn bị mã QR đã được in.",
      },
      {
        title: "Mở chức năng điểm danh",
        content: "Truy cập khu vực điểm danh QR trong FaithEdu.",
      },
      {
        title: "Quét mã học sinh",
        content: "Sử dụng thiết bị hỗ trợ quét mã QR để nhận diện học sinh.",
      },
      {
        title: "Kiểm tra kết quả",
        content: "Kiểm tra danh sách điểm danh và thông tin đã được ghi nhận.",
      },
    ],
  },
  {
    id: "qr-download",
    category: "attendance",
    title: "Tải mã QR học sinh",
    description: "Xuất mã QR để thuận tiện in ấn và điểm danh.",
    icon: <QrcodeOutlined />,
    duration: "2 phút",
    steps: [
      {
        title: "Mở Quản lý học sinh",
        content: "Truy cập danh sách học sinh trong hệ thống.",
      },
      {
        title: "Chọn chức năng QR",
        content:
          "Xem mã QR của từng học sinh hoặc sử dụng chức năng tải bộ mã QR.",
      },
      {
        title: "Lưu file",
        content: "Tải file ZIP chứa mã QR về thiết bị.",
      },
      {
        title: "Chuẩn bị sử dụng",
        content: "Giải nén và in mã QR khi cần phục vụ điểm danh.",
      },
    ],
  },
  {
    id: "scores",
    category: "results",
    title: "Quản lý kết quả học tập",
    description: "Xem và nhập kết quả theo các đầu điểm đã cấu hình.",
    icon: <BookOutlined />,
    duration: "3 phút",
    steps: [
      {
        title: "Truy cập khu vực kết quả",
        content: "Mở chức năng quản lý kết quả học tập.",
      },
      {
        title: "Chọn lớp học",
        content: "Xác định lớp và học sinh cần nhập hoặc xem điểm.",
      },
      {
        title: "Nhập kết quả",
        content: "Chọn đầu điểm tương ứng và nhập điểm kiểm tra.",
      },
      {
        title: "Kiểm tra",
        content: "Kiểm tra lại điểm và thông tin học kỳ trước khi hoàn tất.",
      },
    ],
  },
  {
    id: "excel-export",
    category: "results",
    title: "Xuất bảng điểm Excel",
    description: "Tải bảng điểm lớp học để lưu trữ và tổng hợp.",
    icon: <FileExcelOutlined />,
    duration: "2 phút",
    steps: [
      {
        title: "Chọn lớp cần xuất",
        content: "Mở bảng kết quả học tập và chọn lớp cần lấy dữ liệu.",
      },
      {
        title: "Xuất Excel",
        content: "Chọn chức năng xuất bảng điểm Excel.",
      },
      {
        title: "Kiểm tra file",
        content:
          "Mở file Excel để kiểm tra điểm từng học kỳ, điểm trung bình và danh sách học sinh.",
      },
    ],
  },
];

// ============================================================
// FAQ DATA
// ============================================================

const FAQS = [
  {
    key: "1",
    label: "Quên mật khẩu thì phải làm sao?",
    children:
      "Sử dụng chức năng Quên mật khẩu tại trang đăng nhập. Nhập địa chỉ email thật có thể nhận thư để lấy mã xác thực và thực hiện đặt lại mật khẩu.",
  },
  {
    key: "2",
    label: "Có thể nhập nhiều học sinh cùng lúc không?",
    children:
      "Có. Bạn có thể sử dụng chức năng Import Excel trong phần quản lý học sinh. Hãy tải đúng file mẫu của hệ thống trước khi nhập dữ liệu.",
  },
  {
    key: "3",
    label: "Làm thế nào để lấy mã QR của học sinh?",
    children:
      "Truy cập Quản lý học sinh, xem mã QR của học sinh hoặc sử dụng chức năng tải bộ mã QR để lưu và in.",
  },
  {
    key: "4",
    label: "Có thể chuyển nhiều học sinh sang lớp khác không?",
    children:
      "Có. Tại trang Quản lý học sinh, chọn các học sinh cần chuyển và sử dụng chức năng chuyển lớp hàng loạt nếu tài khoản có quyền thực hiện.",
  },
  {
    key: "5",
    label: "Không thấy một chức năng trong menu?",
    children:
      "Một số chức năng phụ thuộc vào quyền tài khoản. Bạn nên kiểm tra quyền truy cập hoặc liên hệ người quản trị của giáo xứ.",
  },
];

// ============================================================
// SEARCH UTIL
// ============================================================

const normalizeText = (value) =>
  String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .trim();

// ============================================================
// HELP MODAL
// ============================================================

const HelpModalCate = ({ open, onClose }) => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeArticle, setActiveArticle] = useState(null);
  const [search, setSearch] = useState("");
  const [showFaq, setShowFaq] = useState(false);

  // Reset khi mở lại modal.
  useEffect(() => {
    if (open) {
      setActiveCategory("all");
      setActiveArticle(null);
      setSearch("");
      setShowFaq(false);
    }
  }, [open]);

  // ==========================================================
  // FILTER ARTICLES
  // ==========================================================

  const filteredArticles = useMemo(() => {
    const keyword = normalizeText(search);

    return ARTICLES.filter((article) => {
      const categoryMatch =
        activeCategory === "all" || article.category === activeCategory;

      const category = CATEGORIES.find((item) => item.key === article.category);

      const searchableText = normalizeText(
        [
          article.title,
          article.description,
          category?.title,
          ...article.steps.flatMap((step) => [step.title, step.content]),
        ].join(" "),
      );

      const keywordMatch = !keyword || searchableText.includes(keyword);

      return categoryMatch && keywordMatch;
    });
  }, [activeCategory, search]);

  const featuredArticles = useMemo(
    () => ARTICLES.filter((article) => article.featured),
    [],
  );

  const currentCategory = CATEGORIES.find(
    (item) => item.key === activeCategory,
  );

  const openArticle = (article) => {
    setActiveArticle(article);
    setShowFaq(false);
  };

  const backToList = () => {
    setActiveArticle(null);
  };

  const selectCategory = (key) => {
    setActiveCategory(key);
    setActiveArticle(null);
    setShowFaq(false);
    setSearch("");
  };

  const openFaq = () => {
    setActiveArticle(null);
    setShowFaq(true);
    setSearch("");
  };

  // ==========================================================
  // ARTICLE CARD
  // ==========================================================

  const ArticleCard = ({ article }) => (
    <button
      type="button"
      className="fh-article-card"
      onClick={() => openArticle(article)}
    >
      <span className="fh-article-icon">{article.icon}</span>

      <span className="fh-article-info">
        <span className="fh-article-name">{article.title}</span>

        <span className="fh-article-desc">{article.description}</span>

        <span className="fh-article-meta">
          <BookOutlined />
          {article.steps.length} bước
          <span className="fh-meta-dot" />
          {article.duration}
        </span>
      </span>

      <ArrowRightOutlined className="fh-article-arrow" />
    </button>
  );

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <>
      <Modal
        open={open}
        onCancel={onClose}
        footer={null}
        centered
        width={1080}
        destroyOnClose
        className="fh-modal"
        closeIcon={<CloseOutlined />}
        styles={{
          body: { padding: 0 },
        }}
      >
        <div className="fh-layout">
          {/* ================================================
              SIDEBAR
              ================================================ */}

          <aside className="fh-sidebar">
            {/* LOGO */}

            <div className="fh-sidebar-brand">
              <div className="fh-logo-box">
                <img src={logoWeb} alt="FaithEdu" />
              </div>

              <div className="fh-brand-text">
                <strong>
                  Faith<span>Edu</span>
                </strong>

                <small>TRUNG TÂM TRỢ GIÚP</small>
              </div>
            </div>

            {/* SIDEBAR INTRO */}

            <div className="fh-sidebar-intro">
              <span className="fh-sidebar-label">KHÁM PHÁ HỆ THỐNG</span>

              <h3>
                Bạn cần
                <br />
                hỗ trợ gì?
              </h3>

              <p>
                Hướng dẫn sử dụng các chức năng của FaithEdu một cách đơn giản.
              </p>
            </div>

            {/* NAVIGATION */}

            <nav className="fh-navigation" aria-label="Danh mục trợ giúp">
              <div className="fh-nav-label">DANH MỤC HƯỚNG DẪN</div>

              {CATEGORIES.map((category) => {
                const active = !showFaq && activeCategory === category.key;

                return (
                  <button
                    key={category.key}
                    type="button"
                    className={`fh-nav-item ${active ? "active" : ""}`}
                    onClick={() => selectCategory(category.key)}
                    aria-current={active ? "page" : undefined}
                  >
                    <span className="fh-nav-icon">{category.icon}</span>

                    <span>{category.title}</span>

                    {active && <RightOutlined className="fh-nav-arrow" />}
                  </button>
                );
              })}
            </nav>

            {/* FAQ BUTTON */}

            <div className="fh-sidebar-bottom">
              <button
                type="button"
                className={`fh-support-button ${showFaq ? "active" : ""}`}
                onClick={openFaq}
              >
                <QuestionCircleOutlined />
                <span>Câu hỏi thường gặp</span>
                <ArrowRightOutlined />
              </button>

              <div className="fh-sidebar-version">
                <span className="fh-version-dot" />
                FaithEdu · Nền tảng giáo lý số
              </div>
            </div>
          </aside>

          {/* ================================================
              MAIN CONTENT
              ================================================ */}

          <main className="fh-main">
            {/* TOP BAR */}

            <div className="fh-topbar">
              <div className="fh-breadcrumb">
                <HomeOutlined />

                <span>Trợ giúp</span>

                <RightOutlined />

                <strong>
                  {showFaq
                    ? "Câu hỏi thường gặp"
                    : activeArticle
                      ? "Chi tiết hướng dẫn"
                      : currentCategory?.title}
                </strong>
              </div>

              <div className="fh-topbar-status">
                <span />
                Hướng dẫn FaithEdu
              </div>
            </div>

            {/* ==============================================
                FAQ PAGE
                ============================================== */}

            {showFaq ? (
              <div className="fh-content-scroll">
                <div className="fh-page-heading">
                  <div className="fh-heading-icon">
                    <QuestionCircleOutlined />
                  </div>

                  <span className="fh-eyebrow">GIẢI ĐÁP THẮC MẮC</span>

                  <h1>Câu hỏi thường gặp</h1>

                  <p>
                    Những thắc mắc phổ biến trong quá trình sử dụng FaithEdu.
                  </p>
                </div>

                <div className="fh-faq-panel">
                  <Collapse
                    accordion
                    bordered={false}
                    items={FAQS}
                    expandIconPosition="end"
                    className="fh-faq-collapse"
                  />
                </div>

                <div className="fh-info-note">
                  <InfoCircleOutlined />
                  <span>
                    Nếu vẫn gặp khó khăn, bạn có thể liên hệ người quản trị hệ
                    thống của giáo xứ để được hỗ trợ.
                  </span>
                </div>
              </div>
            ) : activeArticle ? (
              /* ===========================================
                 ARTICLE DETAIL
                 =========================================== */

              <div className="fh-content-scroll">
                <button
                  type="button"
                  className="fh-back-button"
                  onClick={backToList}
                >
                  <ArrowLeftOutlined />
                  Quay lại danh sách
                </button>

                <div className="fh-detail-header">
                  <div className="fh-detail-icon">{activeArticle.icon}</div>

                  <div className="fh-detail-heading">
                    <span className="fh-eyebrow">HƯỚNG DẪN SỬ DỤNG</span>

                    <h1>{activeArticle.title}</h1>

                    <p>{activeArticle.description}</p>

                    <div className="fh-detail-meta">
                      <span>
                        <BookOutlined />
                        {activeArticle.steps.length} bước
                      </span>

                      <span>
                        <PlayCircleOutlined />
                        Khoảng {activeArticle.duration}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="fh-detail-section-title">
                  <h3>Các bước thực hiện</h3>

                  <span>{activeArticle.steps.length} bước</span>
                </div>

                <div className="fh-steps">
                  {activeArticle.steps.map((step, index) => (
                    <div className="fh-step" key={index}>
                      <div className="fh-step-marker">
                        <span>{index + 1}</span>
                      </div>

                      <div className="fh-step-body">
                        <h4>{step.title}</h4>

                        <p>{step.content}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {activeArticle.note && (
                  <div className="fh-tip">
                    <BulbOutlined />

                    <div>
                      <strong>Lưu ý</strong>
                      <p>{activeArticle.note}</p>
                    </div>
                  </div>
                )}

                <div className="fh-article-end">
                  <CheckCircleFilled />

                  <div>
                    <strong>Hoàn thành hướng dẫn</strong>
                    <span>Bạn đã xem hết các bước thực hiện.</span>
                  </div>

                  <button type="button" onClick={backToList}>
                    Xem hướng dẫn khác
                    <ArrowRightOutlined />
                  </button>
                </div>
              </div>
            ) : (
              /* ===========================================
                 GUIDE LIST
                 =========================================== */

              <div className="fh-content-scroll">
                {/* HERO */}

                <div className="fh-hero">
                  <div className="fh-hero-decor decor-one" />
                  <div className="fh-hero-decor decor-two" />

                  <div className="fh-hero-content">
                    <div className="fh-hero-tag">
                      <span />
                      FAITHEDU HELP CENTER
                    </div>

                    <h1>
                      Hướng dẫn sử dụng
                      <br />
                      <span>FaithEdu</span>
                    </h1>

                    <p>
                      Tìm câu trả lời và khám phá cách sử dụng các chức năng của
                      hệ thống.
                    </p>
                  </div>

                  <div className="fh-hero-art">
                    <div className="fh-hero-art-circle">
                      <BookOutlined />
                    </div>

                    <div className="fh-hero-art-small">
                      <CheckCircleFilled />
                    </div>
                  </div>
                </div>

                {/* SEARCH */}

                <div className="fh-search-area">
                  <Input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    prefix={<SearchOutlined />}
                    placeholder="Tìm hướng dẫn... Ví dụ: điểm danh, Excel, học sinh"
                    size="large"
                    allowClear
                    className="fh-search-input"
                    aria-label="Tìm kiếm hướng dẫn"
                  />
                </div>

                {/* FEATURED */}

                {!search && activeCategory === "all" && (
                  <section className="fh-section">
                    <div className="fh-section-header">
                      <div>
                        <span className="fh-eyebrow">BẮT ĐẦU NHANH</span>

                        <h2>Hướng dẫn phổ biến</h2>
                      </div>

                      <span className="fh-section-count">
                        {featuredArticles.length} hướng dẫn
                      </span>
                    </div>

                    <div className="fh-featured-grid">
                      {featuredArticles.map((article) => (
                        <button
                          type="button"
                          key={article.id}
                          className="fh-featured-card"
                          onClick={() => openArticle(article)}
                        >
                          <span className="fh-featured-icon">
                            {article.icon}
                          </span>

                          <strong>{article.title}</strong>

                          <small>
                            {article.steps.length} bước · {article.duration}
                          </small>

                          <ArrowRightOutlined className="fh-featured-arrow" />
                        </button>
                      ))}
                    </div>
                  </section>
                )}

                {/* ALL ARTICLES */}

                <section className="fh-section fh-all-section">
                  <div className="fh-section-header">
                    <div>
                      <span className="fh-eyebrow">THƯ VIỆN HƯỚNG DẪN</span>

                      <h2>
                        {search ? "Kết quả tìm kiếm" : currentCategory?.title}
                      </h2>
                    </div>

                    <span className="fh-section-count">
                      {filteredArticles.length} bài viết
                    </span>
                  </div>

                  {filteredArticles.length > 0 ? (
                    <div className="fh-articles-grid">
                      {filteredArticles.map((article) => (
                        <ArticleCard key={article.id} article={article} />
                      ))}
                    </div>
                  ) : (
                    <div className="fh-empty">
                      <Empty description="Không tìm thấy hướng dẫn phù hợp" />

                      <button
                        type="button"
                        onClick={() => {
                          setSearch("");
                          setActiveCategory("all");
                        }}
                      >
                        Xem tất cả hướng dẫn
                      </button>
                    </div>
                  )}
                </section>
              </div>
            )}

            {/* ================================================
                FOOTER
                ================================================ */}

            <footer className="fh-footer">
              <div>
                <SafetyCertificateOutlined />
                Dành cho cộng đoàn giáo lý Việt Nam
              </div>

              <span>
                <GlobalOutlined />
                giaolyso.site
              </span>
            </footer>
          </main>
        </div>
      </Modal>

      {/* ====================================================
          CSS
          ==================================================== */}

      <style>{`
        /* =============================================
           MODAL
        ============================================= */

        .fh-modal {
          font-family: Inter, -apple-system,
            BlinkMacSystemFont, "Segoe UI",
            Arial, sans-serif;
        }

        .fh-modal .ant-modal-content {
          padding: 0 !important;
          border-radius: 20px !important;
          overflow: hidden;
          background: #FFFFFF;
          box-shadow:
            0 30px 90px rgba(15, 35, 60, .20) !important;
        }

        .fh-modal .ant-modal-body {
          padding: 0 !important;
        }

        .fh-modal .ant-modal-close {
          top: 17px;
          right: 18px;
          width: 34px;
          height: 34px;
          border-radius: 10px;
          color: #64748B;
          background: #F1F5F9;
          z-index: 20;
        }

        .fh-modal .ant-modal-close:hover {
          background: #E8EDF4;
          color: #173B5E;
        }

        /* =============================================
           MAIN LAYOUT
        ============================================= */

        .fh-layout {
          display: flex;
          height: min(720px, 88vh);
          min-height: 460px;
          overflow: hidden;
          background: #FFFFFF;
        }

        /* =============================================
           SIDEBAR
        ============================================= */

        .fh-sidebar {
          width: 266px;
          flex: 0 0 266px;
          min-width: 0;

          display: flex;
          flex-direction: column;

          padding: 25px 15px 17px;

          background: #F5F7FB;
          border-right: 1px solid #E7EDF4;
          overflow-y: auto;
          scrollbar-width: thin;
        }

        .fh-sidebar-brand {
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 0 10px 25px;
        }

        .fh-logo-box {
          width: 45px;
          height: 45px;
          flex: 0 0 45px;
          background: #FFFFFF;
          border: 1px solid #E7EDF4;
          border-radius: 13px;
          padding: 7px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .fh-logo-box img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .fh-brand-text {
          display: flex;
          flex-direction: column;
          gap: 3px;
          min-width: 0;
        }

        .fh-brand-text strong {
          font-size: 22px;
          font-weight: 850;
          color: #173B5E;
          letter-spacing: -1px;
          line-height: 1.1;
        }

        .fh-brand-text strong span {
          color: #D9A441;
        }

        .fh-brand-text small {
          font-size: 9px;
          color: #64748B;
          letter-spacing: 1px;
          font-weight: 750;
        }

        .fh-sidebar-intro {
          margin: 0 7px 24px;
          padding: 19px 17px;
          border-radius: 14px;
          background: #173B5E;
          color: #FFFFFF;
        }

        .fh-sidebar-label {
          font-size: 9px;
          letter-spacing: 1px;
          font-weight: 800;
          color: #E6C780;
        }

        .fh-sidebar-intro h3 {
          margin: 10px 0 8px;
          font-size: 23px;
          font-weight: 800;
          line-height: 1.2;
          color: #FFFFFF;
          letter-spacing: -.6px;
        }

        .fh-sidebar-intro p {
          margin: 0;
          font-size: 11px;
          color: rgba(255,255,255,.73);
          line-height: 1.65;
        }

        /* =============================================
           NAVIGATION
        ============================================= */

        .fh-navigation {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .fh-nav-label {
          padding: 0 13px;
          margin-bottom: 9px;
          font-size: 9px;
          letter-spacing: 1px;
          font-weight: 800;
          color: #94A3B8;
        }

        .fh-nav-item {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;

          padding: 12px 13px;
          border-radius: 10px;
          border: 1px solid transparent;

          background: transparent;
          cursor: pointer;
          text-align: left;

          font-size: 12px;
          font-weight: 650;
          color: #64748B;

          transition: .2s ease;
        }

        .fh-nav-item:hover {
          color: #173B5E;
          background: #E9EEF5;
        }

        .fh-nav-item.active {
          background: #FFFFFF;
          color: #173B5E;
          border-color: #E1E8F0;
          box-shadow: 0 2px 8px rgba(23,59,94,.04);
          font-weight: 800;
        }

        .fh-nav-icon {
          width: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
        }

        .fh-nav-item.active .fh-nav-icon {
          color: #D9A441;
        }

        .fh-nav-arrow {
          margin-left: auto;
          font-size: 9px;
          color: #D9A441;
        }

        /* =============================================
           SIDEBAR BOTTOM
        ============================================= */

        .fh-sidebar-bottom {
          margin-top: auto;
          padding: 20px 7px 0;
        }

        .fh-support-button {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 12px;
          background: #FFF9EB;
          border: 1px solid #F1E4BF;
          border-radius: 11px;
          color: #87631D;
          font-weight: 750;
          font-size: 11px;
          cursor: pointer;
        }

        .fh-support-button span {
          flex: 1;
          text-align: left;
        }

        .fh-support-button:hover,
        .fh-support-button.active {
          background: #F7EDCF;
        }

        .fh-sidebar-version {
          display: flex;
          align-items: center;
          gap: 7px;
          margin-top: 18px;
          font-size: 9px;
          color: #94A3B8;
        }

        .fh-version-dot {
          width: 7px;
          height: 7px;
          background: #D9A441;
          border-radius: 50%;
        }

        /* =============================================
           MAIN
        ============================================= */

        .fh-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
          background: #FFFFFF;
        }

        .fh-topbar {
          height: 65px;
          flex: 0 0 65px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 0 65px 0 30px;
          border-bottom: 1px solid #EEF1F5;
        }

        .fh-breadcrumb {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
          color: #94A3B8;
          font-size: 11px;
        }

        .fh-breadcrumb > .anticon:nth-of-type(2) {
          font-size: 9px;
        }

        .fh-breadcrumb strong {
          color: #173B5E;
          font-weight: 750;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }

        .fh-topbar-status {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 10px;
          color: #64748B;
          white-space: nowrap;
        }

        .fh-topbar-status span {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #D9A441;
        }

        .fh-content-scroll {
          flex: 1;
          overflow-y: auto;
          min-height: 0;
          padding: 25px 30px 35px;
          scrollbar-width: thin;
        }

        /* =============================================
           HERO
        ============================================= */

        .fh-hero {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: space-between;
          min-height: 180px;
          overflow: hidden;
          background: linear-gradient(
            115deg,
            #173B5E 0%,
            #244F78 100%
          );
          color: #FFFFFF;
          border-radius: 16px;
          padding: 26px 30px;
        }

        .fh-hero-content {
          position: relative;
          z-index: 2;
        }

        .fh-hero-tag {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 1.2px;
          color: #E8C77C;
        }

        .fh-hero-tag span {
          width: 6px;
          height: 6px;
          background: #D9A441;
          border-radius: 50%;
        }

        .fh-hero h1 {
          margin: 14px 0 9px;
          font-size: 26px;
          line-height: 1.2;
          letter-spacing: -.6px;
          font-weight: 800;
          color: #FFFFFF;
        }

        .fh-hero h1 span {
          color: #E7BE68;
        }

        .fh-hero p {
          max-width: 370px;
          margin: 0;
          color: rgba(255,255,255,.74);
          line-height: 1.65;
          font-size: 11px;
        }

        .fh-hero-decor {
          position: absolute;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,.12);
          pointer-events: none;
        }

        .fh-hero-decor.decor-one {
          width: 300px;
          height: 300px;
          right: -90px;
          top: -145px;
        }

        .fh-hero-decor.decor-two {
          width: 200px;
          height: 200px;
          right: 10px;
          bottom: -155px;
          border-color: rgba(217,164,65,.28);
        }

        .fh-hero-art {
          position: relative;
          z-index: 2;
          width: 130px;
          height: 130px;
          margin-right: 22px;
          flex: 0 0 130px;
        }

        .fh-hero-art-circle {
          width: 110px;
          height: 110px;
          display: flex;
          justify-content: center;
          align-items: center;
          border-radius: 28px;
          background: rgba(255,255,255,.10);
          border: 1px solid rgba(255,255,255,.17);
          transform: rotate(-10deg);
          color: #F3D58F;
          font-size: 50px;
        }

        .fh-hero-art-small {
          position: absolute;
          bottom: 7px;
          right: 0;
          width: 46px;
          height: 46px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 14px;
          color: #173B5E;
          background: #F1D083;
          font-size: 21px;
          box-shadow: 0 8px 25px rgba(0,0,0,.12);
        }

        /* =============================================
           SEARCH
        ============================================= */

        .fh-search-area {
          margin-top: 20px;
          margin-bottom: 28px;
        }

        .fh-search-input.ant-input-affix-wrapper {
          height: 49px;
          border: 1px solid #E2E8F0;
          border-radius: 12px;
          padding: 0 15px;
          background: #FFFFFF;
          box-shadow: 0 3px 13px rgba(15,35,60,.035);
        }

        .fh-search-input.ant-input-affix-wrapper:hover,
        .fh-search-input.ant-input-affix-wrapper-focused {
          border-color: #D9A441;
          box-shadow: 0 0 0 3px rgba(217,164,65,.10);
        }

        .fh-search-input .ant-input-prefix {
          color: #94A3B8;
          margin-right: 10px;
          font-size: 16px;
        }

        .fh-search-input input {
          font-size: 12px;
        }

        /* =============================================
           SECTION
        ============================================= */

        .fh-section {
          margin-top: 25px;
        }

        .fh-all-section {
          margin-top: 28px;
        }

        .fh-section-header {
          display: flex;
          align-items: end;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 15px;
        }

        .fh-eyebrow {
          display: block;
          color: #B18430;
          font-size: 9px;
          font-weight: 850;
          letter-spacing: 1.1px;
        }

        .fh-section-header h2 {
          margin: 6px 0 0;
          color: #173B5E;
          font-size: 18px;
          font-weight: 800;
          letter-spacing: -.4px;
        }

        .fh-section-count {
          color: #94A3B8;
          font-size: 10px;
          white-space: nowrap;
        }

        /* =============================================
           FEATURED
        ============================================= */

        .fh-featured-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
        }

        .fh-featured-card {
          position: relative;
          min-width: 0;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 9px;
          padding: 17px;
          text-align: left;
          border: 1px solid #E7EDF4;
          border-radius: 13px;
          background: #FFFFFF;
          cursor: pointer;
          transition: .2s ease;
        }

        .fh-featured-card:hover {
          transform: translateY(-2px);
          border-color: #E3CE9E;
          box-shadow: 0 10px 24px rgba(23,59,94,.07);
        }

        .fh-featured-icon {
          width: 37px;
          height: 37px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 11px;
          background: #FDF5E5;
          color: #AD802F;
          font-size: 17px;
        }

        .fh-featured-card strong {
          color: #243449;
          font-size: 12px;
          font-weight: 800;
          line-height: 1.5;
        }

        .fh-featured-card small {
          color: #94A3B8;
          font-size: 10px;
        }

        .fh-featured-arrow {
          position: absolute;
          right: 17px;
          top: 20px;
          color: #CBD5E1;
          font-size: 12px;
        }

        .fh-featured-card:hover .fh-featured-arrow {
          color: #D9A441;
        }

        /* =============================================
           ARTICLE LIST
        ============================================= */

        .fh-articles-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 11px;
        }

        .fh-article-card {
          width: 100%;
          min-height: 112px;

          display: flex;
          align-items: flex-start;
          gap: 12px;

          padding: 15px;
          text-align: left;

          background: #FFFFFF;
          border: 1px solid #E7EDF4;
          border-radius: 12px;
          cursor: pointer;

          transition: .2s ease;
        }

        .fh-article-card:hover {
          border-color: #D9C69B;
          background: #FFFEFA;
          box-shadow: 0 6px 17px rgba(23,59,94,.045);
        }

        .fh-article-icon {
          width: 36px;
          height: 36px;
          flex: 0 0 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          background: #EEF3F8;
          color: #173B5E;
          font-size: 17px;
        }

        .fh-article-info {
          min-width: 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .fh-article-name {
          font-size: 12px;
          color: #243449;
          font-weight: 800;
          line-height: 1.45;
        }

        .fh-article-desc {
          color: #64748B;
          font-size: 10px;
          line-height: 1.6;
        }

        .fh-article-meta {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: auto;
          padding-top: 4px;
          color: #94A3B8;
          font-size: 9px;
        }

        .fh-meta-dot {
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: #CBD5E1;
        }

        .fh-article-arrow {
          font-size: 10px;
          color: #CBD5E1;
          margin-top: 5px;
        }

        /* =============================================
           ARTICLE DETAIL
        ============================================= */

        .fh-back-button {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 24px;
          padding: 0;
          background: transparent;
          border: 0;
          color: #64748B;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
        }

        .fh-back-button:hover {
          color: #173B5E;
        }

        .fh-detail-header {
          display: flex;
          align-items: flex-start;
          gap: 17px;
          padding-bottom: 24px;
          border-bottom: 1px solid #EDF1F5;
        }

        .fh-detail-icon {
          width: 58px;
          height: 58px;
          flex: 0 0 58px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 17px;
          background: #FDF5E5;
          color: #B88830;
          font-size: 26px;
        }

        .fh-detail-heading {
          min-width: 0;
          flex: 1;
        }

        .fh-detail-heading h1 {
          margin: 8px 0 8px;
          color: #173B5E;
          font-size: 24px;
          font-weight: 850;
          letter-spacing: -.5px;
          line-height: 1.3;
        }

        .fh-detail-heading p {
          margin: 0;
          color: #64748B;
          font-size: 12px;
          line-height: 1.65;
        }

        .fh-detail-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 15px;
          margin-top: 15px;
          color: #94A3B8;
          font-size: 10px;
        }

        .fh-detail-meta span {
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .fh-detail-section-title {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin: 27px 0 20px;
        }

        .fh-detail-section-title h3 {
          color: #173B5E;
          margin: 0;
          font-size: 16px;
          font-weight: 800;
        }

        .fh-detail-section-title span {
          color: #94A3B8;
          font-size: 10px;
        }

        /* =============================================
           STEPS
        ============================================= */

        .fh-steps {
          display: flex;
          flex-direction: column;
        }

        .fh-step {
          position: relative;
          display: flex;
          align-items: stretch;
          gap: 16px;
          min-height: 94px;
        }

        .fh-step-marker {
          position: relative;
          width: 34px;
          flex: 0 0 34px;
          display: flex;
          justify-content: center;
        }

        .fh-step-marker::after {
          content: "";
          position: absolute;
          top: 39px;
          bottom: 0;
          width: 1px;
          background: #E1E8EF;
        }

        .fh-step:last-child .fh-step-marker::after {
          display: none;
        }

        .fh-step-marker span {
          position: relative;
          z-index: 1;
          width: 34px;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 11px;
          background: #EEF3F8;
          color: #173B5E;
          font-size: 12px;
          font-weight: 850;
        }

        .fh-step-body {
          flex: 1;
          min-width: 0;
          padding-bottom: 25px;
        }

        .fh-step-body h4 {
          margin: 4px 0 7px;
          color: #243449;
          font-size: 13px;
          font-weight: 800;
        }

        .fh-step-body p {
          margin: 0;
          color: #64748B;
          font-size: 11.5px;
          line-height: 1.75;
        }

        /* =============================================
           TIP / END
        ============================================= */

        .fh-tip {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 17px;
          margin: 3px 0 22px;
          border-radius: 12px;
          background: #FFFAED;
          border: 1px solid #F3E6C5;
        }

        .fh-tip > .anticon {
          font-size: 18px;
          color: #C39131;
          margin-top: 2px;
        }

        .fh-tip strong {
          font-size: 12px;
          color: #8A651C;
        }

        .fh-tip p {
          margin: 5px 0 0;
          color: #806C43;
          font-size: 11px;
          line-height: 1.7;
        }

        .fh-article-end {
          display: flex;
          align-items: center;
          gap: 13px;
          padding: 17px;
          border-radius: 13px;
          background: #F6F9FC;
          border: 1px solid #E8EDF4;
        }

        .fh-article-end > .anticon {
          font-size: 24px;
          color: #2E7D5B;
        }

        .fh-article-end > div {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .fh-article-end strong {
          font-size: 12px;
          color: #173B5E;
        }

        .fh-article-end span {
          color: #64748B;
          font-size: 10px;
        }

        .fh-article-end button {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 9px 12px;
          border-radius: 9px;
          border: none;
          background: #173B5E;
          color: #FFFFFF;
          font-size: 10px;
          font-weight: 750;
          cursor: pointer;
        }

        .fh-article-end button:hover {
          background: #244F78;
        }

        /* =============================================
           FAQ
        ============================================= */

        .fh-page-heading {
          padding: 12px 0 27px;
        }

        .fh-heading-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 52px;
          height: 52px;
          margin-bottom: 20px;
          border-radius: 15px;
          background: #FDF5E5;
          color: #B88830;
          font-size: 23px;
        }

        .fh-page-heading h1 {
          font-size: 27px;
          font-weight: 850;
          color: #173B5E;
          margin: 10px 0;
        }

        .fh-page-heading p {
          color: #64748B;
          font-size: 12px;
          line-height: 1.7;
        }

        .fh-faq-panel {
          border: 1px solid #E7EDF4;
          border-radius: 14px;
          padding: 4px 14px;
        }

        .fh-faq-collapse {
          background: transparent;
        }

        .fh-faq-collapse .ant-collapse-item {
          border-bottom: 1px solid #EDF1F5;
        }

        .fh-faq-collapse .ant-collapse-item:last-child {
          border-bottom: none;
        }

        .fh-faq-collapse .ant-collapse-header {
          padding: 17px 5px !important;
          align-items: center !important;
          color: #243449 !important;
          font-size: 12px;
          font-weight: 750;
        }

        .fh-faq-collapse .ant-collapse-content-box {
          padding: 0 5px 17px !important;
          color: #64748B;
          font-size: 11.5px;
          line-height: 1.8;
        }

        .fh-info-note {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          margin-top: 20px;
          padding: 15px;
          border-radius: 11px;
          background: #F6F8FC;
          color: #64748B;
          font-size: 11px;
          line-height: 1.7;
        }

        .fh-info-note .anticon {
          color: #173B5E;
          margin-top: 2px;
        }

        /* =============================================
           EMPTY
        ============================================= */

        .fh-empty {
          padding: 30px;
          border: 1px dashed #E1E8F0;
          border-radius: 13px;
          text-align: center;
        }

        .fh-empty button {
          margin-top: 12px;
          border: 0;
          border-radius: 8px;
          padding: 10px 15px;
          background: #173B5E;
          color: #FFFFFF;
          font-size: 11px;
          cursor: pointer;
        }

        /* =============================================
           FOOTER
        ============================================= */

        .fh-footer {
          min-height: 53px;
          flex: 0 0 53px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 0 30px;
          border-top: 1px solid #EEF1F5;
          background: #FFFFFF;
        }

        .fh-footer div,
        .fh-footer span {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #94A3B8;
          font-size: 10px;
        }

        .fh-footer .anticon {
          color: #D9A441;
        }

        /* =============================================
           TABLET
        ============================================= */

        @media (max-width: 900px) {
          .fh-sidebar {
            width: 220px;
            flex-basis: 220px;
          }

          .fh-sidebar-brand {
            padding-left: 5px;
          }

          .fh-brand-text strong {
            font-size: 19px;
          }

          .fh-content-scroll {
            padding: 22px;
          }

          .fh-topbar {
            padding-left: 22px;
          }

          .fh-hero-art {
            margin-right: 0;
            flex-basis: 100px;
            width: 100px;
          }

          .fh-hero-art-circle {
            width: 90px;
            height: 90px;
            font-size: 40px;
          }

          .fh-articles-grid {
            grid-template-columns: 1fr;
          }
        }

        /* =============================================
           MOBILE
        ============================================= */

        @media (max-width: 700px) {
          .fh-modal {
            width: calc(100vw - 16px) !important;
            max-width: calc(100vw - 16px) !important;
            margin: 8px auto;
            padding-bottom: 0;
          }

          .fh-layout {
            flex-direction: column;
            height: min(850px, 94dvh);
            min-height: 0;
          }

          .fh-sidebar {
            width: 100%;
            flex: 0 0 auto;
            padding: 13px 15px 10px;
            overflow: visible;
            border-right: none;
            border-bottom: 1px solid #E7EDF4;
          }

          .fh-sidebar-brand {
            padding: 0 35px 12px 0;
          }

          .fh-logo-box {
            width: 38px;
            height: 38px;
            flex-basis: 38px;
          }

          .fh-brand-text strong {
            font-size: 19px;
          }

          .fh-sidebar-intro,
          .fh-nav-label,
          .fh-sidebar-version {
            display: none;
          }

          .fh-navigation {
            flex-direction: row;
            gap: 7px;
            overflow-x: auto;
            scrollbar-width: none;
          }

          .fh-navigation::-webkit-scrollbar {
            display: none;
          }

          .fh-nav-item {
            flex: 0 0 auto;
            width: auto;
            gap: 7px;
            padding: 9px 11px;
            font-size: 10px;
            white-space: nowrap;
          }

          .fh-nav-icon {
            font-size: 13px;
          }

          .fh-nav-arrow {
            display: none;
          }

          .fh-sidebar-bottom {
            padding: 0;
            margin-top: 9px;
          }

          .fh-support-button {
            width: fit-content;
            padding: 7px 10px;
            font-size: 10px;
            border-radius: 8px;
          }

          .fh-main {
            min-height: 0;
          }

          .fh-topbar {
            height: 43px;
            flex-basis: 43px;
            padding: 0 55px 0 17px;
          }

          .fh-topbar-status {
            display: none;
          }

          .fh-content-scroll {
            padding: 17px;
          }

          .fh-hero {
            min-height: 155px;
            padding: 20px;
          }

          .fh-hero h1 {
            font-size: 22px;
          }

          .fh-hero p {
            font-size: 10px;
          }

          .fh-hero-art {
            display: none;
          }

          .fh-featured-grid {
            grid-template-columns: 1fr 1fr;
            gap: 9px;
          }

          .fh-featured-card {
            padding: 13px;
          }

          .fh-featured-card strong {
            font-size: 11px;
          }

          .fh-articles-grid {
            grid-template-columns: 1fr;
          }

          .fh-detail-heading h1 {
            font-size: 20px;
          }

          .fh-detail-icon {
            width: 47px;
            height: 47px;
            flex-basis: 47px;
            font-size: 20px;
          }

          .fh-footer {
            min-height: 45px;
            flex-basis: 45px;
            padding: 0 17px;
          }

          .fh-footer div {
            font-size: 9px;
          }

          .fh-footer > span {
            display: none;
          }

          .fh-article-end {
            flex-wrap: wrap;
          }

          .fh-article-end button {
            width: 100%;
            justify-content: center;
          }
        }

        @media (max-width: 380px) {
          .fh-featured-grid {
            grid-template-columns: 1fr;
          }

          .fh-hero h1 {
            font-size: 20px;
          }

          .fh-section-header h2 {
            font-size: 16px;
          }
        }

        /* =============================================
           ACCESSIBILITY
        ============================================= */

        .fh-modal button:focus-visible {
          outline: 2px solid #D9A441;
          outline-offset: 2px;
        }

        @media (prefers-reduced-motion: reduce) {
          .fh-modal * {
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </>
  );
};

export default HelpModalCate;
