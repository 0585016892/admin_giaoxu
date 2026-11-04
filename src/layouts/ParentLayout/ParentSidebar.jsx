import React from "react";
import { Avatar, Badge, Drawer, Tooltip } from "antd";
import {
  HomeFilled,
  TeamOutlined,
  BellOutlined,
  QuestionCircleOutlined,
  UserOutlined,
  SettingOutlined,
  LeftOutlined,
  RightOutlined,
  HeartFilled,
  MenuOutlined,
  CloseOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import logo from "../../assets/images/logoXn.png";

export const MENU_ITEMS = [
  {
    key: "/parent",
    label: "Trang chủ",
    icon: <HomeFilled />,
    description: "Tổng quan gia đình",
  },
  {
    key: "/parent/students",
    label: "Con của tôi",
    icon: <TeamOutlined />,
    description: "Theo dõi các con",
  },
  {
    key: "/parent/notifications",
    label: "Thông báo",
    icon: <BellOutlined />,
    description: "Tin mới từ giáo xứ",
  },
  {
    key: "/parent/support",
    label: "Hỗ trợ",
    icon: <QuestionCircleOutlined />,
    description: "Liên hệ FaithEdu",
  },
];
export const ACCOUNT_ITEMS = [
  {
    key: "/parent/profile",
    label: "Hồ sơ của tôi",
    icon: <UserOutlined />,
    description: "Thông tin tài khoản",
  },
  {
    key: "/parent/settings",
    label: "Cài đặt",
    icon: <SettingOutlined />,
    description: "Thiết lập ứng dụng",
  },
];

const CSS = `
.fe-side,.fe-side *,.fe-bottom,.fe-bottom *,.fe-drawer,.fe-drawer *{box-sizing:border-box}
.fe-side{height:100%;display:flex;flex-direction:column;background:#fff;color:#173B5E;font-family:"Be Vietnam Pro",Inter,sans-serif;overflow:hidden}
.fe-side__brand{height:80px;flex-shrink:0;display:flex;align-items:center;gap:10px;padding:15px;border-bottom:1px solid #e9edf2}
.fe-side__logo{width:43px;height:43px;object-fit:contain;flex-shrink:0}
.fe-side__brandcopy{min-width:0;flex:1;white-space:nowrap;overflow:hidden}
.fe-side__name{font-size:20px;font-weight:800;letter-spacing:-.6px}.fe-side__name span{color:#D9A441}
.fe-side__subtitle{font-size:10px;color:#8492a5;margin-top:3px}
.fe-side__toggle{width:33px;height:33px;flex-shrink:0;border:1px solid #e2e8f0;border-radius:11px;background:#f7f9fc;color:#173B5E;cursor:pointer}
.fe-side__profile{margin:16px 12px 12px;padding:12px;display:flex;align-items:center;gap:10px;background:linear-gradient(125deg,#f2f6fa,#fffaf0);border:1px solid #e9edf2;border-radius:16px;min-width:0}
.fe-side__avatar{background:#173B5E!important;color:#fff!important;flex-shrink:0}
.fe-side__profiletext{min-width:0}.fe-side__username{font-size:12px;font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.fe-side__role{font-size:10px;color:#8291a3;margin-top:4px}
.fe-side__scroll{flex:1;min-height:0;overflow-y:auto;padding:8px 12px;scrollbar-width:thin}
.fe-side__section{font-size:10px;letter-spacing:.7px;text-transform:uppercase;font-weight:700;color:#94a3b8;padding:12px 12px 8px}
.fe-side__item{width:100%;height:46px;display:flex;align-items:center;gap:12px;padding:0 13px;margin:3px 0;border:0;border-radius:12px;background:transparent;color:#65758a;text-align:left;font:600 12px "Be Vietnam Pro",Inter,sans-serif;cursor:pointer;transition:background .2s,color .2s}
.fe-side__item:hover{background:#eef3f7;color:#173B5E}.fe-side__item.active{background:#fff7e7;color:#173B5E;box-shadow:inset 3px 0 #D9A441}
.fe-side__itemicon{width:23px;flex-shrink:0;text-align:center;font-size:19px}.fe-side__itemlabel{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.fe-side__badge{margin-left:auto}
.fe-side__footer{margin:10px 12px 14px;padding:13px;border-radius:14px;background:#fff9ee;border:1px solid #f2e4c6;font-size:11px;color:#173B5E;line-height:1.6}.fe-side__footer svg{color:#D9A441}
.fe-side.collapsed .fe-side__brand{justify-content:center;padding:12px 5px;flex-direction:column;height:108px;gap:6px}.fe-side.collapsed .fe-side__logo{width:38px;height:38px}.fe-side.collapsed .fe-side__brandcopy,.fe-side.collapsed .fe-side__profiletext,.fe-side.collapsed .fe-side__section,.fe-side.collapsed .fe-side__itemlabel,.fe-side.collapsed .fe-side__badge,.fe-side.collapsed .fe-side__footer{display:none}
.fe-side.collapsed .fe-side__profile{justify-content:center;margin:14px 7px;padding:9px 3px}.fe-side.collapsed .fe-side__scroll{padding:8px 7px}.fe-side.collapsed .fe-side__item{justify-content:center;padding:0}.fe-side.collapsed .fe-side__itemicon{width:auto}.fe-side.collapsed .fe-side__toggle{height:26px;width:38px}
.fe-bottom{display:none}
.fe-drawer .ant-drawer-body{padding:0!important}.fe-drawer .ant-drawer-content{border-radius:0 20px 20px 0;overflow:hidden}.fe-drawer .ant-drawer-mask{backdrop-filter:blur(3px)}
.fe-drawer__inner{height:100%;display:flex;flex-direction:column;background:#fff}.fe-drawer__top{display:flex;align-items:center;gap:10px;padding:16px;border-bottom:1px solid #e9edf2}.fe-drawer__top img{width:42px;height:42px;object-fit:contain}.fe-drawer__title{font-weight:800;color:#173B5E;font-size:18px;flex:1}.fe-drawer__title span{color:#D9A441}.fe-drawer__close{width:38px;height:38px;border:0;border-radius:11px;background:#eef3f7;color:#173B5E;font-size:17px}
.fe-drawer__profile{display:flex;align-items:center;gap:12px;margin:16px;padding:13px;border-radius:15px;background:#f7f9fc}.fe-drawer__list{padding:0 14px;flex:1;overflow-y:auto}.fe-drawer__item{height:55px}.fe-drawer__desc{display:block;font-size:10px;color:#94a3b8;font-weight:400;margin-top:3px}.fe-drawer__logout{margin:12px 16px calc(18px + env(safe-area-inset-bottom));height:45px;border:0;border-radius:12px;background:#fff1f1;color:#b94343;font-weight:700}
@media(max-width:767px){.fe-bottom{position:fixed;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));left:10px;right:10px;bottom:calc(9px + env(safe-area-inset-bottom));z-index:1100;height:68px;padding:6px;gap:4px;border:1px solid #e2e8f0;border-radius:20px;background:rgba(255,255,255,.97);box-shadow:0 10px 34px rgba(16,42,67,.15);backdrop-filter:blur(18px)}.fe-bottom__item{border:0;background:transparent;border-radius:14px;display:flex;flex-direction:column;justify-content:center;align-items:center;gap:4px;color:#7c8da1;font:600 10px "Be Vietnam Pro",Inter,sans-serif;min-width:0}.fe-bottom__item.active{background:#fff7e7;color:#173B5E}.fe-bottom__icon{font-size:20px;position:relative}.fe-bottom__more .fe-bottom__icon{color:#173B5E}.fe-bottom__count{position:absolute;top:-7px;right:-12px;background:#c94c4c;color:white;border-radius:20px;font-size:9px;padding:1px 4px}}
@media(max-width:360px){.fe-bottom{left:6px;right:6px}.fe-bottom__item{font-size:9px}}
@media(prefers-reduced-motion:reduce){.fe-side *,.fe-bottom *{transition:none!important}}
`;

export default function ParentSidebar({
  user,
  selectedKey,
  onMenuClick,
  onContactClick,
  onLogout,
  collapsed = false,
  onToggleCollapse,
  mobileDrawerOpen = false,
  onMoreClick,
  onCloseMobileDrawer,
  isMobile = false,
  notificationCount = 0,
}) {
  const name =
    user?.name ||
    user?.full_name ||
    user?.fullName ||
    user?.username ||
    "Phụ huynh";
  const avatar = user?.avatar || user?.avatar_url || user?.avatarUrl;
  const count = Number(notificationCount) || 0;
  const navigateItem = (key) => {
    onCloseMobileDrawer?.();
    if (key === "/parent/support" && onContactClick) onContactClick();
    else onMenuClick?.({ key });
  };
  const itemButton = (item, mobile = false) => (
    <Tooltip
      key={item.key}
      title={!mobile && collapsed ? item.label : ""}
      placement="right"
    >
      <button
        type="button"
        className={`fe-side__item ${mobile ? "fe-drawer__item" : ""} ${selectedKey === item.key ? "active" : ""}`}
        onClick={() => navigateItem(item.key)}
        aria-current={selectedKey === item.key ? "page" : undefined}
      >
        <span className="fe-side__itemicon">{item.icon}</span>
        <span className="fe-side__itemlabel">
          {item.label}
          {mobile && (
            <small className="fe-drawer__desc">{item.description}</small>
          )}
        </span>
        {item.key === "/parent/notifications" && count > 0 && (
          <Badge className="fe-side__badge" count={count} overflowCount={99} />
        )}
      </button>
    </Tooltip>
  );
  return (
    <>
      <style>{CSS}</style>
      {!isMobile && (
        <aside
          className={`fe-side ${collapsed ? "collapsed" : ""}`}
          aria-label="Điều hướng phụ huynh"
        >
          <div className="fe-side__brand">
            <img className="fe-side__logo" src={logo} alt="FaithEdu" />
            <div className="fe-side__brandcopy">
              <div className="fe-side__name">
                Faith<span>Edu</span>
              </div>
              <div className="fe-side__subtitle">Không gian phụ huynh</div>
            </div>
            <button
              className="fe-side__toggle"
              type="button"
              onClick={onToggleCollapse}
              aria-label={collapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
              aria-expanded={!collapsed}
            >
              {collapsed ? <RightOutlined /> : <LeftOutlined />}
            </button>
          </div>
          <div className="fe-side__profile">
            <Avatar src={avatar} size={40} className="fe-side__avatar">
              {name.charAt(0).toUpperCase()}
            </Avatar>
            <div className="fe-side__profiletext">
              <div className="fe-side__username">{name}</div>
              <div className="fe-side__role">Phụ huynh</div>
            </div>
          </div>
          <nav className="fe-side__scroll">
            <div className="fe-side__section">Không gian gia đình</div>
            {MENU_ITEMS.map((i) => itemButton(i))}
            <div className="fe-side__section">Tài khoản</div>
            {ACCOUNT_ITEMS.map((i) => itemButton(i))}
          </nav>
          {!collapsed && (
            <div className="fe-side__footer">
              <HeartFilled /> Cùng con lớn lên trong đức tin
            </div>
          )}
        </aside>
      )}
      {isMobile && (
        <>
          <nav className="fe-bottom" aria-label="Điều hướng nhanh">
            {MENU_ITEMS.slice(0, 3).map((item) => (
              <button
                type="button"
                key={item.key}
                className={`fe-bottom__item ${selectedKey === item.key ? "active" : ""}`}
                onClick={() => navigateItem(item.key)}
              >
                <span className="fe-bottom__icon">
                  {item.icon}
                  {item.key === "/parent/notifications" && count > 0 && (
                    <span className="fe-bottom__count">
                      {count > 9 ? "9+" : count}
                    </span>
                  )}
                </span>
                <span>
                  {item.key === "/parent/students" ? "Các con" : item.label}
                </span>
              </button>
            ))}
            <button
              type="button"
              className="fe-bottom__item fe-bottom__more"
              onClick={onMoreClick}
              aria-expanded={mobileDrawerOpen}
            >
              <span className="fe-bottom__icon">
                {mobileDrawerOpen ? <CloseOutlined /> : <MenuOutlined />}
              </span>
              <span>Thêm</span>
            </button>
          </nav>
          <Drawer
            rootClassName="fe-drawer"
            placement="left"
            width="min(320px, 88vw)"
            open={mobileDrawerOpen}
            onClose={onCloseMobileDrawer}
            closable={false}
            title={null}
          >
            <div className="fe-drawer__inner">
              <div className="fe-drawer__top">
                <img src={logo} alt="FaithEdu" />
                <div className="fe-drawer__title">
                  Faith<span>Edu</span>
                </div>
                <button
                  type="button"
                  className="fe-drawer__close"
                  onClick={onCloseMobileDrawer}
                  aria-label="Đóng menu"
                >
                  <CloseOutlined />
                </button>
              </div>
              <div className="fe-drawer__profile">
                <Avatar src={avatar} size={44} className="fe-side__avatar">
                  {name.charAt(0).toUpperCase()}
                </Avatar>
                <div className="fe-side__profiletext">
                  <div className="fe-side__username">{name}</div>
                  <div className="fe-side__role">Tài khoản phụ huynh</div>
                </div>
              </div>
              <nav className="fe-drawer__list">
                <div className="fe-side__section">Không gian gia đình</div>
                {MENU_ITEMS.map((i) => itemButton(i, true))}
                <div className="fe-side__section">Tài khoản</div>
                {ACCOUNT_ITEMS.map((i) => itemButton(i, true))}
              </nav>
              <button
                type="button"
                className="fe-drawer__logout"
                onClick={() => {
                  onCloseMobileDrawer?.();
                  onLogout?.();
                }}
              >
                <LogoutOutlined /> Đăng xuất
              </button>
            </div>
          </Drawer>
        </>
      )}
    </>
  );
}
