import React, { useCallback, useEffect, useMemo, useState } from "react";

import {
  Button,
  Card,
  Col,
  Empty,
  Input,
  Pagination,
  Popconfirm,
  Row,
  Select,
  Spin,
  Tag,
  Tooltip,
  Upload,
  message,
} from "antd";

import {
  AppstoreOutlined,
  ArrowLeftOutlined,
  AudioOutlined,
  BookOutlined,
  CheckCircleOutlined,
  DeleteOutlined,
  DownloadOutlined,
  EyeOutlined,
  FileExcelOutlined,
  FileImageOutlined,
  FilePdfOutlined,
  FilePptOutlined,
  FileTextOutlined,
  FileWordOutlined,
  FolderOpenOutlined,
  InboxOutlined,
  MenuOutlined,
  MoreOutlined,
  ReloadOutlined,
  SearchOutlined,
  UploadOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";

import { useNavigate } from "react-router-dom";

import {
  getLessons,
  getLessonTypes,
  getLessonResources,
  uploadLessonResource,
  deleteLessonResource,
  getQuestionsByLesson,
} from "../../api/lessonApi";

import "../../assets/css/LessonLibraryPage.css";
import AppFormModal from "../../components/common/AppFormModal";
import AppButton from "../../components/common/AppButton";

/* =========================================================
   CONSTANTS
========================================================= */

const RESOURCE_VIEWER_BASE_PATH = "/catechist/resources";

const DEFAULT_PAGE_SIZE = 12;

const PAGE_SIZE_OPTIONS = ["12", "24", "48"];

const TYPE_LABELS = {
  khai_tam: "Giáo lý Khai tâm",
  du_tong: "Giáo lý Dự tòng",
  hon_nhan: "Giáo lý Hôn nhân",
  huynh_truong: "Giáo lý Huynh trưởng",
  them_suc: "Giáo lý Thêm sức",
  thanh_the: "Giáo lý Thánh Thể",
  xung_toi: "Giáo lý Xưng tội",
};

const CATEGORY_LABELS = {
  presentation: "Bài trình chiếu",
  teacher_material: "Tài liệu giáo lý viên",
  lesson_plan: "Giáo án",
  worksheet: "Phiếu học tập",
  reference: "Tài liệu tham khảo",
  media: "Media",
  other: "Khác",
};

const CATEGORY_OPTIONS = [
  {
    value: "presentation",
    label: "Bài trình chiếu",
  },
  {
    value: "teacher_material",
    label: "Tài liệu giáo lý viên",
  },
  {
    value: "lesson_plan",
    label: "Giáo án",
  },
  {
    value: "worksheet",
    label: "Phiếu học tập",
  },
  {
    value: "reference",
    label: "Tài liệu tham khảo",
  },
  {
    value: "media",
    label: "Media",
  },
  {
    value: "other",
    label: "Khác",
  },
];

const IMAGE_TYPES = ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"];

const VIDEO_TYPES = ["mp4", "webm", "mov", "m4v"];

const AUDIO_TYPES = ["mp3", "wav", "ogg", "m4a", "aac"];

/* =========================================================
   HELPERS
========================================================= */

const getTypeLabel = (type) => {
  if (!type) {
    return "Chưa phân loại";
  }

  if (TYPE_LABELS[type]) {
    return TYPE_LABELS[type];
  }

  return String(type)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const getArrayData = (response, keys = []) => {
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

const getFileExtension = (resource) => {
  if (!resource) {
    return "";
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

const formatFileSize = (bytes) => {
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

const getResourceIcon = (resource, size = 28) => {
  const extension = getFileExtension(resource);

  const style = {
    fontSize: size,
  };

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

const getResourceUrl = (resource) => {
  if (!resource) {
    return "";
  }

  const url =
    resource.resource_type === "link"
      ? resource.external_url
      : resource.file_url || resource.external_url;

  if (!url) {
    return "";
  }

  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  const base =
    process.env.REACT_APP_FILE_BASE_URL ||
    process.env.REACT_APP_API_ORIGIN ||
    "https://api.amsacviet.online";

  return `${base.replace(/\/$/, "")}/${String(url).replace(/^\//, "")}`;
};

/* =========================================================
   COMPONENT
========================================================= */

const LessonLibraryPage = () => {
  const navigate = useNavigate();

  const [messageApi, contextHolder] = message.useMessage();

  /* =======================================================
     STATE
  ======================================================= */

  const [loading, setLoading] = useState(true);

  const [resourceLoading, setResourceLoading] = useState(false);

  const [lessons, setLessons] = useState([]);

  const [lessonTypes, setLessonTypes] = useState([]);

  const [selectedType, setSelectedType] = useState(null);

  const [selectedLesson, setSelectedLesson] = useState(null);

  const [resources, setResources] = useState([]);

  const [searchText, setSearchText] = useState("");

  const [sortType, setSortType] = useState("name");

  const [viewMode, setViewMode] = useState("grid");

  const [currentPage, setCurrentPage] = useState(1);

  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const [uploadOpen, setUploadOpen] = useState(false);

  const [uploading, setUploading] = useState(false);

  const [selectedFile, setSelectedFile] = useState(null);

  const [menuLessonId, setMenuLessonId] = useState(null);

  const [uploadData, setUploadData] = useState({
    title: "",
    description: "",
    resource_category: "teacher_material",
    sort_order: 0,
    visibility: "public",
    is_downloadable: true,
  });
  const [questions, setQuestions] = useState([]);
  const [questionLoading, setQuestionLoading] = useState(false);
  /* =======================================================
     LOAD LESSONS
  ======================================================= */

  const loadLessons = useCallback(async () => {
    try {
      setLoading(true);

      const response = await getLessons({
        catechism_type: selectedType || undefined,
      });

      const data = getArrayData(response?.data, ["lessons"]);

      setLessons(data);
    } catch (error) {
      console.error("Load lessons error:", error);

      messageApi.error(
        error?.response?.data?.message || "Không thể tải danh sách bài học",
      );
    } finally {
      setLoading(false);
    }
  }, [selectedType, messageApi]);

  /* =======================================================
     LOAD TYPES
  ======================================================= */

  const loadLessonTypes = useCallback(async () => {
    try {
      const response = await getLessonTypes();

      const data = getArrayData(response?.data, ["types", "lessonTypes"]);

      setLessonTypes(data);
    } catch (error) {
      console.error("Load lesson types error:", error);
    }
  }, []);

  /* =======================================================
     LOAD RESOURCES
  ======================================================= */

  const loadResources = useCallback(
    async (lessonId) => {
      if (!lessonId) {
        setResources([]);
        setQuestions([]);
        return;
      }

      try {
        setResourceLoading(true);
        setQuestionLoading(true);

        const [resourceResponse, questionResponse] = await Promise.all([
          getLessonResources(lessonId),
          getQuestionsByLesson(lessonId),
        ]);

        const resourceData = getArrayData(resourceResponse?.data, [
          "resources",
        ]);

        const questionData = getArrayData(questionResponse?.data, [
          "questions",
        ]);

        setResources(resourceData);
        setQuestions(questionData);
      } catch (error) {
        console.error("Load lesson resources/questions error:", error);

        messageApi.error(
          error?.response?.data?.message || "Không thể tải dữ liệu bài học",
        );

        setResources([]);
        setQuestions([]);
      } finally {
        setResourceLoading(false);
        setQuestionLoading(false);
      }
    },
    [messageApi],
  );

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    loadLessons();
    loadLessonTypes();
  }, [loadLessons, loadLessonTypes]);

  useEffect(() => {
    if (selectedLesson?.id) {
      loadResources(selectedLesson.id);
    } else {
      setResources([]);
    }
  }, [selectedLesson?.id, loadResources]);

  /* =======================================================
     RESET PAGE WHEN FILTER CHANGES
  ======================================================= */

  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, selectedType, sortType]);

  /* =======================================================
     TYPE OPTIONS
  ======================================================= */

  const typeOptions = useMemo(() => {
    if (lessonTypes.length) {
      return lessonTypes
        .map((item) => {
          if (typeof item === "string") {
            return {
              value: item,
              label: getTypeLabel(item),
            };
          }

          const value =
            item.value || item.type || item.catechism_type || item.key;

          return {
            value,
            label: item.label || item.name || getTypeLabel(value),
          };
        })
        .filter((item) => item.value);
    }

    const uniqueTypes = [
      ...new Set(lessons.map((item) => item.catechism_type).filter(Boolean)),
    ];

    return uniqueTypes.map((type) => ({
      value: type,
      label: getTypeLabel(type),
    }));
  }, [lessonTypes, lessons]);

  /* =======================================================
     FILTER + SORT LESSONS
  ======================================================= */

  const filteredLessons = useMemo(() => {
    let result = [...lessons];

    if (selectedType) {
      result = result.filter(
        (lesson) => lesson.catechism_type === selectedType,
      );
    }

    const keyword = searchText.trim().toLowerCase();

    if (keyword) {
      result = result.filter((lesson) => {
        const title = String(lesson.title || "").toLowerCase();

        const id = String(lesson.id || "").toLowerCase();

        return title.includes(keyword) || id.includes(keyword);
      });
    }

    if (sortType === "name") {
      result.sort((a, b) =>
        String(a.title || "").localeCompare(String(b.title || ""), "vi"),
      );
    }

    if (sortType === "newest") {
      result.sort((a, b) => {
        const dateA = new Date(a.created_at || a.updated_at || 0).getTime();

        const dateB = new Date(b.created_at || b.updated_at || 0).getTime();

        if (dateA && dateB && dateA !== dateB) {
          return dateB - dateA;
        }

        return Number(b.id || 0) - Number(a.id || 0);
      });
    }

    if (sortType === "oldest") {
      result.sort((a, b) => {
        const dateA = new Date(a.created_at || a.updated_at || 0).getTime();

        const dateB = new Date(b.created_at || b.updated_at || 0).getTime();

        if (dateA && dateB && dateA !== dateB) {
          return dateA - dateB;
        }

        return Number(a.id || 0) - Number(b.id || 0);
      });
    }

    return result;
  }, [lessons, selectedType, searchText, sortType]);

  /* =======================================================
     PAGINATION
  ======================================================= */

  const paginatedLessons = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;

    return filteredLessons.slice(startIndex, startIndex + pageSize);
  }, [filteredLessons, currentPage, pageSize]);

  /* =======================================================
     LESSON
  ======================================================= */

  const openLesson = (lesson) => {
    setSelectedLesson(lesson);
    setResources([]);
    setMenuLessonId(null);
  };

  const backToLibrary = () => {
    setSelectedLesson(null);
    setResources([]);
    setMenuLessonId(null);
  };

  /* =======================================================
     RESOURCE VIEWER
     MỞ PAGE, KHÔNG MODAL
  ======================================================= */

  const openResourceViewer = (resource) => {
    if (!resource?.id) {
      messageApi.warning("Không xác định được tài liệu");
      return;
    }

    const url = getResourceUrl(resource);

    if (resource.resource_type !== "link" && !url) {
      messageApi.info("Tài liệu chưa có file");
      return;
    }

    navigate(`${RESOURCE_VIEWER_BASE_PATH}/${resource.id}`);
  };

  /* =======================================================
     UPLOAD MODAL
  ======================================================= */

  const openUploadModal = () => {
    if (!selectedLesson) {
      messageApi.info("Vui lòng mở một bài học trước");
      return;
    }

    setSelectedFile(null);

    setUploadData({
      title: "",
      description: "",
      resource_category: "teacher_material",
      sort_order: resources.length,
      visibility: "public",
      is_downloadable: true,
    });

    setUploadOpen(true);
  };

  const handleBeforeUpload = (file) => {
    const maxSize = 100 * 1024 * 1024;

    if (file.size > maxSize) {
      messageApi.error("File không được vượt quá 100MB");

      return Upload.LIST_IGNORE;
    }

    setSelectedFile(file);

    if (!uploadData.title) {
      const fileName = file.name.replace(/\.[^/.]+$/, "");

      setUploadData((prev) => ({
        ...prev,
        title: fileName,
      }));
    }

    return false;
  };

  const handleUpload = async () => {
    if (!selectedLesson) {
      return;
    }

    if (!selectedFile) {
      messageApi.warning("Vui lòng chọn file");
      return;
    }

    if (!uploadData.title.trim()) {
      messageApi.warning("Vui lòng nhập tên tài liệu");
      return;
    }

    const formData = new FormData();

    formData.append("title", uploadData.title.trim());

    formData.append("description", uploadData.description || "");

    formData.append("resource_category", uploadData.resource_category);

    formData.append("sort_order", String(uploadData.sort_order || 0));

    formData.append("visibility", uploadData.visibility);

    formData.append("is_downloadable", uploadData.is_downloadable ? "1" : "0");

    formData.append("file", selectedFile);

    try {
      setUploading(true);

      await uploadLessonResource(selectedLesson.id, formData);

      messageApi.success("Tải tài liệu thành công");

      setUploadOpen(false);
      setSelectedFile(null);

      await loadResources(selectedLesson.id);
    } catch (error) {
      console.error("Upload resource error:", error);

      messageApi.error(
        error?.response?.data?.message || "Không thể tải tài liệu lên",
      );
    } finally {
      setUploading(false);
    }
  };

  /* =======================================================
     DELETE
  ======================================================= */

  const handleDelete = async (resource) => {
    try {
      await deleteLessonResource(resource.id);

      messageApi.success("Đã xóa tài liệu");

      await loadResources(selectedLesson.id);
    } catch (error) {
      console.error("Delete resource error:", error);

      messageApi.error(
        error?.response?.data?.message || "Không thể xóa tài liệu",
      );
    }
  };

  /* =======================================================
     TOGGLE STATUS
  ======================================================= */

  /* =======================================================
     DOWNLOAD
  ======================================================= */

  const downloadResource = (resource) => {
    const url = getResourceUrl(resource);

    if (!url) {
      messageApi.info("Tài liệu chưa có file");
      return;
    }

    window.open(url, "_blank", "noopener,noreferrer");
  };

  /* =======================================================
     LESSON LIST
  ======================================================= */

  const renderLessonGrid = () => {
    if (!filteredLessons.length) {
      return (
        <div className="ll-empty">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Không tìm thấy bài học"
          />
        </div>
      );
    }

    /* =========================
       LIST
    ========================= */

    if (viewMode === "list") {
      return (
        <>
          <div className="ll-list">
            {paginatedLessons.map((lesson) => (
              <div
                className="ll-list-item"
                key={lesson.id}
                onClick={() => openLesson(lesson)}
              >
                <div className="ll-list-icon">
                  <FolderOpenOutlined />
                </div>

                <div className="ll-list-content">
                  <div className="ll-list-title">
                    {lesson.title || `Bài học #${lesson.id}`}
                  </div>

                  <div className="ll-list-meta">
                    FOLDER
                    <span>•</span>
                    Tài liệu
                  </div>
                </div>

                <div className="ll-list-type">
                  {getTypeLabel(lesson.catechism_type)}
                </div>

                <div className="ll-more-wrapper">
                  <Button
                    type="text"
                    className="ll-more-button"
                    icon={<MoreOutlined />}
                    onClick={(event) => {
                      event.stopPropagation();

                      setMenuLessonId(
                        menuLessonId === lesson.id ? null : lesson.id,
                      );
                    }}
                  />

                  {menuLessonId === lesson.id && (
                    <div
                      className="ll-action-menu"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setMenuLessonId(null);
                          openLesson(lesson);
                        }}
                      >
                        <EyeOutlined />
                        <span>Xem chi tiết</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setMenuLessonId(null);
                          openLesson(lesson);
                        }}
                      >
                        <FolderOpenOutlined />
                        <span>Mở bài học</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setMenuLessonId(null);

                          messageApi.info(
                            "Chức năng chỉnh sửa sẽ được bổ sung.",
                          );
                        }}
                      >
                        <BookOutlined />
                        <span>Chỉnh sửa</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setMenuLessonId(null);

                          messageApi.info(
                            "Chức năng sao chép sẽ được bổ sung.",
                          );
                        }}
                      >
                        <BookOutlined />
                        <span>Sao chép</span>
                      </button>

                      <div className="ll-action-divider" />

                      <button
                        type="button"
                        className="danger"
                        onClick={() => {
                          setMenuLessonId(null);

                          messageApi.info("Chức năng xóa sẽ được bổ sung.");
                        }}
                      >
                        <DeleteOutlined />
                        <span>Xóa</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {renderPagination()}
        </>
      );
    }

    /* =========================
       GRID
    ========================= */

    return (
      <>
        <div className="ll-grid">
          {paginatedLessons.map((lesson) => (
            <div
              className="ll-file-card"
              key={lesson.id}
              onClick={() => openLesson(lesson)}
            >
              <div className="ll-file-preview">
                <div className="ll-folder-graphic">
                  <div className="ll-folder-back" />

                  <div className="ll-folder-front">
                    <span />
                  </div>
                </div>
              </div>

              <div className="ll-file-info">
                <div className="ll-file-row">
                  <div className="ll-small-folder">
                    <FolderOpenOutlined />
                  </div>

                  <div className="ll-file-name">
                    {lesson.title || `Bài học #${lesson.id}`}
                  </div>

                  <div className="ll-more-wrapper">
                    <Button
                      type="text"
                      className="ll-more-button"
                      icon={<MoreOutlined />}
                      onClick={(event) => {
                        event.stopPropagation();

                        setMenuLessonId(
                          menuLessonId === lesson.id ? null : lesson.id,
                        );
                      }}
                    />

                    {menuLessonId === lesson.id && (
                      <div
                        className="ll-action-menu"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setMenuLessonId(null);
                            openLesson(lesson);
                          }}
                        >
                          <EyeOutlined />
                          <span>Xem chi tiết</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setMenuLessonId(null);
                            openLesson(lesson);
                          }}
                        >
                          <FolderOpenOutlined />
                          <span>Mở bài học</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setMenuLessonId(null);

                            messageApi.info(
                              "Chức năng chỉnh sửa sẽ được bổ sung.",
                            );
                          }}
                        >
                          <BookOutlined />
                          <span>Chỉnh sửa</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setMenuLessonId(null);

                            messageApi.info(
                              "Chức năng sao chép sẽ được bổ sung.",
                            );
                          }}
                        >
                          <BookOutlined />
                          <span>Sao chép</span>
                        </button>

                        <div className="ll-action-divider" />

                        <button
                          type="button"
                          className="danger"
                          onClick={() => {
                            setMenuLessonId(null);

                            messageApi.info("Chức năng xóa sẽ được bổ sung.");
                          }}
                        >
                          <DeleteOutlined />
                          <span>Xóa</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="ll-file-meta">
                  <span>FOLDER</span>
                  <span>•</span>
                  <span>Tài liệu</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {renderPagination()}
      </>
    );
  };

  /* =======================================================
     PAGINATION UI
  ======================================================= */

  const renderPagination = () => {
    if (filteredLessons.length <= pageSize) {
      return null;
    }

    return (
      <div className="ll-pagination">
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={filteredLessons.length}
          showSizeChanger
          pageSizeOptions={PAGE_SIZE_OPTIONS}
          showTotal={(total, range) =>
            `${range[0]}-${range[1]} / ${total} bài học`
          }
          onChange={(page, size) => {
            if (size !== pageSize) {
              setPageSize(size);
              setCurrentPage(1);
              return;
            }

            setCurrentPage(page);
          }}
        />
      </div>
    );
  };

  /* =======================================================
     RESOURCES
  ======================================================= */

  const renderResources = () => {
    if (resourceLoading) {
      return (
        <div className="ll-resource-loading">
          <Spin size="large" />
        </div>
      );
    }

    if (!resources.length) {
      return (
        <div className="ll-resource-empty">
          <div className="ll-empty-icon">
            <InboxOutlined />
          </div>

          <h3>Chưa có tài liệu</h3>

          <p>
            Thêm giáo án, PowerPoint, PDF, Word, hình ảnh hoặc video cho bài học
            này.
          </p>

          <AppButton
            shape="circle"
            icon={<UploadOutlined />}
            onClick={openUploadModal}
          />
        </div>
      );
    }

    return (
      <div className="ll-resource-list">
        {resources.map((resource) => {
          const resourceUrl = getResourceUrl(resource);

          const canView = Boolean(
            resource.id && (resourceUrl || resource.resource_type === "link"),
          );

          const isActive =
            resource.is_active === undefined
              ? true
              : Boolean(resource.is_active);

          return (
            <div
              key={resource.id}
              className={`ll-resource ${
                !isActive ? "ll-resource-disabled" : ""
              }`}
            >
              {/* ICON */}

              <div className="ll-resource-icon">
                {getResourceIcon(resource, 30)}
              </div>

              {/* MAIN */}

              <div className="ll-resource-main">
                <div className="ll-resource-title">
                  <span>
                    {resource.title || resource.file_name || "Tài liệu"}
                  </span>

                  {!isActive && <Tag>Đã tắt</Tag>}
                </div>

                <div className="ll-resource-description">
                  {resource.description ||
                    resource.file_name ||
                    "Tài liệu bài học"}
                </div>

                <div className="ll-resource-meta">
                  <Tag>
                    {CATEGORY_LABELS[resource.resource_category] ||
                      resource.resource_category ||
                      "Tài liệu"}
                  </Tag>

                  {resource.file_type && (
                    <span>{String(resource.file_type).toUpperCase()}</span>
                  )}

                  {resource.file_size && (
                    <span>{formatFileSize(resource.file_size)}</span>
                  )}
                </div>
              </div>

              {/* ACTIONS */}

              <div className="ll-resource-actions">
                {canView && (
                  <>
                    <Tooltip title="Xem tài liệu">
                      <AppButton
                        variant="secondary"
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => openResourceViewer(resource)}
                      />
                    </Tooltip>

                    {resourceUrl && (
                      <Tooltip title="Tải xuống">
                        <AppButton
                          variant="secondary"
                          size="small"
                          icon={<DownloadOutlined />}
                          onClick={() => downloadResource(resource)}
                        />
                      </Tooltip>
                    )}
                  </>
                )}

                <Popconfirm
                  title="Xóa tài liệu?"
                  description="File sẽ bị xóa khỏi hệ thống."
                  okText="Xóa"
                  cancelText="Hủy"
                  okButtonProps={{
                    danger: true,
                  }}
                  onConfirm={() => handleDelete(resource)}
                >
                  <Tooltip title="Xóa">
                    <AppButton danger size="small" icon={<DeleteOutlined />} />
                  </Tooltip>
                </Popconfirm>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <>
      {contextHolder}

      <div className="lesson-library-page">
        {/* =================================================
            LIBRARY HEADER
        ================================================= */}

        {!selectedLesson && (
          <>
            <div className="ll-topbar">
              {/* SEARCH */}

              <div className="ll-search-box">
                <Input
                  allowClear
                  prefix={<SearchOutlined />}
                  placeholder="Tìm kiếm bài học..."
                  value={searchText}
                  onChange={(event) => setSearchText(event.target.value)}
                />
              </div>

              {/* SORT */}

              <Select
                className="ll-sort-select"
                value={sortType}
                onChange={setSortType}
                options={[
                  {
                    value: "name",
                    label: "Sắp xếp theo tên",
                  },
                  {
                    value: "newest",
                    label: "Mới nhất",
                  },
                  {
                    value: "oldest",
                    label: "Cũ nhất",
                  },
                ]}
              />

              {/* TYPE */}

              <Select
                className="ll-type-filter"
                allowClear
                showSearch
                optionFilterProp="label"
                placeholder="Tất cả chương trình"
                value={selectedType}
                onChange={setSelectedType}
                options={typeOptions}
                suffixIcon={<BookOutlined />}
              />

              {/* VIEW MODE */}

              <div className="ll-view-toggle">
                <button
                  type="button"
                  className={`ll-view-button ${
                    viewMode === "grid" ? "active" : ""
                  }`}
                  onClick={() => setViewMode("grid")}
                >
                  <AppstoreOutlined />
                </button>

                <button
                  type="button"
                  className={`ll-view-button ${
                    viewMode === "list" ? "active" : ""
                  }`}
                  onClick={() => setViewMode("list")}
                >
                  <MenuOutlined />
                </button>
              </div>

              {/* CREATE */}

              <AppButton
                icon={<UploadOutlined />}
                onClick={() =>
                  messageApi.info("Vui lòng mở một bài học để thêm tài liệu.")
                }
              />
            </div>

            {/* PAGE HEADING */}

            <div className="ll-page-heading">
              <div>
                <h1>Thư viện giáo lý</h1>

                <p>{filteredLessons.length} bài học</p>
              </div>
            </div>
          </>
        )}

        {/* =================================================
            LESSON DETAIL HEADER
        ================================================= */}

        {selectedLesson && (
          <div className="ll-detail-header">
            <div className="ll-detail-left">
              <AppButton
                variant="secondary"
                size="small"
                icon={<ArrowLeftOutlined />}
                onClick={backToLibrary}
              >
                Quay lại
              </AppButton>
              <div className="ll-detail-info">
                <div className="ll-detail-icon">
                  <FolderOpenOutlined />
                </div>

                <div>
                  <div className="ll-detail-type">
                    {getTypeLabel(selectedLesson.catechism_type)}
                  </div>

                  <h2>{selectedLesson.title}</h2>
                </div>
              </div>
            </div>

            <AppButton
              variant="secondary"
              size="small"
              icon={<UploadOutlined />}
              onClick={openUploadModal}
            >
              Thêm tài liệu
            </AppButton>
          </div>
        )}

        {/* =================================================
            LESSON GRID
        ================================================= */}

        {!selectedLesson && (
          <>
            {loading ? (
              <div className="ll-resource-loading">
                <Spin size="large" />
              </div>
            ) : (
              renderLessonGrid()
            )}
          </>
        )}

        {/* =================================================
            RESOURCES
        ================================================= */}

        {selectedLesson && (
          <Card bordered={false} className="ll-resources-card">
            <div className="ll-resources-header">
              <div>
                <h3>Tài liệu bài học</h3>

                <span>{resources.length} tài liệu</span>
              </div>

              <AppButton
                variant="secondary"
                size="small"
                icon={<ReloadOutlined />}
                onClick={() => loadResources(selectedLesson.id)}
              >
                Làm mới
              </AppButton>
            </div>

            {renderResources()}

            {/* CÂU HỎI KIẾN THỨC */}
            <div className="ll-knowledge-section">
              <div className="ll-knowledge-header">
                <div className="ll-knowledge-title-wrapper">
                  <div className="ll-knowledge-icon">
                    <BookOutlined />
                  </div>

                  <div>
                    <h3>Câu hỏi kiến thức</h3>
                    <p>Kiểm tra kiến thức của bài học</p>
                  </div>
                </div>

                <div className="ll-knowledge-count">
                  <strong>{questions.length}</strong>
                  <span>câu hỏi</span>
                </div>
              </div>

              <div className="ll-knowledge-body">
                {questionLoading ? (
                  <div className="ll-question-loading">
                    <Spin size="small" />
                    <span>Đang tải câu hỏi...</span>
                  </div>
                ) : questions.length === 0 ? (
                  <div className="ll-question-empty">
                    <div className="ll-question-empty-icon">
                      <BookOutlined />
                    </div>

                    <div>
                      <strong>Chưa có câu hỏi</strong>
                      <p>Bài học này hiện chưa có câu hỏi kiến thức.</p>
                    </div>
                  </div>
                ) : (
                  <div className="ll-question-ready">
                    <div className="ll-question-info">
                      <CheckCircleOutlined />

                      <div>
                        <strong>Có {questions.length} câu hỏi kiến thức</strong>

                        <p>Làm bài để kiểm tra kiến thức của bài học này.</p>
                      </div>
                    </div>

                    <AppButton
                      variant="secondary"
                      size="small"
                      icon={<BookOutlined />}
                      onClick={() =>
                        navigate(
                          `/catechist/questions/play/${selectedLesson.id}`,
                        )
                      }
                    >
                      {" "}
                      Làm câu hỏi
                    </AppButton>
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* =================================================
            UPLOAD MODAL
        ================================================= */}

        <AppFormModal
          title="Thêm tài liệu bài học"
          subtitle="Thêm giáo trình, quản lý tài liệu bài học"
          onCancel={() => {
            if (!uploading) {
              setUploadOpen(false);
            }
          }}
          onOk={handleUpload}
          confirmLoading={uploading}
          okText="Tải lên"
          cancelText="Hủy"
          width={550}
          className="catechist-modal"
          open={uploadOpen}
        >
          <div>
            {/* TITLE */}

            <div className="ll-form-label">Tên tài liệu</div>

            <Input
              size="large"
              placeholder="VD: Giáo án Bài 1 - Hôn nhân"
              value={uploadData.title}
              onChange={(event) =>
                setUploadData((prev) => ({
                  ...prev,
                  title: event.target.value,
                }))
              }
            />

            {/* DESCRIPTION */}

            <div className="ll-form-label">Mô tả</div>

            <Input.TextArea
              rows={3}
              placeholder="Mô tả ngắn về tài liệu..."
              value={uploadData.description}
              onChange={(event) =>
                setUploadData((prev) => ({
                  ...prev,
                  description: event.target.value,
                }))
              }
            />

            {/* CATEGORY + ORDER */}

            <Row gutter={14}>
              <Col xs={24} sm={16}>
                <div className="ll-form-label">Loại tài liệu</div>

                <Select
                  size="large"
                  style={{
                    width: "100%",
                  }}
                  value={uploadData.resource_category}
                  options={CATEGORY_OPTIONS}
                  onChange={(value) =>
                    setUploadData((prev) => ({
                      ...prev,
                      resource_category: value,
                    }))
                  }
                />
              </Col>

              <Col xs={24} sm={8}>
                <div className="ll-form-label">Thứ tự</div>

                <Input
                  size="large"
                  type="number"
                  min={0}
                  value={uploadData.sort_order}
                  onChange={(event) =>
                    setUploadData((prev) => ({
                      ...prev,
                      sort_order: Number(event.target.value),
                    }))
                  }
                />
              </Col>
            </Row>

            {/* FILE */}

            <div className="ll-form-label">File tài liệu</div>

            <Upload.Dragger
              multiple={false}
              maxCount={1}
              accept={[
                ".ppt",
                ".pptx",
                ".pdf",
                ".doc",
                ".docx",
                ".xls",
                ".xlsx",
                ".jpg",
                ".jpeg",
                ".png",
                ".gif",
                ".webp",
                ".svg",
                ".mp4",
                ".webm",
                ".mov",
                ".mp3",
                ".wav",
                ".ogg",
                ".m4a",
                ".zip",
              ].join(",")}
              fileList={
                selectedFile
                  ? [
                      {
                        uid: "-1",
                        name: selectedFile.name,
                        status: "done",
                      },
                    ]
                  : []
              }
              beforeUpload={handleBeforeUpload}
              onRemove={() => {
                setSelectedFile(null);
              }}
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>

              <p className="ant-upload-text">
                Kéo file vào đây hoặc click để chọn
              </p>

              <p className="ant-upload-hint">
                PPT, PPTX, PDF, DOC, DOCX, XLS, XLSX, hình ảnh, video, audio,
                ZIP
              </p>

              <p className="ant-upload-hint">Dung lượng tối đa: 100MB</p>
            </Upload.Dragger>

            {/* NOTE */}

            <div className="ll-upload-note">
              <strong>Bài học:</strong> {selectedLesson?.title}
            </div>
          </div>
        </AppFormModal>
      </div>
    </>
  );
};

export default LessonLibraryPage;
