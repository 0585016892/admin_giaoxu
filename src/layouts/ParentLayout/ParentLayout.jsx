import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Avatar, Drawer, Grid, Layout } from "antd";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  BellOutlined,
  CloseOutlined,
  HeartFilled,
  HomeOutlined,
  LogoutOutlined,
  MenuOutlined,
  RightOutlined,
  SettingOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useUser } from "../../context/UserContext";
import ParentSidebar, { MENU_ITEMS } from "./ParentSidebar";
import ParentHeader from "./ParentHeader";

const { Sider, Content } = Layout;
const { useBreakpoint } = Grid;
const LOGO = require("../../assets/images/logoXn.png");
const NAV = [
  { key: "/parent", label: "Trang chủ", icon: <HomeOutlined /> },
  { key: "/parent/students", label: "Các con", icon: <TeamOutlined /> },
  { key: "/parent/notifications", label: "Thông báo", icon: <BellOutlined /> },
];
const CSS = `
.fe-parent-layout{--navy:#173B5E;--gold:#D9A441;--muted:#728299;--line:#e8edf4;--sidebar:272px;--header:76px;min-height:100dvh;background:#f5f7fb;color:#20344c;font-family:'Be Vietnam Pro',Inter,system-ui,sans-serif}
.fe-parent-layout *{box-sizing:border-box}
.fe-parent-layout .ant-layout{background:transparent;min-width:0}
.fe-parent-sider{position:fixed!important;inset:0 auto 0 0;z-index:1000;height:100dvh!important;background:white!important;border-right:1px solid var(--line);box-shadow:4px 0 30px rgba(26,56,87,.035)}
.fe-parent-sider .ant-layout-sider-children{height:100%;overflow-y:auto;scrollbar-width:thin;scrollbar-color:#e0e7f0 transparent}
.fe-parent-main{margin-left:var(--sidebar);min-height:100dvh;min-width:0;transition:margin-left .2s ease}
.fe-parent-header{position:sticky;top:0;z-index:800;height:var(--header);background:rgba(255,255,255,.91);border-bottom:1px solid rgba(226,233,242,.85);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px)}
.fe-parent-header>.parent-header{height:100%!important;min-height:100%!important;width:100%!important}
.fe-parent-content{padding:30px clamp(20px,3vw,48px) 56px;min-height:calc(100dvh - var(--header));background:radial-gradient(ellipse at 100% 0%,rgba(217,164,65,.075),transparent 36%),radial-gradient(ellipse at 0% 70%,rgba(23,59,94,.035),transparent 42%),#f5f7fb;overflow-x:clip}
.fe-parent-content-inner{width:100%;max-width:1560px;margin:0 auto;min-width:0;animation:fe-page-in .28s ease both}
.fe-parent-content-inner>*{max-width:100%;min-width:0}
.fe-parent-content-inner .ant-table-wrapper{max-width:100%;overflow-x:auto}
@keyframes fe-page-in{from{opacity:.3;transform:translateY(7px)}to{opacity:1;transform:translateY(0)}}
.fe-parent-drawer .ant-drawer-mask{background:rgba(11,29,49,.48)!important;backdrop-filter:blur(4px)}
.fe-parent-drawer .ant-drawer-content{background:#fff;border-radius:0 24px 24px 0;overflow:hidden}
.fe-parent-drawer .ant-drawer-body{padding:0!important}
.fe-drawer-shell{display:flex;flex-direction:column;height:100%;min-height:0;background:#fff}
.fe-drawer-top{display:flex;align-items:center;justify-content:space-between;padding:24px 20px 18px;border-bottom:1px solid var(--line)}
.fe-drawer-brand{display:flex;align-items:center;gap:11px;color:var(--navy);font-size:22px;font-weight:800;letter-spacing:-.8px}
.fe-drawer-brand img{width:43px;height:43px;object-fit:contain;padding:5px;background:#fff8e9;border:1px solid #f3e6c9;border-radius:13px}
.fe-drawer-brand em{font-style:normal;color:var(--gold)}
.fe-icon-btn{display:grid;place-items:center;width:38px;height:38px;border:1px solid var(--line);border-radius:12px;background:#f7f9fc;color:#60748d;cursor:pointer}
.fe-drawer-scroll{flex:1;min-height:0;overflow-y:auto;padding:18px 16px 24px;scrollbar-width:thin}
.fe-profile-card{display:flex;align-items:center;gap:12px;padding:16px 13px;margin-bottom:23px;background:linear-gradient(120deg,#eef4f9,#fffaf0);border:1px solid #e9edf1;border-radius:18px}
.fe-profile-card .ant-avatar{flex-shrink:0;background:var(--navy);border:2px solid #fff;box-shadow:0 3px 10px #173b5e18}
.fe-profile-info{min-width:0;flex:1}.fe-profile-name{font-size:13px;font-weight:750;color:var(--navy);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.fe-profile-role{font-size:11px;color:#8290a0;margin-top:4px}
.fe-menu-heading{font-size:10px;text-transform:uppercase;letter-spacing:1.3px;font-weight:800;color:#98a4b4;padding:0 12px;margin:21px 0 9px}
.fe-drawer-link{width:100%;display:flex;align-items:center;gap:12px;padding:11px 12px;margin:3px 0;border:0;border-radius:13px;background:transparent;text-align:left;color:#5f7186;cursor:pointer;transition:background .18s,color .18s}
.fe-drawer-link:hover{background:#f5f8fc;color:var(--navy)}.fe-drawer-link.active{background:#edf3f9;color:var(--navy);font-weight:700}
.fe-drawer-link .fe-link-icon{display:grid;place-items:center;flex:0 0 39px;width:39px;height:39px;border-radius:12px;background:#f1f5f9;font-size:18px;color:#8090a3}
.fe-drawer-link.active .fe-link-icon{background:#fff;color:#b58a36;box-shadow:0 2px 8px #173b5e0c}
.fe-link-body{min-width:0;flex:1}.fe-link-label{display:block;font-size:12px;font-weight:700}.fe-link-desc{display:block;font-size:10px;color:#9ba7b5;margin-top:3px}.fe-link-arrow{font-size:11px;color:#b2becb}
.fe-faith-note{padding:15px;margin-top:22px;border:1px solid #f0e3c6;border-radius:16px;background:linear-gradient(125deg,#fff9eb,#fff)}.fe-faith-note strong{display:flex;align-items:center;gap:8px;font-size:12px;color:var(--navy)}.fe-faith-note strong svg{color:var(--gold)}.fe-faith-note p{margin:7px 0 0;font-size:11px;line-height:1.65;color:#84909d}
.fe-drawer-footer{padding:14px 16px calc(18px + env(safe-area-inset-bottom));border-top:1px solid var(--line)}.fe-logout{display:flex;align-items:center;justify-content:center;gap:9px;width:100%;padding:13px;border:0;border-radius:13px;background:#fff1f1;color:#bb4646;font-size:12px;font-weight:750;cursor:pointer}.fe-logout:hover{background:#ffe8e8}
.fe-bottom-nav{display:none}
@media(max-width:1100px) and (min-width:768px){.fe-parent-layout{--sidebar:252px}.fe-parent-content{padding:24px 22px 42px}}
@media(max-width:767px){.fe-parent-layout{--header:64px}.fe-parent-sider{display:none!important}.fe-parent-main{margin-left:0}.fe-parent-content{padding:18px 14px calc(110px + env(safe-area-inset-bottom))}.fe-bottom-nav{position:fixed;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:4px;bottom:calc(10px + env(safe-area-inset-bottom));left:12px;right:12px;z-index:1800;padding:7px;height:72px;border:1px solid #e4eaf2;border-radius:23px;background:rgba(255,255,255,.96);box-shadow:0 10px 38px rgba(16,42,67,.15);backdrop-filter:blur(20px)}.fe-bottom-item{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;border:0;border-radius:17px;background:transparent;color:#8996a7;font-size:10px;font-weight:700;cursor:pointer}.fe-bottom-item.active{background:#edf3f9;color:var(--navy)}.fe-bottom-icon{position:relative;font-size:21px;line-height:1}.fe-bottom-item.more .fe-bottom-icon{display:grid;place-items:center;width:32px;height:32px;border-radius:11px;background:var(--navy);color:#fff;font-size:17px}.fe-bottom-badge{position:absolute;right:-10px;top:-8px;min-width:17px;height:17px;padding:0 4px;border:2px solid #fff;border-radius:20px;background:#d14d50;color:#fff;font-size:9px;line-height:13px;text-align:center}}
@media(max-width:380px){.fe-parent-content{padding-left:10px;padding-right:10px}.fe-bottom-nav{left:7px;right:7px;bottom:calc(7px + env(safe-area-inset-bottom))}}
.fe-parent-layout button:focus-visible{outline:3px solid #d9a44166;outline-offset:2px}
@media(prefers-reduced-motion:reduce){.fe-parent-layout *,.fe-parent-drawer *{animation:none!important;transition:none!important}}
@media print{.fe-parent-sider,.fe-parent-header,.fe-bottom-nav{display:none!important}.fe-parent-main{margin:0!important}.fe-parent-content{padding:0;background:white}}
`;

