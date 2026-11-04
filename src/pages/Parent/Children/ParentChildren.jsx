import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Avatar, Button, Empty, Input, Skeleton, Tag } from "antd";
import {
  ArrowRightOutlined,
  BookOutlined,
  CalendarOutlined,
  ReloadOutlined,
  SearchOutlined,
  TeamOutlined,
  UserOutlined,
  IdcardOutlined,
} from "@ant-design/icons";
import parentApi from "../../../api/parentApi";
import defaultAvatar from "../../../assets/images/student-default.png";

const CSS = `
.fe-kids{color:#173B5E;max-width:1320px;margin:auto;padding:8px 0 40px;font-family:Inter,"Be Vietnam Pro",system-ui,sans-serif}
.fe-kids *{box-sizing:border-box}
.fe-kids-head{display:flex;align-items:flex-end;justify-content:space-between;gap:16px;margin-bottom:22px}
.fe-kids-eyebrow{font-size:11px;font-weight:750;letter-spacing:.11em;text-transform:uppercase;color:#B98524;margin-bottom:6px}
.fe-kids h1{font-size:clamp(24px,3vw,33px);font-weight:800;letter-spacing:-.8px;line-height:1.25;margin:0;color:#173B5E}
.fe-kids-sub{font-size:13px;color:#748398;margin:7px 0 0}
.fe-kids-refresh{height:39px!important;border-radius:11px!important;font-weight:650!important;color:#173B5E!important}
.fe-kids-toolbar{display:flex;gap:12px;align-items:center;justify-content:space-between;margin-bottom:18px}
.fe-kids-count{display:flex;align-items:center;gap:11px;min-width:0}
.fe-kids-count-icon{display:grid;place-items:center;width:42px;height:42px;border-radius:13px;background:#173B5E;color:#fff;font-size:18px}
.fe-kids-count strong{display:block;font-size:18px;line-height:1.2}
.fe-kids-count span{display:block;font-size:11px;color:#8A98A9;margin-top:3px}
.fe-kids-search{width:min(310px,50%);border-radius:11px!important;padding:7px 12px!important}
.fe-kids-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}
.fe-kid{min-width:0;border:1px solid #E4EAF0;border-radius:18px;background:#fff;overflow:hidden;transition:transform .18s,box-shadow .18s,border-color .18s}
.fe-kid:hover{transform:translateY(-3px);border-color:#D9C38C;box-shadow:0 14px 32px rgba(23,59,94,.08)}
.fe-kid-top{padding:18px 18px 14px;display:flex;align-items:center;gap:13px}
.fe-kid-avatar{flex-shrink:0;background:#EDF3F8!important;color:#173B5E!important;font-weight:800!important}
.fe-kid-person{min-width:0;flex:1}
.fe-kid-name{font-size:15px;font-weight:800;color:#173B5E;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.fe-kid-code{display:flex;align-items:center;gap:5px;margin-top:5px;font-size:10px;color:#8B98A9;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.fe-kid-status{margin:0!important;border:0!important;border-radius:7px!important;font-size:10px!important;font-weight:650!important}
.fe-kid-rule{height:1px;background:#F0F3F6;margin:0 18px}
.fe-kid-details{padding:14px 18px;display:grid;grid-template-columns:1fr 1fr;gap:14px}
.fe-kid-label{font-size:10px;color:#94A3B8;margin-bottom:5px}
.fe-kid-value{font-size:12px;font-weight:700;color:#344B61;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.fe-kid-footer{display:flex;justify-content:space-between;align-items:center;gap:10px;background:#FAFBFD;padding:11px 18px;border-top:1px solid #F0F3F6}
.fe-kid-footer-note{font-size:10px;color:#9AA7B6;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.fe-kid-open{border:0;background:none;cursor:pointer;color:#173B5E;font-weight:750;font-size:11px;display:flex;align-items:center;gap:7px;white-space:nowrap;padding:6px 0}
.fe-kid-open:hover{color:#B98524}
.fe-kids-empty{padding:48px 16px;border:1px dashed #D9E1EA;border-radius:18px;background:#fff}
.fe-kids-loading{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}
.fe-kids-skeleton{padding:22px;border:1px solid #E4EAF0;background:#fff;border-radius:18px}
@media(max-width:1100px){.fe-kids-grid,.fe-kids-loading{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:700px){.fe-kids{padding:0 0 100px}.fe-kids-head{align-items:flex-start;margin-bottom:19px}.fe-kids h1{font-size:25px}.fe-kids-sub{font-size:11px}.fe-kids-refresh{width:38px!important;min-width:38px!important;padding:0!important;font-size:0!important}.fe-kids-refresh .anticon{font-size:15px}.fe-kids-toolbar{gap:8px}.fe-kids-search{width:min(215px,55%)}.fe-kids-grid,.fe-kids-loading{grid-template-columns:1fr;gap:10px}.fe-kid-top{padding:15px 15px 12px}.fe-kid-details{padding:12px 15px}.fe-kid-rule{margin:0 15px}.fe-kid-footer{padding:10px 15px}}
@media(prefers-reduced-motion:reduce){.fe-kid{transition:none}.fe-kid:hover{transform:none}}
`;

