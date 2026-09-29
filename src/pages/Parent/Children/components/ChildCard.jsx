import React from "react";
import {
  ArrowRightOutlined,
  CalendarOutlined,
  IdcardOutlined,
  ReadOutlined,
  UserOutlined,
} from "@ant-design/icons";

const ChildCard = ({ child, onView }) => {
  const isStudying = child.status === "active";

  return (
    <div className="child-card">
      {/* =================================================
          TOP
      ================================================= */}

      <div className="child-card-top">
        <div className="child-avatar">
          {child.avatar ? (
            <img
              src={`${process.env.REACT_APP_API_URL}${child.avatar}`}
              alt={child.name}
            />
          ) : (
            <UserOutlined />
          )}
        </div>

        <div className="child-card-main">
          <div className="child-card-name">{child.name}</div>

          <div className="child-card-code">
            <IdcardOutlined />
            <span>{child.code}</span>
          </div>
        </div>

        <div
          className={`child-status ${
            isStudying ? "child-status-studying" : "child-status-inactive"
          }`}
        >
          <span className="child-status-dot" />
          {isStudying ? "Đang học" : "Không hoạt động"}
        </div>
      </div>

      {/* =================================================
          INFO
      ================================================= */}

      <div className="child-card-info">
        <div className="child-info-item">
          <div className="child-info-icon">
            <ReadOutlined />
          </div>

          <div className="child-info-content">
            <div className="child-info-label">Lớp hiện tại</div>

            <div className="child-info-value">
              {child.class.name || "Chưa xếp lớp"}
            </div>
          </div>
        </div>

        <div className="child-info-item">
          <div className="child-info-icon">
            <ReadOutlined />
          </div>

          <div className="child-info-content">
            <div className="child-info-label">Khối giáo lý</div>

            <div className="child-info-value">
              {child.class.category || "Chưa cập nhật"}
            </div>
          </div>
        </div>

        <div className="child-info-item">
          <div className="child-info-icon">
            <CalendarOutlined />
          </div>

          <div className="child-info-content">
            <div className="child-info-label">Ngày sinh</div>

            <div className="child-info-value">{child.formattedDateOfBirth}</div>
          </div>
        </div>

        <div className="child-info-item">
          <div className="child-info-icon">
            <UserOutlined />
          </div>

          <div className="child-info-content">
            <div className="child-info-label">Giới tính</div>

            <div className="child-info-value">
              {child.gender === "female" ? "Nữ" : "Nam" || "Chưa cập nhật"}
            </div>
          </div>
        </div>
      </div>

      {/* =================================================
          FOOTER
      ================================================= */}

      <div className="child-card-footer">
        <div className="child-card-class-code">
          {child.class.code || "Chưa có lớp"}
        </div>

        <button
          type="button"
          className="child-card-detail-button"
          onClick={onView}
        >
          <span>Xem chi tiết</span>
          <ArrowRightOutlined />
        </button>
      </div>
    </div>
  );
};

export default ChildCard;
