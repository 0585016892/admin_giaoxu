import { useEffect, useRef } from "react";

import { notification } from "antd";

import {
  BellOutlined,
  AlertOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  TrophyOutlined,
} from "@ant-design/icons";

import socket from "../socket/socket";

// ============================================================
// ICON
// ============================================================

const getNotificationIcon = (type) => {
  const style = {
    fontSize: 22,
  };

  switch (type) {
    case "attendance":
      return (
        <CheckCircleOutlined
          style={{
            ...style,
            color: "#16A34A",
          }}
        />
      );

    case "schedule":
      return (
        <CalendarOutlined
          style={{
            ...style,
            color: "#2563EB",
          }}
        />
      );

    case "exam":
      return (
        <FileTextOutlined
          style={{
            ...style,
            color: "#7C3AED",
          }}
        />
      );

    case "achievement":
      return (
        <TrophyOutlined
          style={{
            ...style,
            color: "#D4AF37",
          }}
        />
      );

    case "urgent":
      return (
        <AlertOutlined
          style={{
            ...style,
            color: "#DC2626",
          }}
        />
      );

    default:
      return (
        <BellOutlined
          style={{
            ...style,
            color: "#1B365D",
          }}
        />
      );
  }
};

// ============================================================
// COMPONENT
// ============================================================

const NotificationListener = () => {
  const [api, contextHolder] = notification.useNotification();

  const receivedIdsRef = useRef(new Set());

  useEffect(() => {
    // ========================================================
    // RECEIVE NOTIFICATION
    // ========================================================

    const handleNotification = (data = {}) => {
      // ------------------------------------------------------
      // PREVENT DUPLICATE
      // ------------------------------------------------------

      if (data.id && receivedIdsRef.current.has(data.id)) {
        return;
      }

      if (data.id) {
        receivedIdsRef.current.add(data.id);
      }

      // ------------------------------------------------------
      // PRIORITY
      // ------------------------------------------------------

      const isUrgent = data.priority === "urgent";

      // ------------------------------------------------------
      // SHOW ANTD NOTIFICATION
      // ------------------------------------------------------

      api.open({
        key: `notification-${data.id}`,

        message: data.title || "Thông báo mới",

        description: data.content || "Bạn có một thông báo mới",

        icon: getNotificationIcon(isUrgent ? "urgent" : data.type),

        placement: "topRight",

        duration: isUrgent ? 0 : 5,

        style: {
          width: 380,
        },
      });

      // ------------------------------------------------------
      // OPTIONAL SOUND
      // ------------------------------------------------------

      // const audio = new Audio("/notification.mp3");
      // audio.play().catch(() => {});
    };

    // ========================================================
    // SOCKET EVENT
    // ========================================================

    socket.on("notification", handleNotification);

    // ========================================================
    // CLEANUP
    // ========================================================

    return () => {
      socket.off("notification", handleNotification);
    };
  }, [api]);

  return contextHolder;
};

export default NotificationListener;
