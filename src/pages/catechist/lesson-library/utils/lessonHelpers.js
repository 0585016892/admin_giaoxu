// =========================================================
// LESSON CONSTANTS
// =========================================================

export const RESOURCE_VIEWER_BASE_PATH = "/catechist/resources";

export const DEFAULT_PAGE_SIZE = 12;

export const PAGE_SIZE_OPTIONS = ["12", "24", "48"];

export const MAX_FILE_SIZE = 100 * 1024 * 1024;

// =========================================================
// RESOURCE CATEGORIES
// =========================================================

export const CATEGORY_LABELS = {
  presentation: "Bài trình chiếu",
  teacher_material: "Tài liệu giáo lý viên",
  lesson_plan: "Giáo án",
  worksheet: "Phiếu học tập",
  reference: "Tài liệu tham khảo",
  media: "Media",
  other: "Khác",
};

export const CATEGORY_OPTIONS = Object.entries(CATEGORY_LABELS).map(
  ([value, label]) => ({
    value,
    label,
  }),
);

// =========================================================
// FILE TYPES
// =========================================================

export const IMAGE_TYPES = ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"];

export const VIDEO_TYPES = ["mp4", "webm", "mov", "m4v"];

export const AUDIO_TYPES = ["mp3", "wav", "ogg", "m4a", "aac"];

// =========================================================
// UPLOAD DEFAULT
// =========================================================

export const getDefaultUploadData = (sortOrder = 0) => ({
  title: "",
  description: "",
  resource_category: "teacher_material",
  sort_order: sortOrder,
  visibility: "public",
  is_downloadable: true,
  external_url: "",
});

// =========================================================
// API RESPONSE HELPER
// =========================================================

export const getArrayData = (response, keys = []) => {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  for (const key of keys) {
    if (Array.isArray(response?.[key])) {
      return response[key];
    }
  }

  if (
    response?.data &&
    typeof response.data === "object" &&
    !Array.isArray(response.data)
  ) {
    for (const key of keys) {
      if (Array.isArray(response.data?.[key])) {
        return response.data[key];
      }
    }
  }

  return [];
};