function unwrapChildren(response) {
  const data =
    response?.status === true && typeof response?.status === "boolean"
      ? response.data
      : response;
  const options = [
    data,
    data?.data,
    data?.data?.data,
    data?.children,
    data?.items,
    data?.data?.children,
    data?.data?.items,
    data?.data?.data?.children,
  ];
  return options.find(Array.isArray) || [];
}
function normalizeChild(child) {
  return {
    id: child?.id ?? child?.studentId ?? child?.student_id,
    name: child?.name ?? child?.full_name ?? child?.fullName ?? "Chưa cập nhật",
    code: child?.code ?? child?.studentCode ?? child?.student_code ?? "",
    className:
      child?.class_name ??
      child?.className ??
      child?.class?.name ??
      "Chưa xếp lớp",
    level:
      child?.catechism_level ??
      child?.catechismLevel ??
      child?.level_name ??
      child?.levelName ??
      "Chưa cập nhật",
    birth:
      child?.date_of_birth ??
      child?.dateOfBirth ??
      child?.birth_date ??
      child?.birthDate,
    status: child?.status,
    avatar: child?.avatar ?? child?.avatar_url ?? child?.avatarUrl,
  };
}
function formatBirth(value) {
  if (!value) return "Chưa cập nhật";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Chưa cập nhật"
    : date.toLocaleDateString("vi-VN");
}
function statusLabel(value) {
  const key = String(value ?? "").toLowerCase();
  if (["studying", "active", "dang_hoc", "đang học"].includes(key))
    return ["Đang học", "green"];
  if (["inactive", "paused", "tam_nghi"].includes(key))
    return ["Tạm nghỉ", "orange"];
  return [value ? String(value) : "Chưa cập nhật", "default"];
}
function avatarSrc(value) {
  if (!value) return defaultAvatar;
  if (/^(https?:|data:|blob:)/i.test(value)) return value;
  const base = process.env.REACT_APP_API_URL || "";
  return `${base.replace(/\/$/, "")}/${String(value).replace(/^\//, "")}`;
}

