import React from "react";
import {
  ArrowRightOutlined,
  CalendarOutlined,
  CheckCircleFilled,
  IdcardOutlined,
  ReadOutlined,
  UserOutlined,
} from "@ant-design/icons";

/* =========================================================
   FAITHEDU CHILD CARD
   - CSS tích hợp ngay trong file
   - Responsive
   - Không bắt buộc phải có ảnh avatar
   - Có fallback khi thiếu dữ liệu lớp/học sinh
========================================================= */

const CHILD_CARD_CSS = `
.child-card {
  --child-navy: #173b5e;
  --child-blue: #2563eb;
  --child-gold: #e7b84b;
  --child-text: #17233b;
  --child-muted: #64748b;
  --child-border: #e7edf5;

  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  min-width: 0;
  padding: 20px;
  overflow: hidden;
  border: 1px solid var(--child-border);
  border-radius: 20px;
  background: linear-gradient(145deg, #ffffff 0%, #fbfdff 70%, #f2f7ff 100%);
  box-shadow: 0 5px 18px rgba(23, 59, 94, 0.055);
  color: var(--child-text);
  font-family: Inter, "Be Vietnam Pro", "Segoe UI", Arial, sans-serif;
  transition: transform .22s ease, box-shadow .22s ease, border-color .22s ease;
  box-sizing: border-box;
}

.child-card *,
.child-card *::before,
.child-card *::after {
  box-sizing: border-box;
}

.child-card::before {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 5px;
  background: linear-gradient(90deg, #2563eb 0%, #43b6e8 45%, #e7b84b 100%);
  content: "";
}

.child-card::after {
  position: absolute;
  top: -45px;
  right: -35px;
  width: 130px;
  height: 130px;
  border-radius: 50%;
  background: rgba(219, 234, 254, .38);
  content: "";
  pointer-events: none;
}

.child-card:hover {
  transform: translateY(-3px);
  border-color: #cbdcf0;
  box-shadow: 0 13px 30px rgba(23, 59, 94, 0.11);
}

.child-card-top {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
}

.child-avatar-wrap {
  position: relative;
  flex: 0 0 auto;
}

.child-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 68px;
  height: 68px;
  overflow: hidden;
  border: 3px solid #fff;
  border-radius: 21px;
  background: linear-gradient(145deg, #dbeafe 0%, #e0f2fe 52%, #fef3c7 100%);
  box-shadow: 0 4px 12px rgba(37, 99, 235, .13);
  color: #2563eb;
  font-size: 27px;
}

.child-avatar img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.child-avatar-badge {
  position: absolute;
  right: -4px;
  bottom: -4px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border: 2px solid #fff;
  border-radius: 50%;
  background: #22a66b;
  color: #fff;
  font-size: 11px;
}

.child-card-main {
  flex: 1;
  min-width: 0;
}

.child-card-name {
  overflow: hidden;
  color: var(--child-navy);
  font-size: 17px;
  font-weight: 800;
  line-height: 1.4;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.child-card-code {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  max-width: 100%;
  margin-top: 7px;
  padding: 5px 9px;
  overflow: hidden;
  border: 1px solid #e2eaff;
  border-radius: 8px;
  background: #f1f6ff;
  color: #47658b;
  font-size: 11px;
  font-weight: 600;
}

.child-card-code span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.child-status {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 6px;
  padding: 7px 10px;
  border: 1px solid transparent;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 750;
  white-space: nowrap;
}

.child-status-studying {
  border-color: #c9f0db;
  background: #eafaf1;
  color: #168451;
}

.child-status-inactive {
  border-color: #e2e8f0;
  background: #f1f5f9;
  color: #64748b;
}

.child-status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: currentColor;
  box-shadow: 0 0 0 3px rgba(22, 132, 81, .09);
}

.child-status-inactive .child-status-dot {
  box-shadow: none;
}

.child-card-divider {
  height: 1px;
  margin: 19px 0 16px;
  background: linear-gradient(90deg, #e8eef6, #f4f7fb);
}

.child-card-info {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 11px;
}

.child-info-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  min-width: 0;
  min-height: 66px;
  padding: 12px;
  border: 1px solid #edf2f8;
  border-radius: 13px;
  background: rgba(255, 255, 255, .82);
  transition: background .18s ease, border-color .18s ease;
}

.child-info-item:hover {
  border-color: #d8e6fa;
  background: #f7faff;
}

.child-info-icon {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 11px;
  background: #eaf2ff;
  color: #2865ce;
  font-size: 15px;
}

.child-info-item:nth-child(2) .child-info-icon {
  background: #e9fbf3;
  color: #199765;
}

.child-info-item:nth-child(3) .child-info-icon {
  background: #fff5df;
  color: #c58a14;
}

.child-info-item:nth-child(4) .child-info-icon {
  background: #f5edff;
  color: #8b5bd6;
}

.child-info-content {
  min-width: 0;
  padding-top: 1px;
}

.child-info-label {
  margin-bottom: 5px;
  color: #8a98ab;
  font-size: 10px;
  font-weight: 650;
}

.child-info-value {
  overflow-wrap: anywhere;
  color: #263c58;
  font-size: 12px;
  font-weight: 750;
  line-height: 1.45;
}

.child-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 17px;
  padding-top: 14px;
  border-top: 1px solid #edf1f6;
}

.child-card-class-code {
  display: inline-flex;
  align-items: center;
  min-width: 0;
  padding: 7px 10px;
  overflow: hidden;
  border-radius: 8px;
  background: #fff7e4;
  color: #9b6b12;
  font-size: 10px;
  font-weight: 750;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.child-card-detail-button {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 37px;
  padding: 0 13px;
  border: 0;
  border-radius: 10px;
  background: linear-gradient(135deg, #2563eb 0%, #1677ff 100%);
  box-shadow: 0 4px 10px rgba(37, 99, 235, .18);
  color: #fff;
  cursor: pointer;
  font: inherit;
  font-size: 11px;
  font-weight: 750;
  transition: transform .18s ease, box-shadow .18s ease, background .18s ease;
}

.child-card-detail-button:hover {
  transform: translateY(-1px);
  background: linear-gradient(135deg, #1d4ed8 0%, #0966df 100%);
  box-shadow: 0 7px 15px rgba(37, 99, 235, .25);
}

.child-card-detail-button:focus-visible {
  outline: 3px solid rgba(37, 99, 235, .28);
  outline-offset: 3px;
}

@media (max-width: 575px) {
  .child-card {
    padding: 16px;
    border-radius: 17px;
  }

  .child-card-top {
    gap: 11px;
    flex-wrap: wrap;
  }

  .child-avatar {
    width: 58px;
    height: 58px;
    border-radius: 18px;
    font-size: 23px;
  }

  .child-card-name {
    font-size: 15px;
  }

  .child-status {
    margin-left: auto;
    padding: 6px 8px;
    font-size: 9px;
  }

  .child-card-info {
    gap: 8px;
  }

  .child-info-item {
    gap: 8px;
    padding: 10px;
  }

  .child-info-icon {
    width: 30px;
    height: 30px;
    font-size: 13px;
  }

  .child-info-value {
    font-size: 11px;
  }

  .child-card-footer {
    align-items: stretch;
  }

  .child-card-detail-button {
    padding: 0 10px;
  }
}

@media (max-width: 360px) {
  .child-card-info {
    grid-template-columns: minmax(0, 1fr);
  }

  .child-info-item {
    min-height: 56px;
  }

  .child-card-footer {
    flex-direction: column;
  }

  .child-card-class-code,
  .child-card-detail-button {
    width: 100%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .child-card,
  .child-card *,
  .child-card *::before,
  .child-card *::after {
    transition: none !important;
  }
}
`;

