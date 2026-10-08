import React, { useEffect, useMemo, useRef, useState } from "react";

import { Avatar, Button, Input, Tag } from "antd";

import {
  ArrowRightOutlined,
  BarChartOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  RobotOutlined,
  SendOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";

import { chatWithAssistant } from "../../api/assistantApi";
import { useUser } from "../../context/UserContext";

import "./FaithAssistantStyles.css";
import img_bot from "../../assets/images/bot_img.png";

/**
 * ==========================================================
 * CONFIG
 * ==========================================================
 */

const BOT_AVATAR = img_bot;

const MAX_MESSAGES = 100;

const MAX_SUGGESTIONS = 6;

const FLOATING_SIZE = 68;

const FLOATING_GAP = 8;

const FLOATING_POSITION_KEY = "faith_assistant_floating_position";

const QUICK_QUESTIONS = [
  "Làm sao điểm danh bằng QR?",
  "Làm sao thêm học sinh?",
  "Làm sao import học sinh bằng Excel?",
  "Tại sao không quét được QR?",
];

/**
 * ==========================================================
 * WELCOME MESSAGE
 * ==========================================================
 */

const getWelcomeMessage = () => ({
  id: "welcome",
  role: "assistant",
  content:
    "Xin chào! Tôi là Trợ lý FaithEdu.\nTôi có thể hướng dẫn bạn sử dụng hệ thống hoặc tra cứu thông tin giáo lý của giáo xứ.",
  suggestions: [
    {
      id: "welcome-student",
      title: "Tìm một học sinh",
      message: "Tìm học sinh",
    },
    {
      id: "welcome-attendance",
      title: "Xem chuyên cần",
      message: "Thống kê chuyên cần tháng này",
    },
    {
      id: "welcome-class",
      title: "Xem tình hình lớp",
      message: "Tình hình các lớp tháng này",
    },
  ],
});

/**
 * ==========================================================
 * GET USER ID
 * ==========================================================
 */

const getUserId = (user) => {
  if (!user) {
    return null;
  }

  return user?.id || user?.admin_id || user?.user_id || user?.username || null;
};

/**
 * ==========================================================
 * STORAGE
 * ==========================================================
 */

const STORAGE_PREFIX = "faith_assistant_messages";

const getAssistantStorageKey = (user) => {
  const userId = getUserId(user);

  if (!userId) {
    return null;
  }

  return `${STORAGE_PREFIX}_${userId}`;
};

/**
 * ==========================================================
 * LIMIT MESSAGES
 * ==========================================================
 */

const limitMessages = (messages) => {
  if (!Array.isArray(messages)) {
    return [getWelcomeMessage()];
  }

  if (messages.length === 0) {
    return [getWelcomeMessage()];
  }

  return messages.slice(-MAX_MESSAGES);
};

/**
 * ==========================================================
 * LOAD
 * ==========================================================
 */

const loadAssistantMessages = (user) => {
  const storageKey = getAssistantStorageKey(user);

  if (!storageKey) {
    return [getWelcomeMessage()];
  }

  try {
    const savedMessages = localStorage.getItem(storageKey);

    if (!savedMessages) {
      return [getWelcomeMessage()];
    }

    const parsedMessages = JSON.parse(savedMessages);

    if (!Array.isArray(parsedMessages) || parsedMessages.length === 0) {
      return [getWelcomeMessage()];
    }

    return limitMessages(parsedMessages);
  } catch (error) {
    console.warn("[FaithAssistant] Không thể đọc lịch sử:", error);

    return [getWelcomeMessage()];
  }
};

/**
 * ==========================================================
 * SAVE
 * ==========================================================
 */

const saveAssistantMessages = (user, messages) => {
  const storageKey = getAssistantStorageKey(user);

  if (!storageKey) {
    return;
  }

  try {
    const messagesToSave = limitMessages(messages);

    localStorage.setItem(storageKey, JSON.stringify(messagesToSave));
  } catch (error) {
    console.warn("[FaithAssistant] Không thể lưu lịch sử:", error);
  }
};

/**
 * ==========================================================
 * FORMAT HELPERS
 * ==========================================================
 */

const formatNumber = (value) => {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  const number = Number(value);

  if (Number.isNaN(number)) {
    return String(value);
  }

  return new Intl.NumberFormat("vi-VN").format(number);
};

const formatPercent = (value) => {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  const number = Number(value);

  if (Number.isNaN(number)) {
    return String(value);
  }

  return `${number.toFixed(number % 1 === 0 ? 0 : 1)}%`;
};

const formatDate = (value) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString("vi-VN");
};

const formatDateRange = (range) => {
  if (!range) {
    return null;
  }

  if (typeof range === "string") {
    return range;
  }

  const from = range.from || range.start || range.startDate || range.dateFrom;

  const to = range.to || range.end || range.endDate || range.dateTo;

  if (from && to) {
    return `${formatDate(from)} - ${formatDate(to)}`;
  }

  if (from) {
    return `Từ ${formatDate(from)}`;
  }

  if (to) {
    return `Đến ${formatDate(to)}`;
  }

  return null;
};

