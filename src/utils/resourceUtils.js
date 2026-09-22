export const IMAGE_EXTENSIONS = [
  "jpg",
  "jpeg",
  "png",
  "gif",
  "webp",
  "svg",
  "bmp",
];

export const VIDEO_EXTENSIONS = ["mp4", "webm", "mov", "m4v"];

export const AUDIO_EXTENSIONS = ["mp3", "wav", "ogg", "m4a", "aac"];

export const OFFICE_EXTENSIONS = ["doc", "docx", "xls", "xlsx", "ppt", "pptx"];

export const getResourceExtension = (resource) => {
  if (!resource) return "";

  if (resource.file_type) {
    return String(resource.file_type).replace(".", "").toLowerCase();
  }

  const source =
    resource.stored_file_name ||
    resource.file_name ||
    resource.file_url ||
    resource.external_url ||
    "";

  const match = String(source).match(/\.([a-zA-Z0-9]+)(?:\?.*)?$/);

  return match ? match[1].toLowerCase() : "";
};

export const getResourceUrl = (resource) => {
  if (!resource) return "";

  const url = resource.external_url || resource.file_url || "";

  if (!url) return "";

  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  const base = process.env.REACT_APP_API_URL || "https://api.amsacviet.online";

  return `${base.replace(/\/$/, "")}/${String(url).replace(/^\//, "")}`;
};

export const getResourceKind = (resource) => {
  if (!resource) return "unsupported";

  if (resource.resource_type === "link" || resource.external_url) {
    return "link";
  }

  const extension = getResourceExtension(resource);

  const mime = String(resource.mime_type || "").toLowerCase();

  if (mime === "application/pdf" || extension === "pdf") {
    return "pdf";
  }

  if (mime.startsWith("image/") || IMAGE_EXTENSIONS.includes(extension)) {
    return "image";
  }

  if (mime.startsWith("video/") || VIDEO_EXTENSIONS.includes(extension)) {
    return "video";
  }

  if (mime.startsWith("audio/") || AUDIO_EXTENSIONS.includes(extension)) {
    return "audio";
  }

  if (OFFICE_EXTENSIONS.includes(extension)) {
    return "office";
  }

  return "unsupported";
};

export const formatFileSize = (bytes) => {
  if (bytes === null || bytes === undefined || bytes === "") {
    return "";
  }

  const size = Number(bytes);

  if (!Number.isFinite(size)) {
    return "";
  }

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

export const getResourceTypeLabel = (resource) => {
  const extension = getResourceExtension(resource);

  if (!extension) {
    return "Tài liệu";
  }

  return extension.toUpperCase();
};
