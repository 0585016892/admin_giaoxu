import React, { useCallback, useEffect, useState } from "react";
import { Row, Col, Typography, Tag, message, ConfigProvider, Flex } from "antd";
import { RiseOutlined } from "@ant-design/icons";

import { getDashboardCate, getMyLicense } from "../../../api/dashboardApi";
import dailyVerseApi from "../../../api/dailyVerseApi";
import classApi from "../../../api/classApi";

import dash1 from "../../../assets/images/dash1.png";
import dash2 from "../../../assets/images/dash2.png";
import dash3 from "../../../assets/images/dash3.png";
import dash4 from "../../../assets/images/dash4.png";
import jesusChildrenImg from "../../../assets/images/jesus-children.png";
import jesusChildrenImg1 from "../../../assets/images/jesus-children1.png";
import jesusChildrenImg2 from "../../../assets/images/jesus-children2.png";

import FeedbackModal from "../../../components/FeedbackModal";
import { checkFeedback } from "../../../api/contactMessageApi";
import { useUser } from "../../../context/UserContext";

import DashboardStatCard from "./component/DashboardStatCard";
import DashboardSkeleton from "./component/DashboardSkeleton";
import AttendanceOverview from "./component/AttendanceOverview";
import WeeklySchedule from "./component/WeeklySchedule";
import DailyVerseCard from "./component/DailyVerseCard";

const { Title, Text } = Typography;

const IMAGE_ASSETS = {
  students: dash1,
  classes: dash2,
  lessons: dash3,
  achievements: dash4,
};

