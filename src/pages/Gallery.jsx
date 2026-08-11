import React, { useEffect, useState } from "react";
import {
  Image,
  Badge,
  Typography,
  Space,
  Empty,
  Spin,
  ConfigProvider,
  Tag,
} from "antd";
import {
  AppstoreOutlined,
  BankOutlined,
  CalendarOutlined,
  TeamOutlined,
  PictureOutlined,
  UserOutlined,
  CompassOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";
import { getGalleryImages } from "../api/galleryApi";

const { Title, Text, Paragraph } = Typography;

// Bảng màu thiết kế Tôn Nghiêm (Editorial Sacred Palette)
const primaryNavy = "#1B365D"; // Xanh Đêm Navy
const accentGold = "#D4AF37"; // Vàng Đồng
const textDark = "#1E293B";
const softBg = "#FAFAFA";

const Gallery = () => {
  const [images, setImages] = useState([]);
  const [filteredImages, setFilteredImages] = useState([]);
  const [typeFilter, setTypeFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const BASE_URL = process.env.REACT_APP_API_URL || "";

  // Danh mục phân loại hình ảnh khoảnh khắc
  const menuItems = [
    {
      key: "all",
      icon: <AppstoreOutlined />,
      label: "Tất cả",
      count: images.length,
    },
    {
      key: "church",
      icon: <BankOutlined />,
      label: "Giáo xứ",
      count: images.filter((i) => i.type === "church").length,
    },
    {
      key: "image",
      icon: <CalendarOutlined />,
      label: "Sự kiện",
      count: images.filter((i) => i.type === "image").length,
    },
    {
      key: "group",
      icon: <TeamOutlined />,
      label: "Hội đoàn",
      count: images.filter((i) => i.type === "group").length,
    },
    {
      key: "slide",
      icon: <PictureOutlined />,
      label: "Slide Banner",
      count: images.filter((i) => i.type === "slide").length,
    },
    {
      key: "admin",
      icon: <UserOutlined />,
      label: "Ban quản trị",
      count: images.filter((i) => i.type === "admin").length,
    },
  ];

  useEffect(() => {
    fetchGallery();
  }, []);

  useEffect(() => {
    setFilteredImages(
      typeFilter === "all"
        ? images
        : images.filter((item) => item.type === typeFilter),
    );
  }, [typeFilter, images]);

  const fetchGallery = async () => {
    try {
      setLoading(true);
      const res = await getGalleryImages();
      const rawData = res.data?.data || res.data || [];
      const validImages = Array.isArray(rawData)
        ? rawData.filter((item) => item.image && item.image.trim() !== "")
        : [];
      setImages(validImages);
    } catch (error) {
      console.error("Lỗi lấy dữ liệu kho ảnh:", error);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (image) => {
    if (!image) return "https://placehold.co/600x400?text=No+Image";
    if (image.startsWith("http")) return image;
    if (image.startsWith("/uploads")) return `${BASE_URL}${image}`;
    return `${BASE_URL}/uploads/events/${image}`;
  };

  if (loading) {
    return (
      <div
        className="gallery-loading-screen"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
        }}
      >
        <Space direction="vertical" align="center" size="middle">
          <Spin size="large" />
          <Text style={{ color: primaryNavy, fontWeight: 600 }}>
            Đang tải kho ảnh mục vụ Giáo xứ...
          </Text>
        </Space>
      </div>
    );
  }

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: primaryNavy,
          borderRadius: 12,
          colorBgLayout: softBg,
          fontFamily: "'Be Vietnam Pro', -apple-system, sans-serif",
        },
      }}
    >
      <div className="gallery-editorial-layout">
        <div className="gallery-editorial-container">
          {/* 1. HEADER CHÍNH TIÊU ĐỀ BÁO CHÍ */}
          <div className="gallery-header-section">
            <span className="sacred-badge">
              <CompassOutlined /> LƯU TRỮ KHOẢNH KHẮC MỤC VỤ
            </span>
            <Title level={2} className="gallery-main-title">
              THƯ VIỆN HÌNH ẢNH GIÁO XỨ
            </Title>
            <Paragraph className="gallery-sub-title">
              Bấm trực tiếp vào hình ảnh bất kỳ để xem toàn màn hình ở chất
              lượng cao.
            </Paragraph>
          </div>

          {/* 2. THANH MENU BỘ LỌC VIÊN THUỐC (Capsule Pills) */}
          <div className="pill-navigation-container">
            <div className="pill-navigation-wrapper custom-scroll">
              {menuItems.map((item) => {
                const isActive = typeFilter === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => setTypeFilter(item.key)}
                    className={`pill-tab-btn ${isActive ? "active" : ""}`}
                  >
                    <span className="tab-icon">{item.icon}</span>
                    <span>{item.label}</span>
                    <Badge
                      count={item.count}
                      style={{
                        backgroundColor: isActive
                          ? accentGold
                          : "rgba(27, 54, 93, 0.08)",
                        color: isActive ? primaryNavy : "#64748b",
                        boxShadow: "none",
                        fontWeight: 700,
                      }}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. LƯỚI ẢNH MASONRY PINTEREST VỚI TÍNH NĂNG BẤM MỞ TOÀN MÀN HÌNH */}
          {filteredImages.length === 0 ? (
            <div className="empty-gallery-box">
              <Empty
                description={
                  <span style={{ color: "#94a3b8" }}>
                    Không tìm thấy hình ảnh nào trong danh mục này
                  </span>
                }
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            </div>
          ) : (
            <div className="masonry-wrapper">
              <AnimatePresence mode="popLayout">
                {filteredImages.map((item, idx) => (
                  <motion.div
                    key={`${item.id || idx}-${idx}`}
                    layout
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.92 }}
                    transition={{ duration: 0.28 }}
                    className="masonry-item"
                  >
                    <div className="gallery-card">
                      <Image
                        src={getImageUrl(item.image)}
                        alt={item.title || item.name || "Hình ảnh giáo xứ"}
                        preview={{
                          mask: (
                            <div className="preview-mask-text">
                              <EyeOutlined
                                style={{ marginRight: 6, fontSize: 18 }}
                              />{" "}
                              Bấm để xem ảnh phóng to
                            </div>
                          ),
                        }}
                        style={{ width: "100%", display: "block" }}
                      />

                      {/* LỚP PHỦ THÔNG TIN BÊN DƯỚI (Không cản trở sự kiện click vào ảnh) */}
                      <div className="image-overlay">
                        <div
                          style={{
                            padding: "16px 16px 12px 16px",
                            width: "100%",
                          }}
                        >
                          <Text className="overlay-image-title" ellipsis>
                            {item.title ||
                              item.name ||
                              item.full_name ||
                              "Hình ảnh Giáo xứ"}
                          </Text>
                          <Tag className="gold-category-tag">
                            {item.type ? item.type.toUpperCase() : "TƯ LIỆU"}
                          </Tag>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* STYLES SCOPED */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
            @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,600;0,700;1,400&display=swap');

            .gallery-loading-screen {
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 70vh;
              background: ${softBg};
              font-family: 'Be Vietnam Pro', sans-serif;
            }

            .gallery-editorial-layout {
              background: ${softBg};
              min-height: 100vh;
              padding: 40px 20px 80px 20px;
              font-family: 'Be Vietnam Pro', sans-serif;
              color: ${textDark};
            }

            .gallery-editorial-container {
              max-width: 1200px;
              margin: 0 auto;
            }

            /* Header Section */
            .gallery-header-section {
              text-align: center;
              margin-bottom: 32px;
            }

            .sacred-badge {
              background: rgba(212, 175, 55, 0.15);
              border: 1px solid ${accentGold};
              color: ${primaryNavy};
              padding: 4px 14px;
              border-radius: 20px;
              font-size: 11px;
              font-weight: 700;
              letter-spacing: 1px;
              display: inline-flex;
              align-items: center;
              gap: 6px;
              margin-bottom: 10px;
            }

            .gallery-main-title {
              font-family: 'Playfair Display', Georgia, serif !important;
              color: ${primaryNavy} !important;
              margin: 0 !important;
              font-weight: 700 !important;
              font-size: clamp(26px, 4vw, 36px) !important;
            }

            .gallery-sub-title {
              color: #64748b;
              margin: 6px auto 0 auto !important;
              font-size: 14px;
              max-width: 600px;
            }

            /* Pill Navigation Bar */
            .pill-navigation-container {
              display: flex;
              justify-content: center;
              margin-bottom: 40px;
            }

            .pill-navigation-wrapper {
              display: flex;
              gap: 8px;
              background: #ffffff;
              padding: 6px;
              border-radius: 30px;
              border: 1px solid rgba(212, 175, 55, 0.3);
              box-shadow: 0 4px 16px rgba(27, 54, 93, 0.04);
              max-width: 100%;
              overflow-x: auto;
            }

            .pill-tab-btn {
              display: flex;
              align-items: center;
              gap: 8px;
              padding: 8px 18px;
              border: none;
              border-radius: 24px;
              background: transparent;
              color: #64748b;
              font-weight: 600;
              font-size: 13px;
              cursor: pointer;
              transition: all 0.25s ease;
              white-space: nowrap;
            }

            .pill-tab-btn.active {
              background: ${primaryNavy};
              color: #ffffff;
              box-shadow: 0 4px 14px rgba(27, 54, 93, 0.2);
            }

            .tab-icon {
              display: flex;
              align-items: center;
            }

            /* Pinterest Masonry Layout */
            .masonry-wrapper {
              columns: 4 260px;
              column-gap: 20px;
            }

            .masonry-item {
              margin-bottom: 20px;
              break-inside: avoid;
            }

            .gallery-card {
              position: relative;
              border-radius: 16px;
              overflow: hidden;
              cursor: pointer;
              background: #ffffff;
              border: 1px solid rgba(212, 175, 55, 0.25);
              box-shadow: 0 6px 20px rgba(27, 54, 93, 0.04);
              transition: transform 0.3s ease, box-shadow 0.3s ease;
            }

            .gallery-card:hover {
              transform: translateY(-6px);
              box-shadow: 0 12px 30px rgba(27, 54, 93, 0.12);
              border-color: ${accentGold};
            }

            .gallery-card img {
              transition: transform 0.5s cubic-bezier(0.25, 1, 0.5, 1) !important;
            }

            .gallery-card:hover img {
              transform: scale(1.05);
            }

            .image-overlay {
              position: absolute;
              inset: 0;
              background: linear-gradient(to top, rgba(27, 54, 93, 0.88) 0%, rgba(27, 54, 93, 0.2) 60%, transparent 100%);
              display: flex;
              align-items: flex-end;
              opacity: 0;
              transition: opacity 0.3s ease;
              pointer-events: none; /* Giúp sự kiện click lọt qua ảnh để phóng to */
            }

            .gallery-card:hover .image-overlay {
              opacity: 1;
            }

            .overlay-image-title {
              color: #ffffff !important;
              font-size: 15px;
              font-weight: 700;
              font-family: 'Playfair Display', serif;
              display: block;
              margin-bottom: 4px;
            }

            .gold-category-tag {
              background: rgba(212, 175, 55, 0.25) !important;
              border: 1px solid ${accentGold} !important;
              color: #ffffff !important;
              border-radius: 6px;
              font-size: 10px;
              font-weight: 700;
              margin: 0;
            }

            .preview-mask-text {
              font-size: 13px;
              font-weight: 700;
              color: #ffffff;
              display: flex;
              align-items: center;
              justify-content: center;
            }

            .empty-gallery-box {
              padding: 80px 0;
              background: #ffffff;
              border-radius: 20px;
              border: 1px dashed rgba(212, 175, 55, 0.3);
            }

            .custom-scroll::-webkit-scrollbar {
              height: 4px;
            }
            .custom-scroll::-webkit-scrollbar-thumb {
              background: rgba(212, 175, 55, 0.3);
              border-radius: 4px;
            }
          `,
          }}
        />
      </div>
    </ConfigProvider>
  );
};

export default Gallery;