export default function ParentChildren() {
  const navigate = useNavigate();
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const loadChildren = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await parentApi.getChildren();
      if (response?.status === false && typeof response.status === "boolean") {
        throw new Error(response.message || "Không thể tải danh sách các con");
      }
      setChildren(
        unwrapChildren(response)
          .map(normalizeChild)
          .filter((item) => item.id != null),
      );
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Không thể tải danh sách các con",
      );
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    loadChildren();
  }, [loadChildren]);

  const filtered = useMemo(
    () =>
      children.filter((child) =>
        `${child.name} ${child.code} ${child.className}`
          .toLocaleLowerCase("vi-VN")
          .includes(search.trim().toLocaleLowerCase("vi-VN")),
      ),
    [children, search],
  );

  return (
    <main className="fe-kids">
      <style>{CSS}</style>
      <div className="fe-kids-head">
        <div>
          <div className="fe-kids-eyebrow">FaithEdu Family / Hồ sơ</div>
          <h1>Thông tin các con</h1>
          <p className="fe-kids-sub">
            Theo dõi hồ sơ và hành trình giáo lý của từng con.
          </p>
        </div>
        <Button
          className="fe-kids-refresh"
          icon={<ReloadOutlined />}
          loading={loading}
          onClick={loadChildren}
        >
          Làm mới
        </Button>
      </div>

      {error ? (
        <Alert
          type="error"
          showIcon
          message="Không thể tải danh sách"
          description={error}
          action={
            <Button size="small" onClick={loadChildren}>
              Thử lại
            </Button>
          }
          style={{ borderRadius: 12, marginBottom: 18 }}
        />
      ) : null}

      <div className="fe-kids-toolbar">
        <div className="fe-kids-count">
          <div className="fe-kids-count-icon">
            <TeamOutlined />
          </div>
          <div>
            <strong>
              {loading ? "—" : children.length}{" "}
              <span
                style={{ display: "inline", fontSize: 13, color: "#748398" }}
              >
                học sinh
              </span>
            </strong>
            <span>Đã liên kết với tài khoản</span>
          </div>
        </div>
        <Input
          className="fe-kids-search"
          allowClear
          prefix={<SearchOutlined style={{ color: "#94A3B8" }} />}
          placeholder="Tìm tên, mã hoặc lớp..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      {loading ? (
        <div className="fe-kids-loading">
          {[0, 1, 2].map((n) => (
            <div className="fe-kids-skeleton" key={n}>
              <Skeleton active avatar paragraph={{ rows: 2 }} />
            </div>
          ))}
        </div>
      ) : filtered.length ? (
        <div className="fe-kids-grid">
          {filtered.map((child) => {
            const [status, color] = statusLabel(child.status);
            return (
              <article className="fe-kid" key={child.id}>
                <div className="fe-kid-top">
                  <Avatar
                    size={52}
                    src={avatarSrc(child.avatar)}
                    icon={<UserOutlined />}
                    className="fe-kid-avatar"
                  />
                  <div className="fe-kid-person">
                    <div className="fe-kid-name" title={child.name}>
                      {child.name}
                    </div>
                    <div className="fe-kid-code">
                      <IdcardOutlined /> {child.code || "Chưa có mã học sinh"}
                    </div>
                  </div>
                  <Tag className="fe-kid-status" color={color}>
                    {status}
                  </Tag>
                </div>
                <div className="fe-kid-rule" />
                <div className="fe-kid-details">
                  <div>
                    <div className="fe-kid-label">
                      <BookOutlined /> Lớp giáo lý
                    </div>
                    <div className="fe-kid-value" title={child.className}>
                      {child.className}
                    </div>
                  </div>
                  <div>
                    <div className="fe-kid-label">
                      <CalendarOutlined /> Ngày sinh
                    </div>
                    <div className="fe-kid-value">
                      {formatBirth(child.birth)}
                    </div>
                  </div>
                  <div style={{ gridColumn: "1/-1" }}>
                    <div className="fe-kid-label">Khối giáo lý</div>
                    <div className="fe-kid-value">{child.level}</div>
                  </div>
                </div>
                <div className="fe-kid-footer">
                  <span className="fe-kid-footer-note">Hồ sơ học sinh</span>
                  <button
                    type="button"
                    className="fe-kid-open"
                    onClick={() =>
                      navigate(
                        `/parent/children/${encodeURIComponent(String(child.id))}`,
                      )
                    }
                  >
                    Xem chi tiết <ArrowRightOutlined />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="fe-kids-empty">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              search
                ? "Không tìm thấy học sinh phù hợp"
                : "Chưa có học sinh được liên kết. Vui lòng liên hệ giáo xứ hoặc giáo lý viên."
            }
          />
        </div>
      )}
    </main>
  );
}
