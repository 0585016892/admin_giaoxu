import React, { memo, useMemo } from "react";
import { Card, Flex, Typography, Tag, Badge, Skeleton } from "antd";
import { CalendarOutlined } from "@ant-design/icons";

import ScheduleItem from "./ScheduleItem";

const { Title, Text } = Typography;

/**
 * =====================================================
 * NGÀY HIỂN THỊ
 * =====================================================
 *
 * DB:
 * 1 = Thứ Hai
 * 2 = Thứ Ba
 * 3 = Thứ Tư
 * 4 = Thứ Năm
 * 5 = Thứ Sáu
 * 6 = Thứ Bảy
 * 7 = Chúa Nhật
 *
 * UI:
 * Chúa Nhật được đưa lên đầu.
 *
 * Lưu ý:
 * value KHÔNG đổi theo thứ tự hiển thị.
 */
const DAYS = [
  {
    value: 7,
    label: "Chúa Nhật",
    short: "CN",
  },
  {
    value: 1,
    label: "Thứ Hai",
    short: "T2",
  },
  {
    value: 2,
    label: "Thứ Ba",
    short: "T3",
  },
  {
    value: 3,
    label: "Thứ Tư",
    short: "T4",
  },
  {
    value: 4,
    label: "Thứ Năm",
    short: "T5",
  },
  {
    value: 5,
    label: "Thứ Sáu",
    short: "T6",
  },
  {
    value: 6,
    label: "Thứ Bảy",
    short: "T7",
  },
];

/**
 * =====================================================
 * STYLE
 * =====================================================
 */

const chibiCardStyle = {
  borderRadius: 24,
  border: "1px solid #F3F4F6",
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.03)",
  background: "#FFFFFF",
  overflow: "hidden",
};

/**
 * =====================================================
 * GET CURRENT DAY
 * =====================================================
 *
 * JavaScript:
 * 0 = Chủ Nhật
 * 1 = Thứ Hai
 * 2 = Thứ Ba
 * ...
 * 6 = Thứ Bảy
 *
 * Database:
 * 1 = Thứ Hai
 * 2 = Thứ Ba
 * ...
 * 6 = Thứ Bảy
 * 7 = Chúa Nhật
 */
const getCurrentDayOfWeek = () => {
  const day = new Date().getDay();

  return day === 0 ? 7 : day;
};

/**
 * =====================================================
 * WEEKLY SCHEDULE
 * =====================================================
 */

