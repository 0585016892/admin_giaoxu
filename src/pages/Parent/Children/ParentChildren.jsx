import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Button, Spin, Typography, message } from "antd";
import {
  ArrowRightOutlined,
  ReloadOutlined,
  TeamOutlined,
  BookOutlined,
} from "@ant-design/icons";

import "./ParentChildren.css";
import ChildCard from "./components/ChildCard";
import ChildrenEmpty from "./components/ChildrenEmpty";

import parentApi from "../../../api/parentApi";

const { Text } = Typography;

/* =========================================================
   FAITHEDU DESIGN TOKENS
========================================================= */

const COLORS = {
  navy: "#173B5E",
  navyHover: "#244F78",
  gold: "#D9A441",

  background: "#F7F9FC",
  white: "#FFFFFF",

  text: "#173B5E",
  textSecondary: "#64748B",
  muted: "#94A3B8",

  border: "#E2E8F0",
  navyLight: "#EEF3F7",
  goldLight: "#FBF5E7",

  success: "#2E7D5B",
  successBg: "#EAF6F0",

  danger: "#C0392B",
  dangerBg: "#FDEDEC",
};

/* =========================================================
   PAGE STYLES
========================================================= */

const PAGE_CSS = `
.parent-children-page {
  width: 100%;
  min-width: 0;
  min-height: 100%;
  color: ${COLORS.text};
  font-family: Inter, "Be Vietnam Pro", "Segoe UI", Arial, sans-serif;
}

.parent-children-page *,
.parent-children-page *::before,
.parent-children-page *::after {
  box-sizing: border-box;
}

.parent-children-page button {
  font-family: inherit;
}

.parent-children-container {
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;
}

/* PAGE INTRO */

.parent-children-intro {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 22px;
}

.parent-children-intro-main {
  min-width: 0;
}

.parent-children-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  color: ${COLORS.gold};
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1.2px;
  text-transform: uppercase;
}

.parent-children-eyebrow::before {
  content: "";
  width: 19px;
  height: 2px;
  border-radius: 4px;
  background: ${COLORS.gold};
}

.parent-children-title {
  margin: 0 !important;
  color: ${COLORS.navy} !important;
  font-size: 26px !important;
  font-weight: 800 !important;
  line-height: 1.35 !important;
  letter-spacing: -0.6px;
}

.parent-children-subtitle {
  display: block;
  margin-top: 6px;
  color: ${COLORS.textSecondary};
  font-size: 12px;
  line-height: 1.8;
}

/* TOTAL COUNT */

.parent-children-total {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
  padding: 10px 14px;
  border: 1px solid ${COLORS.border};
  border-radius: 12px;
  background: ${COLORS.white};
  box-shadow: 0 3px 12px rgba(23, 59, 94, 0.025);
}

.parent-children-total-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: ${COLORS.navyLight};
  color: ${COLORS.navy};
  font-size: 17px;
}

.parent-children-total-number {
  color: ${COLORS.navy};
  font-size: 18px;
  font-weight: 800;
  line-height: 1.2;
}

.parent-children-total-label {
  margin-top: 3px;
  color: ${COLORS.muted};
  font-size: 10px;
}

/* CONTENT PANEL */

.parent-children-content {
  min-width: 0;
}

.parent-children-content-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.parent-children-content-title {
  display: flex;
  align-items: center;
  gap: 9px;
  min-width: 0;
  margin: 0;
  color: ${COLORS.navy};
  font-size: 14px;
  font-weight: 800;
}

.parent-children-content-mark {
  width: 4px;
  height: 19px;
  flex-shrink: 0;
  border-radius: 5px;
  background: ${COLORS.gold};
}

.parent-children-content-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 23px;
  height: 23px;
  padding: 0 7px;
  border-radius: 7px;
  background: ${COLORS.navyLight};
  color: ${COLORS.navy};
  font-size: 10px;
  font-weight: 800;
}

/* GRID */

.parent-children-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  align-items: stretch;
}

.parent-children-grid > * {
  min-width: 0;
}

/* SUMMARY */

.parent-children-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  margin-top: 22px;
  padding: 15px 17px;
  border: 1px solid #E8E4D8;
  border-radius: 13px;
  background: linear-gradient(
    110deg,
    ${COLORS.goldLight} 0%,
    ${COLORS.white} 75%
  );
}

.parent-children-summary-left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.parent-children-summary-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  flex-shrink: 0;
  border-radius: 11px;
  background: ${COLORS.white};
  border: 1px solid #F0E3C4;
  color: ${COLORS.navy};
  font-size: 17px;
}

.parent-children-summary-title {
  color: ${COLORS.navy};
  font-size: 12px;
  font-weight: 800;
}

.parent-children-summary-description {
  margin-top: 4px;
  color: ${COLORS.textSecondary};
  font-size: 10.5px;
  line-height: 1.6;
}

.parent-children-summary-arrow {
  flex-shrink: 0;
  color: ${COLORS.gold};
  font-size: 15px;
}

/* LOADING */

.parent-children-loading {
  display: flex;
  min-height: 300px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  padding: 32px 16px;
  border: 1px solid ${COLORS.border};
  border-radius: 16px;
  background: ${COLORS.white};
}

.parent-children-loading-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 54px;
  height: 54px;
  border-radius: 16px;
  background: ${COLORS.navyLight};
  color: ${COLORS.navy};
  font-size: 24px;
}

.parent-children-loading .ant-spin-dot-item {
  background-color: ${COLORS.gold};
}

.parent-children-loading-text {
  color: ${COLORS.textSecondary};
  font-size: 12px;
}

/* ERROR */

.parent-children-error {
  padding: 18px;
  border: 1px solid ${COLORS.border};
  border-radius: 14px;
  background: ${COLORS.white};
}

.parent-children-error .ant-alert {
  border-radius: 10px;
}

.parent-children-retry {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  margin-top: 10px;
  padding: 8px 12px;
  border: 1px solid ${COLORS.border};
  border-radius: 8px;
  background: ${COLORS.white};
  color: ${COLORS.navy};
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease;
}

.parent-children-retry:hover {
  border-color: ${COLORS.gold};
  background: ${COLORS.goldLight};
}

/* EMPTY */

.parent-children-empty {
  padding: 35px 16px;
  border: 1px dashed #CBD5E1;
  border-radius: 15px;
  background: ${COLORS.white};
}

.parent-children-empty .ant-empty-description {
  color: ${COLORS.textSecondary};
  font-size: 12px;
}

/* RESPONSIVE */

@media (max-width: 900px) {
  .parent-children-title {
    font-size: 24px !important;
  }

  .parent-children-grid {
    gap: 13px;
  }
}

@media (max-width: 767px) {
  .parent-children-intro {
    align-items: flex-start;
    flex-direction: column;
    gap: 14px;
    margin-bottom: 20px;
  }

  .parent-children-title {
    font-size: 22px !important;
  }

  .parent-children-subtitle {
    font-size: 11.5px;
  }

  .parent-children-total {
    width: 100%;
  }

  .parent-children-grid {
    grid-template-columns: minmax(0, 1fr);
    gap: 12px;
  }

  .parent-children-summary {
    align-items: flex-start;
    margin-top: 18px;
    padding: 13px;
  }

  .parent-children-summary-description {
    font-size: 10px;
  }
}

@media (max-width: 380px) {
  .parent-children-title {
    font-size: 20px !important;
  }

  .parent-children-summary-arrow {
    font-size: 12px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .parent-children-page *,
  .parent-children-page *::before,
  .parent-children-page *::after {
    transition: none !important;
  }
}
`;

