import React, { useCallback, useEffect, useMemo, useState } from "react";

import {
  Badge,
  Button,
  Card,
  Col,
  Dropdown,
  Empty,
  Modal,
  Pagination,
  Row,
  Select,
  Skeleton,
  Space,
  Table,
  Tabs,
  Tag,
  Typography,
  message,
} from "antd";

import { css } from "@emotion/css";

import {
  Gamepad2,
  Heart,
  LayoutGrid,
  List,
  MoreVertical,
  Pencil,
  Play,
  Plus,
  Smile,
  Sparkles,
  Star,
  Trash2,
  Users,
} from "lucide-react";

import { CustomerServiceOutlined } from "@ant-design/icons";

import AppButton from "../../components/common/AppButton";
import StatCard from "../../components/common/StatCard";
import GameTypeSelector from "../../components/games/GameTypeSelector";
import GameBuilder from "../../components/games/GameBuilder";
import GamePlayer from "../../components/games/player/GamePlayer";
import PageHeroHeader from "../../components/common/PageHeroHeader";
import AppSearchInput from "../../components/common/SearchInput";

import { useUser } from "../../context/UserContext";

import {
  deleteGame,
  getAllGames,
  getGameById,
  getGameThumbnail,
} from "../../api/gameApi";

const { Title, Text } = Typography;

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

/* =========================================================
   COLORS
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

  border: "#E2E8F0",

  navyLight: "#EEF3F7",
  goldLight: "#FBF5E7",

  success: "#2E7D5B",
  successBg: "#EAF6F0",

  warning: "#B7791F",
  warningBg: "#FFF7E5",

  gray: "#64748B",
  grayBg: "#F1F5F9",

  danger: "#C0392B",
  dangerBg: "#FDEDEC",
};

/* =========================================================
   GAME TYPES
========================================================= */

export const GAME_TYPES = [
  {
    key: "quiz",
    name: "Trắc nghiệm",
    description: "Trả lời câu hỏi và chọn đáp án đúng",
    icon: "❓",
    color: COLORS.navy,
    bgColor: COLORS.navyLight,
    borderColor: COLORS.border,
  },
  {
    key: "matching",
    name: "Ghép hình",
    description: "Ghép các cặp nội dung tương ứng",
    icon: "🧩",
    color: COLORS.navy,
    bgColor: COLORS.navyLight,
    borderColor: COLORS.border,
  },
  {
    key: "wheel",
    name: "Vòng quay",
    description: "Quay vòng may mắn để chọn câu hỏi",
    icon: "🎡",
    color: COLORS.warning,
    bgColor: COLORS.warningBg,
    borderColor: "#F3D8A1",
  },
  {
    key: "memory",
    name: "Tìm điểm khác",
    description: "Lật thẻ và tìm các cặp giống nhau",
    icon: "🧠",
    color: COLORS.success,
    bgColor: COLORS.successBg,
    borderColor: "#C7E6D7",
  },
  {
    key: "crossword",
    name: "Ô chữ",
    description: "Giải ô chữ theo các gợi ý",
    icon: "🎨",
    color: COLORS.navy,
    bgColor: COLORS.navyLight,
    borderColor: COLORS.border,
  },
  {
    key: "sorting",
    name: "Sắp xếp",
    description: "Sắp xếp nội dung theo đúng thứ tự",
    icon: "↕️",
    color: COLORS.success,
    bgColor: COLORS.successBg,
    borderColor: "#C7E6D7",
  },
  {
    key: "drag_drop",
    name: "Kéo thả",
    description: "Kéo nội dung vào đúng vị trí",
    icon: "✋",
    color: COLORS.warning,
    bgColor: COLORS.warningBg,
    borderColor: "#F3D8A1",
  },
  {
    key: "true_false",
    name: "Đúng / Sai",
    description: "Xác định câu nói đúng hay sai",
    icon: "✨",
    color: COLORS.gold,
    bgColor: COLORS.goldLight,
    borderColor: "#E8D5A6",
  },
];

/* =========================================================
   TABS STYLE
========================================================= */

