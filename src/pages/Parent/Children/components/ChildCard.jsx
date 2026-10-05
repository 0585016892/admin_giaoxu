import React from "react";
import {
  ArrowRightOutlined,
  CalendarOutlined,
  CheckCircleFilled,
  HeartFilled,
  IdcardOutlined,
  ReadOutlined,
  UserOutlined,
} from "@ant-design/icons";

/* =========================================================
   FAITHEDU FAMILY — CHILD PROFILE CARD
   Giao diện mới hoàn toàn
========================================================= */

const CHILD_CARD_CSS = `
/* =========================================================
   CARD
========================================================= */

.fe-child-profile {
  --navy: #173b5e;
  --navy-dark: #102a43;
  --gold: #d9a441;
  --gold-soft: #fff8e8;

  --text: #243447;
  --muted: #7b8797;
  --border: #e8edf3;

  position: relative;
  width: 100%;
  min-width: 0;

  overflow: hidden;

  border: 1px solid var(--border);
  border-radius: 28px;

  background: #ffffff;

  color: var(--text);

  box-shadow:
    0 10px 35px rgba(23, 59, 94, 0.055);

  font-family:
    "Be Vietnam Pro",
    Inter,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;

  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease,
    border-color 0.25s ease;

  box-sizing: border-box;
}

.fe-child-profile *,
.fe-child-profile *::before,
.fe-child-profile *::after {
  box-sizing: border-box;
}

.fe-child-profile:hover {
  transform: translateY(-5px);

  border-color: #dfcfaa;

  box-shadow:
    0 22px 45px rgba(23, 59, 94, 0.105);
}


/* =========================================================
   DECORATION
========================================================= */

.fe-child-profile__circle {
  position: absolute;

  width: 220px;
  height: 220px;

  right: -105px;
  top: -115px;

  border-radius: 50%;

  background:
    radial-gradient(
      circle,
      rgba(217, 164, 65, 0.13),
      rgba(217, 164, 65, 0.035) 55%,
      transparent 70%
    );

  pointer-events: none;
}

.fe-child-profile__circle-small {
  position: absolute;

  width: 90px;
  height: 90px;

  right: 80px;
  top: 35px;

  border: 1px dashed rgba(217, 164, 65, 0.24);
  border-radius: 50%;

  pointer-events: none;
}


/* =========================================================
   HEADER
========================================================= */

.fe-child-profile__header {
  position: relative;

  min-height: 165px;

  padding: 25px 25px 23px;

  background:
    radial-gradient(
      circle at 88% 15%,
      rgba(217, 164, 65, 0.16),
      transparent 27%
    ),
    linear-gradient(
      135deg,
      #fffaf0 0%,
      #ffffff 65%,
      #f8fbfd 100%
    );
}

.fe-child-profile__header-inner {
  position: relative;
  z-index: 2;

  display: flex;
  align-items: center;
  gap: 18px;

  min-width: 0;
}


/* =========================================================
   AVATAR
========================================================= */

.fe-child-profile__avatar-wrapper {
  position: relative;

  flex: 0 0 auto;
}

.fe-child-profile__avatar {
  position: relative;

  display: flex;
  align-items: center;
  justify-content: center;

  width: 86px;
  height: 86px;

  overflow: hidden;

  border: 5px solid #ffffff;
  border-radius: 27px;

  background:
    linear-gradient(
      145deg,
      #eaf1f7 0%,
      #dce9f1 50%,
      #fff1cf 100%
    );

  color: var(--navy);

  font-size: 31px;
  font-weight: 800;

  box-shadow:
    0 12px 25px rgba(23, 59, 94, 0.12);

  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease;
}

.fe-child-profile:hover .fe-child-profile__avatar {
  transform: rotate(-2deg) scale(1.025);

  box-shadow:
    0 15px 30px rgba(23, 59, 94, 0.16);
}

.fe-child-profile__avatar img {
  display: block;

  width: 100%;
  height: 100%;

  object-fit: cover;
}

.fe-child-profile__avatar-fallback {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 100%;
  height: 100%;

  background:
    radial-gradient(
      circle at 35% 25%,
      #ffffff,
      transparent 25%
    ),
    linear-gradient(
      145deg,
      #e7f0f7,
      #dbe8ef
    );

  color: var(--navy);

  font-size: 28px;
  font-weight: 900;
}

.fe-child-profile__status-dot {
  position: absolute;

  right: -2px;
  bottom: -2px;

  display: flex;
  align-items: center;
  justify-content: center;

  width: 27px;
  height: 27px;

  border: 4px solid #ffffff;
  border-radius: 50%;

  background: #2e9d69;

  color: #ffffff;

  font-size: 10px;

  box-shadow:
    0 4px 10px rgba(46, 157, 105, 0.22);
}


/* =========================================================
   HEADER TEXT
========================================================= */

.fe-child-profile__identity {
  min-width: 0;
  flex: 1;
}

.fe-child-profile__eyebrow {
  display: flex;
  align-items: center;
  gap: 6px;

  margin-bottom: 5px;

  color: var(--gold);

  font-size: 9px;
  font-weight: 800;

  letter-spacing: 1px;
  text-transform: uppercase;
}

.fe-child-profile__eyebrow::before {
  content: "";

  width: 16px;
  height: 2px;

  border-radius: 99px;

  background: var(--gold);
}

.fe-child-profile__name {
  margin: 0;

  overflow: hidden;

  color: var(--navy);

  font-size: 21px;
  font-weight: 850;

  line-height: 1.3;

  letter-spacing: -0.45px;

  text-overflow: ellipsis;
  white-space: nowrap;
}

.fe-child-profile__code {
  display: inline-flex;
  align-items: center;
  gap: 6px;

  max-width: 100%;

  margin-top: 8px;

  padding: 5px 8px;

  border-radius: 7px;

  background: rgba(23, 59, 94, 0.055);

  color: #657589;

  font-size: 9px;
  font-weight: 700;

  white-space: nowrap;
}

.fe-child-profile__code span {
  overflow: hidden;

  text-overflow: ellipsis;
}


/* =========================================================
   CLASS PILL
========================================================= */

.fe-child-profile__class {
  position: absolute;

  right: 23px;
  bottom: 21px;

  z-index: 4;

  display: inline-flex;
  align-items: center;
  gap: 5px;

  max-width: 145px;

  padding: 7px 10px;

  overflow: hidden;

  border: 1px solid #f0dfb9;
  border-radius: 999px;

  background: rgba(255, 249, 232, 0.95);

  color: #9a6c1d;

  font-size: 9px;
  font-weight: 800;

  box-shadow:
    0 4px 12px rgba(154, 108, 29, 0.07);

  white-space: nowrap;
}

.fe-child-profile__class span {
  overflow: hidden;

  text-overflow: ellipsis;
}


/* =========================================================
   BODY
========================================================= */

.fe-child-profile__body {
  padding: 20px 25px 18px;

  border-top: 1px solid #f0f2f5;
}


/* =========================================================
   JOURNEY LABEL
========================================================= */

.fe-child-profile__journey {
  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 10px;

  margin-bottom: 13px;
}

.fe-child-profile__journey-title {
  display: flex;
  align-items: center;
  gap: 7px;

  color: var(--navy);

  font-size: 11px;
  font-weight: 800;
}

.fe-child-profile__journey-title-icon {
  color: var(--gold);
  font-size: 13px;
}

.fe-child-profile__journey-status {
  display: inline-flex;
  align-items: center;
  gap: 5px;

  color: #2e8b62;

  font-size: 8px;
  font-weight: 800;
}

.fe-child-profile__journey-status-dot {
  width: 5px;
  height: 5px;

  border-radius: 50%;

  background: currentColor;
}


/* =========================================================
   INFO ROW
========================================================= */

.fe-child-profile__details {
  display: grid;

  grid-template-columns:
    minmax(0, 1.2fr)
    minmax(0, 1fr)
    minmax(0, 0.85fr);

  gap: 8px;
}

.fe-child-profile__detail {
  min-width: 0;

  padding: 11px;

  border: 1px solid #edf1f5;
  border-radius: 13px;

  background: #fcfdfe;
}

.fe-child-profile__detail-label {
  display: flex;
  align-items: center;
  gap: 5px;

  margin-bottom: 5px;

  color: #9aa6b5;

  font-size: 8px;
  font-weight: 700;

  text-transform: uppercase;
  letter-spacing: 0.35px;
}

.fe-child-profile__detail-label svg {
  font-size: 10px;
}

.fe-child-profile__detail-value {
  overflow: hidden;

  color: #34495e;

  font-size: 10px;
  font-weight: 750;

  line-height: 1.4;

  text-overflow: ellipsis;
  white-space: nowrap;
}


/* =========================================================
   FOOTER
========================================================= */

.fe-child-profile__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 12px;

  padding: 14px 25px 18px;

  border-top: 1px solid #f0f2f5;
}

.fe-child-profile__message {
  display: flex;
  align-items: center;
  gap: 7px;

  min-width: 0;

  color: #9aa4b1;

  font-size: 8.5px;
  line-height: 1.4;
}

.fe-child-profile__message-icon {
  flex: 0 0 auto;

  color: var(--gold);

  font-size: 11px;
}

.fe-child-profile__button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;

  flex: 0 0 auto;

  min-height: 37px;

  padding: 0 14px;

  border: 0;
  border-radius: 11px;

  background: var(--navy);

  color: #ffffff;

  cursor: pointer;

  font: inherit;
  font-size: 9.5px;
  font-weight: 800;

  box-shadow:
    0 7px 15px rgba(23, 59, 94, 0.15);

  transition:
    transform 0.18s ease,
    background 0.18s ease,
    box-shadow 0.18s ease;
}

.fe-child-profile__button:hover {
  transform: translateY(-1px);

  background: #244f78;

  box-shadow:
    0 10px 19px rgba(23, 59, 94, 0.21);
}

.fe-child-profile__button:active {
  transform: translateY(0);
}

.fe-child-profile__button:focus-visible {
  outline: 3px solid rgba(217, 164, 65, 0.3);
  outline-offset: 3px;
}


/* =========================================================
   INACTIVE
========================================================= */

.fe-child-profile--inactive .fe-child-profile__status-dot {
  background: #94a3b8;

  box-shadow: none;
}

.fe-child-profile--inactive .fe-child-profile__journey-status {
  color: #94a3b8;
}


/* =========================================================
   TABLET
========================================================= */

@media (max-width: 900px) {
  .fe-child-profile__details {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }

  .fe-child-profile__class {
    position: static;

    margin-top: 12px;
  }
}


/* =========================================================
   MOBILE
========================================================= */

@media (max-width: 575px) {
  .fe-child-profile {
    border-radius: 22px;
  }

  .fe-child-profile__header {
    min-height: 145px;

    padding: 20px 18px;
  }

  .fe-child-profile__header-inner {
    gap: 13px;
  }

  .fe-child-profile__avatar {
    width: 68px;
    height: 68px;

    border-radius: 21px;

    font-size: 25px;
  }

  .fe-child-profile__status-dot {
    width: 23px;
    height: 23px;

    border-width: 3px;

    font-size: 8px;
  }

  .fe-child-profile__eyebrow {
    font-size: 7px;
  }

  .fe-child-profile__name {
    font-size: 17px;
  }

  .fe-child-profile__code {
    margin-top: 6px;

    font-size: 8px;
  }

  .fe-child-profile__class {
    margin-top: 10px;

    padding: 6px 9px;

    font-size: 8px;
  }

  .fe-child-profile__body {
    padding: 16px 16px 15px;
  }

  .fe-child-profile__details {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));

    gap: 7px;
  }

  .fe-child-profile__detail {
    padding: 9px;
  }

  .fe-child-profile__detail-label {
    font-size: 7px;
  }

  .fe-child-profile__detail-value {
    font-size: 9px;
  }

  .fe-child-profile__footer {
    padding:
      12px 16px 15px;
  }

  .fe-child-profile__message {
    font-size: 8px;
  }

  .fe-child-profile__button {
    min-height: 34px;

    padding: 0 11px;

    font-size: 8.5px;
  }
}


/* =========================================================
   VERY SMALL
========================================================= */

@media (max-width: 360px) {
  .fe-child-profile__header {
    padding: 17px 15px;
  }

  .fe-child-profile__avatar {
    width: 60px;
    height: 60px;

    border-radius: 18px;
  }

  .fe-child-profile__name {
    font-size: 15px;
  }

  .fe-child-profile__details {
    grid-template-columns: 1fr;
  }

  .fe-child-profile__footer {
    flex-direction: column;
    align-items: stretch;
  }

  .fe-child-profile__message {
    justify-content: center;
  }

  .fe-child-profile__button {
    width: 100%;
  }
}


/* =========================================================
   REDUCED MOTION
========================================================= */

@media (prefers-reduced-motion: reduce) {
  .fe-child-profile,
  .fe-child-profile *,
  .fe-child-profile *::before,
  .fe-child-profile *::after {
    transition: none !important;
  }
}
`;