/**
 * ==========================================================
 * NORMALIZE BLOCK DATA
 * ==========================================================
 */

const normalizeArray = (value) => {
  if (Array.isArray(value)) {
    return value;
  }

  if (Array.isArray(value?.items)) {
    return value.items;
  }

  if (Array.isArray(value?.rows)) {
    return value.rows;
  }

  if (Array.isArray(value?.data)) {
    return value.data;
  }

  return [];
};

const getBlockData = (block) => {
  if (!block) {
    return null;
  }

  if (Object.prototype.hasOwnProperty.call(block, "data")) {
    return block.data;
  }

  return block;
};

/**
 * ==========================================================
 * CLAMP FLOATING POSITION
 * ==========================================================
 */

const clampFloatingPosition = (left, top) => {
  const maxLeft = Math.max(
    FLOATING_GAP,
    window.innerWidth - FLOATING_SIZE - FLOATING_GAP,
  );

  const maxTop = Math.max(
    FLOATING_GAP,
    window.innerHeight - FLOATING_SIZE - FLOATING_GAP,
  );

  return {
    left: Math.min(Math.max(FLOATING_GAP, left), maxLeft),

    top: Math.min(Math.max(FLOATING_GAP, top), maxTop),
  };
};

/**
 * ==========================================================
 * COMPONENT
 * ==========================================================
 */

