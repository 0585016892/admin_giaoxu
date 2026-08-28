import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  Dropdown,
  Empty,
  Input,
  Modal,
  Pagination,
  Row,
  Col,
  Select,
  Space,
  Tag,
  Typography,
  message,
  Tabs,
  Table,
  Badge,
} from "antd";
import { css } from "@emotion/css";
import {
  Plus,
  Gamepad2,
  Trash2,
  Pencil,
  Search,
  Users,
  Star,
  MoreVertical,
  LayoutGrid,
  List,
  Heart,
  Play,
  Sparkles,
} from "lucide-react";
import AppButton from "../../components/common/AppButton";

import {
  deleteGame,
  getGameThumbnail,
  getAllGames,
  getGameById,
} from "../../api/gameApi";

import GameTypeSelector from "../../components/games/GameTypeSelector";
import GameBuilder from "../../components/games/GameBuilder";
import GamePlayer from "../../components/games/player/GamePlayer";
import StatCard from "../../components/common/StatCard";

const { Title, Text } = Typography;
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const getFileUrl = (file) => {
  if (!file) return null;

  if (file instanceof File || file instanceof Blob) {
    return URL.createObjectURL(file);
  }

  if (typeof file === "string") {
    if (
      file.startsWith("http://") ||
      file.startsWith("https://") ||
      file.startsWith("blob:")
    ) {
      return file;
    }

    const normalized = file.startsWith("/") ? file : `/${file}`;
    return `${API_URL}${normalized}`;
  }

  if (typeof file === "object") {
    if (
      file.originFileObj instanceof File ||
      file.originFileObj instanceof Blob
    ) {
      return URL.createObjectURL(file.originFileObj);
    }

    const possibleUrl =
      file.url ||
      file.path ||
      file.location ||
      file.response?.url ||
      file.response?.path ||
      file.response?.data?.url ||
      file.response?.data?.path;

    if (possibleUrl) {
      return getFileUrl(possibleUrl);
    }
  }

  return null;
};

export const GAME_TYPES = [
  {
    key: "quiz",
    name: "Trắc nghiệm",
    description: "Trả lời câu hỏi và chọn đáp án đúng",
    icon: "❓",
    color: "#6C4BFF",
  },
  {
    key: "matching",
    name: "Ghép hình",
    description: "Ghép các cặp nội dung tương ứng",
    icon: "🔗",
    color: "#1677FF",
  },
  {
    key: "wheel",
    name: "Vòng quay",
    description: "Quay vòng may mắn để chọn câu hỏi",
    icon: "🎡",
    color: "#FF7A45",
  },
  {
    key: "memory",
    name: "Tìm điểm khác",
    description: "Lật thẻ và tìm các cặp giống nhau",
    icon: "🧠",
    color: "#13C2C2",
  },
  {
    key: "crossword",
    name: "Ô chữ",
    description: "Giải ô chữ theo các gợi ý",
    icon: "🧩",
    color: "#722ED1",
  },
  {
    key: "sorting",
    name: "Sắp xếp",
    description: "Sắp xếp nội dung theo đúng thứ tự",
    icon: "↕️",
    color: "#52C41A",
  },
  {
    key: "drag_drop",
    name: "Kéo thả",
    description: "Kéo nội dung vào đúng vị trí",
    icon: "✋",
    color: "#FAAD14",
  },
  {
    key: "true_false",
    name: "Đúng / Sai",
    description: "Xác định câu nói đúng hay sai",
    icon: "✓✕",
    color: "#F5222D",
  },
];

const customTabsStyle = css`
  .ant-tabs-nav {
    margin-bottom: 20px !important;
    &::before {
      display: none !important;
    }
  }

  .ant-tabs-nav-list {
    gap: 8px;
    background: #ffffff;
    padding: 6px;
    border-radius: 16px;
    border: 1px solid #e2e8f0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
  }

  .ant-tabs-tab {
    padding: 8px 18px !important;
    margin: 0 !important;
    border-radius: 12px !important;
    transition: all 0.25s ease !important;
    color: #64748b !important;
    font-weight: 500;

    &:hover {
      color: #1e293b !important;
      background: #f1f5f9;
    }
  }

  .ant-tabs-tab-active {
    background: #6c4bff !important;
    box-shadow: 0 4px 12px rgba(108, 75, 255, 0.3);

    .ant-tabs-tab-btn {
      color: #ffffff !important;
      font-weight: 600;
    }
  }

  .ant-tabs-ink-bar {
    display: none !important;
  }
`;

