import React, { useMemo, useState, useEffect } from "react";
import {
  LinkOutlined,
  ExportOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { Button, Alert, Spin } from "antd";

/**
 * =========================================================
 * LẤY YOUTUBE VIDEO ID
 * Hỗ trợ:
 * https://www.youtube.com/watch?v=xxxxx
 * https://youtu.be/xxxxx
 * https://www.youtube.com/shorts/xxxxx
 * https://www.youtube.com/embed/xxxxx
 * =========================================================
 */
const getYouTubeVideoId = (url) => {
  if (!url) return null;

  try {
    const parsed = new URL(url);

    // youtube.com/watch?v=xxxxx
    if (
      parsed.hostname.includes("youtube.com") &&
      parsed.pathname === "/watch"
    ) {
      return parsed.searchParams.get("v");
    }

    // youtu.be/xxxxx
    if (parsed.hostname === "youtu.be") {
      return parsed.pathname.replace("/", "").split("?")[0];
    }

    // youtube.com/shorts/xxxxx
    if (parsed.hostname.includes("youtube.com")) {
      const shortsMatch = parsed.pathname.match(/^\/shorts\/([^/]+)/);
      if (shortsMatch) {
        return shortsMatch[1];
      }
    }

    // youtube.com/embed/xxxxx
    if (parsed.hostname.includes("youtube.com")) {
      const embedMatch = parsed.pathname.match(/^\/embed\/([^/]+)/);
      if (embedMatch) {
        return embedMatch[1];
      }
    }

    return null;
  } catch {
    return null;
  }
};

/**
 * =========================================================
 * CHUYỂN LINK YOUTUBE → LINK EMBED
 * =========================================================
 */
const getYouTubeEmbedUrl = (url) => {
  const videoId = getYouTubeVideoId(url);
  if (!videoId) {
    return null;
  }
  return `https://www.youtube.com/embed/${videoId}?rel=0`;
};

/**
 * =========================================================
 * KIỂM TRA VÀ CHUẨN HÓA URL
 * =========================================================
 */
const normalizeAndValidateUrl = (inputUrl) => {
  if (!inputUrl) return { isValid: false, url: "" };
  let trimmed = String(inputUrl).trim();

  // Tự động thêm https:// nếu người dùng quên nhập giao thức
  if (!/^https?:\/\//i.test(trimmed)) {
    trimmed = `https://${trimmed}`;
  }

  try {
    const parsed = new URL(trimmed);
    const isValid = parsed.protocol === "http:" || parsed.protocol === "https:";
    return { isValid, url: trimmed };
  } catch {
    return { isValid: false, url: trimmed };
  }
};

/**
 * =========================================================
 * LINK VIEWER
 * =========================================================
 */
const LinkViewer = ({ resource, url }) => {
  const [loading, setLoading] = useState(true);
  const [iframeError, setIframeError] = useState(false);
  const [keyReload, setKeyReload] = useState(0); // Dùng để ép iframe remount khi bấm Tải lại

  const { isValid: isValidFormat, url: normalizedUrl } = useMemo(() => {
    return normalizeAndValidateUrl(url);
  }, [url]);

  /**
   * =======================================================
   * XÁC ĐỊNH URL HIỂN THỊ (HỖ TRỢ EMBED YOUTUBE HOẶC URL THƯỜNG)
   * =======================================================
   */
  const embedUrl = useMemo(() => {
    if (!normalizedUrl) return null;
    const youtubeUrl = getYouTubeEmbedUrl(normalizedUrl);
    if (youtubeUrl) {
      return youtubeUrl;
    }
    return normalizedUrl;
  }, [normalizedUrl]);

  /**
   * =======================================================
   * CƠ CHẾ TIMEOUT AN TOÀN (PHÒNG TRƯỜNG HỢP TRANG BỊ CHẶN IFRAME)
   * Nhiều trang web chặn iframe âm thầm khiến sự kiện onLoad không bao giờ chạy,
   * làm giao diện bị kẹt ở trạng thái "Đang tải tài liệu...".
   * =======================================================
   */
  useEffect(() => {
    if (!loading || !isValidFormat || iframeError) return;

    const timer = setTimeout(() => {
      // Sau 6 giây nếu iframe vẫn chưa load xong, tắt vòng xoay loading để giao diện mượt mà
      setLoading(false);
    }, 6000);

    return () => clearTimeout(timer);
  }, [loading, isValidFormat, iframeError, keyReload]);

  /**
   * =======================================================
   * MỞ LINK NGOÀI
   * =======================================================
   */
  const openLink = () => {
    if (!normalizedUrl) return;
    window.open(normalizedUrl, "_blank", "noopener,noreferrer");
  };

  /**
   * =======================================================
   * KHÔNG CÓ ĐƯỜNG DẪN
   * =======================================================
   */
  if (!url || !String(url).trim()) {
    return (
      <div className="resource-viewer-empty">Không có đường dẫn tài liệu</div>
    );
  }

  /**
   * =======================================================
   * URL KHÔNG HỢP LỆ
   * =======================================================
   */
  if (!isValidFormat) {
    return (
      <div className="resource-link-viewer">
        <div className="resource-link-card">
          <div className="resource-link-icon">
            <LinkOutlined />
          </div>

          <h2>{resource?.title || "Tài liệu liên kết"}</h2>

          <Alert
            type="error"
            showIcon
            message="Đường dẫn không hợp lệ"
            description="Vui lòng kiểm tra lại đường dẫn tài liệu."
          />

          <Button
            type="primary"
            icon={<ExportOutlined />}
            onClick={openLink}
            style={{ marginTop: 20 }}
          >
            Mở liên kết
          </Button>
        </div>
      </div>
    );
  }

  /**
   * =======================================================
   * NẾU IFRAME BỊ CHẶN HOẶC KHÔNG LOAD ĐƯỢC
   * =======================================================
   */
  if (iframeError) {
    return (
      <div className="resource-link-viewer">
        <div className="resource-link-card">
          <div className="resource-link-icon">
            <LinkOutlined />
          </div>

          <h2>{resource?.title || "Tài liệu liên kết"}</h2>

          {resource?.description && <p>{resource.description}</p>}

          <Alert
            type="warning"
            showIcon
            message="Không thể hiển thị trực tiếp"
            description="Website này không cho phép nhúng nội dung trực tiếp trong FaithEdu. Bạn có thể mở tài liệu ở tab mới."
          />

          <Button
            type="primary"
            size="large"
            icon={<ExportOutlined />}
            onClick={openLink}
            style={{ marginTop: 20 }}
          >
            Mở liên kết
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="resource-link-viewer">
      {/* =====================================================
          HEADER
      ====================================================== */}
      <div className="resource-link-header">
        <div className="resource-link-header-left">
          <div className="resource-link-header-icon">
            <LinkOutlined />
          </div>

          <div>
            <h2>{resource?.title || "Tài liệu liên kết"}</h2>
            {resource?.description && <p>{resource.description}</p>}
          </div>
        </div>

        <Button icon={<ExportOutlined />} onClick={openLink}>
          Mở tab mới
        </Button>
      </div>

      {/* =====================================================
          VIEWER
      ====================================================== */}
      <div className="resource-link-frame-wrapper">
        {loading && (
          <div className="resource-link-loading">
            <Spin size="large" />
            <span>Đang tải tài liệu...</span>
          </div>
        )}

        <iframe
          key={keyReload}
          src={embedUrl}
          title={resource?.title || "Tài liệu liên kết"}
          className="resource-link-frame"
          onLoad={() => setLoading(false)}
          onError={() => {
            setLoading(false);
            setIframeError(true);
          }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>

      {/* =====================================================
          FOOTER
      ====================================================== */}
      <div className="resource-link-footer">
        <div className="resource-link-url">
          <LinkOutlined />
          <span title={normalizedUrl}>{normalizedUrl}</span>
        </div>

        <Button
          type="text"
          icon={<ReloadOutlined />}
          onClick={() => {
            setLoading(true);
            setIframeError(false);
            setKeyReload((prev) => prev + 1); // Thay đổi key giúp reload lại hoàn toàn iframe
          }}
        >
          Tải lại
        </Button>
      </div>
    </div>
  );
};

export default LinkViewer;