/* =========================================================
   HELPERS
========================================================= */

const getApiBaseUrl = () => {
  const rawUrl =
    typeof process !== "undefined" && process.env
      ? process.env.REACT_APP_API_URL || ""
      : "";

  return String(rawUrl).replace(/\/+$/, "");
};

const getAvatarUrl = (avatar) => {
  if (!avatar) return "";

  const value = String(avatar).trim();

  if (
    /^(https?:)?\/\//i.test(value) ||
    value.startsWith("data:") ||
    value.startsWith("blob:")
  ) {
    return value;
  }

  const baseUrl = getApiBaseUrl();

  const path = value.startsWith("/") ? value : `/${value}`;

  return `${baseUrl}${path}`;
};

const displayValue = (value, fallback = "Chưa cập nhật") => {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  return value;
};

const getGenderLabel = (gender) => {
  if (!gender) return "Chưa cập nhật";

  const value = String(gender).toLowerCase();

  if (value === "female" || value === "nữ" || value === "nu" || value === "f") {
    return "Nữ";
  }

  if (value === "male" || value === "nam" || value === "m") {
    return "Nam";
  }

  return gender;
};

const getInitials = (name) => {
  const words = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!words.length) return "?";

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
};

/* =========================================================
   COMPONENT
========================================================= */

