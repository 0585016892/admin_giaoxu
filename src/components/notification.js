import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  CheckCircleFilled,
  CloseCircleFilled,
  ExclamationCircleFilled,
  InfoCircleFilled,
  LoadingOutlined,
  CloseOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import "../assets/css/AppNotification.css";
import logo from "../assets/images/logoXn.png";

/**
import { useNotification } from "./notification";
  const notify = useNotification();


 */
const TYPE_CONFIG = {
  success: {
    icon: CheckCircleFilled,
    title: "Thành công",
    className: "fe-notification-success",
    label: "Thành công",
  },
  error: {
    icon: CloseCircleFilled,
    title: "Có lỗi xảy ra",
    className: "fe-notification-error",
    label: "Lỗi",
  },
  warning: {
    icon: ExclamationCircleFilled,
    title: "Cần chú ý",
    className: "fe-notification-warning",
    label: "Cảnh báo",
  },
  info: {
    icon: InfoCircleFilled,
    title: "Thông báo",
    className: "fe-notification-info",
    label: "Thông tin",
  },
  loading: {
    icon: LoadingOutlined,
    title: "Đang xử lý",
    className: "fe-notification-loading",
    label: "Đang xử lý",
  },
};

const NotificationContext = createContext(null);

export function AppNotificationProvider({
  children,
  position = "top-right",
  logoSrc = logo,
  brandName = "FaithEdu",
}) {
  const [notifications, setNotifications] = useState([]);
  const [confirm, setConfirm] = useState(null);
  const idRef = useRef(0);
  const timersRef = useRef(new Map());

  const createId = useCallback(() => {
    idRef.current += 1;
    return `${Date.now()}-${idRef.current}`;
  }, []);

  const remove = useCallback((id) => {
    setNotifications((current) =>
      current.map((item) =>
        item.id === id ? { ...item, closing: true } : item,
      ),
    );

    const oldTimer = timersRef.current.get(`remove-${id}`);
    if (oldTimer) clearTimeout(oldTimer);

    const timer = setTimeout(() => {
      setNotifications((current) => current.filter((item) => item.id !== id));
      timersRef.current.delete(`remove-${id}`);
    }, 240);

    timersRef.current.set(`remove-${id}`, timer);
  }, []);

  const show = useCallback(
    (type, options = {}) => {
      const normalized =
        typeof options === "string" ? { message: options } : options || {};
      const id = createId();
      const config = TYPE_CONFIG[type] || TYPE_CONFIG.info;
      const {
        title,
        message,
        description,
        duration = type === "loading" ? 0 : 4200,
        closable = true,
        onClick,
        action,
        pauseOnHover = true,
      } = normalized;

      const notification = {
        id,
        type: TYPE_CONFIG[type] ? type : "info",
        title: title || config.title,
        message: message || description || "",
        duration,
        closable,
        onClick,
        action,
        pauseOnHover,
        closing: false,
      };

      setNotifications((current) => [...current, notification]);
      return id;
    },
    [createId],
  );

  const update = useCallback((id, options = {}) => {
    setNotifications((current) =>
      current.map((item) => (item.id === id ? { ...item, ...options } : item)),
    );
  }, []);

  const loading = useCallback(
    (options = {}) => show("loading", { duration: 0, ...options }),
    [show],
  );

  const success = useCallback((options) => show("success", options), [show]);
  const error = useCallback((options) => show("error", options), [show]);
  const warning = useCallback((options) => show("warning", options), [show]);
  const info = useCallback((options) => show("info", options), [show]);

  const confirmDialog = useCallback((options = {}) => {
    setConfirm({
      title: options.title || "Xác nhận thao tác",
      message:
        options.message || "Bạn có chắc chắn muốn thực hiện thao tác này?",
      confirmText: options.confirmText || "Xác nhận",
      cancelText: options.cancelText || "Hủy",
      danger: Boolean(options.danger),
      centered: options.centered !== false,
      width: options.width || 440,
      icon: options.icon || null,
      closeOnBackdrop: Boolean(options.closeOnBackdrop),
      closeOnEscape: options.closeOnEscape !== false,
      onConfirm: options.onConfirm,
      onCancel: options.onCancel,
    });
  }, []);

  const closeConfirm = useCallback(() => setConfirm(null), []);

  const destroy = useCallback(() => {
    setNotifications([]);
    timersRef.current.forEach(clearTimeout);
    timersRef.current.clear();
  }, []);

  useEffect(() => {
    const activeIds = new Set(notifications.map((item) => item.id));

    notifications.forEach((item) => {
      if (!item.duration || item.duration <= 0 || item.closing) return;

      const timerKey = `auto-${item.id}`;
      if (timersRef.current.has(timerKey)) return;

      const timer = setTimeout(() => {
        timersRef.current.delete(timerKey);
        remove(item.id);
      }, item.duration);

      timersRef.current.set(timerKey, timer);
    });

    timersRef.current.forEach((timer, key) => {
      if (!key.startsWith("auto-")) return;
      const id = key.slice(5);
      if (!activeIds.has(id)) {
        clearTimeout(timer);
        timersRef.current.delete(key);
      }
    });
  }, [notifications, remove]);

  useEffect(
    () => () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current.clear();
    },
    [],
  );

  const value = {
    show,
    success,
    error,
    warning,
    info,
    loading,
    update,
    remove,
    destroy,
    confirm: confirmDialog,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}

      <div
        className={`fe-notification-container ${position}`}
        aria-live="polite"
        aria-relevant="additions text"
      >
        {notifications.map((item) => (
          <NotificationItem
            key={item.id}
            notification={item}
            logoSrc={logoSrc}
            brandName={brandName}
            onClose={() => remove(item.id)}
            onClick={item.onClick}
          />
        ))}
      </div>

      {confirm && (
        <ConfirmDialog
          {...confirm}
          logoSrc={logoSrc}
          brandName={brandName}
          onClose={closeConfirm}
        />
      )}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotification phải được sử dụng bên trong AppNotificationProvider.",
    );
  }
  return context;
}