const FaithAssistant = () => {
  const { user } = useUser();

  /**
   * ========================================================
   * USER AVATAR
   * ========================================================
   */

  const apiUrl = process.env.REACT_APP_API_URL || "";

  const userAvatar = user?.avatar
    ? `${apiUrl}${user.avatar}`
    : `${apiUrl}default.png`;

  /**
   * ========================================================
   * STATE
   * ========================================================
   */

  const [open, setOpen] = useState(false);

  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);

  const [showGreeting, setShowGreeting] = useState(false);

  const [messages, setMessages] = useState([getWelcomeMessage()]);

  const [floatingPosition, setFloatingPosition] = useState(null);

  const [isDragging, setIsDragging] = useState(false);

  /**
   * ========================================================
   * REF
   * ========================================================
   */

  const messagesEndRef = useRef(null);

  const inputRef = useRef(null);

  const floatingRef = useRef(null);

  /**
   * ========================================================
   * DRAG REF
   * ========================================================
   */

  const dragRef = useRef({
    pointerId: null,
    startX: 0,
    startY: 0,
    startLeft: 0,
    startTop: 0,
    moved: false,
  });

  /**
   * ========================================================
   * USER
   * ========================================================
   */

  const userId = getUserId(user);

  /**
   * ========================================================
   * CAN SEND
   * ========================================================
   */

  const canSend = useMemo(() => {
    return message.trim().length > 0 && !loading && !!userId;
  }, [message, loading, userId]);

  /**
   * ========================================================
   * LOAD HISTORY
   * ========================================================
   */

  useEffect(() => {
    if (!userId) {
      setMessages([getWelcomeMessage()]);
      setShowGreeting(false);

      return;
    }

    const restoredMessages = loadAssistantMessages(user);

    setMessages(restoredMessages);

    const timer = setTimeout(() => {
      setShowGreeting(true);
    }, 1200);

    return () => {
      clearTimeout(timer);
    };
  }, [userId, user]);

  /**
   * ========================================================
   * SAVE HISTORY
   * ========================================================
   */

  useEffect(() => {
    if (!userId) {
      return;
    }

    saveAssistantMessages(user, messages);
  }, [messages, userId, user]);

  /**
   * ========================================================
   * AUTO SCROLL
   * ========================================================
   */

  useEffect(() => {
    if (!open) {
      return;
    }

    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    });
  }, [messages, loading, open]);

  /**
   * ========================================================
   * FOCUS
   * ========================================================
   */

  useEffect(() => {
    if (!open) {
      return;
    }

    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 250);

    return () => {
      clearTimeout(timer);
    };
  }, [open]);

  /**
   * ========================================================
   * ESC
   * ========================================================
   */

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape" && open) {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  /**
   * ========================================================
   * LOAD FLOATING POSITION
   * ========================================================
   */

  useEffect(() => {
    try {
      const saved = localStorage.getItem(FLOATING_POSITION_KEY);

      if (!saved) {
        return;
      }

      const parsed = JSON.parse(saved);

      if (typeof parsed?.left !== "number" || typeof parsed?.top !== "number") {
        return;
      }

      const safePosition = clampFloatingPosition(parsed.left, parsed.top);

      setFloatingPosition(safePosition);
    } catch (error) {
      console.warn("[FaithAssistant] Không thể load vị trí floating:", error);
    }
  }, []);

  /**
   * ========================================================
   * SAVE FLOATING POSITION
   * ========================================================
   */

  useEffect(() => {
    if (!floatingPosition) {
      return;
    }

    try {
      localStorage.setItem(
        FLOATING_POSITION_KEY,
        JSON.stringify(floatingPosition),
      );
    } catch (error) {
      console.warn("[FaithAssistant] Không thể lưu vị trí floating:", error);
    }
  }, [floatingPosition]);

  /**
   * ========================================================
   * KEEP FLOATING INSIDE VIEWPORT
   * ========================================================
   */

  useEffect(() => {
    const handleResize = () => {
      if (!floatingPosition) {
        return;
      }

      const nextPosition = clampFloatingPosition(
        floatingPosition.left,
        floatingPosition.top,
      );

      if (
        nextPosition.left !== floatingPosition.left ||
        nextPosition.top !== floatingPosition.top
      ) {
        setFloatingPosition(nextPosition);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [floatingPosition]);

  /**
   * ========================================================
   * POINTER DOWN
   * ========================================================
   */

  const handleFloatingPointerDown = (event) => {
    const element = floatingRef.current;

    if (!element) {
      return;
    }

    /**
     * Chỉ nhận chuột trái.
     */
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    /**
     * Ngăn browser xử lý native drag/select.
     */
    event.preventDefault();

    const rect = element.getBoundingClientRect();

    dragRef.current = {
      pointerId: event.pointerId,

      startX: event.clientX,

      startY: event.clientY,

      startLeft: rect.left,

      startTop: rect.top,

      moved: false,
    };

    try {
      element.setPointerCapture(event.pointerId);
    } catch (error) {}

    setIsDragging(false);
  };

  /**
   * ========================================================
   * POINTER MOVE
   * ========================================================
   */

  const handleFloatingPointerMove = (event) => {
    const element = floatingRef.current;

    if (!element) {
      return;
    }

    const drag = dragRef.current;

    if (drag.pointerId !== event.pointerId) {
      return;
    }

    const deltaX = event.clientX - drag.startX;

    const deltaY = event.clientY - drag.startY;

    /**
     * Chống rung khi click.
     */
    if (!drag.moved && Math.abs(deltaX) < 5 && Math.abs(deltaY) < 5) {
      return;
    }

    drag.moved = true;

    setIsDragging(true);

    const nextPosition = clampFloatingPosition(
      drag.startLeft + deltaX,
      drag.startTop + deltaY,
    );

    setFloatingPosition(nextPosition);

    /**
     * Cực kỳ quan trọng:
     * không cho browser scroll / native drag.
     */
    event.preventDefault();
  };

  /**
   * ========================================================
   * POINTER UP
   * ========================================================
   */

  const handleFloatingPointerUp = (event) => {
    const element = floatingRef.current;

    const drag = dragRef.current;

    if (drag.pointerId !== event.pointerId) {
      return;
    }

    if (drag.moved) {
      event.preventDefault();
      event.stopPropagation();
    }

    try {
      element?.releasePointerCapture?.(event.pointerId);
    } catch (error) {}

    /**
     * Giữ moved=true trong một nhịp
     * để click tiếp theo bị chặn.
     */
    const wasMoved = drag.moved;

    dragRef.current = {
      pointerId: null,
      startX: 0,
      startY: 0,
      startLeft: 0,
      startTop: 0,
      moved: wasMoved,
    };

    setIsDragging(false);
  };

  /**
   * ========================================================
   * POINTER CANCEL
   * ========================================================
   */

  const handleFloatingPointerCancel = (event) => {
    const drag = dragRef.current;

    if (drag.pointerId !== event.pointerId) {
      return;
    }

    dragRef.current = {
      pointerId: null,
      startX: 0,
      startY: 0,
      startLeft: 0,
      startTop: 0,
      moved: false,
    };

    setIsDragging(false);
  };

  /**
   * ========================================================
   * CLICK FLOATING
   * ========================================================
   */

  const handleFloatingClick = (event) => {
    /**
     * Vừa kéo xong:
     * không được mở assistant.
     */
    if (dragRef.current.moved) {
      event.preventDefault();
      event.stopPropagation();

      dragRef.current.moved = false;

      return;
    }

    handleOpen();
  };

  /**
   * ========================================================
   * NATIVE DRAG
   * ========================================================
   */

  const handleFloatingDragStart = (event) => {
    event.preventDefault();
  };

  /**
   * ========================================================
   * RENDER TEXT
   * ========================================================
   */

  const renderMessageContent = (content) => {
    if (!content) {
      return null;
    }

    const lines = String(content).split("\n");

    return lines.map((line, index) => (
      <React.Fragment key={index}>
        {line}

        {index < lines.length - 1 && <br />}
      </React.Fragment>
    ));
  };

  /**
   * ========================================================
   * SEND
   * ========================================================
   */

  const handleSend = async (value = message) => {
    const cleanMessage = String(value || "").trim();

    if (!cleanMessage) {
      return;
    }

    if (loading) {
      return;
    }

    if (!userId) {
      return;
    }

    const userMessage = {
      id: `${Date.now()}-user`,
      role: "user",
      content: cleanMessage,
    };

    setMessages((prev) => [...prev, userMessage]);

    setMessage("");

    setLoading(true);

    try {
      const response = await chatWithAssistant(cleanMessage);

      const data = response || {};

      const blocks = Array.isArray(data?.blocks) ? data.blocks : [];

      const suggestions = Array.isArray(data?.suggestions)
        ? data.suggestions
        : [];

      const normalizedData = data?.data ?? null;

      const assistantMessage = {
        id: `${Date.now()}-assistant`,
        role: "assistant",

        content:
          data?.reply ||
          data?.answer ||
          "Xin lỗi, tôi chưa tìm thấy thông tin phù hợp.",

        intent: data?.intent || "unknown",

        data: normalizedData,

        blocks,

        suggestions: suggestions.slice(0, MAX_SUGGESTIONS),

        article: data?.article || null,

        meta: data?.meta || null,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage = {
        id: `${Date.now()}-error`,

        role: "assistant",

        content:
          error?.response?.data?.message ||
          "Không thể kết nối với Trợ lý FaithEdu. Vui lòng thử lại.",

        blocks: [
          {
            type: "warning",
            data: {
              title: "Không thể kết nối",

              message:
                "Trợ lý đang gặp sự cố khi xử lý yêu cầu. Vui lòng thử lại sau.",
            },
          },
        ],

        suggestions: [
          {
            title: "Thử lại",

            message: cleanMessage,
          },
        ],
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * ========================================================
   * ENTER
   * ========================================================
   */

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();

      handleSend();
    }
  };

  /**
   * ========================================================
   * OPEN
   * ========================================================
   */

  const handleOpen = () => {
    setOpen(true);

    setShowGreeting(false);
  };

  /**
   * ========================================================
   * CLOSE
   * ========================================================
   */

  const handleClose = () => {
    setOpen(false);
  };

  /**
   * ========================================================
   * SUGGESTION TEXT
   * ========================================================
   */

  const getSuggestionText = (suggestion) => {
    if (!suggestion) {
      return "";
    }

    return (
      suggestion.message ||
      suggestion.query ||
      suggestion.title ||
      suggestion.label ||
      ""
    );
  };

  const getSuggestionLabel = (suggestion) => {
    if (!suggestion) {
      return "";
    }

    return (
      suggestion.label ||
      suggestion.title ||
      suggestion.message ||
      suggestion.query ||
      ""
    );
  };

  /**
   * ========================================================
   * BLOCK: STUDENT CARD
   * ========================================================
   */

  const renderStudentCard = (data, index) => {
    if (!data) {
      return null;
    }

    const studentName = data.name || data.student_name || "Học sinh";

    const studentCode = data.code || data.student_code;

    const className = data.class_name || data.className;

    const gender = data.gender_label || data.gender;

    const status = data.status_label || data.status;

    const phone = data.phone || data.student_phone;

    return (
      <div
        key={`student-card-${index}`}
        className="faith-assistant-block student-card"
      >
        <div className="faith-assistant-student-card-top">
          <Avatar
            size={48}
            src={data.avatar || data.avatar_url}
            icon={<UserOutlined />}
          />

          <div className="faith-assistant-student-main">
            <div className="faith-assistant-block-title">{studentName}</div>

            {studentCode && (
              <div className="faith-assistant-muted">
                Mã học sinh: {studentCode}
              </div>
            )}
          </div>
        </div>

        <div className="faith-assistant-info-grid">
          {className && (
            <div>
              <span>Lớp</span>
              <strong>{className}</strong>
            </div>
          )}

          {gender && (
            <div>
              <span>Giới tính</span>
              <strong>{gender}</strong>
            </div>
          )}

          {status && (
            <div>
              <span>Trạng thái</span>
              <strong>{status}</strong>
            </div>
          )}

          {phone && (
            <div>
              <span>Số điện thoại</span>
              <strong>{phone}</strong>
            </div>
          )}
        </div>
      </div>
    );
  };

  /**
   * ========================================================
   * BLOCK: CLASS CARD
   * ========================================================
   */

  const renderClassCard = (data, index) => {
    if (!data) {
      return null;
    }

    const className = data.name || data.class_name || "Lớp";

    const classCode = data.code || data.class_code;

    const studentCount =
      data.student_count ?? data.total_students ?? data.students_count;

    const teacherName = data.teacher_name || data.teacher;

    return (
      <div
        key={`class-card-${index}`}
        className="faith-assistant-block class-card"
      >
        <div className="faith-assistant-class-card-header">
          <div className="faith-assistant-block-icon">
            <TeamOutlined />
          </div>

          <div>
            <div className="faith-assistant-block-title">{className}</div>

            {classCode && (
              <div className="faith-assistant-muted">{classCode}</div>
            )}
          </div>
        </div>

        <div className="faith-assistant-info-grid">
          {studentCount !== undefined && (
            <div>
              <span>Số học sinh</span>

              <strong>{formatNumber(studentCount)}</strong>
            </div>
          )}

          {teacherName && (
            <div>
              <span>Giáo lý viên</span>

              <strong>{teacherName}</strong>
            </div>
          )}

          {data.attendance_rate !== undefined && (
            <div>
              <span>Chuyên cần</span>

              <strong>{formatPercent(data.attendance_rate)}</strong>
            </div>
          )}
        </div>
      </div>
    );
  };

  /**
   * ========================================================
   * BLOCK: STATISTICS
   * ========================================================
   */

  const renderStatistics = (data, index) => {
    if (!data) {
      return null;
    }

    const entries = [
      ["Tổng số", data.total ?? data.total_students ?? data.total_count],

      ["Có mặt", data.present ?? data.present_count],

      ["Đi muộn", data.late ?? data.late_count],

      ["Vắng", data.absent ?? data.absent_count],

      ["Có phép", data.excused ?? data.excused_count],

      ["Chưa điểm danh", data.not_attended ?? data.not_attended_count],

      ["Chuyên cần", data.attendance_rate],
    ].filter(([, value]) => value !== undefined && value !== null);

    if (entries.length === 0) {
      return null;
    }

    return (
      <div
        key={`statistics-${index}`}
        className="faith-assistant-block statistics-block"
      >
        <div className="faith-assistant-block-header">
          <div className="faith-assistant-block-icon">
            <BarChartOutlined />
          </div>

          <div>
            <div className="faith-assistant-block-title">Thống kê</div>

            {data.title && (
              <div className="faith-assistant-muted">{data.title}</div>
            )}
          </div>
        </div>

        <div className="faith-assistant-stat-grid">
          {entries.map(([label, value]) => {
            const isRate = label === "Chuyên cần";

            return (
              <div key={label} className="faith-assistant-stat-item">
                <span>{label}</span>

                <strong>
                  {isRate ? formatPercent(value) : formatNumber(value)}
                </strong>
              </div>
            );
          })}
        </div>

        {data.dateRange && (
          <div className="faith-assistant-block-footer">
            <CalendarOutlined />

            <span>{formatDateRange(data.dateRange)}</span>
          </div>
        )}
      </div>
    );
  };

  /**
   * ========================================================
   * BLOCK: ATTENDANCE SUMMARY
   * ========================================================
   */

  const renderAttendanceSummary = (data, index) => {
    if (!data) {
      return null;
    }

    const items = [
      {
        key: "present",
        label: "Có mặt",
        value: data.present ?? data.present_count ?? 0,
        icon: <CheckCircleOutlined />,
      },

      {
        key: "late",
        label: "Đi muộn",
        value: data.late ?? data.late_count ?? 0,
        icon: <ClockCircleOutlined />,
      },

      {
        key: "absent",
        label: "Vắng",
        value: data.absent ?? data.absent_count ?? 0,
        icon: <ExclamationCircleOutlined />,
      },

      {
        key: "excused",
        label: "Có phép",
        value: data.excused ?? data.excused_count ?? 0,
        icon: <InfoCircleOutlined />,
      },
    ];

    return (
      <div
        key={`attendance-summary-${index}`}
        className="faith-assistant-block attendance-summary"
      >
        <div className="faith-assistant-block-header">
          <div className="faith-assistant-block-icon">
            <CalendarOutlined />
          </div>

          <div>
            <div className="faith-assistant-block-title">Chuyên cần</div>

            {data.title && (
              <div className="faith-assistant-muted">{data.title}</div>
            )}
          </div>
        </div>

        <div className="faith-assistant-attendance-grid">
          {items.map((item) => (
            <div className="faith-assistant-attendance-item" key={item.key}>
              <div className="faith-assistant-attendance-icon">{item.icon}</div>

              <strong>{formatNumber(item.value)}</strong>

              <span>{item.label}</span>
            </div>
          ))}
        </div>

        {data.attendance_rate !== undefined && (
          <div className="faith-assistant-rate">
            <span>Tỷ lệ chuyên cần</span>

            <strong>{formatPercent(data.attendance_rate)}</strong>
          </div>
        )}
      </div>
    );
  };

  /**
   * ========================================================
   * BLOCK: ATTENDANCE LIST
   * ========================================================
   */

  const renderAttendanceList = (data, index) => {
    const items = normalizeArray(data);

    if (!items.length) {
      return null;
    }

    return (
      <div
        key={`attendance-list-${index}`}
        className="faith-assistant-block list-block"
      >
        <div className="faith-assistant-block-header">
          <div className="faith-assistant-block-icon">
            <CalendarOutlined />
          </div>

          <div>
            <div className="faith-assistant-block-title">
              Danh sách điểm danh
            </div>

            <div className="faith-assistant-muted">
              {formatNumber(items.length)} kết quả
            </div>
          </div>
        </div>

        <div className="faith-assistant-list">
          {items.slice(0, 20).map((item, itemIndex) => (
            <div
              className="faith-assistant-list-row"
              key={
                item.id ||
                `${item.student_id}-${item.attendance_date}-${itemIndex}`
              }
            >
              <div>
                <strong>{item.student_name || item.name || "Học sinh"}</strong>

                <span>{item.class_name || item.class || ""}</span>
              </div>

              <div className="faith-assistant-list-right">
                {item.attendance_date && (
                  <span>{formatDate(item.attendance_date)}</span>
                )}

                <Tag>
                  {item.attendance_status_label ||
                    item.status_label ||
                    item.attendance_status ||
                    item.status ||
                    "—"}
                </Tag>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  /**
   * ========================================================
   * BLOCK: STUDENT LIST
   * ========================================================
   */

  const renderStudentList = (data, index) => {
    const items = normalizeArray(data);

    if (!items.length) {
      return null;
    }

    return (
      <div
        key={`student-list-${index}`}
        className="faith-assistant-block list-block"
      >
        <div className="faith-assistant-block-header">
          <div className="faith-assistant-block-icon">
            <UserOutlined />
          </div>

          <div>
            <div className="faith-assistant-block-title">Học sinh</div>

            <div className="faith-assistant-muted">
              {formatNumber(items.length)} kết quả
            </div>
          </div>
        </div>

        <div className="faith-assistant-list">
          {items.slice(0, 20).map((item, itemIndex) => (
            <div
              className="faith-assistant-list-row"
              key={item.id || item.student_id || itemIndex}
            >
              <Avatar
                size={34}
                src={item.avatar || item.avatar_url}
                icon={<UserOutlined />}
              />

              <div className="faith-assistant-list-student">
                <strong>{item.name || item.student_name || "Học sinh"}</strong>

                <span>
                  {item.code || item.student_code || item.class_name || ""}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  /**
   * ========================================================
   * BLOCK: CLASS LIST
   * ========================================================
   */

  const renderClassList = (data, index) => {
    const items = normalizeArray(data);

    if (!items.length) {
      return null;
    }

    return (
      <div
        key={`class-list-${index}`}
        className="faith-assistant-block list-block"
      >
        <div className="faith-assistant-block-header">
          <div className="faith-assistant-block-icon">
            <TeamOutlined />
          </div>

          <div>
            <div className="faith-assistant-block-title">Danh sách lớp</div>

            <div className="faith-assistant-muted">
              {formatNumber(items.length)} lớp
            </div>
          </div>
        </div>

        <div className="faith-assistant-list">
          {items.slice(0, 20).map((item, itemIndex) => (
            <div
              className="faith-assistant-list-row"
              key={item.id || item.class_id || itemIndex}
            >
              <div className="faith-assistant-class-list-icon">
                <TeamOutlined />
              </div>

              <div className="faith-assistant-list-student">
                <strong>{item.name || item.class_name || "Lớp"}</strong>

                <span>{item.code || item.class_code || ""}</span>
              </div>

              {item.attendance_rate !== undefined && (
                <strong>{formatPercent(item.attendance_rate)}</strong>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  /**
   * ========================================================
   * BLOCK: RANKING
   * ========================================================
   */

  const renderRanking = (data, index) => {
    const items = normalizeArray(data);

    if (!items.length) {
      return null;
    }

    return (
      <div
        key={`ranking-${index}`}
        className="faith-assistant-block ranking-block"
      >
        <div className="faith-assistant-block-header">
          <div className="faith-assistant-block-icon">
            <BarChartOutlined />
          </div>

          <div>
            <div className="faith-assistant-block-title">Xếp hạng</div>

            {data?.title && (
              <div className="faith-assistant-muted">{data.title}</div>
            )}
          </div>
        </div>

        <div className="faith-assistant-ranking">
          {items.slice(0, 20).map((item, itemIndex) => {
            const rank = item.rank || item.ranking || itemIndex + 1;

            const name =
              item.name ||
              item.student_name ||
              item.class_name ||
              item.class ||
              "—";

            const rate = item.attendance_rate ?? item.rate ?? item.percentage;

            return (
              <div
                className="faith-assistant-ranking-row"
                key={
                  item.id ||
                  item.student_id ||
                  item.class_id ||
                  `${rank}-${itemIndex}`
                }
              >
                <div className="faith-assistant-rank-number">{rank}</div>

                <div className="faith-assistant-ranking-name">
                  <strong>{name}</strong>

                  {item.class_name && item.student_name && (
                    <span>{item.class_name}</span>
                  )}
                </div>

                {rate !== undefined && (
                  <strong className="faith-assistant-ranking-rate">
                    {formatPercent(rate)}
                  </strong>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  /**
   * ========================================================
   * BLOCK: WARNING / INFO
   * ========================================================
   */

  const renderNotice = (data, index, type) => {
    if (!data) {
      return null;
    }

    const title = data.title || (type === "warning" ? "Lưu ý" : "Thông tin");

    const content = data.message || data.content || data.description || "";

    return (
      <div
        key={`${type}-${index}`}
        className={`faith-assistant-block faith-assistant-notice ${type}`}
      >
        <div className="faith-assistant-notice-icon">
          {type === "warning" ? (
            <ExclamationCircleOutlined />
          ) : (
            <InfoCircleOutlined />
          )}
        </div>

        <div>
          <div className="faith-assistant-block-title">{title}</div>

          {content && (
            <div className="faith-assistant-notice-content">{content}</div>
          )}
        </div>
      </div>
    );
  };

  /**
   * ========================================================
   * RENDER BLOCK
   * ========================================================
   */

  const renderBlock = (block, index) => {
    if (!block) {
      return null;
    }

    const type = block.type || block.blockType || "info";

    const data = getBlockData(block);

    switch (type) {
      case "student_card":
        return renderStudentCard(data, index);

      case "class_card":
        return renderClassCard(data, index);

      case "statistics":
        return renderStatistics(data, index);

      case "attendance_summary":
        return renderAttendanceSummary(data, index);

      case "attendance_list":
        return renderAttendanceList(data, index);

      case "student_list":
        return renderStudentList(data, index);

      case "class_list":
        return renderClassList(data, index);

      case "ranking":
        return renderRanking(data, index);

      case "warning":
        return renderNotice(data, index, "warning");

      case "info":
        return renderNotice(data, index, "info");

      default:
        return null;
    }
  };

  /**
   * ========================================================
   * RENDER META
   * ========================================================
   */

  const renderMeta = (meta) => {
    if (!meta) {
      return null;
    }

    const dateRange = formatDateRange(meta.dateRange || meta.date_range);

    if (!dateRange) {
      return null;
    }

    return (
      <div className="faith-assistant-meta">
        <CalendarOutlined />

        <span>{dateRange}</span>
      </div>
    );
  };

  /**
   * ========================================================
   * RENDER SUGGESTIONS
   * ========================================================
   */

  const renderSuggestions = (suggestions) => {
    if (!Array.isArray(suggestions) || suggestions.length === 0) {
      return null;
    }

    return (
      <div className="faith-assistant-suggestions">
        {suggestions.slice(0, MAX_SUGGESTIONS).map((suggestion, index) => {
          const label = getSuggestionLabel(suggestion);

          const value = getSuggestionText(suggestion);

          if (!label || !value) {
            return null;
          }

          return (
            <button
              type="button"
              key={suggestion.id || `${label}-${index}`}
              onClick={() => handleSend(value)}
              className="faith-assistant-suggestion"
              disabled={loading}
            >
              <span>{label}</span>

              <ArrowRightOutlined />
            </button>
          );
        })}
      </div>
    );
  };

  /**
   * ========================================================
   * RENDER ASSISTANT EXTRAS
   * ========================================================
   */

  const renderAssistantExtras = (item) => {
    if (!item) {
      return null;
    }

    return (
      <>
        {Array.isArray(item.blocks) && item.blocks.length > 0 && (
          <div className="faith-assistant-blocks">
            {item.blocks.map((block, index) => renderBlock(block, index))}
          </div>
        )}

        {renderMeta(item.meta)}

        {renderSuggestions(item.suggestions)}
      </>
    );
  };

  /**
   * ========================================================
   * RENDER
   * ========================================================
   */

  return (
    <>
      {/* ====================================================
          FLOATING ASSISTANT
      ==================================================== */}

      {!open && userId && (
        <>
          {showGreeting && (
            <div
              className="faith-assistant-greeting"
              style={
                floatingPosition
                  ? {
                      left: `${floatingPosition.left - 300}px`,
                      top: `${Math.max(8, floatingPosition.top - 92)}px`,
                      right: "auto",
                      bottom: "auto",
                    }
                  : undefined
              }
            >
              <button
                type="button"
                className="faith-assistant-greeting-close"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();

                  setShowGreeting(false);
                }}
                aria-label="Đóng lời chào"
              >
                <CloseOutlined />
              </button>

              <button
                type="button"
                className="faith-assistant-greeting-content"
                onClick={handleOpen}
              >
                <span className="faith-assistant-greeting-title">
                  Hôm nay bạn cần giúp gì?
                </span>

                <span className="faith-assistant-greeting-subtitle">
                  Tôi có thể hướng dẫn hoặc tra cứu thông tin FaithEdu
                </span>
              </button>
            </div>
          )}

          <div
            ref={floatingRef}
            className={`faith-assistant-floating-wrapper ${
              isDragging ? "is-dragging" : ""
            }`}
            style={
              floatingPosition
                ? {
                    left: `${floatingPosition.left}px`,
                    top: `${floatingPosition.top}px`,
                    right: "auto",
                    bottom: "auto",
                  }
                : undefined
            }
            onPointerDown={handleFloatingPointerDown}
            onPointerMove={handleFloatingPointerMove}
            onPointerUp={handleFloatingPointerUp}
            onPointerCancel={handleFloatingPointerCancel}
            onClick={handleFloatingClick}
            onDragStart={handleFloatingDragStart}
          >
            <button
              type="button"
              className="faith-assistant-floating"
              aria-label="Mở Trợ lý FaithEdu"
              tabIndex={0}
              onDragStart={handleFloatingDragStart}
            >
              <div className="faith-assistant-floating-ring" />

              <img
                src={BOT_AVATAR}
                alt="Trợ lý FaithEdu"
                className="faith-assistant-floating-image"
                draggable={false}
              />

              <span className="faith-assistant-floating-badge">
                <RobotOutlined />
              </span>
            </button>
          </div>
        </>
      )}

      {/* ====================================================
          CHAT OVERLAY
      ==================================================== */}

      {open && (
        <div
          className="faith-assistant-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              handleClose();
            }
          }}
        >
          <div
            className="faith-assistant-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Trợ lý FaithEdu"
          >
            {/* =================================================
                HEADER
            ================================================= */}

            <div className="faith-assistant-header">
              <div className="faith-assistant-header-left">
                <div className="faith-assistant-header-avatar">
                  <img src={BOT_AVATAR} alt="FaithEdu Assistant" />

                  <span className="faith-assistant-online-dot" />
                </div>

                <div className="faith-assistant-header-info">
                  <div className="faith-assistant-title">Trợ lý FaithEdu</div>

                  <div className="faith-assistant-status">
                    <span className="faith-assistant-status-dot" />
                    Đang hỗ trợ bạn
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="faith-assistant-close"
                onClick={handleClose}
                aria-label="Đóng Trợ lý"
              >
                <CloseOutlined />
              </button>
            </div>

            {/* =================================================
                BODY
            ================================================= */}

            <div className="faith-assistant-body">
              <div className="faith-assistant-message-list">
                {messages.map((item) => {
                  const isUser = item.role === "user";

                  return (
                    <div
                      key={item.id}
                      className={`faith-assistant-message-row ${
                        isUser ? "is-user" : "is-assistant"
                      }`}
                    >
                      {!isUser && (
                        <div className="faith-assistant-message-avatar">
                          <img src={BOT_AVATAR} alt="Bot" />
                        </div>
                      )}

                      <div className="faith-assistant-message-wrapper">
                        <div className="faith-assistant-message">
                          <div className="faith-assistant-message-content">
                            {renderMessageContent(item.content)}
                          </div>
                        </div>

                        {!isUser && renderAssistantExtras(item)}
                      </div>

                      {isUser && (
                        <div className="faith-assistant-message-avatar user">
                          <img
                            src={userAvatar}
                            alt="Bạn"
                            onError={(event) => {
                              event.currentTarget.src = `${apiUrl}default.png`;
                            }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* =================================================
                    QUICK QUESTIONS
                ================================================= */}

                {messages.length === 1 && !loading && (
                  <div className="faith-assistant-quick">
                    <div className="faith-assistant-quick-title">
                      Bạn có thể hỏi tôi:
                    </div>

                    <div className="faith-assistant-quick-list">
                      {QUICK_QUESTIONS.map((question) => (
                        <button
                          type="button"
                          key={question}
                          onClick={() => handleSend(question)}
                          className="faith-assistant-quick-button"
                          disabled={loading}
                        >
                          <span>{question}</span>

                          <ArrowRightOutlined />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* =================================================
                    TYPING
                ================================================= */}

                {loading && (
                  <div className="faith-assistant-message-row is-assistant">
                    <div className="faith-assistant-message-avatar">
                      <img src={BOT_AVATAR} alt="Bot" />
                    </div>

                    <div className="faith-assistant-message-wrapper">
                      <div className="faith-assistant-message typing">
                        <div className="faith-assistant-typing">
                          <span />
                          <span />
                          <span />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* =================================================
                INPUT
            ================================================= */}

            <div className="faith-assistant-input-area">
              <div className="faith-assistant-input-wrapper">
                <Input.TextArea
                  ref={inputRef}
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Bạn cần hỗ trợ điều gì?"
                  autoSize={{
                    minRows: 1,
                    maxRows: 4,
                  }}
                  maxLength={500}
                  disabled={loading}
                  className="faith-assistant-textarea"
                />

                <Button
                  type="primary"
                  className="faith-assistant-send"
                  disabled={!canSend}
                  onClick={() => handleSend()}
                  icon={<SendOutlined />}
                />
              </div>

              <div className="faith-assistant-input-hint">
                Nhấn Enter để gửi · Shift + Enter để xuống dòng
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FaithAssistant;
