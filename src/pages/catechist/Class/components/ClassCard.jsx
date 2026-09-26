import React from "react";
import {
  Card,
  Col,
  Row,
  Space,
  Typography,
  Tag,
  Dropdown,
  Button,
  Avatar,
  Tooltip,
} from "antd";
import {
  BookOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  UserOutlined,
  ArrowRightOutlined,
  StarFilled,
} from "@ant-design/icons";

const { Text } = Typography;

// Mock helper functions nếu chưa import
const getCategoryShortName = (cat) => cat || "Khác";
const getDayName = (day) => day || "Chủ Nhật";
const formatTime = (time) => time || "08:00";

const StatusTag = ({ status }) => {
  const isFinished = status === "active";
  return (
    <Tag
      bordered={false}
      style={{
        borderRadius: 8,
        fontSize: 11,
        fontWeight: 700,
        padding: "2px 8px",
        margin: 0,
        backgroundColor: isFinished ? "#F1F5F9" : "#E0F2FE",
        color: isFinished ? "#64748B" : "#0284C7",
        fontFamily: "'Be Vietnam Pro', -apple-system, sans-serif",
      }}
    >
      {status === "active" ? "Đang hoạt động" : "Tạm dừng"}
    </Tag>
  );
};

const InfoItem = ({ icon, label, value }) => (
  <div
    style={{
      padding: "8px 10px",
      borderRadius: 12,
      background: "#F7F9FC",
      border: "1.5px solid #D9E2EC",
      display: "flex",
      alignItems: "center",
      gap: 8,
    }}
  >
    <div
      style={{
        color: "#173B5E",
        fontSize: 14,
        display: "flex",
        alignItems: "center",
      }}
    >
      {icon}
    </div>
    <div style={{ minWidth: 0, flex: 1 }}>
      <Text
        style={{
          display: "block",
          fontSize: 10,
          color: "#64748B",
          fontWeight: 600,
          lineHeight: 1,
        }}
      >
        {label}
      </Text>
      <Text
        strong
        ellipsis
        style={{
          display: "block",
          fontSize: 11,
          color: "#173B5E",
          marginTop: 2,
        }}
      >
        {value}
      </Text>
    </div>
  </div>
);