const GameManagementPage = ({ teacherId }) => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  const [editingGame, setEditingGame] = useState(null);

  const [activeTab, setActiveTab] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [selectedClass, setSelectedClass] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [playingGame, setPlayingGame] = useState(null);
  const [playerLoading, setPlayerLoading] = useState(false);

  const loadGames = async () => {
    try {
      setLoading(true);
      const result = await getAllGames();
      if (result?.success) {
        setGames(result.data || []);
      }
    } catch (error) {
      console.error(error);
      message.error(error.message || "Không thể tải danh sách game");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGames();
  }, [teacherId]);

  const openCreate = () => {
    setEditingGame(null);
    setSelectedType(null);
    setBuilderOpen(true);
  };

  const handleSelectType = (type) => {
    setSelectedType(type);
  };

  const handleEdit = (game) => {
    setEditingGame(game);
    setSelectedType(game.type);
    setBuilderOpen(true);
  };

  const handleDelete = (game) => {
    Modal.confirm({
      title: "Xóa trò chơi?",
      content: (
        <span>
          Bạn có chắc muốn xóa <b>{game.name}</b>? Dữ liệu và toàn bộ file của
          game sẽ bị xóa.
        </span>
      ),
      okText: "Xóa",
      cancelText: "Hủy",
      okButtonProps: { danger: true, style: { borderRadius: 8 } },
      cancelButtonProps: { style: { borderRadius: 8 } },
      onOk: async () => {
        try {
          await deleteGame(game.id);
          message.success("Xóa game thành công");
          loadGames();
        } catch (error) {
          message.error(error.message || "Không thể xóa game");
        }
      },
    });
  };

  const closeBuilder = () => {
    setBuilderOpen(false);
    setSelectedType(null);
    setEditingGame(null);
  };

  const filteredGames = useMemo(() => {
    let result = [...games];

    if (activeTab !== "all") {
      result = result.filter((g) => g.type === activeTab);
    }

    if (searchText.trim()) {
      const keyword = searchText.toLowerCase();
      result = result.filter(
        (g) =>
          g.name?.toLowerCase().includes(keyword) ||
          g.description?.toLowerCase().includes(keyword),
      );
    }

    if (selectedClass !== "all") {
      result = result.filter((g) => g.grade === selectedClass);
    }

    if (selectedStatus !== "all") {
      result = result.filter((g) =>
        selectedStatus === "active"
          ? g.status !== "draft"
          : g.status === "draft",
      );
    }

    result.sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      }
      if (sortBy === "oldest") {
        return new Date(a.created_at || 0) - new Date(b.created_at || 0);
      }
      if (sortBy === "name") {
        return (a.name || "").localeCompare(b.name || "");
      }
      if (sortBy === "popular") {
        return (b.playersCount || 0) - (a.playersCount || 0);
      }
      return 0;
    });

    return result;
  }, [games, activeTab, searchText, selectedClass, selectedStatus, sortBy]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchText, selectedClass, selectedStatus, sortBy]);

  const paginatedGames = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredGames.slice(start, start + pageSize);
  }, [filteredGames, currentPage, pageSize]);

  const handlePlayGame = async (game) => {
    try {
      setPlayerLoading(true);
      const result = await getGameById(game.id);

      if (!result?.success) {
        throw new Error(result?.message || "Không thể tải game");
      }

      setPlayingGame(result.data);
    } catch (error) {
      console.error(error);
      message.error(error.message || "Không thể mở game");
    } finally {
      setPlayerLoading(false);
    }
  };

  if (playerLoading) {
    return <GamePlayer loading onExit={() => setPlayingGame(null)} />;
  }

  if (playingGame) {
    return (
      <GamePlayer game={playingGame} onExit={() => setPlayingGame(null)} />
    );
  }

  const columns = [
    {
      title: "Trò chơi",
      dataIndex: "name",
      key: "name",
      render: (text, record) => {
        const type = GAME_TYPES.find((item) => item.key === record.type);
        const thumbUrl = getFileUrl(
          record.thumbnail ||
            record.background?.image ||
            getGameThumbnail(record),
        );

        return (
          <Space size={14}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 12,
                background: record.background?.color || "#F3F0FF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                fontSize: 24,
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              }}
            >
              {thumbUrl ? (
                <img
                  src={thumbUrl}
                  alt={text}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                type?.icon || "🎮"
              )}
            </div>
            <div>
              <Text strong style={{ fontSize: 15, color: "#1E293B" }}>
                {text}
              </Text>
              <div>
                <Text
                  type="secondary"
                  style={{ fontSize: 13, color: "#64748B" }}
                >
                  {record.description || "Không có mô tả"}
                </Text>
              </div>
            </div>
          </Space>
        );
      },
    },
    {
      title: "Loại trò chơi",
      dataIndex: "type",
      key: "type",
      render: (typeKey) => {
        const type = GAME_TYPES.find((item) => item.key === typeKey);
        return (
          <Tag
            style={{
              color: "#6C4BFF",
              background: "#F4F0FF",
              border: "none",
              borderRadius: 8,
              padding: "4px 10px",
              fontWeight: 600,
            }}
          >
            {type?.name || typeKey}
          </Tag>
        );
      },
    },
    {
      title: "Khối lớp",
      dataIndex: "grade",
      key: "grade",
      render: (grade) => grade || "Khối Thiếu Nhi",
    },
    {
      title: "Tham gia",
      key: "players",
      render: (_, record) => (
        <Text style={{ fontWeight: 500 }}>
          {record.playersCount || 0} học sinh
        </Text>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) =>
        status === "draft" ? (
          <Badge status="default" text="Bản nháp" />
        ) : (
          <Badge status="success" text="Đang mở" />
        ),
    },
    {
      title: "Thao tác",
      key: "action",
      align: "right",
      render: (_, record) => (
        <Space size={8}>
          <Button
            type="primary"
            icon={<Play size={14} fill="currentColor" />}
            onClick={() => handlePlayGame(record)}
            style={{ borderRadius: 8, background: "#6C4BFF", border: "none" }}
          >
            Chơi
          </Button>
          <Button
            icon={<Pencil size={14} />}
            onClick={() => handleEdit(record)}
            style={{ borderRadius: 8 }}
          />
          <Button
            danger
            icon={<Trash2 size={14} />}
            onClick={() => handleDelete(record)}
            style={{ borderRadius: 8 }}
          />
        </Space>
      ),
    },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F8FAFC",
        padding: "32px 40px",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* 1. THỐNG KÊ DASHBOARD */}
      <Row gutter={[20, 20]} style={{ marginBottom: 28 }}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Tổng số Game"
            value={games.length}
            loading={loading}
            icon={<Gamepad2 size={22} />}
            iconColor="#6366F1"
            description="Tất cả trò chơi"
          />
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Lớp học áp dụng"
            value={0}
            loading={loading}
            icon={<Users size={22} />}
            iconColor="#0EA5E9"
            description="Lớp đang áp dụng game"
          />
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Học sinh"
            value={0}
            loading={loading}
            icon={<Users size={22} />}
            iconColor="#10B981"
            description="Tổng lượt tham gia"
          />
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Tỷ lệ hoàn thành"
            value="0%"
            loading={loading}
            icon={<Star size={22} />}
            iconColor="#F59E0B"
            description="Tỷ lệ hoàn thành game"
          />
        </Col>
      </Row>

      {/* 2. TABS THEO LOẠI TRÒ CHƠI */}
      <div className={customTabsStyle}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: "all",
              label: (
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span>🎮</span> Tất cả trò chơi
                </span>
              ),
            },
            ...GAME_TYPES.map((type) => ({
              key: type.key,
              label: (
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span>{type.icon}</span>
                  <span>{type.name}</span>
                </span>
              ),
            })),
          ]}
        />
      </div>

      {/* 3. BẢNG ĐIỀU KHIỂN & BỘ LỌC TÌM KIẾM */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 16,
          marginBottom: 28,
          background: "#FFFFFF",
          padding: "16px 20px",
          borderRadius: 16,
          border: "1px solid #E2E8F0",
          boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
        }}
      >
        <Space wrap size={12}>
          <Input
            placeholder="Tìm kiếm trò chơi..."
            prefix={<Search size={16} style={{ color: "#94A3B8" }} />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            style={{ width: 260, borderRadius: 10, height: 40 }}
          />

          <Select
            value={selectedClass}
            onChange={setSelectedClass}
            style={{ width: 160, height: 40 }}
            options={[
              { value: "all", label: "Tất cả các khối" },
              { value: "thieu_nhi", label: "Khối Thiếu Nhi" },
              { value: "giao_ly", label: "Khối Giáo Lý" },
            ]}
          />

          <Select
            value={selectedStatus}
            onChange={setSelectedStatus}
            style={{ width: 160, height: 40 }}
            options={[
              { value: "all", label: "Trạng thái: Tất cả" },
              { value: "active", label: "Đang mở" },
              { value: "draft", label: "Bản nháp" },
            ]}
          />

          <Select
            value={sortBy}
            onChange={setSortBy}
            style={{ width: 170, height: 40 }}
            options={[
              { value: "newest", label: "Sắp xếp: Mới nhất" },
              { value: "oldest", label: "Sắp xếp: Cũ nhất" },
              { value: "name", label: "Sắp xếp: Tên (A-Z)" },
              { value: "popular", label: "Phổ biến nhất" },
            ]}
          />
        </Space>

        <Space size={12}>
          <div
            style={{
              background: "#F1F5F9",
              padding: 4,
              borderRadius: 10,
              display: "flex",
              gap: 4,
            }}
          >
            <Button
              type={viewMode === "grid" ? "primary" : "text"}
              icon={<LayoutGrid size={16} />}
              onClick={() => setViewMode("grid")}
              style={{
                borderRadius: 8,
                height: 32,
                width: 32,
                padding: 0,
                background: viewMode === "grid" ? "#6C4BFF" : "transparent",
              }}
            />
            <Button
              type={viewMode === "list" ? "primary" : "text"}
              icon={<List size={16} />}
              onClick={() => setViewMode("list")}
              style={{
                borderRadius: 8,
                height: 32,
                width: 32,
                padding: 0,
                background: viewMode === "list" ? "#6C4BFF" : "transparent",
              }}
            />
          </div>

          <AppButton
            type="primary"
            icon={<Plus size={18} />}
            onClick={openCreate}
            style={{
              height: 40,
              borderRadius: 10,
              background: "#0a0036",
              fontWeight: 600,
              padding: "0 20px",
            }}
          >
            Tạo trò chơi
          </AppButton>
        </Space>
      </div>

      {/* 4. DANH SÁCH GAME DISPLAY */}
      {paginatedGames.length === 0 && !loading ? (
        <Card
          style={{
            borderRadius: 20,
            padding: 60,
            textAlign: "center",
            border: "1px dashed #CBD5E1",
            background: "#FFFFFF",
          }}
        >
          <Empty
            image={
              <div
                style={{
                  width: 80,
                  height: 80,
                  background: "#F1F5F9",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                }}
              >
                <Gamepad2 size={40} style={{ color: "#94A3B8" }} />
              </div>
            }
            description={
              <div>
                <Title level={4} style={{ color: "#1E293B", marginBottom: 4 }}>
                  Không tìm thấy trò chơi
                </Title>
                <Text type="secondary" style={{ color: "#64748B" }}>
                  Thử thay đổi bộ lọc hoặc tạo trò chơi mới ngay.
                </Text>
              </div>
            }
          >
            <Button
              type="primary"
              icon={<Plus size={16} />}
              onClick={openCreate}
              style={{
                background: "#6C4BFF",
                borderRadius: 10,
                height: 40,
                marginTop: 12,
                fontWeight: 600,
              }}
            >
              Tạo trò chơi mới
            </Button>
          </Empty>
        </Card>
      ) : viewMode === "list" ? (
        <Card
          style={{
            borderRadius: 16,
            border: "1px solid #E2E8F0",
            boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
            overflow: "hidden",
          }}
          styles={{ body: { padding: 0 } }}
        >
          <Table
            columns={columns}
            dataSource={paginatedGames}
            rowKey="id"
            pagination={false}
            loading={loading}
          />
        </Card>
      ) : (
        <Row gutter={[20, 20]}>
          {paginatedGames.map((game) => {
            const type = GAME_TYPES.find((item) => item.key === game.type);
            const thumbUrl = getFileUrl(
              game.thumbnail ||
                game.background?.image ||
                getGameThumbnail(game),
            );

            return (
              <Col xs={24} sm={12} md={8} lg={6} xl={4.8} key={game.id}>
                <Card
                  hoverable
                  style={{
                    borderRadius: 16,
                    overflow: "hidden",
                    border: "1px solid #E2E8F0",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.03)",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                  styles={{ body: { padding: "16px" } }}
                  cover={
                    <div
                      style={{
                        height: 150,
                        background: game.background?.color || "#F1F5F9",
                        backgroundImage:
                          !thumbUrl && game.background?.image
                            ? `url(${getFileUrl(game.background.image)})`
                            : "none",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                      {thumbUrl ? (
                        <img
                          src={thumbUrl}
                          alt={game.name}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            transition: "transform 0.5s ease",
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            height: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 52,
                          }}
                        >
                          {type?.icon || "🎮"}
                        </div>
                      )}
                      <Tag
                        style={{
                          position: "absolute",
                          top: 12,
                          right: 12,
                          margin: 0,
                          background: "rgba(255, 255, 255, 0.9)",
                          backdropFilter: "blur(4px)",
                          color: "#6C4BFF",
                          border: "none",
                          borderRadius: 8,
                          fontWeight: 600,
                          padding: "2px 8px",
                          boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                        }}
                      >
                        {type?.name || game.type}
                      </Tag>
                    </div>
                  }
                >
                  <div>
                    <Title
                      level={5}
                      style={{
                        margin: "0 0 6px 0",
                        fontSize: 15,
                        fontWeight: 700,
                        color: "#1E293B",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                      title={game.name}
                    >
                      {game.name}
                    </Title>

                    <div
                      style={{
                        color: "#64748B",
                        fontSize: 12,
                        marginBottom: 16,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          marginBottom: 6,
                        }}
                      >
                        <Users size={13} style={{ color: "#94A3B8" }} />
                        <span>{game.grade || "Khối Thiếu Nhi"}</span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <span>👤 {game.playersCount || "0"} lượt chơi</span>
                        <span
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 3,
                          }}
                        >
                          <Heart
                            size={12}
                            style={{
                              color: "#EF4444",
                              fill: "#EF4444",
                            }}
                          />{" "}
                          {game.rating || "100%"}
                        </span>
                      </div>
                    </div>

                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <Button
                        type="primary"
                        icon={<Play size={14} fill="currentColor" />}
                        onClick={() => handlePlayGame(game)}
                        style={{
                          flex: 1,
                          borderRadius: 10,
                          background: "#F4F0FF",
                          color: "#6C4BFF",
                          border: "none",
                          fontWeight: 600,
                          fontSize: 13,
                          height: 36,
                          boxShadow: "none",
                        }}
                      >
                        Chơi game
                      </Button>
                      <Dropdown
                        trigger={["click"]}
                        menu={{
                          items: [
                            {
                              key: "edit",
                              icon: <Pencil size={14} />,
                              label: "Chỉnh sửa",
                              onClick: () => handleEdit(game),
                            },
                            {
                              key: "delete",
                              icon: <Trash2 size={14} />,
                              label: "Xóa trò chơi",
                              danger: true,
                              onClick: () => handleDelete(game),
                            },
                          ],
                        }}
                      >
                        <Button
                          type="text"
                          icon={
                            <MoreVertical
                              size={16}
                              style={{ color: "#64748B" }}
                            />
                          }
                          style={{
                            borderRadius: 8,
                            padding: 0,
                            width: 36,
                            height: 36,
                          }}
                        />
                      </Dropdown>
                    </div>
                  </div>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}

      {/* 5. PHÂN TRANG (PAGINATION) */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginTop: 36,
          gap: 16,
        }}
      >
        <Pagination
          current={currentPage}
          total={filteredGames.length}
          pageSize={pageSize}
          onChange={(page) => setCurrentPage(page)}
          showSizeChanger={false}
        />
        <Select
          value={pageSize}
          onChange={(val) => {
            setPageSize(val);
            setCurrentPage(1);
          }}
          style={{ width: 110 }}
          options={[
            { value: 10, label: "10 / trang" },
            { value: 20, label: "20 / trang" },
            { value: 50, label: "50 / trang" },
          ]}
        />
      </div>

      {/* BUILDER MODAL */}
      <Modal
        open={builderOpen}
        onCancel={closeBuilder}
        footer={null}
        width={selectedType ? 1100 : 900}
        destroyOnClose
        centered
        style={{ borderRadius: 20, overflow: "hidden" }}
        title={
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 18,
              fontWeight: 700,
            }}
          >
            <Sparkles size={20} style={{ color: "#6C4BFF" }} />
            <span>
              {editingGame ? "Chỉnh sửa trò chơi" : "Tạo trò chơi mới"}
            </span>
          </div>
        }
      >
        {!selectedType ? (
          <GameTypeSelector
            types={GAME_TYPES}
            value={selectedType}
            onChange={handleSelectType}
          />
        ) : (
          <GameBuilder
            type={selectedType}
            teacherId={teacherId}
            game={editingGame}
            onBack={() => setSelectedType(null)}
            onSuccess={() => {
              closeBuilder();
              loadGames();
            }}
          />
        )}
      </Modal>
    </div>
  );
};

export default GameManagementPage;
