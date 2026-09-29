import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Spin } from "antd";
import {
  ArrowRightOutlined,
  ReloadOutlined,
  TeamOutlined,
} from "@ant-design/icons";

import "./ParentChildren.css";

import ChildrenHeader from "./components/ChildrenHeader";
import ChildCard from "./components/ChildCard";
import ChildrenEmpty from "./components/ChildrenEmpty";

import parentApi from "../../../api/parentApi";

// =========================================================
// HELPERS
// =========================================================

const formatDate = (value) => {
  if (!value) return "Chưa cập nhật";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Chưa cập nhật";
  }

  return date.toLocaleDateString("vi-VN");
};

// =========================================================
// NORMALIZE CHILD
// =========================================================

const normalizeChild = (child) => {
  if (!child) return null;

  return {
    ...child,

    id: child.id,

    code: child.code || "",

    name: child.name || "Chưa cập nhật",

    gender: child.gender || null,

    date_of_birth: child.date_of_birth || child.dateOfBirth || null,

    avatar: child.avatar || child.avatar_url || child.avatarUrl || null,

    class_id: child.class_id || child.classId || null,

    class_name: child.class_name || child.className || null,

    class_code: child.class_code || child.classCode || null,

    catechism_level: child.catechism_level || child.catechismLevel || null,

    status: child.status || "studying",

    formattedDateOfBirth: formatDate(child.date_of_birth || child.dateOfBirth),
  };
};

// =========================================================
// GET CHILDREN FROM RESPONSE
// =========================================================

const extractChildren = (response) => {
  if (!response) {
    return [];
  }

  // {
  //   success: true,
  //   data: [...]
  // }

  if (Array.isArray(response.data)) {
    return response.data;
  }

  // {
  //   success: true,
  //   data: {
  //      children: [...]
  //   }
  // }

  if (Array.isArray(response.data?.children)) {
    return response.data.children;
  }

  // {
  //   success: true,
  //   children: [...]
  // }

  if (Array.isArray(response.children)) {
    return response.children;
  }

  // {
  //   success: true,
  //   data: {
  //      items: [...]
  //   }
  // }

  if (Array.isArray(response.data?.items)) {
    return response.data.items;
  }

  // {
  //   success: true,
  //   items: [...]
  // }

  if (Array.isArray(response.items)) {
    return response.items;
  }

  return [];
};

// =========================================================
// COMPONENT
// =========================================================

const ParentChildren = () => {
  const navigate = useNavigate();

  // =======================================================
  // STATE
  // =======================================================

  const [loading, setLoading] = useState(true);

  const [children, setChildren] = useState([]);

  const [error, setError] = useState("");

  // =======================================================
  // LOAD CHILDREN
  // =======================================================

  const loadChildren = async () => {
    console.log("");
    console.log("==================================================");
    console.log("👨‍👩‍👧 LOAD PARENT CHILDREN");
    console.log("==================================================");

    setLoading(true);
    setError("");

    try {
      const response = await parentApi.getChildren();

      console.log("");
      console.log("==================================================");
      console.log("👨‍👩‍👧 GET CHILDREN RESULT");
      console.log("==================================================");
      console.log("RESPONSE:", response);

      if (!response?.status) {
        console.error("❌ GET CHILDREN FAILED:", response?.message);

        setChildren([]);

        setError(response?.message || "Không thể tải danh sách các con");

        return;
      }

      const rawChildren = extractChildren(response.data);

      console.log("RAW CHILDREN:", rawChildren);

      console.log("CHILDREN COUNT:", rawChildren.length);

      const normalizedChildren = rawChildren
        .map(normalizeChild)
        .filter(Boolean);

      console.log("NORMALIZED CHILDREN:", normalizedChildren);

      setChildren(normalizedChildren);
    } catch (error) {
      console.error("❌ LOAD CHILDREN ERROR:", error);

      setChildren([]);

      setError(error?.message || "Không thể tải danh sách các con");
    } finally {
      setLoading(false);

      console.log("==================================================");
    }
  };

  // =======================================================
  // INITIAL LOAD
  // =======================================================

  useEffect(() => {
    loadChildren();
  }, []);

  // =======================================================
  // MEMO
  // =======================================================

  const displayChildren = useMemo(() => {
    return children.map((child) => ({
      ...child,

      formattedDateOfBirth:
        child.formattedDateOfBirth || formatDate(child.date_of_birth),
    }));
  }, [children]);

  // =======================================================
  // XEM CHI TIẾT CON
  // =======================================================

  const handleViewChild = (child) => {
    console.log("");
    console.log("==================================================");
    console.log("👨‍👩‍👧 PARENT VIEW CHILD");
    console.log("==================================================");

    console.log("CHILD:", child);
    console.log("CHILD ID:", child?.id);

    console.log("==================================================");

    if (!child?.id) {
      console.error("❌ CHILD ID KHÔNG HỢP LỆ");

      return;
    }

    navigate(`/parent/children/${child.id}`);
  };

  // =======================================================
  // LOADING
  // =======================================================

  if (loading) {
    return (
      <div className="parent-children-page">
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
    );
  }

  // =======================================================
  // ERROR
  // =======================================================

  if (error) {
    return (
      <div className="parent-children-page">
        <div className="parent-children-container">
          <ChildrenHeader count={0} />

          <div className="parent-children-error">
            <Alert
              type="error"
              showIcon
              message="Không thể tải danh sách các con"
              description={error}
              action={
                <button
                  type="button"
                  className="parent-children-retry"
                  onClick={loadChildren}
                >
                  <ReloadOutlined />

                  <span>Thử lại</span>
                </button>
              }
            />
          </div>
        </div>
      </div>
    );
  }

  // =======================================================
  // RENDER
  // =======================================================

  return (
    <div className="parent-children-page">
      <div className="parent-children-container">
        {/* =================================================
            HEADER
        ================================================= */}

        <ChildrenHeader count={displayChildren.length} />

        {/* =================================================
            CONTENT
        ================================================= */}

        {displayChildren.length === 0 ? (
          <ChildrenEmpty />
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

        {/* =================================================
            FOOTER SUMMARY
        ================================================= */}

        {displayChildren.length > 0 && (
          <div className="parent-children-summary">
            <div className="parent-children-summary-left">
              <div className="parent-children-summary-icon">
                <TeamOutlined />
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