/* =========================================================
   HELPERS
========================================================= */

const formatDate = (value) => {
  if (!value) return "Chưa cập nhật";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Chưa cập nhật";
  }

  return date.toLocaleDateString("vi-VN");
};

const normalizeChild = (child) => {
  if (!child) return null;

  const dateOfBirth = child.date_of_birth ?? child.dateOfBirth ?? null;

  return {
    ...child,

    id: child.id ?? child.studentId ?? child.student_id ?? null,

    code: child.code ?? child.studentCode ?? child.student_code ?? "",

    name: child.name ?? child.full_name ?? child.fullName ?? "Chưa cập nhật",

    gender: child.gender ?? null,

    date_of_birth: dateOfBirth,

    avatar: child.avatar ?? child.avatar_url ?? child.avatarUrl ?? null,

    class_id: child.class_id ?? child.classId ?? null,

    class_name:
      child.class_name ?? child.className ?? child.class?.name ?? null,

    class_code: child.class_code ?? child.classCode ?? null,

    catechism_level: child.catechism_level ?? child.catechismLevel ?? null,

    status: child.status ?? "studying",

    formattedDateOfBirth: formatDate(dateOfBirth),
  };
};

const extractChildren = (response) => {
  if (!response) return [];

  if (Array.isArray(response)) {
    return response;
  }

  const candidates = [
    response.data?.data?.children,
    response.data?.data?.items,
    response.data?.data,
    response.data?.children,
    response.data?.items,
    response.data,
    response.children,
    response.items,
  ];

  return candidates.find(Array.isArray) || [];
};

/* =========================================================
   COMPONENT
========================================================= */