const ClassCard = ({
  item = {},
  onView,
  onEdit,
  onDelete,
  canEdit = false,
  canDelete = false,
}) => {
  const catechists = Array.isArray(item.catechists) ? item.catechists : [];
  const studentsCount = Number(item.studentsCount || 0);

  return (
    <Card
      bordered={false}
      hoverable
      onClick={() => onView?.(item)}
      className="class-card-navy-gold"
      style={{
        height: "100%",
        borderRadius: 20,
        overflow: "hidden",
        cursor: "pointer",
        background: "#FFFFFF",
        border: "1.5px solid #D9E2EC",
        boxShadow: "0 10px 30px -5px rgba(23, 59, 94, 0.06)",
        transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}
      styles={{
        body: {
          padding: 0,
        },
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow =
          "0 20px 35px -10px rgba(23, 59, 94, 0.12)";
        e.currentTarget.style.borderColor = "#173B5E";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow =
          "0 10px 30px -5px rgba(23, 59, 94, 0.06)";
        e.currentTarget.style.borderColor = "#D9E2EC";
      }}
    >
      {/* HEADER SECTION */}
      <div
        style={{
          position: "relative",
          padding: 20,
          background: "linear-gradient(135deg, #173B5E 0%, #1E4976 100%)",
          borderBottom: "1.5px solid #D9E2EC",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -20,
            right: -20,
            width: 90,
            height: 90,
            borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.04)",
            pointerEvents: "none",
          }}
        />

        <Row
          justify="space-between"
          align="start"
          gutter={12}
          style={{ position: "relative", zIndex: 1 }}
        >
          <Col flex="auto">
            <Space align="start" size={12}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  flexShrink: 0,
                  borderRadius: 14,
                  background: "rgba(255, 255, 255, 0.1)",
                  color: "#D9A441",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                  border: "1.5px solid rgba(217, 164, 65, 0.3)",
                }}
              >
                <BookOutlined />
              </div>

              <div style={{ minWidth: 0 }}>
                <Text
                  strong
                  ellipsis
                  style={{
                    display: "block",
                    maxWidth: 200,
                    color: "#FFFFFF",
                    fontSize: 16,
                    fontWeight: 700,
                    fontFamily: "'Be Vietnam Pro', -apple-system, sans-serif",
                    lineHeight: 1.3,
                  }}
                >
                  {item.name || "Chưa đặt tên"}
                </Text>

                <Space size={6} wrap style={{ marginTop: 6 }}>
                  {item.code && (
                    <Tag
                      style={{
                        margin: 0,
                        border: 0,
                        borderRadius: 8,
                        background: "rgba(217, 164, 65, 0.2)",
                        color: "#F3C65D",
                        fontSize: 11,
                        fontWeight: 700,
                        padding: "1px 8px",
                      }}
                    >
                      {item.code}
                    </Tag>
                  )}

                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: "rgba(255, 255, 255, 0.7)",
                    }}
                  >
                    {getCategoryShortName(item.category)}
                  </Text>
                </Space>
              </div>
            </Space>
          </Col>

          <Col>
            <Dropdown
              trigger={["click"]}
              menu={{
                items: [
                  {
                    key: "view",
                    icon: <EyeOutlined />,
                    label: "Xem chi tiết",
                    onClick: ({ domEvent }) => {
                      domEvent.stopPropagation();
                      onView?.(item);
                    },
                  },

                  // CHỈ HIỆN KHI CÓ QUYỀN SỬA
                  ...(canEdit
                    ? [
                        {
                          key: "edit",
                          icon: <EditOutlined />,
                          label: "Chỉnh sửa",
                          onClick: ({ domEvent }) => {
                            domEvent.stopPropagation();
                            onEdit?.(item);
                          },
                        },
                      ]
                    : []),

                  // Chỉ hiện divider nếu có quyền sửa hoặc xóa
                  ...(canEdit || canDelete
                    ? [
                        {
                          type: "divider",
                        },
                      ]
                    : []),

                  // CHỈ HIỆN KHI CÓ QUYỀN XÓA
                  ...(canDelete
                    ? [
                        {
                          key: "delete",
                          danger: true,
                          icon: <DeleteOutlined />,
                          label: "Xóa lớp",
                          onClick: ({ domEvent }) => {
                            domEvent.stopPropagation();
                            onDelete?.(item);
                          },
                        },
                      ]
                    : []),
                ],
              }}
            >
              <Button
                type="text"
                icon={<MoreOutlined />}
                onClick={(e) => e.stopPropagation()}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  color: "#FFFFFF",
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                }}
              />
            </Dropdown>
          </Col>
        </Row>

        <Row
          justify="space-between"
          align="middle"
          style={{ marginTop: 14, position: "relative", zIndex: 1 }}
        >
          <Col>
            <Text
              style={{
                color: "rgba(255, 255, 255, 0.6)",
                fontSize: 11,
                fontWeight: 600,
              }}
            >
              {item.category || "Chưa phân loại"}
            </Text>
          </Col>

          <Col>
            <StatusTag status={item.status} />
          </Col>
        </Row>
      </div>

      {/* BODY SECTION */}
      <div style={{ padding: 18 }}>
        <Row gutter={[10, 10]}>
          <Col span={12}>
            <InfoItem
              icon={<CalendarOutlined />}
              label="Lịch học"
              value={getDayName(item.day_of_week)}
            />
          </Col>

          <Col span={12}>
            <InfoItem
              icon={<ClockCircleOutlined />}
              label="Thời gian"
              value={`${formatTime(item.start_time)} - ${formatTime(
                item.end_time,
              )}`}
            />
          </Col>

          <Col span={12}>
            <InfoItem
              icon={<EnvironmentOutlined />}
              label="Phòng học"
              value={item.room || "Chưa cập nhật"}
            />
          </Col>

          <Col span={12}>
            <InfoItem
              icon={<TeamOutlined />}
              label="Học viên"
              value={`${studentsCount} bé`}
            />
          </Col>
        </Row>

        {/* GIÁO LÝ VIÊN CARD */}
        <div
          style={{
            marginTop: 14,
            padding: "10px 14px",
            borderRadius: 14,
            background: "#F7F9FC",
            border: "1.5px solid #D9E2EC",
          }}
        >
          <Row justify="space-between" align="middle">
            <Col>
              <Space size={10}>
                <Avatar.Group
                  max={{
                    count: 3,
                    style: {
                      background: "#173B5E",
                      color: "#FFFFFF",
                      fontSize: 10,
                      fontWeight: 700,
                      border: "2px solid #FFFFFF",
                    },
                  }}
                >
                  {catechists.length > 0 ? (
                    catechists.map((catechist, index) => (
                      <Tooltip
                        key={catechist.id || catechist.catechist_id || index}
                        title={catechist.full_name || "Giáo lý viên"}
                      >
                        <Avatar
                          size={32}
                          style={{
                            background: index % 2 === 0 ? "#173B5E" : "#D9A441",
                            color: "#FFFFFF",
                            fontSize: 12,
                            fontWeight: 700,
                            border: "2px solid #FFFFFF",
                          }}
                        >
                          {catechist.full_name?.charAt(0)?.toUpperCase() || "G"}
                        </Avatar>
                      </Tooltip>
                    ))
                  ) : (
                    <Avatar
                      size={32}
                      icon={<UserOutlined />}
                      style={{
                        background: "#E2E8F0",
                        color: "#64748B",
                        border: "2px solid #FFFFFF",
                      }}
                    />
                  )}
                </Avatar.Group>

                <div>
                  <Text
                    strong
                    style={{
                      display: "block",
                      color: "#173B5E",
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    {catechists.length > 0
                      ? `${catechists.length} Giáo lý viên`
                      : "Chưa phân công"}
                  </Text>

                  <Text
                    style={{ fontSize: 10, color: "#64748B", fontWeight: 600 }}
                  >
                    <StarFilled style={{ color: "#D9A441", marginRight: 3 }} />
                    Phụ trách lớp
                  </Text>
                </div>
              </Space>
            </Col>

            <Col>
              <Button
                type="text"
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onView?.(item);
                }}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  color: "#173B5E",
                  background: "#FFFFFF",
                  border: "1.5px solid #D9E2EC",
                  boxShadow: "0 2px 6px rgba(23, 59, 94, 0.05)",
                }}
                icon={<ArrowRightOutlined />}
              />
            </Col>
          </Row>
        </div>
      </div>
    </Card>
  );
};

export default ClassCard;