const getApiBaseUrl = () => {
  // Dự án Create React App: khai báo REACT_APP_API_URL trong file .env.
  const rawUrl =
    typeof process !== "undefined" && process.env
      ? process.env.REACT_APP_API_URL || ""
      : "";

  return String(rawUrl).replace(/\/+$/, "");
};

const getAvatarUrl = (avatar) => {
  if (!avatar) return "";
  if (/^(https?:)?\/\//i.test(avatar) || avatar.startsWith("data:")) {
    return avatar;
  }

  const baseUrl = getApiBaseUrl();
  const path = avatar.startsWith("/") ? avatar : `/${avatar}`;
  return `${baseUrl}${path}`;
};

const displayValue = (value, fallback = "Chưa cập nhật") => {
  if (value === null || value === undefined || value === "") return fallback;
  return value;
};

const ChildCard = ({ child = {}, onView = () => {} }) => {
  const student = child || {};
  const studentClass = student.class || {};
  const isStudying =
    student.status === "active" ||
    student.status === "Active" ||
    student.status === true;

  const avatarUrl = getAvatarUrl(student.avatar);
  const gender =
    student.gender === "female" || student.gender === "Female"
      ? "Nữ"
      : student.gender === "male" || student.gender === "Male"
        ? "Nam"
        : "Chưa cập nhật";

  return (
    <>
      <style>{CHILD_CARD_CSS}</style>

      <article className="child-card">
        <div className="child-card-top">
          <div className="child-avatar-wrap">
            <div className="child-avatar">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={student.name || "Ảnh đại diện học sinh"}
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <UserOutlined />
              )}
            </div>

            {isStudying && (
              <span className="child-avatar-badge" title="Đang học">
                <CheckCircleFilled />
              </span>
            )}
          </div>

          <div className="child-card-main">
            <div className="child-card-name">
              {displayValue(student.name, "Học sinh")}
            </div>

            <div className="child-card-code" title={student.code || ""}>
              <IdcardOutlined />
              <span>{displayValue(student.code, "Chưa có mã học sinh")}</span>
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

        <div className="child-card-divider" />

        <div className="child-card-info">
          <div className="child-info-item">
            <div className="child-info-icon">
              <ReadOutlined />
            </div>
            <div className="child-info-content">
              <div className="child-info-label">Lớp hiện tại</div>
              <div className="child-info-value">
                {displayValue(studentClass.name, "Chưa xếp lớp")}
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
                {displayValue(studentClass.category, "Chưa cập nhật")}
              </div>
            </div>
          </div>

          <div className="child-info-item">
            <div className="child-info-icon">
              <CalendarOutlined />
            </div>
            <div className="child-info-content">
              <div className="child-info-label">Ngày sinh</div>
              <div className="child-info-value">
                {displayValue(student.formattedDateOfBirth)}
              </div>
            </div>
          </div>

          <div className="child-info-item">
            <div className="child-info-icon">
              <UserOutlined />
            </div>
            <div className="child-info-content">
              <div className="child-info-label">Giới tính</div>
              <div className="child-info-value">{gender}</div>
            </div>
          </div>
        </div>

        <div className="child-card-footer">
          <div
            className="child-card-class-code"
            title={studentClass.code || ""}
          >
            {displayValue(studentClass.code, "Chưa có lớp")}
          </div>

          <button
            type="button"
            className="child-card-detail-button"
            onClick={() => onView(student)}
          >
            <span>Xem chi tiết</span>
            <ArrowRightOutlined />
          </button>
        </div>
      </article>
    </>
  );
};

export default ChildCard;