const customTabsStyle = css`
  width: 100%;

  .ant-tabs {
    width: 100%;
  }

  .ant-tabs-nav {
    margin-bottom: 24px !important;

    &::before {
      display: none !important;
    }
  }

  .ant-tabs-nav-wrap {
    overflow-x: auto;
    scrollbar-width: none;
  }

  .ant-tabs-nav-wrap::-webkit-scrollbar {
    display: none;
  }

  .ant-tabs-nav-list {
    gap: 8px;
    background: ${COLORS.white};
    padding: 10px;
    border-radius: 18px;
    border: 1px solid ${COLORS.border};
    box-shadow: 0 8px 24px rgba(23, 59, 94, 0.05);
    min-width: max-content;
  }

  .ant-tabs-tab {
    padding: 9px 18px !important;
    margin: 0 !important;
    border-radius: 12px !important;
    transition: all 0.25s ease !important;
    color: ${COLORS.textSecondary} !important;
    font-weight: 600;
  }

  .ant-tabs-tab:hover {
    color: ${COLORS.navy} !important;
    background: ${COLORS.navyLight};
  }

  .ant-tabs-tab-active {
    background: ${COLORS.navyLight} !important;
    border: 1px solid ${COLORS.border} !important;
  }

  .ant-tabs-tab-active .ant-tabs-tab-btn {
    color: ${COLORS.navy} !important;
    font-weight: 700;
  }

  .ant-tabs-ink-bar {
    display: none !important;
  }
`;

/* =========================================================
   FILE URL
========================================================= */

