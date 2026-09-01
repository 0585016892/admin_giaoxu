import React, { useMemo, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Layout,
  Dropdown,
  Space,
  Avatar,
  Tooltip,
  ConfigProvider,
  Tag,
} from "antd";
import {
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  QuestionCircleOutlined,
  HeartFilled,
  StarFilled,
  CrownFilled,
  SmileOutlined,
  DownOutlined,
} from "@ant-design/icons";

import { useUser } from "../../context/UserContext";
import HelpModalCate from "../../components/HelpModalCate";

const { Header } = Layout;
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export default function AdminHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useUser();
  const [helpOpen, setHelpOpen] = useState(false);
  console.log(user);

  useEffect(() => {
    const path = location.pathname;

    let title = "Giáo lý • Sống đạo";

    if (path === "/catechist") {
      title = "Tổng quan";
    } else if (path === "/catechist/classes") {
      title = "Quản lý lớp học";
    } else if (path === "/catechist/students") {
      title = "Quản lý học sinh";
    } else if (path === "/catechist/games") {
      title = "Kho trò chơi";
    } else if (path === "/catechist/results") {
      title = "Kết quả học tập";
    } else if (path === "/catechist/leaderboard") {
      title = "Bảng xếp hạng";
    } else if (path === "/catechist/lessons") {
      title = "Bài học & Câu hỏi";
    } else if (path === "/catechist-management") {
      title = "Quản lý giáo lý viên";
    } else if (path === "/catechist/profile") {
      title = "Trang cá nhân";
    } else if (path === "/login") {
      title = "Đăng nhập Giáo Lý Viên";
    }
    document.title = `${title} | Giáo lý • Sống đạo`;
  }, [location.pathname]);
  /* =========================================================
     AVATAR URL
  ========================================================= */
  const userAvatarUrl = useMemo(() => {
    if (!user?.avatar) return null;
    if (
      user.avatar.startsWith("http://") ||
      user.avatar.startsWith("https://") ||
      user.avatar.startsWith("blob:")
    ) {
      return user.avatar;
    }
    const normalized = user.avatar.startsWith("/")
      ? user.avatar
      : `/${user.avatar}`;
    return `${API_URL}${normalized}`;
  }, [user?.avatar]);

  /* =========================================================
     ROLE HELPER
  ========================================================= */
  const translateRole = (role) => {
    switch (role) {
      case "priest":
        return "Linh mục Chánh xứ ✝️";
      case "admin":
        return "Ban Quản Trị ✨";
      case "teacher":
      case "catechist":
        return "Huynh Trưởng / GLV 💖";
      case "liturgy_manager":
        return "Ban Phụng Vụ ⛪";
      case "media_manager":
        return "Ban Truyền Thông 📸";
      default:
        return "Hội đồng Mục vụ 🌿";
    }
  };

  /* =========================================================
     ACCOUNT TYPE CONFIG
  ========================================================= */
  const accountType = useMemo(() => {
    const type = String(user?.account_type || "")
      .trim()
      .toLowerCase();
    if (type === "vip") {
      return {
        key: "vip",
        label: "VIP",
        icon: <CrownFilled />,
        color: "#D97706",
        bg: "#FEF3C7",
        border: "#FDE68A",
      };
    }
    return {
      key: "member",
      label: "Thành viên",
      icon: <StarFilled />,
      color: "#64748B",
      bg: "#F1F5F9",
      border: "#CBD5E1",
    };
  }, [user?.account_type]);

  const userName =
    user?.username ||
    user?.full_name ||
    user?.name ||
    user?.email ||
    "Huynh Trưởng";

  /* =========================================================
     MENU & NAVIGATE HANDLER
  ========================================================= */
  const handleMenuClick = ({ key }) => {
    switch (key) {
      case "profile":
        navigate("/catechist/profile");
        break;
      case "settings":
        navigate("/catechist/settings");
        break;
      case "logout":
        if (typeof logout === "function") {
          logout();
        }
        navigate("/login"); // Điều hướng về trang login sau khi đăng xuất
        break;
      default:
        break;
    }
  };

  const menuItems = [
    {
      key: "account-info",
      disabled: true,
      label: (
        <div className="chibi-menu-header">
          <span className="chibi-menu-sub">Tài khoản hiện tại</span>
          <div className="chibi-menu-name">{userName}</div>
          <div className="chibi-menu-tags">
            <Tag className="chibi-tag-role">{translateRole(user?.role)}</Tag>
            <Tag
              icon={accountType.icon}
              style={{
                color: accountType.color,
                background: accountType.bg,
                borderColor: accountType.border,
              }}
              className="chibi-tag-account"
            >
              {accountType.label}
            </Tag>
          </div>
        </div>
      ),
    },
    { type: "divider" },
    {
      key: "profile",
      icon: <SmileOutlined style={{ color: "#FF6B8B" }} />,
      label: <span>Trang cá nhân</span>,
    },
    {
      key: "settings",
      icon: <SettingOutlined style={{ color: "#A855F7" }} />,
      label: <span>Thiết lập hệ thống</span>,
    },
    { type: "divider" },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: <span>Đăng xuất</span>,
      danger: true,
    },
  ];

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#FF6B8B",
          borderRadius: 16,
          fontFamily: "'Quicksand', 'Be Vietnam Pro', sans-serif",
        },
      }}
    >
      <div className="chibi-header-wrapper">
        <Header className="chibi-pastel-header">
          {/* BRAND LOGO - NAVIGATE HOME */}
          <div className="chibi-brand-pill" onClick={() => navigate("/")}>
            <div className="chibi-logo-box">
              <HeartFilled className="chibi-heart-icon" />
            </div>
            <div className="chibi-brand-text">
              <span className="chibi-title">GIÁO LÝ • SỐNG ĐẠO</span>
              <span className="chibi-sub">Nụ Cười Mới ✨</span>
            </div>
          </div>

          {/* RIGHT CONTROLS */}
          <Space size={10} align="center">
            {/* HELP BUTTON */}
            <Tooltip title="Hướng dẫn sử dụng nè!" placement="bottom">
              <button
                className="chibi-btn-help"
                onClick={() => setHelpOpen(true)}
              >
                <QuestionCircleOutlined className="chibi-icon-help" />
                <span className="chibi-text-help">Trợ giúp</span>
              </button>
            </Tooltip>

            {/* USER PROFILE DROPDOWN */}
            <Dropdown
              menu={{ items: menuItems, onClick: handleMenuClick }}
              placement="bottomRight"
              trigger={["click"]}
              overlayClassName="chibi-dropdown-overlay"
            >
              <div className="chibi-user-badge">
                <div className="chibi-avatar-wrapper">
                  <Avatar
                    size={36}
                    className="chibi-avatar-main"
                    src={userAvatarUrl}
                    icon={<UserOutlined />}
                  />
                  <span className={`chibi-mini-star ${accountType.key}`}>
                    {accountType.key === "vip" ? (
                      <CrownFilled />
                    ) : (
                      <StarFilled />
                    )}
                  </span>
                </div>

                <div className="chibi-user-info">
                  <span className="chibi-user-name">{userName}</span>
                  <span className="chibi-user-role">
                    {translateRole(user?.role)}
                  </span>
                </div>

                <DownOutlined className="chibi-arrow-icon" />
              </div>
            </Dropdown>
          </Space>

          {/* HELP MODAL */}
          <HelpModalCate open={helpOpen} onCancel={() => setHelpOpen(false)} />

          {/* STYLES */}
          <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@600;700;800&display=swap');

            .chibi-header-wrapper {
              position: sticky;
              top: 0;
              z-index: 1000;
              padding: 8px 16px 0;
              background: transparent;
            }

            .chibi-pastel-header {
              background: rgba(255, 255, 255, 0.88) !important;
              backdrop-filter: blur(16px) saturate(180%);
              -webkit-backdrop-filter: blur(16px) saturate(180%);
              height: 62px !important;
              line-height: 62px !important;
              border-radius: 20px;
              padding: 0 12px !important;
              display: flex;
              align-items: center;
              justify-content: space-between;
              border: 1.5px solid #FFE4E6;
              box-shadow: 0 8px 20px -4px rgba(255, 182, 193, 0.25);
            }

            /* BRAND */
            .chibi-brand-pill {
              display: flex;
              align-items: center;
              gap: 8px;
              padding: 5px 12px 5px 6px;
              background: #FFF1F2;
              border: 1px solid #FECDD3;
              border-radius: 16px;
              cursor: pointer;
              transition: all 0.25s ease;
            }
            .chibi-brand-pill:hover {
              transform: translateY(-1px) scale(1.02);
              background: #FFE4E6;
            }

            .chibi-logo-box {
              width: 32px;
              height: 32px;
              border-radius: 12px;
              background: linear-gradient(135deg, #FF6B8B 0%, #FF85A1 100%);
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 3px 8px rgba(255, 107, 139, 0.3);
            }

            .chibi-heart-icon {
              color: #FFF;
              font-size: 15px;
              animation: chibiPulse 2s infinite ease-in-out;
            }

            @keyframes chibiPulse {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.15); }
            }

            .chibi-brand-text {
              display: flex;
              flex-direction: column;
              line-height: 1.15;
            }

            .chibi-title {
              color: #475569;
              font-size: 12px;
              font-weight: 800;
              letter-spacing: 0.2px;
            }

            .chibi-sub {
              color: #FF6B8B;
              font-size: 10px;
              font-weight: 700;
            }

            /* HELP BUTTON */
            .chibi-btn-help {
              display: flex;
              align-items: center;
              gap: 5px;
              height: 36px;
              padding: 0 12px;
              background: #F0FDF4;
              border: 1px solid #BBF7D0;
              border-radius: 14px;
              cursor: pointer;
              transition: all 0.2s ease;
            }
            .chibi-btn-help:hover {
              background: #DCFCE7;
              transform: translateY(-1px);
            }
            .chibi-icon-help {
              font-size: 15px;
              color: #16A34A;
            }
            .chibi-text-help {
              font-size: 12px;
              font-weight: 700;
              color: #15803D;
            }

            /* USER BADGE */
            .chibi-user-badge {
              display: flex;
              align-items: center;
              gap: 8px;
              padding: 4px 10px 4px 5px;
              background: #FAF5FF;
              border: 1px solid #E9D5FF;
              border-radius: 16px;
              cursor: pointer;
              transition: all 0.2s ease;
            }
            .chibi-user-badge:hover {
              background: #F3E8FF;
              border-color: #D8B4FE;
            }

            .chibi-avatar-wrapper {
              position: relative;
              display: flex;
              align-items: center;
            }

            .chibi-avatar-main {
              border: 2px solid #FFF;
              box-shadow: 0 2px 6px rgba(168, 85, 247, 0.2);
              background-color: #F472B6;
            }

            .chibi-mini-star {
              position: absolute;
              bottom: -2px;
              right: -3px;
              width: 14px;
              height: 14px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 7px;
              color: #FFF;
              border: 1.5px solid #FFF;
            }
            .chibi-mini-star.vip { background: #F59E0B; }
            .chibi-mini-star.member { background: #94A3B8; }

            .chibi-user-info {
              display: flex;
              flex-direction: column;
              text-align: left;
              line-height: 1.15;
            }

            .chibi-user-name {
              font-size: 12px;
              font-weight: 800;
              color: #334155;
              max-width: 120px;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }

            .chibi-user-role {
              font-size: 9.5px;
              font-weight: 700;
              color: #9333EA;
              max-width: 130px;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }

            .chibi-arrow-icon {
              font-size: 9px;
              color: #A855F7;
              margin-left: 2px;
            }

            /* DROPDOWN OVERLAY */
            .chibi-dropdown-overlay .ant-dropdown-menu {
              padding: 8px !important;
              border-radius: 18px !important;
              border: 1.5px solid #F3E8FF !important;
              box-shadow: 0 12px 28px rgba(168, 85, 247, 0.15) !important;
            }

            .chibi-menu-header {
              padding: 4px 4px 6px;
              min-width: 190px;
            }
            .chibi-menu-sub {
              font-size: 11px;
              color: #94A3B8;
              font-weight: 600;
            }
            .chibi-menu-name {
              font-size: 14px;
              color: #1E293B;
              font-weight: 800;
              margin: 2px 0 6px;
            }
            .chibi-menu-tags {
              display: flex;
              gap: 4px;
              flex-wrap: wrap;
            }
            .chibi-tag-role {
              margin: 0;
              border-radius: 8px;
              border: 1px solid #E9D5FF;
              background: #FAF5FF;
              color: #9333EA;
              font-size: 10px;
              font-weight: 700;
            }
            .chibi-tag-account {
              margin: 0;
              border-radius: 8px;
              font-size: 10px;
              font-weight: 800;
            }

            /* RESPONSIVE MOBILE */
            @media (max-width: 640px) {
              .chibi-header-wrapper { padding: 6px 8px 0; }
              .chibi-pastel-header { height: 54px !important; padding: 0 8px !important; }
              .chibi-brand-text,
              .chibi-text-help,
              .chibi-user-info,
              .chibi-arrow-icon { display: none; }
              .chibi-brand-pill { padding: 4px; }
              .chibi-btn-help { padding: 0 10px; }
              .chibi-user-badge { padding: 3px; }
            }
          `}</style>
        </Header>
      </div>
    </ConfigProvider>
  );
}