const displayName = (user) =>
  user?.name ||
  user?.full_name ||
  user?.fullName ||
  user?.display_name ||
  user?.username ||
  "Phụ huynh";
const descriptions = {
  "/parent": "Tổng quan gia đình",
  "/parent/students": "Theo dõi hành trình của con",
  "/parent/notifications": "Tin tức và thông báo",
  "/parent/support": "Liên hệ và trợ giúp",
};

export default function ParentLayout() {
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const [drawerOpen, setDrawerOpen] = useState(false);
  const selectedKey = useMemo(() => {
    const path = location.pathname.replace(/\/$/, "") || "/parent";
    if (path === "/parent") return "/parent";
    if (path === "/parent/children" || path.startsWith("/parent/children/"))
      return "/parent/students";
    if (path === "/parent/contact" || path.startsWith("/parent/contact/"))
      return "/parent/support";
    const keys = [
      ...MENU_ITEMS.map((item) => item?.key).filter(Boolean),
      "/parent/profile",
      "/parent/settings",
    ];
    return (
      keys
        .sort((a, b) => b.length - a.length)
        .find((key) => path === key || path.startsWith(`${key}/`)) || "/parent"
    );
  }, [location.pathname]);

  useEffect(() => setDrawerOpen(false), [location.pathname, isMobile]);
  const go = useCallback(
    (path) => {
      setDrawerOpen(false);
      if (path && path !== location.pathname) navigate(path);
    },
    [location.pathname, navigate],
  );
  const handleLogout = useCallback(async () => {
    try {
      if (typeof logout === "function") await logout();
      else {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    } catch (error) {
      console.error("Parent logout failed:", error);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } finally {
      setDrawerOpen(false);
      navigate("/", { replace: true });
    }
  }, [logout, navigate]);

  if (!user) return <Navigate to="/" replace />;
  if (user.role !== "parent") {
    return (
      <Navigate
        to={
          ["catechist", "teacher", "admin_catechist"].includes(user.role)
            ? "/catechist"
            : "/"
        }
        replace
      />
    );
  }
  const name = displayName(user);
  const avatar = user.avatar || user.avatar_url || user.avatarUrl;
  const unread = Math.max(
    0,
    Number(user.notificationCount ?? user.unreadNotificationCount ?? 0) || 0,
  );
  const menuClick = ({ key }) =>
    go(key === "/parent/support" ? "/parent/contact" : key);
  const menuButton = (item, description) => (
    <button
      key={item.key}
      type="button"
      className={`fe-drawer-link ${selectedKey === item.key ? "active" : ""}`}
      onClick={() =>
        go(item.key === "/parent/support" ? "/parent/contact" : item.key)
      }
    >
      <span className="fe-link-icon">{item.icon}</span>
      <span className="fe-link-body">
        <span className="fe-link-label">{item.label}</span>
        <span className="fe-link-desc">{description}</span>
      </span>
      <RightOutlined className="fe-link-arrow" />
    </button>
  );
  return (
    <>
      <style>{CSS}</style>
      <Layout className="fe-parent-layout">
        {!isMobile && (
          <Sider
            width={screens.lg ? 272 : 252}
            theme="light"
            trigger={null}
            className="fe-parent-sider"
          >
            <ParentSidebar
              user={user}
              selectedKey={selectedKey}
              onMenuClick={menuClick}
              onContactClick={() => go("/parent/contact")}
              onMoreClick={() => setDrawerOpen(true)}
              onCloseMobileDrawer={() => setDrawerOpen(false)}
              onLogout={handleLogout}
              notificationCount={unread}
            />
          </Sider>
        )}
        {isMobile && (
          <Drawer
            placement="left"
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            width="min(336px, 90vw)"
            closable={false}
            title={null}
            rootClassName="fe-parent-drawer"
            styles={{ body: { padding: 0 }, header: { display: "none" } }}
          >
            <div className="fe-drawer-shell">
              <div className="fe-drawer-top">
                <div className="fe-drawer-brand">
                  <img src={LOGO} alt="FaithEdu" />
                  <span>
                    Faith<em>Edu</em>
                  </span>
                </div>
                <button
                  className="fe-icon-btn"
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  aria-label="Đóng menu"
                >
                  <CloseOutlined />
                </button>
              </div>
              <div className="fe-drawer-scroll">
                <div className="fe-profile-card">
                  <Avatar
                    size={48}
                    src={avatar}
                    icon={!avatar ? <UserOutlined /> : undefined}
                  />
                  <div className="fe-profile-info">
                    <div className="fe-profile-name">{name}</div>
                    <div className="fe-profile-role">
                      Phụ huynh · FaithEdu Family
                    </div>
                  </div>
                </div>
                <div className="fe-menu-heading">Không gian gia đình</div>
                {MENU_ITEMS.filter(Boolean).map((item) =>
                  menuButton(
                    item,
                    descriptions[item.key] || "Khám phá chức năng",
                  ),
                )}
                <div className="fe-menu-heading">Tài khoản</div>
                {menuButton(
                  {
                    key: "/parent/profile",
                    label: "Hồ sơ của tôi",
                    icon: <UserOutlined />,
                  },
                  "Thông tin cá nhân",
                )}
                {menuButton(
                  {
                    key: "/parent/settings",
                    label: "Cài đặt",
                    icon: <SettingOutlined />,
                  },
                  "Thiết lập ứng dụng",
                )}
                <div className="fe-faith-note">
                  <strong>
                    <HeartFilled /> Cùng con lớn lên trong đức tin
                  </strong>
                  <p>
                    Đồng hành cùng con trong hành trình học giáo lý và sống đạo
                    mỗi ngày.
                  </p>
                </div>
              </div>
              <div className="fe-drawer-footer">
                <button
                  type="button"
                  className="fe-logout"
                  onClick={handleLogout}
                >
                  <LogoutOutlined /> Đăng xuất tài khoản
                </button>
              </div>
            </div>
          </Drawer>
        )}
        <Layout className="fe-parent-main">
          <header className="fe-parent-header">
            <ParentHeader
              user={user}
              isMobile={isMobile}
              onMenuOpen={() => setDrawerOpen(true)}
              onProfile={() => go("/parent/profile")}
              onLogout={handleLogout}
              onNotifications={() => go("/parent/notifications")}
              notificationCount={unread}
            />
          </header>
          <Content className="fe-parent-content">
            <main className="fe-parent-content-inner" key={location.pathname}>
              <Outlet />
            </main>
          </Content>
        </Layout>
        {isMobile && (
          <nav className="fe-bottom-nav" aria-label="Điều hướng phụ huynh">
            {NAV.map((item) => (
              <button
                key={item.key}
                type="button"
                className={`fe-bottom-item ${selectedKey === item.key ? "active" : ""}`}
                onClick={() => go(item.key)}
                aria-current={selectedKey === item.key ? "page" : undefined}
              >
                <span className="fe-bottom-icon">
                  {item.icon}
                  {item.key === "/parent/notifications" && unread > 0 && (
                    <span className="fe-bottom-badge">
                      {unread > 99 ? "99+" : unread}
                    </span>
                  )}
                </span>
                <span>{item.label}</span>
              </button>
            ))}
            <button
              type="button"
              className={`fe-bottom-item more ${drawerOpen ? "active" : ""}`}
              onClick={() => setDrawerOpen(true)}
              aria-label="Mở menu"
              aria-expanded={drawerOpen}
            >
              <span className="fe-bottom-icon">
                <MenuOutlined />
              </span>
              <span>Thêm</span>
            </button>
          </nav>
        )}
      </Layout>
    </>
  );
}
