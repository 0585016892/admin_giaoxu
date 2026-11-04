import {
  AudioOutlined,
  FileExcelOutlined,
  FileImageOutlined,
  FilePdfOutlined,
  FilePptOutlined,
  FileTextOutlined,
  FileWordOutlined,
  LinkOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";

import { IMAGE_TYPES, VIDEO_TYPES, AUDIO_TYPES } from "./lessonHelpers";

// =========================================================
// FILE EXTENSION
// =========================================================

export const getFileExtension = (resource) => {
  if (!resource) return "";

  if (resource.resource_type === "link") {
    return "link";
  }

  if (resource.file_type) {
    return String(resource.file_type).replace(".", "").toLowerCase();
  }

  const source =
    resource.stored_file_name ||
    resource.file_name ||
    resource.file_url ||
    resource.external_url ||
    "";

  const cleanSource = String(source).split("?")[0].split("#")[0];

  const match = cleanSource.match(/\.([a-zA-Z0-9]+)$/);

  return match ? match[1].toLowerCase() : "";
};

// =========================================================
// FILE SIZE
// =========================================================

export const formatFileSize = (bytes) => {
  if (bytes === null || bytes === undefined || bytes === "") {
    return "";
  }

  const size = Number(bytes);

  if (!Number.isFinite(size)) return "";

  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  if (size < 1024 * 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${(size / (1024 * 1024 * 1024)).toFixed(1)} GB`;
};

// =========================================================
// URL HELPERS
// =========================================================

export const isHttpUrl = (value) => {
  const url = String(value || "").trim();

  if (!url) return false;

  try {
    const parsed = new URL(url);

    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

export const normalizeUrl = (value) => String(value || "").trim();

export const getResourceUrl = (resource) => {
  if (!resource) return "";

  let url = "";

  if (resource.resource_type === "link") {
    url = resource.external_url;
  } else {
    url = resource.file_url || resource.external_url || "";
  }

  url = normalizeUrl(url);

  if (!url) return "";

  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  const base =
    process.env.REACT_APP_FILE_BASE_URL ||
    process.env.REACT_APP_API_ORIGIN ||
    "https://api.amsacviet.online";

  return `${String(base).replace(/\/+$/, "")}/${url.replace(/^\/+/, "")}`;
};

// =========================================================
// RESOURCE STATUS
// =========================================================

export const isResourceActive = (resource) => {
  if (!resource) return false;

  if (resource.is_active === undefined || resource.is_active === null) {
    return true;
  }

  return ![false, 0, "0"].includes(resource.is_active);
};

// =========================================================
// RESOURCE ICON
// =========================================================

export const getResourceIcon = (resource, size = 28) => {
  const extension = getFileExtension(resource);

  const style = {
    fontSize: size,
  };

  if (resource?.resource_type === "link") {
    return (
      <LinkOutlined
        style={{
          ...style,
          color: "#2563EB",
        }}
      />
    );
  }

  if (extension === "pdf") {
    return (
      <FilePdfOutlined
        style={{
          ...style,
          color: "#DC2626",
        }}
      />
    );
  }

  if (["ppt", "pptx"].includes(extension)) {
    return (
      <FilePptOutlined
        style={{
          ...style,
          color: "#EA580C",
        }}
      />
    );
  }

  if (["doc", "docx"].includes(extension)) {
    return (
      <FileWordOutlined
        style={{
          ...style,
          color: "#2563EB",
        }}
      />
    );
  }

  if (["xls", "xlsx"].includes(extension)) {
    return (
      <FileExcelOutlined
        style={{
          ...style,
          color: "#16A34A",
        }}
      />
    );
  }

  if (IMAGE_TYPES.includes(extension)) {
    return (
      <FileImageOutlined
        style={{
          ...style,
          color: "#9333EA",
        }}
      />
    );
  }

  if (VIDEO_TYPES.includes(extension)) {
    return (
      <VideoCameraOutlined
        style={{
          ...style,
          color: "#7C3AED",
        }}
      />
    );
  }

  if (AUDIO_TYPES.includes(extension)) {
    return (
      <AudioOutlined
        style={{
          ...style,
          color: "#0891B2",
        }}
      />
    );
  }

  return (
    <FileTextOutlined
      style={{
        ...style,
        color: "#173B5E",
      }}
    />
  );
};