function BrandMark({ logoSrc, brandName }) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <div className="fe-brand-mark" title={brandName}>
      {logoSrc && !imageFailed ? (
        <img
          src={logoSrc}
          alt={`${brandName} logo`}
          onError={() => setImageFailed(true)}
        />
      ) : (
        <span className="fe-brand-fallback" aria-hidden="true">
          {brandName?.trim()?.charAt(0)?.toUpperCase() || "F"}
        </span>
      )}
    </div>
  );
}

function NotificationItem({
  notification,
  onClose,
  onClick,
  logoSrc,
  brandName,
}) {
  const {
    type,
    title,
    message,
    duration,
    closable,
    action,
    pauseOnHover,
    closing,
  } = notification;

  const config = TYPE_CONFIG[type] || TYPE_CONFIG.info;
  const Icon = config.icon;
  const [paused, setPaused] = useState(false);

  return (
    <article
      className={`fe-notification ${config.className} ${
        closing ? "is-closing" : "is-entering"
      } ${paused ? "is-paused" : ""}`}
      onMouseEnter={() => pauseOnHover && setPaused(true)}
      onMouseLeave={() => pauseOnHover && setPaused(false)}
      onClick={onClick}
      role={type === "error" ? "alert" : "status"}
    >
      <div className="fe-notification-topline">
        <div className="fe-notification-brand">
          <BrandMark logoSrc={logoSrc} brandName={brandName} />
          <span>{brandName}</span>
        </div>
        <span className="fe-notification-type">{config.label}</span>
        {closable && (
          <button
            type="button"
            className="fe-notification-close"
            onClick={(event) => {
              event.stopPropagation();
              onClose();
            }}
            aria-label="Đóng thông báo"
          >
            <CloseOutlined />
          </button>
        )}
      </div>

      <div className="fe-notification-main">
        <div className="fe-notification-icon">
          <Icon />
        </div>
        <div className="fe-notification-content">
          <div className="fe-notification-title">{title}</div>
          {message && <div className="fe-notification-message">{message}</div>}
          {action && (
            <button
              type="button"
              className="fe-notification-action"
              onClick={(event) => {
                event.stopPropagation();
                action.onClick?.();
              }}
            >
              {action.label}
            </button>
          )}
        </div>
      </div>

      {duration > 0 && (
        <div
          className={`fe-notification-progress ${paused ? "is-paused" : ""}`}
          style={{ animationDuration: `${duration}ms` }}
        />
      )}
    </article>
  );
}

function ConfirmDialog({
  title,
  message,
  confirmText,
  cancelText,
  danger,
  centered = true,
  width = 440,
  icon = null,
  closeOnBackdrop = false,
  closeOnEscape = true,
  onConfirm,
  onCancel,
  onClose,
  logoSrc,
  brandName,
}) {
  const [loadingState, setLoadingState] = useState(false);

  const handleCancel = useCallback(() => {
    if (loadingState) return;
    onCancel?.();
    onClose();
  }, [loadingState, onCancel, onClose]);

  useEffect(() => {
    if (!closeOnEscape) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !loadingState) handleCancel();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [closeOnEscape, loadingState, handleCancel]);

  const handleConfirm = async () => {
    if (loadingState) return;
    if (typeof onConfirm !== "function") {
      onClose();
      return;
    }

    try {
      setLoadingState(true);
      await onConfirm();
      onClose();
    } catch (error) {
      console.error("[AppNotification] confirm error:", error);
      setLoadingState(false);
    }
  };

  return (
    <div className={`fe-confirm-overlay ${centered ? "is-centered" : ""}`}>
      <button
        type="button"
        className="fe-confirm-backdrop"
        aria-label="Đóng hộp thoại"
        onClick={() => closeOnBackdrop && handleCancel()}
      />

      <section
        className="fe-confirm-modal"
        style={{ width: `min(${width}px, calc(100vw - 32px))` }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="fe-confirm-title"
      >
        <div className="fe-confirm-header">
          <div className="fe-confirm-brand">
            <BrandMark logoSrc={logoSrc} brandName={brandName} />
            <div>
              <strong>{brandName}</strong>
              <span>Xác nhận thao tác</span>
            </div>
          </div>
          <button
            type="button"
            className="fe-confirm-close"
            onClick={handleCancel}
            disabled={loadingState}
            aria-label="Đóng"
          >
            <CloseOutlined />
          </button>
        </div>

        <div className="fe-confirm-body">
          <div className={`fe-confirm-icon ${danger ? "danger" : ""}`}>
            {icon ||
              (danger ? <DeleteOutlined /> : <ExclamationCircleFilled />)}
          </div>
          <h2 id="fe-confirm-title">{title}</h2>
          <p>{message}</p>
        </div>

        <div className="fe-confirm-actions">
          <button
            type="button"
            className="fe-confirm-cancel"
            onClick={handleCancel}
            disabled={loadingState}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={`fe-confirm-submit ${danger ? "danger" : ""}`}
            onClick={handleConfirm}
            disabled={loadingState}
          >
            {loadingState ? (
              <>
                <LoadingOutlined spin />
                <span>Đang xử lý...</span>
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </section>
    </div>
  );
}

export default AppNotificationProvider;
