import React from "react";
import { Avatar, Badge, Dropdown } from "antd";
import {
  MenuOutlined,
  BellOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  DownOutlined,
} from "@ant-design/icons";

const CSS = `
.fe-head{height:72px;padding:0 clamp(16px,2.5vw,32px);display:flex;align-items:center;justify-content:space-between;gap:12px;background:#fff;border-bottom:1px solid #e9eef3;color:#173b5e;font-family:inherit}
.fe-head *{box-sizing:border-box}.fe-head__left,.fe-head__right{display:flex;align-items:center;gap:12px;min-width:0}.fe-head__title{font-size:18px;font-weight:750;line-height:1.35;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.fe-head__sub{font-size:11px;color:#8793a3;margin-top:3px}.fe-head__button{height:39px;width:39px;display:grid;place-items:center;background:#fff;border:1px solid #e7edf2;border-radius:11px;color:#173b5e;font-size:18px;cursor:pointer;flex:none}.fe-head__button:hover,.fe-head__account:hover{background:#f4f7fa}.fe-head__account{display:flex;align-items:center;gap:9px;border:1px solid #e7edf2;border-radius:12px;background:#fff;padding:5px 9px 5px 5px;cursor:pointer;max-width:230px;color:#173b5e}.fe-head__avatar{background:#173b5e!important;color:white!important}.fe-head__username{font-size:12px;font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:125px}.fe-head__role{font-size:10px;color:#8b97a5;margin-top:3px}.fe-head__chevron{font-size:10px;color:#91a0b0}.fe-head__mobile{display:none}
@media(max-width:767px){.fe-head{height:62px;padding:0 13px;gap:8px}.fe-head__mobile{display:grid}.fe-head__title{font-size:15px}.fe-head__sub,.fe-head__user-meta,.fe-head__chevron{display:none}.fe-head__right,.fe-head__left{gap:8px}.fe-head__button{height:37px;width:37px;font-size:17px}.fe-head__account{border:0;padding:0}.fe-head__account .ant-avatar{width:35px!important;height:35px!important;line-height:35px!important}}
`;
const initials = (n) =>
  String(n || "PH")
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((x) => x[0])
    .join("")
    .toUpperCase();
export default function ParentHeader({
  user,
  isMobile = false,
  onMenuOpen,
  onProfile,
  onLogout,
  onNotifications,
  notificationCount = 0,
}) {
  const name =
    user?.full_name ||
    user?.fullName ||
    user?.name ||
    user?.username ||
    "Phụ huynh";
  const avatar = user?.avatar || user?.avatar_url || user?.avatarUrl;
  const items = [
    { key: "profile", label: "Thông tin tài khoản", icon: <UserOutlined /> },
    { key: "settings", label: "Cài đặt", icon: <SettingOutlined /> },
    { type: "divider" },
    {
      key: "logout",
      label: "Đăng xuất",
      icon: <LogoutOutlined />,
      danger: true,
    },
  ];
  const onClick = ({ key }) =>
    key === "logout" ? onLogout?.() : onProfile?.(key);
  return (
    <>
      <style>{CSS}</style>
      <div className="fe-head">
        <div className="fe-head__left">
          <button
            className="fe-head__button fe-head__mobile"
            type="button"
            onClick={onMenuOpen}
            aria-label="Mở menu"
          >
            <MenuOutlined />
          </button>
          <div style={{ minWidth: 0 }}>
            <div className="fe-head__title">Xin chào, {name} 👋</div>
            <div className="fe-head__sub">
              Chào mừng trở lại với FaithEdu Family
            </div>
          </div>
        </div>
        <div className="fe-head__right">
          <button
            className="fe-head__button"
            type="button"
            onClick={onNotifications}
            aria-label="Thông báo"
          >
            <Badge dot={notificationCount > 0}>
              <BellOutlined />
            </Badge>
          </button>
          <Dropdown
            menu={{ items, onClick }}
            trigger={["click"]}
            placement="bottomRight"
          >
            <button
              type="button"
              className="fe-head__account"
              aria-label="Tùy chọn tài khoản"
            >
              <Avatar className="fe-head__avatar" size={36} src={avatar}>
                {!avatar && initials(name)}
              </Avatar>
              <div className="fe-head__user-meta">
                <div className="fe-head__username">{name}</div>
                <div className="fe-head__role">Phụ huynh</div>
              </div>
              <DownOutlined className="fe-head__chevron" />
            </button>
          </Dropdown>
        </div>
      </div>
    </>
  );
}