const ParentChildren = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState([]);
  const [error, setError] = useState("");

  /* LOAD CHILDREN */

  const loadChildren = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await parentApi.getChildren();

      // Hỗ trợ response API dạng { status, data }
      // và response Axios dạng { data, status: 200 }.
      const isApiResponse = typeof response?.status === "boolean";

      if (isApiResponse && response.status === false) {
        throw new Error(response.message || "Không thể tải danh sách các con");
      }

      const payload = isApiResponse ? response.data : response;

      const rawChildren = extractChildren(payload);

      const normalizedChildren = rawChildren
        .map(normalizeChild)
        .filter((child) => child && child.id != null);

      setChildren(normalizedChildren);
    } catch (err) {
      console.error("Load parent children error:", err);

      setChildren([]);

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

  /* DISPLAY DATA */

  const displayChildren = useMemo(
    () =>
      children.map((child) => ({
        ...child,
        formattedDateOfBirth:
          child.formattedDateOfBirth || formatDate(child.date_of_birth),
      })),
    [children],
  );

  /* VIEW CHILD DETAIL */

  const handleViewChild = useCallback(
    (child) => {
      if (child?.id == null) {
        message.warning("Không tìm thấy mã học sinh");
        return;
      }

      navigate(`/parent/children/${encodeURIComponent(String(child.id))}`);
    },
    [navigate],
  );

  /* LOADING */

  if (loading) {
    return (
      <div className="parent-children-page">
        <style>{PAGE_CSS}</style>

        <div className="parent-children-container">
          <div className="parent-children-loading">
            <div className="parent-children-loading-icon">
              <TeamOutlined />
            </div>

            <Spin size="small" />

            <div className="parent-children-loading-text">
              Đang tải thông tin các con...
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ERROR */

  if (error) {
    return (
      <div className="parent-children-page">
        <style>{PAGE_CSS}</style>

        <div className="parent-children-container">
          <div className="parent-children-intro">
            <div className="parent-children-intro-main">
              <div className="parent-children-eyebrow">Không gian gia đình</div>

              <h1 className="parent-children-title">Con của tôi</h1>

              <Text className="parent-children-subtitle">
                Theo dõi thông tin học sinh được liên kết với gia đình.
              </Text>
            </div>
          </div>

          <div className="parent-children-error">
            <Alert
              type="error"
              showIcon
              message="Không thể tải danh sách các con"
              description={error}
            />

            <button
              type="button"
              className="parent-children-retry"
              onClick={loadChildren}
            >
              <ReloadOutlined />
              <span>Thử tải lại</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* RENDER */

  return (
    <div className="parent-children-page">
      <style>{PAGE_CSS}</style>

      <div className="parent-children-container">
        {/* INTRO */}

        <div className="parent-children-intro">
          <div className="parent-children-intro-main">
            <div className="parent-children-eyebrow">Không gian gia đình</div>

            <h1 className="parent-children-title">Con của tôi</h1>

            <Text className="parent-children-subtitle">
              Theo dõi thông tin và hành trình học giáo lý của các con.
            </Text>
          </div>

          <div className="parent-children-total">
            <div className="parent-children-total-icon">
              <TeamOutlined />
            </div>

            <div>
              <div className="parent-children-total-number">
                {displayChildren.length}
              </div>

              <div className="parent-children-total-label">
                Học sinh được liên kết
              </div>
            </div>
          </div>
        </div>

        {/* CHILDREN HEADER */}

        <div className="parent-children-content">
          <div className="parent-children-content-header">
            <h2 className="parent-children-content-title">
              <span className="parent-children-content-mark" />
              Danh sách học sinh
              <span className="parent-children-content-count">
                {displayChildren.length}
              </span>
            </h2>

            <Button
              type="text"
              className="parent-children-section-action"
              icon={<ReloadOutlined />}
              onClick={loadChildren}
              style={{
                color: COLORS.navy,
                fontSize: 11,
                fontWeight: 600,
              }}
            >
              Làm mới
            </Button>
          </div>

          {displayChildren.length === 0 ? (
            <div className="parent-children-empty">
              <ChildrenEmpty />
            </div>
          ) : (
            <div className="parent-children-grid">
              {displayChildren.map((child) => (
                <ChildCard
                  key={child.id}
                  child={child}
                  onView={() => handleViewChild(child)}
                />
              ))}
            </div>
          )}
        </div>

        {/* FOOTER SUMMARY */}

        {displayChildren.length > 0 && (
          <div className="parent-children-summary">
            <div className="parent-children-summary-left">
              <div className="parent-children-summary-icon">
                <BookOutlined />
              </div>

              <div>
                <div className="parent-children-summary-title">
                  {displayChildren.length} học sinh được liên kết
                </div>

                <div className="parent-children-summary-description">
                  Thông tin được quản lý bởi giáo xứ và giáo lý viên.
                </div>
              </div>
            </div>

            <ArrowRightOutlined className="parent-children-summary-arrow" />
          </div>
        )}
      </div>
    </div>
  );
};

export default ParentChildren;
