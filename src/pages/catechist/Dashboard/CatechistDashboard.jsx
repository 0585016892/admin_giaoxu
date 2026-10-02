import React, { useCallback, useEffect, useState } from "react";
import { Row, Col, Typography, Tag, Flex } from "antd";
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
import { useNotification } from "../../../components/notification";

const { Title, Text } = Typography;

const IMAGE_ASSETS = {
  students: dash1,
  classes: dash2,
  lessons: dash3,
  achievements: dash4,
};

export default function CatechistDashboard() {
  const notify = useNotification();

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
      notify.error(
        err?.response?.data?.message || "Không thể tải dữ liệu dashboard",
      );
    } finally {
      setLoading(false);
    }
  }, [notify]);

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
      notify.error(
        err?.response?.data?.message || "Không thể tải thông tin license",
      );
    }
  }, [notify]);

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
      notify.error(err?.response?.data?.message || "Không thể tải lịch học");

      setSchedules([]);
    } finally {
      setScheduleLoading(false);
    }
  }, [notify]);

  // =====================================================
  // DAILY VERSE
  // =====================================================

  const fetchDailyVerse = useCallback(async () => {
    try {
      setVerseLoading(true);

      const response = await dailyVerseApi.getRandom();

      setDailyVerse(response?.data?.data || null);
    } catch (err) {
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
      } catch (error) {}
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
    <>
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
            className="faith-dashboard-title"
            style={{
              margin: 0,
              fontWeight: 800,
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
                <Tag className="faith-status-tag faith-status-success">
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
                <Tag className="faith-status-tag faith-status-success">
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
                <Tag className="faith-status-tag faith-status-success">
                  Giáo xứ
                </Tag>
              }
            />
          </Col>

          <Col xs={24} sm={12} lg={6}>
            {(() => {
              const currentLicense = license?.license;

              const type =
                currentLicense?.type || currentLicense?.license_type || null;

              const isTrial =
                type === "trial" || currentLicense?.is_trial === true;

              const isYearly = type === "yearly";

              const isLifetime =
                type === "lifetime" || currentLicense?.is_lifetime === true;

              const isExpired =
                !isLifetime && currentLicense?.is_expired === true;

              // const isActive = currentLicense?.is_active === true && !isExpired;

              // // =====================================================
              // // TÊN GÓI
              // // =====================================================

              // const packageName = isLifetime
              //   ? "Vĩnh viễn"
              //   : isYearly
              //     ? "1 năm"
              //     : isTrial
              //       ? "Dùng thử"
              //       : "Chưa kích hoạt";

              // =====================================================
              // VALUE
              // =====================================================

              let value = "Chưa kích hoạt";

              if (isLifetime) {
                value = "Vĩnh viễn";
              } else if (isYearly) {
                value =
                  currentLicense?.days_remaining != null
                    ? `${currentLicense.days_remaining} ngày`
                    : "1 năm";
              } else if (isTrial) {
                value =
                  currentLicense?.days_remaining != null
                    ? `${currentLicense.days_remaining} ngày`
                    : "Dùng thử";
              } else if (isExpired) {
                value = "Đã hết hạn";
              }

              // =====================================================
              // SUB TEXT
              // =====================================================

              let subText = "Chưa kích hoạt FaithEdu";

              if (isLifetime) {
                subText = "Sử dụng FaithEdu không giới hạn thời gian";
              } else if (isYearly) {
                subText = currentLicense?.license_expires_at
                  ? `Hết hạn ${new Date(
                      currentLicense.license_expires_at,
                    ).toLocaleDateString("vi-VN")}`
                  : "Gói FaithEdu 1 năm";
              } else if (isTrial) {
                subText = currentLicense?.trial_expires_at
                  ? `Dùng thử đến ${new Date(
                      currentLicense.trial_expires_at,
                    ).toLocaleDateString("vi-VN")}`
                  : "Gói dùng thử FaithEdu";
              } else if (isExpired) {
                subText = "Gói FaithEdu đã hết hạn";
              }

              // =====================================================
              // TAG
              // =====================================================

              let tagText = "Chưa kích hoạt";
              let tagBackground = "#F1F5F9";
              let tagColor = "#64748B";

              if (isLifetime) {
                tagText = "Vĩnh viễn";
                tagBackground = "#ECFDF5";
                tagColor = "#059669";
              } else if (isYearly) {
                tagText = "Gói 1 năm";
                tagBackground = "#EFF6FF";
                tagColor = "#2563EB";
              } else if (isTrial) {
                tagText = "Dùng thử";
                tagBackground = "#FEF3C7";
                tagColor = "#B45309";
              } else if (isExpired) {
                tagText = "Đã hết hạn";
                tagBackground = "#FEE2E2";
                tagColor = "#DC2626";
              }

              return (
                <DashboardStatCard
                  title="FaithEdu"
                  value={value}
                  subText={subText}
                  icon={IMAGE_ASSETS.achievements}
                  tag={
                    <Tag
                      style={{
                        border: "none",
                        borderRadius: 8,
                        background: tagBackground,
                        color: tagColor,
                        fontWeight: 700,
                      }}
                    >
                      {tagText}
                    </Tag>
                  }
                />
              );
            })()}
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
    </>
  );
}
