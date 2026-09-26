import React, { useEffect } from "react";

import {
  Form,
  Input,
  Select,
  DatePicker,
  TimePicker,
  Row,
  Col,
  Space,
  Typography,
  Button,
  Tag,
  Alert,
} from "antd";

import {
  EnvironmentOutlined,
  IdcardOutlined,
  InfoCircleOutlined,
  ScheduleOutlined,
  FileTextOutlined,
  PlusOutlined,
  DeleteOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
} from "@ant-design/icons";

import dayjs from "dayjs";

const { TextArea } = Input;
const { Text } = Typography;

/* =========================================================
   THEME
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

  border: "#D9E2EC",
  borderLight: "#E2E8F0",

  navyLight: "#EEF3F7",
  goldLight: "#FBF5E7",

  danger: "#C0392B",
  dangerBg: "#FDEDEC",
};

/* =========================================================
   OPTIONS
========================================================= */

const categoryOptions = [
  {
    value: "Giáo lý Khai Tâm",
    label: "Giáo lý Khai Tâm",
  },
  {
    value: "Giáo lý Đến Bàn Tiệc Thánh",
    label: "Giáo lý Đến Bàn Tiệc Thánh",
  },
  {
    value: "Giáo lý Lớn Lên Trong Chúa Thánh Thần",
    label: "Giáo lý Lớn Lên Trong Chúa Thánh Thần",
  },
  {
    value: "Giáo lý Sống Đạo",
    label: "Giáo lý Sống Đạo",
  },
  {
    value: "Giáo lý Vào Đời",
    label: "Giáo lý Vào Đời",
  },
  {
    value: "Giáo lý Huynh Trưởng",
    label: "Giáo lý Huynh Trưởng",
  },
  {
    value: "Giáo lý Hôn Nhân",
    label: "Giáo lý Hôn Nhân",
  },
  {
    value: "Giáo lý Dự Tòng",
    label: "Giáo lý Dự Tòng",
  },
  {
    value: "Giáo lý Người Lớn",
    label: "Giáo lý Người Lớn",
  },
  {
    value: "Lớp Kinh Thánh",
    label: "Lớp Kinh Thánh",
  },
  {
    value: "Giáo lý Mùa Chay",
    label: "Giáo lý Mùa Chay",
  },
  {
    value: "Giáo lý Mùa Hè",
    label: "Giáo lý Mùa Hè",
  },
  {
    value: "Giáo lý Thăng Tiến",
    label: "Giáo lý Thăng Tiến",
  },
  {
    value: "Giáo lý Hiệp Thông",
    label: "Giáo lý Hiệp Thông",
  },
];

const statusOptions = [
  {
    value: "active",
    label: "Đang hoạt động",
  },
  {
    value: "paused",
    label: "Tạm dừng",
  },
  {
    value: "completed",
    label: "Đã kết thúc",
  },
];

const dayOptions = [
  {
    value: 1,
    label: "Thứ Hai",
  },
  {
    value: 2,
    label: "Thứ Ba",
  },
  {
    value: 3,
    label: "Thứ Tư",
  },
  {
    value: 4,
    label: "Thứ Năm",
  },
  {
    value: 5,
    label: "Thứ Sáu",
  },
  {
    value: 6,
    label: "Thứ Bảy",
  },
  {
    value: 7,
    label: "Chúa Nhật",
  },
];

/* =========================================================
   HELPERS
========================================================= */

const normalizeTime = (value) => {
  if (!value) return null;

  if (dayjs.isDayjs(value)) {
    return value;
  }

  const stringValue = String(value);

  const formats = ["HH:mm:ss", "HH:mm"];

  for (const format of formats) {
    const parsed = dayjs(
      stringValue.slice(0, format === "HH:mm" ? 5 : 8),
      format,
    );

    if (parsed.isValid()) {
      return parsed;
    }
  }

  return null;
};

const normalizeSchedule = (schedule = {}) => {
  return {
    id: schedule.id,

    day_of_week:
      schedule.day_of_week !== undefined && schedule.day_of_week !== null
        ? Number(schedule.day_of_week)
        : undefined,

    start_time: normalizeTime(schedule.start_time),

    end_time: normalizeTime(schedule.end_time),

    room: schedule.room || "",
  };
};

/* =========================================================
   FORM SECTION
========================================================= */