const WeeklySchedule = memo(function WeeklySchedule({
  schedules = [],
  loading = false,
}) {
  /**
   * Ngày hiện tại.
   *
   * Ví dụ hôm nay là Chủ Nhật:
   * today = 7
   */
  const today = getCurrentDayOfWeek();

  /**
   * ===================================================
   * GROUP SCHEDULE BY DAY
   * ===================================================
   */
  const schedulesByDay = useMemo(() => {
    const grouped = {};

    /**
     * Khởi tạo đủ 7 ngày.
     */
    DAYS.forEach((day) => {
      grouped[day.value] = [];
    });

    /**
     * Đưa schedule vào đúng ngày.
     */
    schedules.forEach((schedule) => {
      const day = Number(schedule?.day_of_week);

      /**
       * Bỏ qua dữ liệu ngày không hợp lệ.
       */
      if (day < 1 || day > 7) {
        return;
      }

      if (!grouped[day]) {
        grouped[day] = [];
      }

      grouped[day].push(schedule);
    });

    /**
     * Sắp xếp các lớp trong cùng một ngày
     * theo giờ bắt đầu.
     */
    Object.keys(grouped).forEach((day) => {
      grouped[day].sort((a, b) => {
        return String(a?.start_time || "").localeCompare(
          String(b?.start_time || ""),
        );
      });
    });

    return grouped;
  }, [schedules]);

  /**
   * ===================================================
   * LOADING
   * ===================================================
   */
  if (loading) {
    return (
      <Card
        bordered={false}
        style={chibiCardStyle}
        styles={{
          body: {
            padding: 20,
          },
        }}
      >
        <Flex
          align="center"
          gap={10}
          style={{
            marginBottom: 18,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: "#E8F0F7",
            }}
          />

          <div style={{ flex: 1 }}>
            <Skeleton
              active
              title={{ width: 180 }}
              paragraph={{ rows: 1, width: 280 }}
            />
          </div>
        </Flex>

        <Skeleton
          active
          paragraph={{
            rows: 6,
          }}
        />
      </Card>
    );
  }

  /**
   * ===================================================
   * RENDER
   * ===================================================
   */

  return (
    <Card
      bordered={false}
      style={chibiCardStyle}
      styles={{
        body: {
          padding: 20,
        },
      }}
    >
      {/* =================================================
          HEADER
      ================================================= */}

      <Flex
        justify="space-between"
        align="center"
        wrap="wrap"
        gap={12}
        style={{
          marginBottom: 18,
        }}
      >
        {/* TITLE */}

        <Flex align="center" gap={10}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: "#E8F0F7",
              color: "#173B5E",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <CalendarOutlined
              style={{
                fontSize: 18,
              }}
            />
          </div>

          <div>
            <Title
              level={4}
              style={{
                margin: 0,
                fontWeight: 800,
                color: "#1F2937",
              }}
            >
              Lịch học trong tuần
            </Title>

            <Text
              type="secondary"
              style={{
                fontSize: 12,
              }}
            >
              Lịch học các lớp giáo lý lặp lại hàng tuần
            </Text>
          </div>
        </Flex>

        {/* TYPE */}

        <Tag
          icon={<CalendarOutlined />}
          style={{
            border: "none",
            borderRadius: 8,
            background: "#F1F5F9",
            color: "#475569",
            fontWeight: 600,
            padding: "5px 10px",
            margin: 0,
          }}
        >
          Lịch hàng tuần
        </Tag>
      </Flex>

      {/* =================================================
          WEEK GRID
      ================================================= */}

      <div
        style={{
          display: "grid",

          /**
           * 7 cột.
           *
           * Trên desktop:
           * mỗi ngày chia đều.
           *
           * Trên màn hình nhỏ:
           * giữ min-width và cho phép scroll ngang.
           */
          gridTemplateColumns: "repeat(7, minmax(170px, 1fr))",

          gap: 10,

          overflowX: "auto",

          paddingBottom: 6,

          /**
           * Scrollbar nhẹ.
           */
          scrollbarWidth: "thin",
        }}
      >
        {DAYS.map((day) => {
          const daySchedules = schedulesByDay[day.value] || [];

          /**
           * Hôm nay.
           *
           * Ví dụ:
           * today = 7
           * day.value = 7
           *
           * => Chúa Nhật được highlight.
           */
          const isToday = today === day.value;

          return (
            <div
              key={day.value}
              style={{
                minWidth: 170,

                borderRadius: 16,

                background: isToday ? "#FFFCF4" : "#FFFFFF",

                border: isToday ? "2px solid #D9A441" : "1px solid #E2E8F0",

                overflow: "hidden",

                /**
                 * Đảm bảo các cột
                 * có chiều cao đồng đều.
                 */
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* =================================================
                  DAY HEADER
              ================================================= */}

              <div
                style={{
                  padding: "12px 10px",

                  background: isToday ? "#FFF8E7" : "#F8FAFC",

                  borderBottom: "1px solid #E2E8F0",

                  flexShrink: 0,
                }}
              >
                <Flex justify="space-between" align="center" gap={5}>
                  {/* DAY NAME */}

                  <div>
                    <Text
                      style={{
                        display: "block",
                        fontSize: 12,
                        fontWeight: 800,
                        color: isToday ? "#A16207" : "#334155",
                      }}
                    >
                      {day.label}
                    </Text>

                    <Text
                      style={{
                        display: "block",
                        fontSize: 10,
                        color: "#94A3B8",
                        marginTop: 1,
                      }}
                    >
                      {day.short}
                    </Text>
                  </div>

                  {/* TODAY / COUNT */}

                  <Flex align="center" gap={5}>
                    {isToday && (
                      <Tag
                        style={{
                          margin: 0,
                          padding: "2px 6px",
                          border: "none",
                          borderRadius: 6,
                          background: "#D9A441",
                          color: "#FFFFFF",
                          fontSize: 9,
                          fontWeight: 700,
                          lineHeight: "16px",
                        }}
                      >
                        HÔM NAY
                      </Tag>
                    )}

                    <Badge
                      count={daySchedules.length}
                      showZero
                      overflowCount={99}
                      style={{
                        background: isToday ? "#A16207" : "#94A3B8",
                        boxShadow: "none",
                      }}
                    />
                  </Flex>
                </Flex>
              </div>

              {/* =================================================
                  SCHEDULE LIST
              ================================================= */}

              <div
                style={{
                  height: 330,
                  overflowY: "auto",
                  padding: 8,

                  /**
                   * Không cho nội dung ngày này
                   * làm cao toàn bộ dashboard.
                   */
                  flex: "0 0 330px",

                  scrollbarWidth: "thin",
                }}
              >
                {daySchedules.length === 0 ? (
                  /**
                   * ================================
                   * EMPTY
                   * ================================
                   */

                  <div
                    style={{
                      height: "100%",

                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",

                      flexDirection: "column",

                      color: "#CBD5E1",
                      textAlign: "center",
                      padding: 10,
                    }}
                  >
                    <CalendarOutlined
                      style={{
                        fontSize: 20,
                        marginBottom: 7,
                        color: "#CBD5E1",
                      }}
                    />

                    <Text
                      style={{
                        fontSize: 10,
                        color: "#94A3B8",
                      }}
                    >
                      Không có lớp
                    </Text>
                  </div>
                ) : (
                  /**
                   * ================================
                   * SCHEDULES
                   * ================================
                   */

                  <Flex vertical gap={8}>
                    {daySchedules.map((schedule) => (
                      <ScheduleItem key={schedule.id} schedule={schedule} />
                    ))}
                  </Flex>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* =================================================
          FOOTER
      ================================================= */}

      <Flex
        align="center"
        gap={6}
        style={{
          marginTop: 10,
        }}
      >
        <CalendarOutlined
          style={{
            color: "#94A3B8",
            fontSize: 11,
          }}
        />

        <Text
          type="secondary"
          style={{
            fontSize: 11,
          }}
        >
          Các ngày có nhiều lớp có thể cuộn riêng.
        </Text>
      </Flex>
    </Card>
  );
});

export default WeeklySchedule;
