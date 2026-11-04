import React, { useEffect, useMemo, useState } from "react";
import { Avatar, Button, Empty, Progress, Skeleton, message } from "antd";
import {
  ArrowRightOutlined,
  BellOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  HomeOutlined,
  ReloadOutlined,
  RightOutlined,
  TeamOutlined,
  TrophyOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { getDashboardParent } from "../../api/dashboardApi";
import parentApi from "../../api/parentApi";

// FaithEdu Family — Product Dashboard
// Không dùng dữ liệu giả. Các trường chưa được API trả về sẽ hiển thị "—".
const ROUTES = {
  students: "/parent/students",
  notifications: "/parent/notifications",
  schedule: "/parent/schedule",
};
const css = `
.fe-product{font-family:Inter,"Be Vietnam Pro",system-ui,sans-serif;color:#203349;width:100%;max-width:1440px;margin:0 auto;min-width:0}
.fe-product *{box-sizing:border-box}
.fe-product button{font-family:inherit}
.fe-product__top{display:flex;justify-content:space-between;align-items:center;gap:16px;margin-bottom:24px}
.fe-product__eyebrow{font-size:12px;font-weight:700;color:#718399;margin-bottom:6px;letter-spacing:.04em}
.fe-product__heading{font-size:clamp(22px,2.4vw,30px);font-weight:800;line-height:1.25;letter-spacing:-.8px;color:#173B5E;margin:0}
.fe-product__intro{font-size:13px;color:#7B8999;margin:7px 0 0;line-height:1.6}
.fe-product__top-actions{display:flex;align-items:center;gap:9px;flex-shrink:0}
.fe-product__date{font-size:12px;color:#64748b;background:#fff;border:1px solid #e7edf3;padding:10px 13px;border-radius:11px;white-space:nowrap}
.fe-product__button.ant-btn{height:39px;border-radius:11px;font-weight:650;font-size:12px;display:inline-flex;align-items:center;justify-content:center;gap:6px}
.fe-product__button--primary.ant-btn{background:#173B5E;color:#fff;border-color:#173B5E;box-shadow:none}
.fe-product__button--primary.ant-btn:hover{background:#285578!important;border-color:#285578!important;color:white!important}
.fe-product__welcome{background:#173B5E;border-radius:18px;display:flex;align-items:stretch;justify-content:space-between;overflow:hidden;position:relative;margin-bottom:20px;min-height:174px}
.fe-product__welcome:after{content:"";position:absolute;width:340px;height:340px;border:1px solid rgba(255,255,255,.12);border-radius:50%;right:-110px;top:-180px;pointer-events:none}
.fe-product__welcome-copy{position:relative;z-index:1;padding:26px 30px;max-width:650px}
.fe-product__welcome-kicker{color:#e4c987;font-size:11px;font-weight:750;letter-spacing:.06em;text-transform:uppercase}
.fe-product__welcome-title{font-size:clamp(20px,2vw,26px);line-height:1.3;color:white;font-weight:800;letter-spacing:-.45px;margin:9px 0}
.fe-product__welcome-desc{font-size:12px;line-height:1.8;color:#d0dce7;margin:0;max-width:500px}
.fe-product__welcome-mark{display:flex;align-items:center;justify-content:center;width:225px;min-width:160px;position:relative;color:rgba(255,255,255,.13);font-size:115px;font-weight:700}
.fe-product__welcome-mark:before{content:"";position:absolute;width:145px;height:145px;background:rgba(217,164,65,.12);border-radius:50%}
.fe-product__metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:13px;margin-bottom:22px}
.fe-product__metric{background:#fff;border:1px solid #e6ebf1;border-radius:15px;padding:17px 18px;min-width:0;display:flex;gap:13px;align-items:flex-start}
.fe-product__metric-icon{width:39px;height:39px;flex-shrink:0;border-radius:11px;display:grid;place-items:center;font-size:18px;background:#eff4f8;color:#173B5E}
.fe-product__metric:nth-child(2) .fe-product__metric-icon{background:#eaf6f0;color:#2E7D5B}
.fe-product__metric:nth-child(3) .fe-product__metric-icon{background:#fff5e5;color:#ac7d29}
.fe-product__metric:nth-child(4) .fe-product__metric-icon{background:#f2effa;color:#7460a5}
.fe-product__metric-label{color:#728298;font-size:11px;font-weight:650}
.fe-product__metric-value{font-size:25px;font-weight:800;letter-spacing:-.6px;color:#173B5E;margin-top:5px;line-height:1.2;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.fe-product__metric-note{color:#9aa7b6;font-size:10px;margin-top:6px}
.fe-product__grid{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(300px,1fr);gap:17px;align-items:start}
.fe-product__stack{display:flex;flex-direction:column;gap:17px;min-width:0}
.fe-product__panel{background:white;border:1px solid #e6ebf1;border-radius:16px;padding:20px;min-width:0}
.fe-product__panel-head{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:18px}
.fe-product__panel-title{margin:0;font-size:15px;color:#173B5E;font-weight:800;letter-spacing:-.2px}
.fe-product__panel-sub{font-size:11px;color:#93a0af;margin:5px 0 0}
.fe-product__link{border:0;background:none;color:#315b7b;cursor:pointer;font-size:11px;font-weight:750;white-space:nowrap;display:inline-flex;align-items:center;gap:6px;padding:7px 0}
.fe-product__link:hover{color:#D9A441}
.fe-product__students{display:flex;flex-direction:column;gap:10px}
.fe-product__student{width:100%;border:1px solid #edf0f4;background:#fff;border-radius:12px;padding:13px 14px;display:flex;align-items:center;gap:12px;text-align:left;cursor:pointer;transition:border-color .2s,background .2s}
.fe-product__student:hover{border-color:#cbd8e5;background:#fafcff}
.fe-product__student-avatar.ant-avatar{background:#eaf0f5;color:#173B5E;font-weight:800;flex-shrink:0}
.fe-product__student-main{flex:1;min-width:0}
.fe-product__student-name{font-size:12px;font-weight:750;color:#203349;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.fe-product__student-meta{font-size:11px;color:#8b98a7;margin-top:5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.fe-product__student-arrow{color:#a5b0bd;font-size:11px}
.fe-product__student-tag{font-size:10px;color:#287a57;background:#eaf6f0;padding:5px 8px;border-radius:6px;white-space:nowrap}
.fe-product__schedule{display:flex;flex-direction:column}
.fe-product__schedule-item{display:flex;align-items:center;gap:12px;padding:13px 0;border-top:1px solid #edf0f4}
.fe-product__schedule-item:first-child{border-top:0;padding-top:0}
.fe-product__calendar{width:51px;min-width:51px;height:51px;border-radius:10px;background:#f0f4f8;display:flex;align-items:center;justify-content:center;flex-direction:column}
.fe-product__calendar strong{font-size:17px;color:#173B5E;line-height:1.1}
.fe-product__calendar span{font-size:10px;color:#74869a;margin-top:4px}
.fe-product__schedule-detail{flex:1;min-width:0}
.fe-product__schedule-title{font-size:12px;font-weight:750;color:#243447;white-space:nowrap;text-overflow:ellipsis;overflow:hidden}
.fe-product__schedule-time{font-size:11px;color:#8492a3;margin-top:6px;display:flex;gap:6px;align-items:center;flex-wrap:wrap}
.fe-product__status{color:#315b7b;background:#edf3f8;font-size:10px;padding:5px 7px;border-radius:7px;white-space:nowrap}
.fe-product__attendance{display:flex;justify-content:space-between;gap:16px;align-items:center;margin:2px 0 15px}
.fe-product__attendance strong{font-size:30px;line-height:1.2;color:#173B5E;letter-spacing:-1px}
.fe-product__attendance p{font-size:11px;color:#8593a3;margin:6px 0 0}
.fe-product__attendance-icon{font-size:26px;color:#d9a441;background:#fff8eb;width:48px;height:48px;border-radius:13px;display:grid;place-items:center}
.fe-product__progress .ant-progress-inner{background:#e9eef3}
.fe-product__progress .ant-progress-bg{background:#D9A441!important}
.fe-product__smallprint{color:#94a3b8;font-size:11px;margin-top:11px}
.fe-product__quicklinks{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
.fe-product__quicklink{border:1px solid #e9edf2;border-radius:11px;background:#fff;padding:13px 11px;display:flex;align-items:center;gap:10px;cursor:pointer;text-align:left;color:#173B5E;font-size:11px;font-weight:750;transition:background .2s}
.fe-product__quicklink:hover{background:#f3f7fa}
.fe-product__quicklink .anticon{font-size:16px;color:#52728e}
.fe-product__empty{padding:12px 0}
.fe-product__loading{background:white;border:1px solid #e6ebf1;border-radius:16px;padding:24px}
.fe-product__footer{margin:21px 0 5px;color:#a0aab6;font-size:11px;text-align:center}
@media(max-width:1200px){.fe-product__metrics{grid-template-columns:repeat(2,minmax(0,1fr))}.fe-product__grid{grid-template-columns:minmax(0,1fr) minmax(280px,.8fr)}}
@media(max-width:900px){.fe-product__grid{grid-template-columns:1fr}.fe-product__stack{gap:14px}}
@media(max-width:640px){.fe-product__top{align-items:flex-start;margin-bottom:18px}.fe-product__top-actions{display:none}.fe-product__welcome{min-height:160px;border-radius:15px}.fe-product__welcome-copy{padding:22px}.fe-product__welcome-mark{min-width:70px;width:70px;font-size:72px;margin-right:10px}.fe-product__welcome-desc{font-size:11px}.fe-product__metrics{gap:9px;margin-bottom:14px}.fe-product__metric{padding:13px 12px;gap:9px;border-radius:12px}.fe-product__metric-icon{width:32px;height:32px;font-size:15px}.fe-product__metric-value{font-size:20px}.fe-product__metric-note{display:none}.fe-product__panel{padding:15px;border-radius:13px}.fe-product__student-tag{display:none}.fe-product__panel-head{margin-bottom:13px}}
@media(max-width:370px){.fe-product__welcome-mark{display:none}.fe-product__metric{gap:7px;padding:12px 9px}.fe-product__metric-icon{width:28px;height:28px}.fe-product__metric-value{font-size:18px}}
@media(prefers-reduced-motion:reduce){.fe-product *{transition:none!important}}
`;

function unwrap(response) {
  return response?.data?.data ?? response?.data ?? response ?? {};
}
function pick(obj, ...paths) {
  for (const path of paths) {
    const value = path.split(".").reduce((acc, key) => acc?.[key], obj);
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return null;
}
function asList(value) {
  return Array.isArray(value) ? value : [];
}
function numberOrNull(value) {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}
function display(value, suffix = "") {
  return value === null || value === undefined || value === ""
    ? "—"
    : `${value}${suffix}`;
}
function initials(name) {
  const p = String(name || "PH")
    .trim()
    .split(/\s+/);
  return (
    p.length > 1
      ? `${p[p.length - 2][0]}${p[p.length - 1][0]}`
      : p[0].slice(0, 2)
  ).toUpperCase();
}
function dateParts(raw) {
  if (!raw) return { day: "—", month: "—" };
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return { day: "—", month: "—" };
  return {
    day: String(date.getDate()).padStart(2, "0"),
    month: `Th${date.getMonth() + 1}`,
  };
}
function Panel({ title, subtitle, action, onAction, children }) {
  return (
    <section className="fe-product__panel">
      <div className="fe-product__panel-head">
        <div>
          <h2 className="fe-product__panel-title">{title}</h2>
          {subtitle && <p className="fe-product__panel-sub">{subtitle}</p>}
        </div>
        {action && (
          <button className="fe-product__link" type="button" onClick={onAction}>
            {action}
            <ArrowRightOutlined />
          </button>
        )}
      </div>
      {children}
    </section>
  );
}
function Metric({ icon, label, value, note }) {
  return (
    <div className="fe-product__metric">
      <div className="fe-product__metric-icon">{icon}</div>
      <div style={{ minWidth: 0 }}>
        <div className="fe-product__metric-label">{label}</div>
        <div className="fe-product__metric-value" title={String(value)}>
          {value}
        </div>
        <div className="fe-product__metric-note">{note}</div>
      </div>
    </div>
  );
}

export default function ParentDashboard() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState({});
  const [me, setMe] = useState({});
  const [loading, setLoading] = useState(true);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      const [d, p] = await Promise.allSettled([
        getDashboardParent(),
        parentApi.getMe(),
      ]);
      if (!active) return;
      setDashboard(d.status === "fulfilled" ? unwrap(d.value) : {});
      setMe(p.status === "fulfilled" ? unwrap(p.value) : {});
      if (d.status === "rejected")
        message.error(
          d.reason?.response?.data?.message ||
            "Không thể tải dữ liệu tổng quan",
        );
      if (p.status === "rejected")
        message.warning("Chưa tải được thông tin phụ huynh");
      setLoading(false);
    }
    load();
    return () => {
      active = false;
    };
  }, [reload]);

  const students = useMemo(() => asList(dashboard?.students), [dashboard]);
  const schedules = useMemo(() => {
    const list = pick(dashboard, "upcomingSchedules", "schedules");
    if (Array.isArray(list)) return list;
    return dashboard?.upcomingSchedule &&
      typeof dashboard.upcomingSchedule === "object"
      ? [dashboard.upcomingSchedule]
      : [];
  }, [dashboard]);
  const name =
    pick(me, "full_name", "fullName", "name", "username") || "Phụ huynh";
  const score = pick(
    dashboard,
    "averageScore",
    "average_score",
    "averageResult",
    "latestResult.score",
    "latestResult.averageScore",
  );
  const certificates = pick(
    dashboard,
    "certificateCount",
    "certificatesCount",
    "certificate_count",
  );
  const attended = pick(dashboard, "attendedSessions", "attended_sessions");
  const attendance = useMemo(() => {
    const rates = students
      .map((s) =>
        numberOrNull(
          pick(s, "attendanceRate", "attendance_rate", "attendance"),
        ),
      )
      .filter((v) => v !== null && v >= 0 && v <= 100);
    if (rates.length)
      return Math.round(rates.reduce((a, b) => a + b, 0) / rates.length);
    const total = numberOrNull(
      pick(
        dashboard,
        "attendanceRate",
        "attendance_rate",
        "attendancePercentage",
      ),
    );
    return total === null
      ? null
      : Math.max(0, Math.min(100, Math.round(total)));
  }, [students, dashboard]);
  const today = new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date());

  return (
    <div className="fe-product">
      <style>{css}</style>
      {loading ? (
        <div className="fe-product__loading">
          <Skeleton active paragraph={{ rows: 3 }} />
          <Skeleton active paragraph={{ rows: 6 }} />
        </div>
      ) : (
        <>
          <div className="fe-product__top">
            <div>
              <div className="fe-product__eyebrow">FAITHEDU / GIA ĐÌNH</div>
              <h1 className="fe-product__heading">Tổng quan gia đình</h1>
              <p className="fe-product__intro">
                Xin chào, {name}. Theo dõi hành trình học giáo lý của các con
                tại đây.
              </p>
            </div>
            <div className="fe-product__top-actions">
              <span className="fe-product__date">
                <CalendarOutlined /> {today}
              </span>
              <Button
                className="fe-product__button"
                icon={<ReloadOutlined />}
                onClick={() => setReload((v) => v + 1)}
              >
                Làm mới
              </Button>
            </div>
          </div>
          <div className="fe-product__welcome">
            <div className="fe-product__welcome-copy">
              <div className="fe-product__welcome-kicker">FAITHEDU FAMILY</div>
              <h2 className="fe-product__welcome-title">
                Đồng hành cùng con, mỗi ngày một bước.
              </h2>
              <p className="fe-product__welcome-desc">
                Thông tin học tập, chuyên cần và lịch học được tổng hợp trong
                một không gian đơn giản, thuận tiện cho phụ huynh.
              </p>
            </div>
            <div className="fe-product__welcome-mark" aria-hidden="true">
              ✝
            </div>
          </div>
          <div className="fe-product__metrics">
            <Metric
              icon={<TeamOutlined />}
              label="Các con"
              value={students.length}
              note="Học sinh đã kết nối"
            />
            <Metric
              icon={<CheckCircleOutlined />}
              label="Chuyên cần"
              value={display(attendance, "%")}
              note={
                attended == null
                  ? "Tỷ lệ tham gia"
                  : `${attended} buổi đã tham gia`
              }
            />
            <Metric
              icon={<TrophyOutlined />}
              label="Điểm trung bình"
              value={display(score)}
              note="Kết quả học tập"
            />
            <Metric
              icon={<FileTextOutlined />}
              label="Chứng chỉ"
              value={display(certificates)}
              note="Số chứng chỉ được cấp"
            />
          </div>
          <div className="fe-product__grid">
            <div className="fe-product__stack">
              <Panel
                title="Thông tin các con"
                subtitle="Danh sách học sinh liên kết với tài khoản"
                action="Xem tất cả"
                onAction={() => navigate(ROUTES.students)}
              >
                {students.length ? (
                  <div className="fe-product__students">
                    {students.slice(0, 4).map((s, i) => {
                      const id = pick(s, "id", "studentId", "student_id");
                      const studentName =
                        pick(s, "name", "full_name", "fullName") || "Học sinh";
                      const className =
                        pick(s, "className", "class_name", "class.name") ||
                        "Chưa cập nhật lớp";
                      const avatar = pick(
                        s,
                        "avatar",
                        "avatar_url",
                        "avatarUrl",
                      );
                      const status = pick(s, "status", "learningStatus");
                      return (
                        <button
                          key={id ?? i}
                          className="fe-product__student"
                          type="button"
                          onClick={() =>
                            navigate(
                              id != null
                                ? `/parent/children/${encodeURIComponent(id)}`
                                : ROUTES.students,
                            )
                          }
                        >
                          <Avatar
                            size={42}
                            src={avatar || undefined}
                            className="fe-product__student-avatar"
                          >
                            {!avatar && initials(studentName)}
                          </Avatar>
                          <span className="fe-product__student-main">
                            <div className="fe-product__student-name">
                              {studentName}
                            </div>
                            <div className="fe-product__student-meta">
                              {className}
                            </div>
                          </span>
                          {status && (
                            <span className="fe-product__student-tag">
                              {status}
                            </span>
                          )}
                          <RightOutlined className="fe-product__student-arrow" />
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="fe-product__empty">
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description="Chưa có học sinh được kết nối"
                    />
                    <Button
                      className="fe-product__button fe-product__button--primary"
                      onClick={() => navigate(ROUTES.students)}
                    >
                      Xem trang các con <ArrowRightOutlined />
                    </Button>
                  </div>
                )}
              </Panel>
              <Panel
                title="Lịch học sắp tới"
                subtitle="Các buổi học được cập nhật từ hệ thống"
                action="Xem lịch"
                onAction={() => navigate(ROUTES.schedule)}
              >
                {schedules.length ? (
                  <div className="fe-product__schedule">
                    {schedules.slice(0, 4).map((s, i) => {
                      const { day, month } = dateParts(
                        pick(s, "date", "startDate", "start_date"),
                      );
                      const title =
                        pick(s, "subject", "title", "name", "className") ||
                        "Buổi học giáo lý";
                      const time = pick(s, "time", "startTime", "start_time");
                      const location = pick(s, "room", "location", "classroom");
                      const status = pick(s, "status");
                      return (
                        <div
                          className="fe-product__schedule-item"
                          key={s?.id ?? i}
                        >
                          <div className="fe-product__calendar">
                            <strong>{day}</strong>
                            <span>{month}</span>
                          </div>
                          <div className="fe-product__schedule-detail">
                            <div className="fe-product__schedule-title">
                              {title}
                            </div>
                            <div className="fe-product__schedule-time">
                              <ClockCircleOutlined /> {time || "Chưa có giờ"}
                              {location ? ` · ${location}` : ""}
                            </div>
                          </div>
                          {status && (
                            <span className="fe-product__status">{status}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="Chưa có lịch học sắp tới"
                  />
                )}
              </Panel>
            </div>
            <div className="fe-product__stack">
              <Panel
                title="Theo dõi chuyên cần"
                subtitle="Tỷ lệ tham gia các buổi học giáo lý"
              >
                <div className="fe-product__attendance">
                  <div>
                    <strong>{display(attendance, "%")}</strong>
                    <p>
                      {attendance === null
                        ? "Chưa có dữ liệu chuyên cần"
                        : "Tỷ lệ chuyên cần hiện tại"}
                    </p>
                  </div>
                  <div className="fe-product__attendance-icon">
                    <CheckCircleOutlined />
                  </div>
                </div>
                <Progress
                  className="fe-product__progress"
                  percent={attendance ?? 0}
                  showInfo={false}
                  strokeWidth={8}
                />
                <div className="fe-product__smallprint">
                  {attended == null
                    ? "Thông tin được cập nhật theo dữ liệu giáo xứ."
                    : `Đã tham gia ${attended} buổi học.`}
                </div>
              </Panel>
              <Panel
                title="Truy cập nhanh"
                subtitle="Các chức năng dành cho phụ huynh"
              >
                <div className="fe-product__quicklinks">
                  <button
                    type="button"
                    className="fe-product__quicklink"
                    onClick={() => navigate(ROUTES.students)}
                  >
                    <UserOutlined /> Các con
                  </button>
                  <button
                    type="button"
                    className="fe-product__quicklink"
                    onClick={() => navigate(ROUTES.schedule)}
                  >
                    <CalendarOutlined /> Lịch học
                  </button>
                  <button
                    type="button"
                    className="fe-product__quicklink"
                    onClick={() => navigate(ROUTES.notifications)}
                  >
                    <BellOutlined /> Thông báo
                  </button>
                  <button
                    type="button"
                    className="fe-product__quicklink"
                    onClick={() => navigate("/parent")}
                  >
                    <HomeOutlined /> Tổng quan
                  </button>
                </div>
              </Panel>
            </div>
          </div>
          <div className="fe-product__footer">
            FaithEdu Family · Nền tảng đồng hành cùng gia đình và giáo xứ
          </div>
        </>
      )}
    </div>
  );
}