const FormSection = ({
  icon,
  title,
  description,
  children,
  marginBottom = 16,
}) => {
  return (
    <div
      style={{
        padding: 16,
        marginBottom,
        borderRadius: 14,
        background: COLORS.background,
        border: `1.5px solid ${COLORS.border}`,
        fontFamily: "'Be Vietnam Pro', -apple-system, sans-serif",
      }}
    >
      <Space
        align="start"
        size={10}
        style={{
          marginBottom: 16,
        }}
      >
        <span
          style={{
            width: 32,
            height: 32,
            borderRadius: 9,
            background: COLORS.white,
            border: `1px solid ${COLORS.borderLight}`,
            color: COLORS.gold,
            fontSize: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {icon}
        </span>

        <div>
          <Text
            strong
            style={{
              display: "block",
              color: COLORS.navy,
              fontSize: 13,
              fontWeight: 800,
              lineHeight: 1.4,
            }}
          >
            {title}
          </Text>

          {description && (
            <Text
              style={{
                display: "block",
                marginTop: 2,
                color: COLORS.muted,
                fontSize: 11,
                fontWeight: 500,
                lineHeight: 1.5,
              }}
            >
              {description}
            </Text>
          )}
        </div>
      </Space>

      {children}
    </div>
  );
};

/* =========================================================
   SCHEDULE ITEM
========================================================= */

const ScheduleItem = ({ field, index, remove, form }) => {
  const startTime = Form.useWatch(
    ["schedules", field.name, "start_time"],
    form,
  );

  /* -------------------------------------------------------
     DISABLE END TIME
  ------------------------------------------------------- */

  const disableEndTime = () => {
    if (!startTime) {
      return {};
    }

    const hour = dayjs(startTime).hour();
    const minute = dayjs(startTime).minute();

    return {
      disabledHours: () =>
        Array.from(
          {
            length: hour,
          },
          (_, i) => i,
        ),

      disabledMinutes: (selectedHour) => {
        if (selectedHour !== hour) {
          return [];
        }

        return Array.from(
          {
            length: minute,
          },
          (_, i) => i,
        );
      },
    };
  };

  return (
    <div
      style={{
        position: "relative",
        padding: 14,
        marginBottom: 12,
        borderRadius: 12,
        background: COLORS.white,
        border: `1px solid ${COLORS.border}`,
        boxShadow: "0 3px 12px rgba(23, 59, 94, 0.04)",
      }}
    >
      {/* HEADER */}

      <Row
        justify="space-between"
        align="middle"
        style={{
          marginBottom: 12,
        }}
      >
        <Col>
          <Space size={8}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: COLORS.navyLight,
                color: COLORS.navy,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                fontWeight: 800,
              }}
            >
              {index + 1}
            </div>

            <div>
              <Text
                strong
                style={{
                  color: COLORS.navy,
                  fontSize: 12,
                  fontWeight: 800,
                }}
              >
                Buổi học {index + 1}
              </Text>

              <Text
                style={{
                  display: "block",
                  color: COLORS.muted,
                  fontSize: 10,
                  marginTop: 1,
                }}
              >
                Lịch học lặp lại hàng tuần
              </Text>
            </div>
          </Space>
        </Col>

        <Col>
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => remove(field.name)}
            disabled={false}
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          />
        </Col>
      </Row>

      {/* DAY + ROOM */}

      <Row gutter={12}>
        <Col xs={24} sm={12}>
          <Form.Item
            name={[field.name, "day_of_week"]}
            label="Ngày học"
            rules={[
              {
                required: true,
                message: "Vui lòng chọn ngày học",
              },
            ]}
            style={{
              marginBottom: 12,
            }}
          >
            <Select
              size="large"
              options={dayOptions}
              placeholder="Chọn ngày học"
              suffixIcon={<CalendarOutlined />}
              style={{
                width: "100%",
              }}
            />
          </Form.Item>
        </Col>

        <Col xs={24} sm={12}>
          <Form.Item
            name={[field.name, "room"]}
            label="Phòng học"
            style={{
              marginBottom: 12,
            }}
          >
            <Input
              size="large"
              prefix={
                <EnvironmentOutlined
                  style={{
                    color: COLORS.navy,
                  }}
                />
              }
              placeholder="Ví dụ: Phòng A01"
              style={{
                borderRadius: 10,
              }}
            />
          </Form.Item>
        </Col>
      </Row>

      {/* TIME */}

      <Row gutter={12}>
        <Col xs={24} sm={12}>
          <Form.Item
            name={[field.name, "start_time"]}
            label="Giờ bắt đầu"
            rules={[
              {
                required: true,
                message: "Vui lòng chọn giờ bắt đầu",
              },
            ]}
            style={{
              marginBottom: 0,
            }}
          >
            <TimePicker
              size="large"
              format="HH:mm"
              minuteStep={5}
              placeholder="Giờ bắt đầu"
              style={{
                width: "100%",
                borderRadius: 10,
              }}
            />
          </Form.Item>
        </Col>

        <Col xs={24} sm={12}>
          <Form.Item
            name={[field.name, "end_time"]}
            label="Giờ kết thúc"
            dependencies={[["schedules", field.name, "start_time"]]}
            rules={[
              {
                required: true,
                message: "Vui lòng chọn giờ kết thúc",
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const startTime = getFieldValue([
                    "schedules",
                    field.name,
                    "start_time",
                  ]);

                  if (!value || !startTime) {
                    return Promise.resolve();
                  }

                  const start = dayjs(startTime);
                  const end = dayjs(value);

                  if (end.isAfter(start)) {
                    return Promise.resolve();
                  }

                  return Promise.reject(
                    new Error("Giờ kết thúc phải sau giờ bắt đầu"),
                  );
                },
              }),
            ]}
            style={{
              marginBottom: 0,
            }}
          >
            <TimePicker
              size="large"
              format="HH:mm"
              minuteStep={5}
              placeholder="Giờ kết thúc"
              disabledTime={disableEndTime}
              style={{
                width: "100%",
                borderRadius: 10,
              }}
            />
          </Form.Item>
        </Col>
      </Row>
    </div>
  );
};