const getFileUrl = (file) => {
  if (!file) {
    return null;
  }

  if (typeof File !== "undefined" && file instanceof File) {
    return URL.createObjectURL(file);
  }

  if (typeof Blob !== "undefined" && file instanceof Blob) {
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
    if (typeof File !== "undefined" && file.originFileObj instanceof File) {
      return URL.createObjectURL(file.originFileObj);
    }

    if (typeof Blob !== "undefined" && file.originFileObj instanceof Blob) {
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

/* =========================================================
   HELPERS
========================================================= */

const getGameType = (type) => {
  return GAME_TYPES.find((item) => item.key === type);
};

const getGameTypeInfo = (game) => {
  return (
    getGameType(game?.type) || {
      key: game?.type,
      name: game?.type || "Game",
      icon: "🎮",
      color: COLORS.navy,
      bgColor: COLORS.navyLight,
      borderColor: COLORS.border,
    }
  );
};

const getThumbnail = (game) => {
  if (!game) {
    return null;
  }

  return getFileUrl(
    game.thumbnail || game.background?.image || getGameThumbnail(game),
  );
};

/* =========================================================
   VIP MODAL
========================================================= */

const showVipModal = (game) => {
  Modal.info({
    title: "Tính năng dành cho VIP",

    content: (
      <div style={{ paddingTop: 8 }}>
        <div
          style={{
            fontSize: 15,
            color: COLORS.textSecondary,
            lineHeight: 1.7,
          }}
        >
          Game <b>{game?.name || "này"}</b> chỉ dành cho tài khoản VIP.
        </div>

        <div
          style={{
            marginTop: 12,
            padding: "12px 16px",
            borderRadius: 12,
            background: COLORS.goldLight,
            border: `1px solid ${COLORS.gold}`,
            color: COLORS.warning,
            fontWeight: 600,
          }}
        >
          Tài khoản Member chỉ được chơi Trắc nghiệm.
        </div>
      </div>
    ),

    okText: "Đã hiểu",
    centered: true,

    okButtonProps: {
      style: {
        borderRadius: 10,
        fontWeight: 700,
        background: COLORS.navy,
        borderColor: COLORS.navy,
      },
    },
  });
};

/* =========================================================
   CARD SKELETON
========================================================= */

const GameCardSkeleton = () => {
  return (
    <Card
      style={{
        borderRadius: 20,
        overflow: "hidden",
        border: `1px solid ${COLORS.border}`,
        background: COLORS.white,
      }}
      styles={{
        body: {
          padding: 20,
        },
      }}
    >
      <Skeleton.Image
        active
        style={{
          width: "100%",
          height: 145,
          borderRadius: 0,
        }}
      />

      <div style={{ marginTop: 20 }}>
        <Skeleton
          active
          title={{
            width: "70%",
          }}
          paragraph={{
            rows: 3,
            width: ["55%", "85%", "65%"],
          }}
        />
      </div>
    </Card>
  );
};

/* =========================================================
   EMPTY
========================================================= */

const GameEmpty = ({ onCreate }) => {
  return (
    <Card
      style={{
        borderRadius: 22,
        padding: 60,
        textAlign: "center",
        border: `1.5px dashed ${COLORS.border}`,
        background: COLORS.white,
        boxShadow: "0 8px 24px rgba(23, 59, 94, 0.04)",
      }}
    >
      <Empty
        image={
          <div
            style={{
              width: 90,
              height: 90,
              background: COLORS.navyLight,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              border: `1px solid ${COLORS.border}`,
            }}
          >
            <Gamepad2
              size={46}
              style={{
                color: COLORS.navy,
              }}
            />
          </div>
        }
        description={
          <div>
            <Title
              level={4}
              style={{
                color: COLORS.navy,
                marginBottom: 6,
                fontWeight: 700,
              }}
            >
              Chưa có trò chơi nào
            </Title>

            <Text
              type="secondary"
              style={{
                color: COLORS.textSecondary,
              }}
            >
              Thử đổi bộ lọc hoặc tạo một trò chơi mới.
            </Text>
          </div>
        }
      >
        <Button
          type="primary"
          icon={<Plus size={18} />}
          onClick={onCreate}
          style={{
            background: COLORS.navy,
            borderRadius: 12,
            height: 42,
            marginTop: 16,
            fontWeight: 700,
            borderColor: COLORS.navy,
            boxShadow: "0 6px 16px rgba(23, 59, 94, 0.18)",
          }}
        >
          Tạo trò chơi
        </Button>
      </Empty>
    </Card>
  );
};

/* =========================================================
   MAIN
========================================================= */

const GameManagementPage = ({ teacherId }) => {
  const { user } = useUser();

  const [games, setGames] = useState([]);

  const [loading, setLoading] = useState(true);

  const [builderOpen, setBuilderOpen] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  const [editingGame, setEditingGame] = useState(null);

  const [activeTab, setActiveTab] = useState("all");

  const [searchText, setSearchText] = useState("");

  const [selectedClass, setSelectedClass] = useState("all");

  const [selectedStatus, setSelectedStatus] = useState("all");

  const [sortBy] = useState("newest");

  const [viewMode, setViewMode] = useState("grid");

  const [currentPage, setCurrentPage] = useState(1);

  const [pageSize, setPageSize] = useState(10);

  const [playingGame, setPlayingGame] = useState(null);

  const [playerLoading, setPlayerLoading] = useState(false);

  /* =========================================================
     ACCOUNT TYPE
  ========================================================= */

  const accountType = String(user?.account_type || user?.accountType || "")
    .trim()
    .toLowerCase();

  const isVip = accountType === "vip";

  const isMember =
    accountType === "member" ||
    accountType === "normal" ||
    accountType === "free" ||
    accountType === "user";

  /* =========================================================
     GAME ACCESS
  ========================================================= */

  const getGameAccess = useCallback(
    (game) => {
      if (isVip) {
        return {
          allowed: true,
          isVip: true,
          message: "",
        };
      }

      if (game?.type === "quiz") {
        return {
          allowed: true,
          isVip: false,
          message: "",
        };
      }

      return {
        allowed: false,
        isVip: false,
        message:
          isMember || !accountType
            ? "Game này chỉ dành cho tài khoản VIP."
            : "Tài khoản của bạn không có quyền chơi game này.",
      };
    },
    [isVip, isMember, accountType],
  );

  /* =========================================================
     LOAD GAMES
  ========================================================= */

  const loadGames = useCallback(async () => {
    try {
      setLoading(true);

      const result = await getAllGames();

      if (result?.success) {
        setGames(Array.isArray(result.data) ? result.data : []);
      } else {
        message.error(result?.message || "Không thể tải danh sách game");
      }
    } catch (error) {
      message.error(error?.message || "Không thể tải danh sách game");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGames();
  }, [loadGames, teacherId]);

  /* =========================================================
     BUILDER
  ========================================================= */

  const openCreate = useCallback(() => {
    setEditingGame(null);
    setSelectedType(null);
    setBuilderOpen(true);
  }, []);

  const handleSelectType = useCallback((type) => {
    setSelectedType(type);
  }, []);

  const handleEdit = useCallback((game) => {
    setEditingGame(game);
    setSelectedType(game?.type || null);
    setBuilderOpen(true);
  }, []);

  const closeBuilder = useCallback(() => {
    setBuilderOpen(false);
    setSelectedType(null);
    setEditingGame(null);
  }, []);

  /* =========================================================
     DELETE
  ========================================================= */

  const handleDelete = useCallback(
    (game) => {
      if (!game?.id) {
        message.error("Không tìm thấy ID game");
        return;
      }

      Modal.confirm({
        title: "Xóa trò chơi?",

        content: (
          <span
            style={{
              color: COLORS.textSecondary,
            }}
          >
            Bạn có chắc muốn xóa <b>{game.name}</b> không? Dữ liệu game sẽ bị
            xóa.
          </span>
        ),

        okText: "Xóa",
        cancelText: "Hủy",
        centered: true,

        okButtonProps: {
          danger: true,

          style: {
            borderRadius: 10,
            background: COLORS.danger,
            borderColor: COLORS.danger,
            fontWeight: 600,
          },
        },

        cancelButtonProps: {
          style: {
            borderRadius: 10,
          },
        },

        onOk: async () => {
          try {
            await deleteGame(game.id);

            message.success("Xóa game thành công.");

            await loadGames();
          } catch (error) {
            message.error(error?.message || "Không thể xóa game");
          }
        },
      });
    },
    [loadGames],
  );

  /* =========================================================
     PLAY GAME
  ========================================================= */

  const handlePlayGame = useCallback(
    async (game) => {
      if (!game?.id) {
        message.error("Không tìm thấy trò chơi");
        return;
      }

      const access = getGameAccess(game);

      if (!access.allowed) {
        showVipModal(game);
        return;
      }

      try {
        setPlayerLoading(true);

        const result = await getGameById(game.id);

        if (!result?.success || !result?.data) {
          throw new Error(result?.message || "Không thể tải game");
        }

        const loadedGame = result.data;

        const loadedAccess = getGameAccess(loadedGame);

        if (!loadedAccess.allowed) {
          showVipModal(loadedGame);
          return;
        }

        setPlayingGame(loadedGame);
      } catch (error) {
        message.error(error?.message || "Không thể mở game");
      } finally {
        setPlayerLoading(false);
      }
    },
    [getGameAccess],
  );

  /* =========================================================
     FILTER
  ========================================================= */

  const filteredGames = useMemo(() => {
    let result = [...games];

    if (activeTab !== "all") {
      result = result.filter((game) => game?.type === activeTab);
    }

    const keyword = searchText.trim().toLowerCase();

    if (keyword) {
      result = result.filter((game) => {
        const name = game?.name?.toLowerCase() || "";

        const description = game?.description?.toLowerCase() || "";

        return name.includes(keyword) || description.includes(keyword);
      });
    }

    if (selectedClass !== "all") {
      result = result.filter((game) => game?.grade === selectedClass);
    }

    if (selectedStatus !== "all") {
      result = result.filter((game) =>
        selectedStatus === "active"
          ? game?.status !== "draft"
          : game?.status === "draft",
      );
    }

    result.sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b?.created_at || 0) - new Date(a?.created_at || 0);
      }

      if (sortBy === "oldest") {
        return new Date(a?.created_at || 0) - new Date(b?.created_at || 0);
      }

      if (sortBy === "name") {
        return (a?.name || "").localeCompare(b?.name || "", "vi");
      }

      if (sortBy === "popular") {
        return Number(b?.playersCount || 0) - Number(a?.playersCount || 0);
      }

      return 0;
    });

    return result;
  }, [games, activeTab, searchText, selectedClass, selectedStatus, sortBy]);

  /* =========================================================
     RESET PAGINATION
  ========================================================= */

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchText, selectedClass, selectedStatus, sortBy]);

  /* =========================================================
     PAGINATION
  ========================================================= */

  const paginatedGames = useMemo(() => {
    const start = (currentPage - 1) * pageSize;

    return filteredGames.slice(start, start + pageSize);
  }, [filteredGames, currentPage, pageSize]);

  /* =========================================================
     STATS
  ========================================================= */

  const totalGames = games.length;

  const totalClasses = useMemo(() => {
    return new Set(games.map((game) => game?.grade).filter(Boolean)).size;
  }, [games]);

  const totalPlayers = useMemo(() => {
    return games.reduce(
      (sum, game) => sum + Number(game?.playersCount || 0),
      0,
    );
  }, [games]);

  const completionRate = useMemo(() => {
    const values = games
      .map((game) => {
        const value = game?.completionRate ?? game?.rating ?? null;

        if (value === null || value === undefined) {
          return null;
        }

        const number = parseFloat(String(value).replace("%", ""));

        return Number.isNaN(number) ? null : number;
      })
      .filter((value) => value !== null);

    if (!values.length) {
      return 0;
    }

    return Math.round(
      values.reduce((sum, value) => sum + value, 0) / values.length,
    );
  }, [games]);

  /* =========================================================
     TABLE COLUMNS
  ========================================================= */

  const columns = useMemo(
    () => [
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
                  borderRadius: 14,

                  background: type?.bgColor || COLORS.navyLight,

                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",

                  overflow: "hidden",

                  fontSize: 24,

                  border: `1px solid ${type?.borderColor || COLORS.border}`,
                }}
              >
                {thumbUrl ? (
                  <img
                    src={thumbUrl}
                    alt={text || "Game"}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  type?.icon || "🎮"
                )}
              </div>

              <div>
                <Text
                  strong
                  style={{
                    fontSize: 14,
                    color: COLORS.navy,
                  }}
                >
                  {text || "Game chưa đặt tên"}
                </Text>

                <div>
                  <Text
                    type="secondary"
                    style={{
                      fontSize: 12,
                      color: COLORS.textSecondary,
                    }}
                  >
                    {record.description || "Chưa có mô tả"}
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
                color: type?.color || COLORS.navy,

                background: type?.bgColor || COLORS.navyLight,

                border: `1px solid ${type?.borderColor || COLORS.border}`,

                borderRadius: 10,

                padding: "4px 12px",

                fontWeight: 700,
              }}
            >
              {type?.icon} {type?.name || typeKey}
            </Tag>
          );
        },
      },

      {
        title: "Khối lớp",
        dataIndex: "grade",
        key: "grade",

        render: (grade) => (
          <span
            style={{
              color: COLORS.textSecondary,
            }}
          >
            {grade || "Khối Thiếu Nhi"}
          </span>
        ),
      },

      {
        title: "Tham gia",
        key: "players",

        render: (_, record) => (
          <Text
            style={{
              fontWeight: 600,
              color: COLORS.textSecondary,
            }}
          >
            👶 {record.playersCount || 0} bé
          </Text>
        ),
      },

      {
        title: "Trạng thái",
        dataIndex: "status",
        key: "status",

        render: (status) =>
          status === "draft" ? (
            <Badge
              status="default"
              text={
                <span
                  style={{
                    color: COLORS.muted,
                  }}
                >
                  Bản nháp
                </span>
              }
            />
          ) : (
            <Badge
              status="success"
              text={
                <span
                  style={{
                    color: COLORS.success,
                  }}
                >
                  Đang mở
                </span>
              }
            />
          ),
      },

      {
        title: "Thao tác",
        key: "action",
        align: "right",

        render: (_, record) => {
          const access = getGameAccess(record);

          return (
            <Space size={8}>
              <AppButton
                variant="secondary"
                size="small"
                type="primary"
                icon={
                  access.allowed ? (
                    <Play size={14} fill="currentColor" />
                  ) : (
                    <Star size={14} />
                  )
                }
                disabled={!access.allowed}
                onClick={() => handlePlayGame(record)}
              >
                {access.allowed ? "Vào chơi" : "Chỉ VIP"}
              </AppButton>

              <AppButton
                variant="secondary"
                size="small"
                icon={<Pencil size={14} />}
                onClick={() => handleEdit(record)}
              />
              <AppButton
                danger
                size="small"
                icon={<Trash2 size={14} />}
                onClick={() => handleDelete(record)}
              />
            </Space>
          );
        },
      },
    ],
    [getGameAccess, handleDelete, handleEdit, handlePlayGame],
  );

  /* =========================================================
     PLAYER SCREEN
  ========================================================= */

  if (playerLoading) {
    return <GamePlayer loading onExit={() => setPlayingGame(null)} />;
  }

  if (playingGame) {
    return (
      <GamePlayer game={playingGame} onExit={() => setPlayingGame(null)} />
    );
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div
      style={{
        minHeight: "100vh",

        background: COLORS.background,

        fontFamily:
          "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",

        color: COLORS.text,
      }}
    >
      {/* =====================================================
          HEADER
      ===================================================== */}

      <PageHeroHeader
        icon={<CustomerServiceOutlined />}
        badgeText="TRÒ CHƠI GIÁO LÝ"
        title="Kho trò chơi"
        description="Tạo và quản lý những trò chơi giáo lý tương tác cho các bé."
      />

      {/* =====================================================
          STATS
      ===================================================== */}

      <Row
        gutter={[20, 20]}
        style={{
          marginBottom: 28,
        }}
      >
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Tổng số Game"
            value={totalGames}
            loading={loading}
            icon={<Gamepad2 size={24} />}
            iconColor={COLORS.navy}
            description="Tất cả mini games"
            style={{
              background: COLORS.white,

              borderRadius: 18,

              border: `1px solid ${COLORS.border}`,

              boxShadow: "0 8px 20px rgba(23,59,94,0.05)",
            }}
          />
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Lớp học áp dụng"
            value={totalClasses}
            loading={loading}
            icon={<Users size={24} />}
            iconColor={COLORS.navyHover}
            description="Lớp tham gia thử thách"
            style={{
              background: COLORS.white,

              borderRadius: 18,

              border: `1px solid ${COLORS.border}`,

              boxShadow: "0 8px 20px rgba(23,59,94,0.05)",
            }}
          />
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Các Bé Tham Gia"
            value={totalPlayers}
            loading={loading}
            icon={<Smile size={24} />}
            iconColor={COLORS.success}
            description="Tổng số lượt tương tác"
            style={{
              background: COLORS.white,

              borderRadius: 18,

              border: `1px solid ${COLORS.border}`,

              boxShadow: "0 8px 20px rgba(23,59,94,0.05)",
            }}
          />
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Tỷ lệ hoàn thành"
            value={`${completionRate}%`}
            loading={loading}
            icon={<Star size={24} />}
            iconColor={COLORS.gold}
            description="Bé hoàn thành game"
            style={{
              background: COLORS.white,

              borderRadius: 18,

              border: `1px solid ${COLORS.border}`,

              boxShadow: "0 8px 20px rgba(23,59,94,0.05)",
            }}
          />
        </Col>
      </Row>

      {/* =====================================================
          TABS
      ===================================================== */}

      <div className={customTabsStyle}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: "all",

              label: (
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <Gamepad2 size={16} />

                  <span>Tất cả game</span>
                </span>
              ),
            },

            ...GAME_TYPES.map((type) => ({
              key: type.key,

              label: (
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <span>{type.icon}</span>

                  <span>{type.name}</span>
                </span>
              ),
            })),
          ]}
        />
      </div>

      {/* =====================================================
          FILTER
      ===================================================== */}

      <Card
        style={{
          marginBottom: 28,

          borderRadius: 18,

          border: `1px solid ${COLORS.border}`,

          boxShadow: "0 8px 24px rgba(23,59,94,0.04)",

          background: COLORS.white,
        }}
        styles={{
          body: {
            padding: "18px 24px",
          },
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
          }}
        >
          <Space
            wrap
            size={12}
            style={{
              flex: 1,
            }}
          >
            <AppSearchInput
              value={searchText}
              onChange={(value) => {
                setSearchText(value);
                setCurrentPage(1);
              }}
              placeholder="Tìm trò chơi..."
            />

            <Select
              value={selectedClass}
              onChange={setSelectedClass}
              style={{
                width: 160,
              }}
              options={[
                {
                  value: "all",
                  label: "Tất cả các khối",
                },
                {
                  value: "thieu_nhi",
                  label: "Khối Thiếu Nhi",
                },
                {
                  value: "giao_ly",
                  label: "Khối Giáo Lý",
                },
              ]}
            />

            <Select
              value={selectedStatus}
              onChange={setSelectedStatus}
              style={{
                width: 160,
              }}
              options={[
                {
                  value: "all",
                  label: "Trạng thái: Tất cả",
                },
                {
                  value: "active",
                  label: "Đang mở",
                },
                {
                  value: "draft",
                  label: "Bản nháp",
                },
              ]}
            />
          </Space>

          <Space size={12}>
            {/* VIEW MODE */}

            <div
              style={{
                background: COLORS.grayBg,

                padding: 4,

                borderRadius: 12,

                display: "flex",

                gap: 4,

                border: `1px solid ${COLORS.border}`,
              }}
            >
              <Button
                type={viewMode === "grid" ? "primary" : "text"}
                icon={<LayoutGrid size={18} />}
                onClick={() => setViewMode("grid")}
                style={{
                  borderRadius: 9,

                  height: 34,
                  width: 34,

                  padding: 0,

                  background: viewMode === "grid" ? COLORS.navy : "transparent",

                  color:
                    viewMode === "grid" ? COLORS.white : COLORS.textSecondary,

                  boxShadow:
                    viewMode === "grid"
                      ? "0 4px 12px rgba(23,59,94,0.18)"
                      : "none",
                }}
              />

              <Button
                type={viewMode === "list" ? "primary" : "text"}
                icon={<List size={18} />}
                onClick={() => setViewMode("list")}
                style={{
                  borderRadius: 9,

                  height: 34,
                  width: 34,

                  padding: 0,

                  background: viewMode === "list" ? COLORS.navy : "transparent",

                  color:
                    viewMode === "list" ? COLORS.white : COLORS.textSecondary,

                  boxShadow:
                    viewMode === "list"
                      ? "0 4px 12px rgba(23,59,94,0.18)"
                      : "none",
                }}
              />
            </div>

            <AppButton
              size="small"
              type="primary"
              icon={<Plus size={20} />}
              onClick={openCreate}
            >
              Tạo game mới
            </AppButton>
          </Space>
        </div>
      </Card>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      {loading ? (
        viewMode === "list" ? (
          <Card
            style={{
              borderRadius: 18,

              border: `1px solid ${COLORS.border}`,

              background: COLORS.white,
            }}
            styles={{
              body: {
                padding: 24,
              },
            }}
          >
            <Skeleton
              active
              paragraph={{
                rows: 8,
              }}
            />
          </Card>
        ) : (
          <Row gutter={[22, 22]}>
            {Array.from({
              length: 10,
            }).map((_, index) => (
              <Col xs={24} sm={12} md={8} lg={6} xl={4.8} key={index}>
                <GameCardSkeleton />
              </Col>
            ))}
          </Row>
        )
      ) : paginatedGames.length === 0 ? (
        <GameEmpty onCreate={openCreate} />
      ) : viewMode === "list" ? (
        /* ===================================================
           LIST
        =================================================== */

        <Card
          style={{
            borderRadius: 18,

            border: `1px solid ${COLORS.border}`,

            boxShadow: "0 8px 24px rgba(23,59,94,0.04)",

            overflow: "hidden",

            background: COLORS.white,
          }}
          styles={{
            body: {
              padding: 0,
            },
          }}
        >
          <Table
            columns={columns}
            dataSource={paginatedGames}
            rowKey="id"
            pagination={false}
            scroll={{
              x: 900,
            }}
          />
        </Card>
      ) : (
        /* ===================================================
           GRID
        =================================================== */

        <Row gutter={[22, 22]}>
          {paginatedGames.map((game) => {
            const type = getGameTypeInfo(game);

            const thumbUrl = getThumbnail(game);

            const access = getGameAccess(game);

            return (
              <Col xs={24} sm={12} md={8} lg={6} xl={4.8} key={game.id}>
                <Card
                  hoverable
                  style={{
                    height: "100%",

                    borderRadius: 20,

                    overflow: "hidden",

                    border: `1px solid ${COLORS.border}`,

                    background: COLORS.white,

                    boxShadow: "0 8px 22px rgba(23,59,94,0.05)",

                    transition: "all 0.3s ease",
                  }}
                  styles={{
                    body: {
                      padding: 20,
                    },
                  }}
                  cover={
                    <div
                      style={{
                        height: 145,

                        background: game.background?.color || type.bgColor,

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
                          alt={game.name || "Game"}
                          loading="lazy"
                          style={{
                            width: "100%",

                            height: "100%",

                            objectFit: "cover",
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
                          {type.icon}
                        </div>
                      )}

                      {/* TYPE */}

                      <Tag
                        style={{
                          position: "absolute",

                          top: 12,
                          right: 12,

                          margin: 0,

                          background: "rgba(255,255,255,0.96)",

                          color: type.color,

                          border: `1px solid ${type.borderColor}`,

                          borderRadius: 10,

                          fontWeight: 700,

                          padding: "2px 10px",

                          boxShadow: "0 4px 10px rgba(23,59,94,0.06)",
                        }}
                      >
                        {type.icon} {type.name}
                      </Tag>

                      {/* VIP */}

                      {!access.allowed && (
                        <div
                          style={{
                            position: "absolute",

                            left: 12,
                            bottom: 12,

                            background: "rgba(255,255,255,0.96)",

                            border: `1px solid ${COLORS.gold}`,

                            color: COLORS.warning,

                            borderRadius: 10,

                            padding: "4px 9px",

                            fontSize: 11,

                            fontWeight: 800,
                          }}
                        >
                          <Star
                            size={12}
                            fill="currentColor"
                            style={{
                              marginRight: 4,
                              verticalAlign: "middle",
                            }}
                          />
                          VIP
                        </div>
                      )}
                    </div>
                  }
                >
                  <div
                    style={{
                      display: "flex",

                      flexDirection: "column",

                      height: "100%",
                    }}
                  >
                    {/* NAME */}

                    <Title
                      level={5}
                      style={{
                        margin: "0 0 6px 0",

                        fontSize: 15,

                        fontWeight: 800,

                        color: COLORS.navy,

                        overflow: "hidden",

                        textOverflow: "ellipsis",

                        whiteSpace: "nowrap",
                      }}
                      title={game.name}
                    >
                      {game.name || "Game chưa đặt tên"}
                    </Title>

                    {/* INFO */}

                    <div
                      style={{
                        color: COLORS.textSecondary,

                        fontSize: 12,

                        fontWeight: 600,

                        marginBottom: 16,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",

                          alignItems: "center",

                          gap: 6,

                          marginBottom: 7,
                        }}
                      >
                        <Users
                          size={14}
                          style={{
                            color: COLORS.muted,
                          }}
                        />

                        <span>{game.grade || "Khối Thiếu Nhi"}</span>
                      </div>

                      <div
                        style={{
                          display: "flex",

                          alignItems: "center",

                          justifyContent: "space-between",

                          gap: 8,
                        }}
                      >
                        <span>👶 {game.playersCount || 0} bé chơi</span>

                        <span
                          style={{
                            display: "flex",

                            alignItems: "center",

                            gap: 4,

                            color: COLORS.gold,

                            fontWeight: 700,
                          }}
                        >
                          <Heart
                            size={13}
                            style={{
                              color: COLORS.gold,
                            }}
                            fill={COLORS.gold}
                          />

                          {game.rating || game.completionRate || "100%"}
                        </span>
                      </div>
                    </div>

                    {/* ACTIONS */}

                    <div
                      style={{
                        display: "flex",

                        alignItems: "center",

                        gap: 8,

                        marginTop: "auto",
                      }}
                    >
                      <AppButton
                        variant="secondary"
                        size="small"
                        icon={
                          access.allowed ? (
                            <Play size={14} fill="currentColor" />
                          ) : (
                            <Star size={14} />
                          )
                        }
                        disabled={!access.allowed}
                        onClick={() => handlePlayGame(game)}
                        style={{
                          flex: 1,

                          borderRadius: 10,

                          background: access.allowed
                            ? COLORS.navy
                            : COLORS.grayBg,

                          color: access.allowed ? COLORS.white : COLORS.muted,

                          border: access.allowed
                            ? `1px solid ${COLORS.navy}`
                            : `1px solid ${COLORS.border}`,

                          fontWeight: 700,

                          fontSize: 13,

                          height: 40,

                          boxShadow: access.allowed
                            ? "0 5px 14px rgba(23,59,94,0.16)"
                            : "none",

                          cursor: access.allowed ? "pointer" : "not-allowed",

                          opacity: access.allowed ? 1 : 0.75,
                        }}
                      >
                        {access.allowed ? "Vào chơi" : "Chỉ VIP"}
                      </AppButton>

                      <Dropdown
                        trigger={["click"]}
                        menu={{
                          items: [
                            {
                              key: "edit",

                              icon: <Pencil size={14} />,

                              label: "Sửa game",

                              onClick: () => handleEdit(game),
                            },

                            {
                              key: "delete",

                              icon: <Trash2 size={14} />,

                              label: "Xóa game",

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
                              style={{
                                color: COLORS.textSecondary,
                              }}
                            />
                          }
                          style={{
                            borderRadius: 10,

                            padding: 0,

                            width: 40,

                            height: 40,

                            background: COLORS.grayBg,

                            border: `1px solid ${COLORS.border}`,
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

      {/* =====================================================
          PAGINATION
      ===================================================== */}

      {!loading && filteredGames.length > 0 && (
        <div
          style={{
            display: "flex",

            justifyContent: "center",

            alignItems: "center",

            flexWrap: "wrap",

            marginTop: 40,

            gap: 16,
          }}
        >
          <Pagination
            current={currentPage}
            total={filteredGames.length}
            pageSize={pageSize}
            onChange={(page) => setCurrentPage(page)}
            showSizeChanger={false}
            showTotal={(total) => `Tổng ${total} game`}
          />

          <Select
            value={pageSize}
            onChange={(value) => {
              setPageSize(value);

              setCurrentPage(1);
            }}
            style={{
              width: 130,
            }}
            options={[
              {
                value: 10,
                label: "10 game/trang",
              },
              {
                value: 20,
                label: "20 game/trang",
              },
              {
                value: 50,
                label: "50 game/trang",
              },
            ]}
          />
        </div>
      )}

      {/* =====================================================
          BUILDER MODAL
      ===================================================== */}

      <Modal
        open={builderOpen}
        onCancel={closeBuilder}
        footer={null}
        width={selectedType ? 1100 : 900}
        destroyOnClose
        centered
        maskClosable={false}
        title={
          <div
            style={{
              display: "flex",

              alignItems: "center",

              gap: 10,

              fontSize: 18,

              fontWeight: 800,

              color: COLORS.navy,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,

                borderRadius: 10,

                background: COLORS.goldLight,

                display: "flex",

                alignItems: "center",

                justifyContent: "center",

                border: `1px solid ${COLORS.gold}`,
              }}
            >
              <Sparkles
                size={20}
                style={{
                  color: COLORS.gold,
                }}
              />
            </div>

            <span>{editingGame ? "Sửa trò chơi" : "Tạo trò chơi mới"}</span>
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