export default function CatechistDashboard() {
  const { user } = useUser();

  const [feedbackOpen, setFeedbackOpen] = useState(false);

  const [license, setLicense] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [dailyVerse, setDailyVerse] = useState(null);
  const [schedules, setSchedules] = useState([]);

  const [loading, setLoading] = useState(true);
  const [scheduleLoading, setScheduleLoading] = useState(true);
  const [verseLoading, setVerseLoading] = useState(false);

  // =====================================================
  // DASHBOARD
  // =====================================================

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);

      const response = await getDashboardCate();

      const data = response?.data?.data || response?.data || response || null;

      if (!data) {
        throw new Error("Không có dữ liệu dashboard");
      }

      setDashboard(data);
    } catch (err) {
      message.error(
        err?.response?.data?.message || "Không thể tải dữ liệu dashboard",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // =====================================================
  // LICENSE
  // =====================================================

  const fetchLicense = useCallback(async () => {
    try {
      const data = await getMyLicense();

      if (data?.success) {
        setLicense(data);
      }
    } catch (err) {
      message.error(
        err?.response?.data?.message || "Không thể tải thông tin license",
      );
    }
  }, []);

  // =====================================================
  // SCHEDULE
  // =====================================================

  const fetchSchedules = useCallback(async () => {
    try {
      setScheduleLoading(true);

      const response = await classApi.getSchedules();

      /*
       * classApi hiện tại trả về res.data.
       *
       * Ví dụ:
       * {
       *   success: true,
       *   data: [...]
       * }
       */

      const data = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response)
          ? response
          : [];

      setSchedules(data);
    } catch (err) {
      console.error("GET WEEKLY SCHEDULE ERROR:", err);

      message.error(err?.response?.data?.message || "Không thể tải lịch học");

      setSchedules([]);
    } finally {
      setScheduleLoading(false);
    }
  }, []);

  // =====================================================
  // DAILY VERSE
  // =====================================================

  const fetchDailyVerse = useCallback(async () => {
    try {
      setVerseLoading(true);

      const response = await dailyVerseApi.getRandom();

      setDailyVerse(response?.data?.data || null);
    } catch (err) {
      console.error("GET DAILY VERSE ERROR:", err);
    } finally {
      setVerseLoading(false);
    }
  }, []);

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    fetchDashboard();
    fetchLicense();
    fetchSchedules();
    fetchDailyVerse();
  }, [fetchDashboard, fetchLicense, fetchSchedules, fetchDailyVerse]);

  // =====================================================
  // FEEDBACK
  // =====================================================

  useEffect(() => {
    const checkUserFeedback = async () => {
      try {
        if (!user?.email) return;

        const res = await checkFeedback(user.email);

        if (res?.success && !res.hasFeedback) {
          setFeedbackOpen(true);
        }
      } catch (error) {
        console.error("CHECK USER FEEDBACK ERROR:", error);
      }
    };

    checkUserFeedback();
  }, [user?.email]);

  // =====================================================
  // DATA
  // =====================================================

  const metrics = dashboard?.top_metrics || {};

  const totalStudents = Number(metrics?.total_students?.value ?? 0);

  const studentCompare = Number(
    metrics?.total_students?.compare_last_month_pct ?? 0,
  );

  const totalClasses = Number(metrics?.classes?.total ?? 0);

  const activeClasses = Number(metrics?.classes?.active ?? 0);

  const studentStatistics = dashboard?.student_statistics || {};

  const attendanceToday = studentStatistics?.overview?.attendance_today || {
    present: 0,
    absent: 0,
    late: 0,
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div style={{ padding: 24 }}>
        <DashboardSkeleton />
      </div>
    );
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#2563EB",
          fontFamily: "'Be Vietnam Pro', sans-serif",
          borderRadius: 16,
        },
      }}
    >
      <Flex
        vertical
        gap={24}
        style={{
          padding: 8,
        }}
      >
        {/* HEADER */}

        <div>
          <Title
            level={3}
            style={{
              margin: 0,
              fontWeight: 800,
              color: "#1F2937",
            }}
          >
            Bảng Điều Khiển Giáo Lý
          </Title>

          <Text
            type="secondary"
            style={{
              fontSize: 14,
            }}
          >
            Chào mừng quay trở lại công tác giảng dạy! ✨
          </Text>
        </div>

        {/* =================================================
            STATISTICS
        ================================================= */}

        <Row gutter={[20, 20]}>
          <Col xs={24} sm={12} lg={6}>
            <DashboardStatCard
              title="Tổng"
              value={totalStudents}
              subText="học sinh được phân lớp"
              icon={IMAGE_ASSETS.students}
              tag={
                <Tag
                  style={{
                    border: "none",
                    borderRadius: 8,
                    background: "#DCFCE7",
                    color: "#15803D",
                    fontWeight: 700,
                  }}
                >
                  <RiseOutlined /> +{studentCompare}%
                </Tag>
              }
            />
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <DashboardStatCard
              title="Lớp"
              value={totalClasses}
              subText={`${activeClasses} lớp đang hoạt động`}
              icon={IMAGE_ASSETS.classes}
              tag={
                <Tag
                  style={{
                    border: "none",
                    borderRadius: 8,
                    background: "#DCFCE7",
                    color: "#15803D",
                    fontWeight: 700,
                  }}
                >
                  Đang hoạt động
                </Tag>
              }
            />
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <DashboardStatCard
              title="Giáo Xứ"
              value={license?.church?.name || "Đang cập nhật"}
              subText={`Địa chỉ: ${
                license?.church?.address || "Đang cập nhật"
              }`}
              icon={IMAGE_ASSETS.lessons}
              tag={
                <Tag
                  style={{
                    border: "none",
                    borderRadius: 8,
                    background: "#EFF6FF",
                    color: "#2563EB",
                    fontWeight: 700,
                  }}
                >
                  Giáo xứ
                </Tag>
              }
            />
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <DashboardStatCard
              title="FaithEdu"
              value={
                license?.license?.is_trial
                  ? `${license.license.days_remaining} ngày`
                  : license?.license?.is_active
                    ? "Đã kích hoạt"
                    : license?.license?.is_expired
                      ? "Đã hết hạn"
                      : "Chưa kích hoạt"
              }
              subText={
                license?.license?.is_trial
                  ? `Dùng thử đến ${new Date(
                      license.trial_expires_at,
                    ).toLocaleDateString("vi-VN")}`
                  : license?.license?.is_active
                    ? "Đã kích hoạt FaithEdu"
                    : license?.license?.is_expired
                      ? "Gói FaithEdu đã hết hạn"
                      : "Chưa kích hoạt FaithEdu"
              }
              icon={IMAGE_ASSETS.achievements}
              tag={
                <Tag
                  style={{
                    border: "none",
                    borderRadius: 8,
                    background: license?.license?.is_trial
                      ? "#FEF3C7"
                      : license?.license?.is_active
                        ? "#DCFCE7"
                        : license?.license?.is_expired
                          ? "#FEE2E2"
                          : "#F1F5F9",
                    color: license?.license?.is_trial
                      ? "#B45309"
                      : license?.license?.is_active
                        ? "#15803D"
                        : license?.license?.is_expired
                          ? "#DC2626"
                          : "#64748B",
                    fontWeight: 700,
                  }}
                >
                  {license?.license?.is_trial
                    ? "Dùng thử"
                    : license?.license?.is_active
                      ? "Gói FaithEdu"
                      : license?.license?.is_expired
                        ? "Đã hết hạn"
                        : "Chưa kích hoạt"}
                </Tag>
              }
            />
          </Col>
        </Row>

        {/* ATTENDANCE */}

        <AttendanceOverview attendance={attendanceToday} />

        {/* WEEKLY SCHEDULE */}

        <WeeklySchedule schedules={schedules} loading={scheduleLoading} />

        {/* DAILY VERSE */}

        <DailyVerseCard
          verse={dailyVerse}
          loading={verseLoading}
          onRefresh={fetchDailyVerse}
          images={[jesusChildrenImg, jesusChildrenImg1, jesusChildrenImg2]}
        />
      </Flex>

      <FeedbackModal
        open={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
      />
    </ConfigProvider>
  );
}