const ChildCard = ({ child = {}, onView = () => {} }) => {
  const student = child || {};

  const studentClass = student.class || {};

  const isStudying =
    student.status === "active" ||
    student.status === "Active" ||
    student.status === "studying" ||
    student.status === "Studying" ||
    student.status === true;

  const avatarUrl = getAvatarUrl(student.avatar);

  const gender = getGenderLabel(student.gender);

  const className =
    student.class_name || student.className || studentClass.name || null;

  // const classCode =
  //   student.class_code || student.classCode || studentClass.code || null;

  const catechismLevel =
    student.catechism_level ||
    student.catechismLevel ||
    studentClass.category ||
    null;

  const studentName =
    student.name || student.full_name || student.fullName || "Học sinh";

  return (
    <>
      <style>{CHILD_CARD_CSS}</style>

      <article
        className={[
          "fe-child-profile",
          !isStudying ? "fe-child-profile--inactive" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {/* =================================================
            DECORATION
        ================================================= */}

        <div className="fe-child-profile__circle" />

        <div className="fe-child-profile__circle-small" />

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="fe-child-profile__header">
          <div className="fe-child-profile__header-inner">
            {/* AVATAR */}

            <div className="fe-child-profile__avatar-wrapper">
              <div className="fe-child-profile__avatar">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={studentName}
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="fe-child-profile__avatar-fallback">
                    {getInitials(studentName)}
                  </div>
                )}
              </div>

              <span
                className="fe-child-profile__status-dot"
                title={isStudying ? "Đang học" : "Không hoạt động"}
              >
                {isStudying ? <CheckCircleFilled /> : null}
              </span>
            </div>

            {/* IDENTITY */}

            <div className="fe-child-profile__identity">
              <div className="fe-child-profile__eyebrow">Hồ sơ của con</div>

              <h3 className="fe-child-profile__name" title={studentName}>
                {studentName}
              </h3>

              <div
                className="fe-child-profile__code"
                title={student.code || ""}
              >
                <IdcardOutlined />

                <span>{displayValue(student.code, "Chưa có mã học sinh")}</span>
              </div>
            </div>
          </div>

          {/* CLASS */}

          <div className="fe-child-profile__class" title={className || ""}>
            <ReadOutlined />

            <span>{displayValue(className, "Chưa xếp lớp")}</span>
          </div>
        </div>

        {/* =================================================
            BODY
        ================================================= */}

        <div className="fe-child-profile__body">
          <div className="fe-child-profile__journey">
            <div className="fe-child-profile__journey-title">
              <HeartFilled className="fe-child-profile__journey-title-icon" />
              Hành trình giáo lý
            </div>

            <div className="fe-child-profile__journey-status">
              <span className="fe-child-profile__journey-status-dot" />

              {isStudying ? "Đang theo học" : "Tạm ngưng"}
            </div>
          </div>

          <div className="fe-child-profile__details">
            {/* LỚP */}

            <div className="fe-child-profile__detail">
              <div className="fe-child-profile__detail-label">
                <ReadOutlined />
                Lớp hiện tại
              </div>

              <div
                className="fe-child-profile__detail-value"
                title={className || ""}
              >
                {displayValue(className, "Chưa xếp lớp")}
              </div>
            </div>

            {/* KHỐI */}

            <div className="fe-child-profile__detail">
              <div className="fe-child-profile__detail-label">
                <ReadOutlined />
                Khối giáo lý
              </div>

              <div
                className="fe-child-profile__detail-value"
                title={catechismLevel || ""}
              >
                {displayValue(catechismLevel, "Chưa cập nhật")}
              </div>
            </div>

            {/* NGÀY SINH */}

            <div className="fe-child-profile__detail">
              <div className="fe-child-profile__detail-label">
                <CalendarOutlined />
                Ngày sinh
              </div>

              <div className="fe-child-profile__detail-value">
                {displayValue(
                  student.formattedDateOfBirth ||
                    student.date_of_birth ||
                    student.dateOfBirth,
                )}
              </div>
            </div>

            {/* GIỚI TÍNH */}

            <div className="fe-child-profile__detail">
              <div className="fe-child-profile__detail-label">
                <UserOutlined />
                Giới tính
              </div>

              <div className="fe-child-profile__detail-value">{gender}</div>
            </div>
          </div>
        </div>

        {/* =================================================
            FOOTER
        ================================================= */}

        <div className="fe-child-profile__footer">
          <div className="fe-child-profile__message">
            <HeartFilled className="fe-child-profile__message-icon" />

            <span>Gia đình đồng hành cùng con</span>
          </div>

          <button
            type="button"
            className="fe-child-profile__button"
            onClick={() => onView(student)}
          >
            <span>Xem hành trình</span>

            <ArrowRightOutlined />
          </button>
        </div>
      </article>
    </>
  );
};

export default ChildCard;
