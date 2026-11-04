import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Empty,
  Progress,
  Select,
  Skeleton,
  Tag,
  message,
} from "antd";
import {
  ArrowLeftOutlined,
  ReloadOutlined,
  UserOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  TrophyOutlined,
  ScheduleOutlined,
  SafetyCertificateOutlined,
  BellOutlined,
  BookOutlined,
  DownloadOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import parentApi from "../../../../api/parentApi";
import fallbackAvatar from "../../../../assets/images/student-default.png";
import "./ChildDetail.css";

const tabs = [
  { key: "overview", label: "Tổng quan", icon: <UserOutlined /> },
  { key: "attendance", label: "Điểm danh", icon: <CheckCircleOutlined /> },
  { key: "results", label: "Kết quả", icon: <TrophyOutlined /> },
  { key: "schedule", label: "Lịch học", icon: <ScheduleOutlined /> },
  {
    key: "certificates",
    label: "Chứng nhận",
    icon: <SafetyCertificateOutlined />,
  },
  { key: "lessons", label: "Bài học", icon: <BookOutlined /> },
  { key: "notifications", label: "Thông báo", icon: <BellOutlined /> },
];
const emptyText = "Chưa cập nhật";
const fmtDate = (v) => {
  if (!v) return emptyText;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? String(v) : d.toLocaleDateString("vi-VN");
};
const fmtTime = (v) => (v ? String(v).slice(0, 5) : "--:--");
const dayName = (d) =>
  ({
    0: "Chủ nhật",
    1: "Thứ 2",
    2: "Thứ 3",
    3: "Thứ 4",
    4: "Thứ 5",
    5: "Thứ 6",
    6: "Thứ 7",
    sunday: "Chủ nhật",
    monday: "Thứ 2",
    tuesday: "Thứ 3",
    wednesday: "Thứ 4",
    thursday: "Thứ 5",
    friday: "Thứ 6",
    saturday: "Thứ 7",
  })[String(d ?? "").toLowerCase()] ||
  (d ?? emptyText);
const attendanceLabel = (s) =>
  ({ present: "Có mặt", absent: "Vắng", late: "Đi muộn", excused: "Có phép" })[
    String(s || "").toLowerCase()
  ] ||
  s ||
  "Chưa rõ";
const attendanceColor = (s) =>
  ({ present: "green", absent: "red", late: "orange", excused: "blue" })[
    String(s || "").toLowerCase()
  ] || "default";
const typeLabel = (s) =>
  ({
    mass: "Thánh lễ",
    catechism: "Giáo lý",
    online: "Trực tuyến",
    paper: "Trên giấy",
  })[String(s || "").toLowerCase()] ||
  s ||
  "Khác";
const arr = (...values) => {
  for (const v of values) if (Array.isArray(v)) return v;
  return [];
};
const unwrap = (res) => res?.data?.data ?? res?.data ?? {};
const scoreText = (v) =>
  v === null || v === undefined || v === "" || !Number.isFinite(Number(v))
    ? "—"
    : Number(v).toFixed(1);
const avatarUrl = (v) =>
  !v
    ? fallbackAvatar
    : /^(https?:\/\/|data:|blob:)/i.test(v)
      ? v
      : `${process.env.REACT_APP_API_URL || ""}${v}`;
const getError = (err, fallback) =>
  err?.response?.data?.message || err?.message || fallback;

function Panel({ title, extra, children }) {
  return (
    <section className="cd-panel">
      <div className="cd-panel-head">
        <h2>{title}</h2>
        {extra}
      </div>
      {children}
    </section>
  );
}
function Info({ label, value }) {
  return (
    <div className="cd-info">
      <span>{label}</span>
      <strong>
        {value === null || value === undefined || value === ""
          ? emptyText
          : value}
      </strong>
    </div>
  );
}
function Stat({ label, value, onClick }) {
  return (
    <button
      type="button"
      className="cd-stat"
      onClick={onClick}
      disabled={!onClick}
      aria-label={`${label}: ${value}${onClick ? ", xem chi tiết" : ""}`}
    >
      <span>{label}: </span>
      <strong>{value}</strong>
    </button>
  );
}
function Blank({ title }) {
  return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={title} />;
}
function Loader() {
  return (
    <div className="cd-panel">
      <Skeleton active paragraph={{ rows: 5 }} />
    </div>
  );
}
function FetchError({ text, retry }) {
  return (
    <Alert
      type="error"
      showIcon
      message={text}
      action={
        <Button size="small" onClick={retry}>
          Thử lại
        </Button>
      }
    />
  );
}

export default function ChildDetail() {
  const navigate = useNavigate();
  const { studentId } = useParams();
  const [messageApi, holder] = message.useMessage();
  const [tab, setTab] = useState("overview");
  const [child, setChild] = useState(null);
  const [loadingChild, setLoadingChild] = useState(true);
  const [childError, setChildError] = useState("");
  const [data, setData] = useState({});
  const [busy, setBusy] = useState({});
  const [errors, setErrors] = useState({});
  const [month, setMonth] = useState("");
  const [attendanceType, setAttendanceType] = useState("all");
  const [examType, setExamType] = useState("all");
  const [scheduleType, setScheduleType] = useState("all");

  const loadChild = useCallback(async () => {
    if (!studentId) {
      setChildError("Thiếu mã học sinh");
      setLoadingChild(false);
      return;
    }
    setLoadingChild(true);
    setChildError("");
    try {
      const res = await parentApi.getChild(studentId);
      const payload = res?.data || {};
      if (
        payload.success === false ||
        (!payload.student && !payload.data?.student)
      )
        throw new Error(payload.message || "Không tìm thấy học sinh");
      const detail = payload.data?.student ? payload.data : payload;
      const classes = arr(detail.classes);
      setChild({
        ...detail.student,
        classes,
        currentClass: classes[0] || null,
        attendance: detail.attendance || {},
        family: detail.family || {},
        latestResult: detail.latest_result,
        sacraments: arr(detail.sacraments),
      });
    } catch (e) {
      setChild(null);
      setChildError(getError(e, "Không thể tải hồ sơ"));
    } finally {
      setLoadingChild(false);
    }
  }, [studentId]);

  const loadTab = useCallback(
    async (key) => {
      if (
        !studentId ||
        !["attendance", "results", "schedule", "certificates"].includes(key)
      )
        return;
      setBusy((v) => ({ ...v, [key]: true }));
      setErrors((v) => ({ ...v, [key]: "" }));
      try {
        let res;
        if (key === "attendance") {
          const params = { page: 1, pageSize: 100 };
          if (attendanceType !== "all") params.type = attendanceType;
          if (month) {
            const [y, m] = month.split("-").map(Number);
            params.from = `${month}-01`;
            params.to = `${month}-${String(new Date(y, m, 0).getDate()).padStart(2, "0")}`;
          }
          res = await parentApi.getChildAttendance(studentId, params);
        } else if (key === "results") {
          res = await parentApi.getChildResults(
            studentId,
            examType === "all" ? {} : { exam_type: examType },
          );
        } else if (key === "schedule")
          res = await parentApi.getChildSchedule(studentId);
        else res = await parentApi.getChildCertificates(studentId);
        if (res?.data?.success === false || res?.success === false)
          throw new Error(
            res?.data?.message || res?.message || "Không tải được dữ liệu",
          );
        setData((v) => ({ ...v, [key]: unwrap(res) }));
      } catch (e) {
        setErrors((v) => ({
          ...v,
          [key]: getError(e, "Không tải được dữ liệu"),
        }));
      } finally {
        setBusy((v) => ({ ...v, [key]: false }));
      }
    },
    [studentId, attendanceType, month, examType],
  );

  useEffect(() => {
    loadChild();
    setData({});
    setTab("overview");
  }, [loadChild]);
  useEffect(() => {
    loadTab(tab);
  }, [tab, loadTab]);

  const classInfo = child?.currentClass;
  const overviewAttendance = child?.attendance || {};
  const total = Number(
    overviewAttendance.total ?? overviewAttendance.total_attendance ?? 0,
  );
  const present = Number(
    overviewAttendance.present ?? overviewAttendance.present_count ?? 0,
  );
  const late = Number(
    overviewAttendance.late ?? overviewAttendance.late_count ?? 0,
  );
  const overviewRate = Number(
    overviewAttendance.rate ?? (total ? ((present + late) / total) * 100 : 0),
  );
  const schedule = classInfo?.schedules?.[0];
  const currentData = useMemo(() => data[tab] || {}, [data, tab]);

  const records = useMemo(() => {
    if (tab === "attendance") {
      return arr(
        currentData.records,
        currentData.attendances,
        currentData.data?.records,
        currentData.data,
      );
    }

    if (tab === "results") {
      return arr(
        currentData.records,
        currentData.results,
        currentData.data?.records,
        currentData.data,
      );
    }

    if (tab === "schedule") {
      return arr(
        currentData.schedules,
        currentData.records,
        currentData.data?.schedules,
        currentData.data?.records,
        currentData.data,
      );
    }

    if (tab === "certificates") {
      return arr(
        currentData.certificates,
        currentData.records,
        currentData.data?.certificates,
        currentData.data?.records,
        currentData.data,
      );
    }

    return [];
  }, [tab, currentData]);
  const summary = currentData.summary || currentData.data?.summary || {};
  const shownSchedules =
    scheduleType === "all"
      ? records
      : records.filter(
          (r) =>
            (r.type || r.schedule_type || r.category || "catechism") ===
            scheduleType,
        );

  return (
    <div className="cd-page">
      {holder}
      <div className="cd-shell">
        <button
          className="cd-back"
          type="button"
          onClick={() => navigate("/parent/students")}
        >
          <ArrowLeftOutlined /> Danh sách các con
        </button>
        {loadingChild ? (
          <Loader />
        ) : childError || !child ? (
          <FetchError
            text={childError || "Không tìm thấy hồ sơ"}
            retry={loadChild}
          />
        ) : (
          <>
            <header className="cd-profile">
              <img
                src={avatarUrl(child.avatar)}
                alt={child.name || "Học sinh"}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = fallbackAvatar;
                }}
              />
              <div className="cd-profile-text">
                <div className="cd-eyebrow">HỒ SƠ HỌC SINH</div>
                <h1>
                  {child.saint_name ? `${child.saint_name} ` : ""}
                  {child.name || "Học sinh"}
                </h1>
                <p>
                  {classInfo?.name || "Chưa xếp lớp"}
                  {child.code ? ` · ${child.code}` : ""}
                </p>
              </div>
              <button
                type="button"
                aria-label="Tải lại hồ sơ"
                onClick={loadChild}
                className="cd-refresh"
              >
                <ReloadOutlined />
              </button>
            </header>
            <nav className="cd-tabs" aria-label="Nội dung hồ sơ">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  className={tab === t.key ? "active" : ""}
                  onClick={() => setTab(t.key)}
                  aria-current={tab === t.key ? "page" : undefined}
                >
                  {t.icon}
                  <span>{t.label}</span>
                </button>
              ))}
            </nav>
            <main className="cd-main">
              {tab === "overview" && (
                <>
                  <div className="cd-stats">
                    <Stat
                      label="Chuyên cần"
                      value={`${Math.round(overviewRate)}%`}
                      onClick={() => setTab("attendance")}
                    />
                    <Stat label="Có mặt" value={present} />
                    <Stat
                      label="Điểm gần nhất"
                      value={scoreText(
                        child.latestResult?.score ??
                          child.latestResult?.result ??
                          child.latestResult?.point,
                      )}
                      onClick={() => setTab("results")}
                    />
                  </div>
                  <div className="cd-columns">
                    <Panel
                      title="Lịch học của con"
                      extra={
                        <Button type="link" onClick={() => setTab("schedule")}>
                          Xem lịch <RightOutlined />
                        </Button>
                      }
                    >
                      {schedule ? (
                        <div className="cd-upcoming">
                          <div className="cd-upcoming-icon">
                            <CalendarOutlined />
                          </div>
                          <div>
                            <strong>
                              {dayName(
                                schedule.day_of_week ?? schedule.dayOfWeek,
                              )}
                            </strong>
                            <p>
                              {fmtTime(
                                schedule.start_time ?? schedule.startTime,
                              )}{" "}
                              – {fmtTime(schedule.end_time ?? schedule.endTime)}
                            </p>
                            <small>
                              {schedule.room ||
                                classInfo?.room ||
                                "Chưa có phòng học"}
                            </small>
                          </div>
                        </div>
                      ) : (
                        <Blank title="Chưa có lịch học" />
                      )}
                    </Panel>
                    <Panel title="Thông tin học sinh">
                      <Info label="Mã học sinh" value={child.code} />
                      <Info
                        label="Ngày sinh"
                        value={fmtDate(child.date_of_birth)}
                      />
                      <Info
                        label="Giới tính"
                        value={
                          child.gender === "male"
                            ? "Nam"
                            : child.gender === "female"
                              ? "Nữ"
                              : child.gender
                        }
                      />
                      <Info label="Tên thánh" value={child.saint_name} />
                      <Info label="Giáo xứ" value={child.parish} />
                      <Info label="Điện thoại" value={child.phone} />
                    </Panel>
                    <Panel title="Lớp Giáo lý">
                      <Info label="Tên lớp" value={classInfo?.name} />
                      <Info label="Mã lớp" value={classInfo?.code} />
                      <Info
                        label="Phòng học"
                        value={classInfo?.room || schedule?.room}
                      />
                      <Info
                        label="Giáo lý viên"
                        value={
                          classInfo?.catechist_name || classInfo?.catechistName
                        }
                      />
                    </Panel>
                    <Panel title="Thông tin gia đình">
                      <Info label="Cha" value={child.family?.father?.name} />
                      <Info
                        label="SĐT cha"
                        value={child.family?.father?.phone}
                      />
                      <Info label="Mẹ" value={child.family?.mother?.name} />
                      <Info
                        label="SĐT mẹ"
                        value={child.family?.mother?.phone}
                      />
                      <Info
                        label="Người giám hộ"
                        value={child.family?.guardian?.name}
                      />
                      <Info
                        label="SĐT giám hộ"
                        value={child.family?.guardian?.phone}
                      />
                    </Panel>
                  </div>
                  <Panel title="Hành trình Bí tích">
                    {child.sacraments.length ? (
                      child.sacraments.map((s, i) => (
                        <div className="cd-list-row" key={s.id || i}>
                          <div className="cd-row-icon">
                            <SafetyCertificateOutlined />
                          </div>
                          <div className="cd-row-main">
                            <strong>{s.name || s.type || "Bí tích"}</strong>
                            <small>
                              {fmtDate(s.date_received)}
                              {s.church_name_custom
                                ? ` · ${s.church_name_custom}`
                                : ""}
                            </small>
                          </div>
                        </div>
                      ))
                    ) : (
                      <Blank title="Chưa có dữ liệu Bí tích" />
                    )}
                  </Panel>
                </>
              )}
              {tab === "attendance" && (
                <>
                  <div className="cd-filters">
                    <label>
                      Tháng
                      <input
                        type="month"
                        value={month}
                        onChange={(e) => setMonth(e.target.value)}
                      />
                    </label>
                    <label>
                      Loại điểm danh
                      <Select
                        value={attendanceType}
                        onChange={setAttendanceType}
                        options={[
                          { value: "all", label: "Tất cả" },
                          { value: "catechism", label: "Giáo lý" },
                          { value: "mass", label: "Thánh lễ" },
                        ]}
                      />
                    </label>
                  </div>
                  {busy.attendance ? (
                    <Loader />
                  ) : errors.attendance ? (
                    <FetchError
                      text={errors.attendance}
                      retry={() => loadTab("attendance")}
                    />
                  ) : (
                    <>
                      <div className="cd-stats">
                        <Stat label="Tổng buổi" value={summary.total ?? 0} />
                        <Stat
                          label="Có mặt"
                          value={summary.present ?? summary.present_count ?? 0}
                        />
                        <Stat
                          label="Vắng"
                          value={summary.absent ?? summary.absent_count ?? 0}
                        />
                        <Stat
                          label="Đi muộn"
                          value={summary.late ?? summary.late_count ?? 0}
                        />
                      </div>
                      <Panel title="Tỷ lệ chuyên cần">
                        <div className="cd-rate">
                          <strong>
                            {Math.round(
                              Number(
                                summary.rate ??
                                  (Number(summary.total)
                                    ? ((Number(summary.present || 0) +
                                        Number(summary.late || 0)) /
                                        Number(summary.total)) *
                                      100
                                    : 0),
                              ),
                            )}
                            %
                          </strong>
                          <Progress
                            percent={Math.min(
                              100,
                              Math.max(
                                0,
                                Number(
                                  summary.rate ??
                                    (Number(summary.total)
                                      ? ((Number(summary.present || 0) +
                                          Number(summary.late || 0)) /
                                          Number(summary.total)) *
                                        100
                                      : 0),
                                ),
                              ),
                            )}
                            showInfo={false}
                            strokeColor="#D9A441"
                          />
                        </div>
                      </Panel>
                      <Panel
                        title="Nhật ký điểm danh"
                        extra={
                          <Button
                            icon={<ReloadOutlined />}
                            onClick={() => loadTab("attendance")}
                          />
                        }
                      >
                        {records.length ? (
                          records.map((r, i) => (
                            <div className="cd-list-row" key={r.id || i}>
                              <div className="cd-row-icon">
                                <CalendarOutlined />
                              </div>
                              <div className="cd-row-main">
                                <strong>
                                  {r.class_name ||
                                    r.className ||
                                    typeLabel(r.attendance_type || r.type)}
                                </strong>
                                <small>
                                  {fmtDate(r.attendance_date || r.date)} ·{" "}
                                  {typeLabel(r.attendance_type || r.type)}
                                </small>
                              </div>
                              <Tag
                                color={attendanceColor(
                                  r.status || r.attendance_status,
                                )}
                              >
                                {attendanceLabel(
                                  r.status || r.attendance_status,
                                )}
                              </Tag>
                            </div>
                          ))
                        ) : (
                          <Blank title="Chưa có dữ liệu điểm danh" />
                        )}
                      </Panel>
                    </>
                  )}
                </>
              )}
              {tab === "results" && (
                <>
                  <div className="cd-filters">
                    <label>
                      Hình thức kiểm tra
                      <Select
                        value={examType}
                        onChange={setExamType}
                        options={[
                          { value: "all", label: "Tất cả" },
                          { value: "online", label: "Trực tuyến" },
                          { value: "paper", label: "Trên giấy" },
                        ]}
                      />
                    </label>
                  </div>
                  {busy.results ? (
                    <Loader />
                  ) : errors.results ? (
                    <FetchError
                      text={errors.results}
                      retry={() => loadTab("results")}
                    />
                  ) : (
                    <>
                      <div className="cd-stats">
                        <Stat
                          label="Trung bình"
                          value={scoreText(summary.average ?? summary.avg)}
                        />
                        <Stat
                          label="Cao nhất"
                          value={scoreText(summary.highest ?? summary.max)}
                        />
                        <Stat
                          label="Gần nhất"
                          value={scoreText(
                            summary.latest?.score ?? child.latestResult?.score,
                          )}
                        />
                      </div>
                      <Panel
                        title="Kết quả học tập"
                        extra={
                          <Button
                            icon={<ReloadOutlined />}
                            onClick={() => loadTab("results")}
                          />
                        }
                      >
                        {records.length ? (
                          records.map((r, i) => (
                            <div className="cd-list-row" key={r.id || i}>
                              <div className="cd-row-main">
                                <strong>
                                  {r.title ||
                                    r.subject_name ||
                                    r.exam_name ||
                                    r.examName ||
                                    "Bài kiểm tra"}
                                </strong>
                                <small>
                                  {fmtDate(r.exam_date || r.examDate || r.date)}{" "}
                                  · {typeLabel(r.exam_type || r.examType)}
                                </small>
                              </div>
                              <div className="cd-score">
                                {scoreText(r.score ?? r.point ?? r.result)}
                                <small>/10</small>
                              </div>
                            </div>
                          ))
                        ) : (
                          <Blank title="Chưa có kết quả học tập" />
                        )}
                      </Panel>
                    </>
                  )}
                </>
              )}
              {tab === "schedule" && (
                <>
                  <div className="cd-filters">
                    <label>
                      Loại lịch
                      <Select
                        value={scheduleType}
                        onChange={setScheduleType}
                        options={[
                          { value: "all", label: "Tất cả" },
                          { value: "catechism", label: "Giáo lý" },
                          { value: "mass", label: "Thánh lễ" },
                        ]}
                      />
                    </label>
                  </div>
                  {busy.schedule ? (
                    <Loader />
                  ) : errors.schedule ? (
                    <FetchError
                      text={errors.schedule}
                      retry={() => loadTab("schedule")}
                    />
                  ) : (
                    <Panel
                      title="Lịch học trong tuần"
                      extra={
                        <Button
                          icon={<ReloadOutlined />}
                          onClick={() => loadTab("schedule")}
                        />
                      }
                    >
                      {shownSchedules.length ? (
                        shownSchedules.map((r, i) => (
                          <div className="cd-list-row" key={r.id || i}>
                            <div className="cd-day">
                              {dayName(r.day_of_week ?? r.dayOfWeek)}
                            </div>
                            <div className="cd-row-main">
                              <strong>
                                {r.class_name ||
                                  r.className ||
                                  r.name ||
                                  "Lớp Giáo lý"}
                              </strong>
                              <small>
                                {fmtTime(r.start_time || r.startTime)} –{" "}
                                {fmtTime(r.end_time || r.endTime)} ·{" "}
                                {r.room || "Chưa có phòng"}
                              </small>
                              {(r.catechist_name || r.catechistName) && (
                                <small>
                                  GLV: {r.catechist_name || r.catechistName}
                                </small>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <Blank title="Chưa có lịch học" />
                      )}
                    </Panel>
                  )}
                </>
              )}
              {tab === "certificates" &&
                (busy.certificates ? (
                  <Loader />
                ) : errors.certificates ? (
                  <FetchError
                    text={errors.certificates}
                    retry={() => loadTab("certificates")}
                  />
                ) : (
                  <Panel
                    title="Chứng nhận của con"
                    extra={
                      <Button
                        icon={<ReloadOutlined />}
                        onClick={() => loadTab("certificates")}
                      />
                    }
                  >
                    {records.length ? (
                      records.map((r, i) => {
                        const url =
                          r.file_url ||
                          r.fileUrl ||
                          r.download_url ||
                          r.downloadUrl;
                        return (
                          <div className="cd-list-row" key={r.id || i}>
                            <div className="cd-row-icon">
                              <SafetyCertificateOutlined />
                            </div>
                            <div className="cd-row-main">
                              <strong>
                                {r.title ||
                                  r.certificate_title ||
                                  r.name ||
                                  r.certificate_type ||
                                  "Chứng nhận"}
                              </strong>
                              <small>
                                Ngày cấp:{" "}
                                {fmtDate(
                                  r.issue_date ||
                                    r.issueDate ||
                                    r.date_received,
                                )}
                              </small>
                              <small>
                                {r.certificate_number ||
                                  r.certificateNumber ||
                                  r.number ||
                                  ""}
                              </small>
                            </div>
                            <Button
                              icon={<DownloadOutlined />}
                              disabled={!url}
                              onClick={() => {
                                if (url)
                                  window.open(
                                    url,
                                    "_blank",
                                    "noopener,noreferrer",
                                  );
                                else messageApi.warning("Chưa có file");
                              }}
                              aria-label="Mở chứng nhận"
                            />
                          </div>
                        );
                      })
                    ) : (
                      <Blank title="Chưa có chứng nhận" />
                    )}
                  </Panel>
                ))}
              {tab === "lessons" && (
                <Panel title="Bài học">
                  <Blank title="Chưa có dữ liệu bài học từ API hiện tại" />
                </Panel>
              )}
              {tab === "notifications" && (
                <Panel title="Thông báo">
                  <p className="cd-muted">
                    Xem thông báo chung trong mục Thông báo của phụ huynh.
                  </p>
                  <Button
                    onClick={() => navigate("/parent/notifications")}
                    icon={<BellOutlined />}
                  >
                    Đi đến thông báo
                  </Button>
                </Panel>
              )}
            </main>
          </>
        )}
      </div>
    </div>
  );
}