/* =========================================================
   CLASS FORM
========================================================= */

const ClassForm = ({
  form,
  editingClass = null,
  loading = false,
  onFinish,
  onValuesChange,
}) => {
  /* =======================================================
     INITIAL DATA
  ======================================================= */

  useEffect(() => {
    if (!form) return;

    if (!editingClass) {
      form.resetFields();

      form.setFieldsValue({
        category: "Giáo lý Hôn Nhân",
        status: "active",

        name: undefined,
        description: undefined,

        schedules: [
          {
            day_of_week: undefined,
            start_time: null,
            end_time: null,
            room: "",
          },
        ],

        start_date: null,
        end_date: null,
      });

      return;
    }

    const schedules = Array.isArray(editingClass.schedules)
      ? editingClass.schedules.map(normalizeSchedule)
      : [];

    form.setFieldsValue({
      name: editingClass.name || "",

      category: editingClass.category || "Giáo lý Hôn Nhân",

      description: editingClass.description || "",

      status: editingClass.status || "active",

      schedules,

      start_date: editingClass.start_date
        ? dayjs(editingClass.start_date)
        : null,

      end_date: editingClass.end_date ? dayjs(editingClass.end_date) : null,
    });
  }, [editingClass, form]);

  /* =======================================================
     DATE DISABLED
  ======================================================= */

  const disableStartDate = (current) => {
    if (!current) return false;

    const today = dayjs().startOf("day");

    /*
     * Khi chỉnh sửa lớp đã bắt đầu,
     * vẫn cho phép giữ ngày hiện tại.
     */
    if (editingClass?.start_date) {
      const currentStart = dayjs(editingClass.start_date).startOf("day");

      if (current.isSame(currentStart, "day")) {
        return false;
      }
    }

    return current.isBefore(today);
  };

  const disableEndDate = (current) => {
    if (!current) return false;

    const startDate = form?.getFieldValue("start_date");

    if (!startDate) {
      return false;
    }

    return current.isBefore(dayjs(startDate).startOf("day"));
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      onValuesChange={onValuesChange}
      disabled={loading}
      style={{
        fontFamily: "'Be Vietnam Pro', -apple-system, sans-serif",
      }}
    >
      {/* ===================================================
          BASIC INFORMATION
      =================================================== */}

      <FormSection
        icon={<InfoCircleOutlined />}
        title="Thông tin cơ bản"
        description="Thông tin nhận diện và chương trình của lớp"
      >
        <Row gutter={16}>
          <Col xs={24} md={16}>
            <Form.Item
              name="name"
              label="Tên lớp học"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập tên lớp",
                },
                {
                  whitespace: true,
                  message: "Tên lớp không được để trống",
                },
                {
                  max: 150,
                  message: "Tên lớp không được vượt quá 150 ký tự",
                },
              ]}
              style={{
                marginBottom: 16,
              }}
            >
              <Input
                size="large"
                placeholder="Ví dụ: Lớp Hôn Nhân K01"
                style={{
                  borderRadius: 10,
                }}
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item
              label="Mã lớp"
              style={{
                marginBottom: 16,
              }}
            >
              <Input
                size="large"
                disabled
                value={editingClass?.code || "Tự động tạo"}
                prefix={
                  <IdcardOutlined
                    style={{
                      color: COLORS.navy,
                    }}
                  />
                }
                style={{
                  borderRadius: 10,
                  background: "#EDF2F7",
                  color: COLORS.textSecondary,
                  fontWeight: 600,
                }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              name="category"
              label="Chương trình giáo lý"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn chương trình",
                },
              ]}
              style={{
                marginBottom: 0,
              }}
            >
              <Select
                size="large"
                options={categoryOptions}
                placeholder="Chọn chương trình"
                showSearch
                optionFilterProp="label"
                style={{
                  width: "100%",
                }}
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              name="status"
              label="Trạng thái"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn trạng thái",
                },
              ]}
              style={{
                marginBottom: 0,
              }}
            >
              <Select
                size="large"
                options={statusOptions}
                placeholder="Chọn trạng thái"
                style={{
                  width: "100%",
                }}
              />
            </Form.Item>
          </Col>
        </Row>
      </FormSection>

      {/* ===================================================
          RECURRING WEEKLY SCHEDULE
      =================================================== */}

      <FormSection
        icon={<ScheduleOutlined />}
        title="Lịch học hàng tuần"
        description="Thêm một hoặc nhiều buổi học lặp lại mỗi tuần"
      >
        <Alert
          type="info"
          showIcon
          icon={<CalendarOutlined />}
          message="Lịch học được lặp lại hàng tuần"
          description="Bạn có thể thêm nhiều ngày học cho cùng một lớp. Ví dụ: Thứ 2 và Thứ 5 hàng tuần."
          style={{
            marginBottom: 14,
            borderRadius: 10,
          }}
        />

        <Form.List name="schedules">
          {(fields, { add, remove }) => (
            <>
              {fields.length === 0 && (
                <div
                  style={{
                    padding: 20,
                    borderRadius: 12,
                    border: `1px dashed ${COLORS.border}`,
                    background: COLORS.white,
                    textAlign: "center",
                    marginBottom: 12,
                  }}
                >
                  <ScheduleOutlined
                    style={{
                      fontSize: 24,
                      color: COLORS.gold,
                      marginBottom: 8,
                    }}
                  />

                  <Text
                    style={{
                      display: "block",
                      color: COLORS.muted,
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    Chưa có lịch học
                  </Text>
                </div>
              )}

              {fields.map((field, index) => (
                <ScheduleItem
                  key={field.key}
                  field={field}
                  index={index}
                  remove={remove}
                  form={form}
                />
              ))}

              <Button
                type="dashed"
                block
                icon={<PlusOutlined />}
                onClick={() =>
                  add({
                    day_of_week: undefined,
                    start_time: null,
                    end_time: null,
                    room: "",
                  })
                }
                style={{
                  height: 42,
                  borderRadius: 10,
                  color: COLORS.navy,
                  borderColor: COLORS.navy,
                  fontWeight: 700,
                  background: COLORS.white,
                }}
              >
                Thêm buổi học
              </Button>

              {fields.length > 0 && (
                <div
                  style={{
                    marginTop: 12,
                    display: "flex",
                    justifyContent: "flex-end",
                  }}
                >
                  <Tag
                    icon={<ClockCircleOutlined />}
                    style={{
                      margin: 0,
                      borderRadius: 7,
                      padding: "3px 9px",
                      background: COLORS.navyLight,
                      borderColor: COLORS.border,
                      color: COLORS.navy,
                      fontWeight: 700,
                    }}
                  >
                    {fields.length} buổi / tuần
                  </Tag>
                </div>
              )}
            </>
          )}
        </Form.List>
      </FormSection>

      {/* ===================================================
          COURSE DURATION
      =================================================== */}

      <FormSection
        icon={<CalendarOutlined />}
        title="Thời gian khóa học"
        description="Khoảng thời gian lớp học hoạt động"
      >
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              name="start_date"
              label="Ngày bắt đầu"
              rules={[
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    const endDate = getFieldValue("end_date");

                    if (!value || !endDate) {
                      return Promise.resolve();
                    }

                    if (
                      dayjs(value).isSame(dayjs(endDate), "day") ||
                      dayjs(value).isBefore(dayjs(endDate), "day")
                    ) {
                      return Promise.resolve();
                    }

                    return Promise.reject(
                      new Error(
                        "Ngày bắt đầu phải trước hoặc bằng ngày kết thúc",
                      ),
                    );
                  },
                }),
              ]}
              style={{
                marginBottom: 0,
              }}
            >
              <DatePicker
                size="large"
                format="DD/MM/YYYY"
                disabledDate={disableStartDate}
                placeholder="Chọn ngày bắt đầu"
                style={{
                  width: "100%",
                  borderRadius: 10,
                }}
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              name="end_date"
              label="Ngày kết thúc"
              dependencies={["start_date"]}
              rules={[
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    const startDate = getFieldValue("start_date");

                    if (!value || !startDate) {
                      return Promise.resolve();
                    }

                    if (
                      dayjs(value).isSame(dayjs(startDate), "day") ||
                      dayjs(value).isAfter(dayjs(startDate), "day")
                    ) {
                      return Promise.resolve();
                    }

                    return Promise.reject(
                      new Error(
                        "Ngày kết thúc phải sau hoặc bằng ngày bắt đầu",
                      ),
                    );
                  },
                }),
              ]}
              style={{
                marginBottom: 0,
              }}
            >
              <DatePicker
                size="large"
                format="DD/MM/YYYY"
                disabledDate={disableEndDate}
                placeholder="Chọn ngày kết thúc"
                style={{
                  width: "100%",
                  borderRadius: 10,
                }}
              />
            </Form.Item>
          </Col>
        </Row>
      </FormSection>

      {/* ===================================================
          DESCRIPTION
      =================================================== */}

      <FormSection
        icon={<FileTextOutlined />}
        title="Mô tả"
        description="Thông tin bổ sung về lớp học"
        marginBottom={0}
      >
        <Form.Item
          name="description"
          style={{
            marginBottom: 0,
          }}
        >
          <TextArea
            rows={4}
            showCount
            maxLength={500}
            placeholder="Nhập mô tả hoặc thông tin thêm về lớp học..."
            style={{
              borderRadius: 10,
            }}
          />
        </Form.Item>
      </FormSection>

      {/* ===================================================
          LOCAL STYLE
      =================================================== */}

      <style>
        {`
          .class-form-schedule .ant-form-item {
            margin-bottom: 12px;
          }

          .ant-form-item-label > label {
            color: ${COLORS.text} !important;
            font-weight: 700 !important;
            font-size: 12px !important;
          }

          .ant-input,
          .ant-input-affix-wrapper,
          .ant-select-selector,
          .ant-picker {
            border-color: ${COLORS.border} !important;
          }

          .ant-input:hover,
          .ant-input-affix-wrapper:hover,
          .ant-select-selector:hover,
          .ant-picker:hover {
            border-color: ${COLORS.navy} !important;
          }

          .ant-input:focus,
          .ant-input-focused,
          .ant-input-affix-wrapper:focus,
          .ant-input-affix-wrapper-focused,
          .ant-picker-focused {
            border-color: ${COLORS.navy} !important;
            box-shadow:
              0 0 0 2px rgba(23, 59, 94, 0.08) !important;
          }

          .ant-select-focused .ant-select-selector {
            border-color: ${COLORS.navy} !important;
            box-shadow:
              0 0 0 2px rgba(23, 59, 94, 0.08) !important;
          }

          .ant-form-item-explain-error {
            font-size: 11px;
          }

          .ant-alert {
            border-color: ${COLORS.border} !important;
          }
        `}
      </style>
    </Form>
  );
};

export default ClassForm;
