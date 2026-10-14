import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
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
  LinkOutlined,
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
  getLessonResources,
  uploadLessonResource,
  deleteLessonResource,
  getQuestionsByLesson,
  getLessonPrograms,
} from "../../api/lessonApi";

import "../../assets/css/LessonLibraryPage.css";
import lessonCardCover from "../../assets/images/faith-library-card-cover.png";

import AppFormModal from "../../components/common/AppFormModal";

import AppButton from "../../components/common/AppButton";

import { useNotification } from "../../components/notification";

/* =========================================================

   CONSTANTS

\========================================================= */

const RESOURCE_VIEWER_BASE_PATH = "/catechist/resources";

const DEFAULT_PAGE_SIZE = 12;

const PAGE_SIZE_OPTIONS = ["12", "24", "48"];

const MAX_FILE_SIZE = 100 * 1024 * 1024;

const CATEGORY_LABELS = {
  presentation: "Bài trình chiếu",

  teacher_material: "Tài liệu giáo lý viên",

  lesson_plan: "Giáo án",

  worksheet: "Phiếu học tập",

  reference: "Tài liệu tham khảo",

  media: "Media",

  other: "Khác",
};

const CATEGORY_OPTIONS = Object.entries(CATEGORY_LABELS).map(
  ([value, label]) => ({
    value,

    label,
  }),
);

const IMAGE_TYPES = ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"];

const VIDEO_TYPES = ["mp4", "webm", "mov", "m4v"];

const AUDIO_TYPES = ["mp3", "wav", "ogg", "m4a", "aac"];

/* =========================================================

   UPLOAD DEFAULTS

\========================================================= */

const getDefaultUploadData = (sortOrder = 0) => ({
  title: "",

  description: "",

  resource_category: "teacher_material",

  sort_order: sortOrder,

  visibility: "public",

  is_downloadable: true,

  external_url: "",
});

/* =========================================================

   HELPERS

\========================================================= */

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

const formatFileSize = (bytes) => {
  if (bytes === null || bytes === undefined || bytes === "") {
    return "";
  }

  const size = Number(bytes);

  if (!Number.isFinite(size)) return "";

  if (size < 1024) return `${size} B`;

  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;

  if (size < 1024 * 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${(size / (1024 * 1024 * 1024)).toFixed(1)} GB`;
};

const isHttpUrl = (value) => {
  const url = String(value || "").trim();

  if (!url) return false;

  try {
    const parsed = new URL(url);

    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

const normalizeUrl = (value) => String(value || "").trim();

const getResourceUrl = (resource) => {
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

const isResourceActive = (resource) => {
  if (!resource) return false;

  if (resource.is_active === undefined || resource.is_active === null) {
    return true;
  }

  return ![false, 0, "0"].includes(resource.is_active);
};

const getResourceIcon = (resource, size = 28) => {
  const extension = getFileExtension(resource);

  const style = { fontSize: size };

  if (resource?.resource_type === "link") {
    return <LinkOutlined style={{ ...style, color: "#2563EB" }} />;
  }

  if (extension === "pdf") {
    return <FilePdfOutlined style={{ ...style, color: "#DC2626" }} />;
  }

  if (["ppt", "pptx"].includes(extension)) {
    return <FilePptOutlined style={{ ...style, color: "#EA580C" }} />;
  }

  if (["doc", "docx"].includes(extension)) {
    return <FileWordOutlined style={{ ...style, color: "#2563EB" }} />;
  }

  if (["xls", "xlsx"].includes(extension)) {
    return <FileExcelOutlined style={{ ...style, color: "#16A34A" }} />;
  }

  if (IMAGE_TYPES.includes(extension)) {
    return <FileImageOutlined style={{ ...style, color: "#9333EA" }} />;
  }

  if (VIDEO_TYPES.includes(extension)) {
    return <VideoCameraOutlined style={{ ...style, color: "#7C3AED" }} />;
  }

  if (AUDIO_TYPES.includes(extension)) {
    return <AudioOutlined style={{ ...style, color: "#0891B2" }} />;
  }

  return <FileTextOutlined style={{ ...style, color: "#173B5E" }} />;
};

/* =========================================================

   COMPONENT

\========================================================= */

const LessonLibraryPage = () => {
  const navigate = useNavigate();

  const notify = useNotification();

  /*

   * Dùng ref để callback không phụ thuộc identity của notify.

   * Tránh effect gọi API lặp nếu useNotification trả object mới

   * sau mỗi lần render.

   */

  const notifyRef = useRef(notify);

  notifyRef.current = notify;

  /* =======================================================

     MAIN STATE

  \======================================================= */

  const [loading, setLoading] = useState(false);

  const [programs, setPrograms] = useState([]);

  const [selectedProgram, setSelectedProgram] = useState(null);

  const [lessons, setLessons] = useState([]);

  const [selectedLesson, setSelectedLesson] = useState(null);

  const [searchText, setSearchText] = useState("");

  const [sortType, setSortType] = useState("name");

  const [viewMode, setViewMode] = useState("list");

  const [currentPage, setCurrentPage] = useState(1);

  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  /* =======================================================

     RESOURCES & QUESTIONS

  \======================================================= */

  const [resourceLoading, setResourceLoading] = useState(false);

  const [resources, setResources] = useState([]);

  const [questions, setQuestions] = useState([]);

  const [questionLoading, setQuestionLoading] = useState(false);

  /* =======================================================

     UPLOAD

  \======================================================= */

  const [uploadOpen, setUploadOpen] = useState(false);

  const [uploading, setUploading] = useState(false);

  const [selectedFile, setSelectedFile] = useState(null);

  const [uploadData, setUploadData] = useState(getDefaultUploadData());

  const [menuLessonId, setMenuLessonId] = useState(null);

  /* =======================================================

     LOAD PROGRAMS

     Chỉ gọi khi mở thư viện, không tải danh sách bài học

     khi người dùng chưa chọn chương trình.

  \======================================================= */

  const loadPrograms = useCallback(async () => {
    try {
      setLoading(true);

      const response = await getLessonPrograms();

      const data = getArrayData(response.data, ["programs"]);

      setPrograms(data);
    } catch (error) {
      notifyRef.current.error(
        error?.response?.data?.message ||
          "Không thể tải danh sách chương trình giáo lý",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPrograms();
  }, [loadPrograms]);

  /* =======================================================

     LOAD LESSONS BY PROGRAM

     Không lọc theo catechism_type.

  \======================================================= */

  const loadLessons = useCallback(async (programId) => {
    if (!programId) {
      setLessons([]);

      return;
    }

    try {
      setLoading(true);

      const response = await getLessons({
        program_id: programId,
      });

      const data = getArrayData(response.data.data, ["lessons"]);

      setLessons(data);
    } catch (error) {
      setLessons([]);

      notifyRef.current.error(
        error?.response?.data?.message || "Không thể tải danh sách bài học",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!selectedProgram?.id) {
      setLessons([]);

      return;
    }

    setCurrentPage(1);

    setSearchText("");

    setSelectedLesson(null);

    setResources([]);

    setQuestions([]);

    setMenuLessonId(null);

    loadLessons(selectedProgram.id);
  }, [selectedProgram?.id, loadLessons]);

  /* =======================================================

     LOAD RESOURCES AND QUESTIONS

  \======================================================= */

  const loadResources = useCallback(async (lessonId) => {
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

      const resourceData = getArrayData(resourceResponse?.data?.data, [
        "resources",
      ]);

      const questionData = getArrayData(questionResponse?.data, ["questions"]);

      setResources(resourceData);

      setQuestions(questionData);
    } catch (error) {
      setResources([]);

      setQuestions([]);

      notifyRef.current.error(
        error?.response?.data?.message || "Không thể tải dữ liệu bài học",
      );
    } finally {
      setResourceLoading(false);

      setQuestionLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedLesson?.id) {
      loadResources(selectedLesson.id);
    } else {
      setResources([]);

      setQuestions([]);
    }
  }, [selectedLesson?.id, loadResources]);

  /* =======================================================

     PROGRAM NAVIGATION

  \======================================================= */

  const openProgram = (program) => {
    if (!program?.id) {
      notifyRef.current.warning("Chương trình giáo lý không hợp lệ");

      return;
    }

    setSelectedProgram(program);

    setSelectedLesson(null);

    setLessons([]);

    setResources([]);

    setQuestions([]);

    setSearchText("");

    setCurrentPage(1);

    setMenuLessonId(null);
  };

  const backToPrograms = () => {
    setSelectedProgram(null);

    setSelectedLesson(null);

    setLessons([]);

    setResources([]);

    setQuestions([]);

    setSearchText("");

    setCurrentPage(1);

    setMenuLessonId(null);
  };

  /* =======================================================

     LESSON NAVIGATION

  \======================================================= */

  const openLesson = (lesson) => {
    if (!lesson?.id) {
      notifyRef.current.warning("Không xác định được bài học");

      return;
    }

    setSelectedLesson(lesson);

    setResources([]);

    setQuestions([]);

    setMenuLessonId(null);
  };

  const backToLibrary = () => {
    setSelectedLesson(null);

    setResources([]);

    setQuestions([]);

    setMenuLessonId(null);
  };

  /* =======================================================

     SEARCH, SORT AND PAGINATION

     Chỉ tìm kiếm trong danh sách bài học của chương trình

     đang chọn. Không lọc catechism_type.

  \======================================================= */

  const filteredLessons = useMemo(() => {
    let result = [...lessons];

    const keyword = String(searchText || "")
      .trim()

      .toLowerCase();

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
  }, [lessons, searchText, sortType]);

  const paginatedLessons = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;

    return filteredLessons.slice(startIndex, startIndex + pageSize);
  }, [filteredLessons, currentPage, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, sortType, pageSize]);

  /* =======================================================

     RESOURCE VIEWER

  \======================================================= */

  const openResourceViewer = (resource) => {
    if (!resource?.id) {
      notifyRef.current.warning("Không xác định được tài liệu");

      return;
    }

    const url = getResourceUrl(resource);

    if (resource.resource_type !== "link" && !url) {
      notifyRef.current.info("Tài liệu chưa có file");

      return;
    }

    navigate(`${RESOURCE_VIEWER_BASE_PATH}/${resource.id}`);
  };

  /* =======================================================

     UPLOAD MODAL

  \======================================================= */

  const openUploadModal = () => {
    if (!selectedLesson) {
      notifyRef.current.info("Vui lòng mở một bài học trước");

      return;
    }

    setSelectedFile(null);

    setUploadData(getDefaultUploadData(resources.length));

    setUploadOpen(true);
  };

  const closeUploadModal = () => {
    if (uploading) return;

    setUploadOpen(false);

    setSelectedFile(null);

    setUploadData(getDefaultUploadData());
  };

  const handleExternalUrlChange = (event) => {
    const value = event?.target?.value || "";

    setUploadData((prev) => ({
      ...prev,

      external_url: value,
    }));

    if (String(value).trim() && selectedFile) {
      setSelectedFile(null);
    }
  };

  const handleBeforeUpload = (file) => {
    const externalUrl = normalizeUrl(uploadData?.external_url);

    if (externalUrl) {
      notifyRef.current.info(
        "Bạn đang sử dụng đường link. Hãy xóa đường link nếu muốn tải file.",
      );

      return Upload.LIST_IGNORE;
    }

    if (Number(file?.size || 0) > MAX_FILE_SIZE) {
      notifyRef.current.error("File không được vượt quá 100MB");

      return Upload.LIST_IGNORE;
    }

    setSelectedFile(file);

    if (!String(uploadData?.title || "").trim()) {
      const fileName = String(file?.name || "").replace(/\.[^/.]+$/, "");

      setUploadData((prev) => ({
        ...prev,

        title: fileName,
      }));
    }

    // Không để Ant Design tự upload. File được gửi bằng handleUpload.

    return false;
  };

  const handleUpload = async () => {
    if (!selectedLesson) return;

    const title = String(uploadData?.title || "").trim();

    const description = String(uploadData?.description || "").trim();

    const externalUrl = normalizeUrl(uploadData?.external_url);

    if (!title) {
      notifyRef.current.warning("Vui lòng nhập tên tài liệu");

      return;
    }

    if (!selectedFile && !externalUrl) {
      notifyRef.current.warning("Vui lòng chọn file hoặc nhập đường link");

      return;
    }

    if (selectedFile && externalUrl) {
      notifyRef.current.warning("Vui lòng chỉ chọn file hoặc nhập đường link");

      return;
    }

    if (externalUrl && !isHttpUrl(externalUrl)) {
      notifyRef.current.error(
        "Đường link không hợp lệ. Vui lòng sử dụng http:// hoặc https://",
      );

      return;
    }

    const formData = new FormData();

    formData.append("title", title);

    formData.append("description", description);

    formData.append(
      "resource_category",

      uploadData?.resource_category || "teacher_material",
    );

    formData.append("sort_order", String(Number(uploadData?.sort_order || 0)));

    formData.append("visibility", uploadData?.visibility || "public");

    formData.append(
      "is_downloadable",

      externalUrl ? "0" : uploadData?.is_downloadable ? "1" : "0",
    );

    if (externalUrl) {
      formData.append("resource_type", "link");

      formData.append("external_url", externalUrl);
    }

    if (selectedFile) {
      formData.append("resource_type", "file");

      formData.append("file", selectedFile);
    }

    try {
      setUploading(true);

      await uploadLessonResource(selectedLesson.id, formData);

      notifyRef.current.success(
        externalUrl
          ? "Đã thêm đường link thành công"
          : "Tải tài liệu thành công",
      );

      setUploadOpen(false);

      setSelectedFile(null);

      setUploadData(getDefaultUploadData());

      await loadResources(selectedLesson.id);
    } catch (error) {
      notifyRef.current.error(
        error?.response?.data?.message || "Không thể thêm tài liệu",
      );
    } finally {
      setUploading(false);
    }
  };

  /* =======================================================

     DELETE RESOURCE

  \======================================================= */

  const handleDelete = async (resource) => {
    if (!resource?.id || !selectedLesson?.id) {
      notifyRef.current.warning("Không xác định được tài liệu cần xóa");

      return;
    }

    try {
      await deleteLessonResource(resource.id);

      notifyRef.current.success("Đã xóa tài liệu");

      await loadResources(selectedLesson.id);
    } catch (error) {
      notifyRef.current.error(
        error?.response?.data?.message || "Không thể xóa tài liệu",
      );
    }
  };

  /* =======================================================

     DOWNLOAD RESOURCE

  \======================================================= */

  const downloadResource = (resource) => {
    if (resource?.resource_type === "link") {
      openResourceViewer(resource);

      return;
    }

    const url = getResourceUrl(resource);

    if (!url) {
      notifyRef.current.info("Tài liệu chưa có file");

      return;
    }

    window.open(url, "_blank", "noopener,noreferrer");
  };

  /* =======================================================

     PAGINATION

  \======================================================= */

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

     LESSON ACTION MENU

  \======================================================= */

  const renderLessonMenu = (lesson) => {
    if (menuLessonId !== lesson.id) return null;

    return (
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

            notifyRef.current.info("Chức năng chỉnh sửa sẽ được bổ sung.");
          }}
        >
          <BookOutlined />

          <span>Chỉnh sửa</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setMenuLessonId(null);

            notifyRef.current.info("Chức năng sao chép sẽ được bổ sung.");
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

            notifyRef.current.info("Chức năng xóa bài học chưa được cấu hình.");
          }}
        >
          <DeleteOutlined />

          <span>Xóa</span>
        </button>
      </div>
    );
  };

  /* =======================================================

     LESSON LIST / GRID

  \======================================================= */

  const renderLessonGrid = () => {
    if (!filteredLessons.length) {
      return (
        <div className="ll-empty">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              searchText
                ? "Không tìm thấy bài học phù hợp"
                : "Chương trình này chưa có bài học"
            }
          />
        </div>
      );
    }

    if (viewMode === "list") {
      return (
        <>
          <div className="ll-list">
            {paginatedLessons.map((lesson) => (
              <div
                className="ll-list-item"
                key={lesson.id}
                onClick={() => openLesson(lesson)}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === "Enter") openLesson(lesson);
                }}
              >
                <div className="ll-list-icon">
                  <FolderOpenOutlined />
                </div>

                <div className="ll-list-content">
                  <div className="ll-list-title">
                    {lesson.title || `Bài học #${lesson.id}`}
                  </div>

                  <div className="ll-list-meta">
                    BÀI HỌC
                    <span>•</span>
                    ID: {lesson.id}
                  </div>
                </div>

                <div className="ll-list-type">
                  {selectedProgram?.name || "Chương trình giáo lý"}
                </div>

                <div className="ll-more-wrapper">
                  <AppButton
                    size="small"
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

                  {renderLessonMenu(lesson)}
                </div>
              </div>
            ))}
          </div>

          {renderPagination()}
        </>
      );
    }

    return (
      <>
        <div className="ll-grid">
          {paginatedLessons.map((lesson) => (
            <div
              className="ll-file-card"
              key={lesson.id}
              onClick={() => openLesson(lesson)}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === "Enter") openLesson(lesson);
              }}
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
                    <AppButton
                      size="small"
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

                    {renderLessonMenu(lesson)}
                  </div>
                </div>

                <div className="ll-file-meta">
                  <span>BÀI HỌC</span>

                  <span>•</span>

                  <span>ID: {lesson.id}</span>
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

     PROGRAM SELECTION

  \======================================================= */

  const renderProgramSelection = () => {
    if (loading) {
      return (
        <div className="ll-resource-loading">
          <Spin size="large" tip="Đang tải chương trình giáo lý..." />
        </div>
      );
    }

    if (!programs.length) {
      return (
        <div className="ll-empty">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Chưa có chương trình giáo lý đang hoạt động"
          >
            <AppButton icon={<ReloadOutlined />} onClick={loadPrograms}>
              Tải lại
            </AppButton>
          </Empty>
        </div>
      );
    }

    return (
      <div className="ll-program-grid-redesigned">
        {programs.map((program, index) => (
          <Card
            key={program.id}
            hoverable
            bordered={false}
            className="ll-program-card-redesigned"
            onClick={() => openProgram(program)}
          >
            <div className="ll-program-cover">
              <img
                src={lessonCardCover}
                alt="Minh họa chương trình giáo lý"
                loading="lazy"
              />
              <span className="ll-program-number">
                {String(index + 1).padStart(2, "0")}
              </span>
            </div>

            <div className="ll-program-card-body">
              <div className="ll-program-card-topline">
                <span className="ll-program-kicker">CHƯƠNG TRÌNH GIÁO LÝ</span>
                {program.code && <Tag color="blue">{program.code}</Tag>}
              </div>

              <h3>{program.name || "Chương trình chưa đặt tên"}</h3>

              <p>
                {program.description ||
                  "Chọn để xem danh sách bài học và tài liệu."}
              </p>

              <div className="ll-program-card-footer">
                <span>
                  <FolderOpenOutlined />
                  Xem bài học
                </span>
                <span className="ll-program-arrow">
                  <ArrowLeftOutlined />
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  /* =======================================================

     RESOURCES

  \======================================================= */

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
            Thêm giáo án, PowerPoint, PDF, Word, hình ảnh, video hoặc đường link
            cho bài học này.
          </p>

          <AppButton
            size="small"
            icon={<UploadOutlined />}
            onClick={openUploadModal}
          >
            Thêm tài liệu
          </AppButton>
        </div>
      );
    }

    return (
      <div className="ll-resource-list">
        {resources.map((resource) => {
          const resourceUrl = getResourceUrl(resource);

          const isLink = resource.resource_type === "link";

          const isActive = isResourceActive(resource);

          const canView = Boolean(resource.id && (resourceUrl || isLink));

          return (
            <div
              key={resource.id}
              className={`ll-resource ${
                !isActive ? "ll-resource-disabled" : ""
              }`}
            >
              <div className="ll-resource-icon">
                {getResourceIcon(resource, 30)}
              </div>

              <div className="ll-resource-main">
                <div className="ll-resource-title">
                  <span>
                    {resource.title || resource.file_name || "Tài liệu"}
                  </span>

                  {!isActive && <Tag>Đã tắt</Tag>}

                  {isLink && <Tag color="blue">Liên kết</Tag>}
                </div>

                <div className="ll-resource-description">
                  {resource.description ||
                    resource.file_name ||
                    (isLink ? resource.external_url : "Tài liệu bài học")}
                </div>

                <div className="ll-resource-meta">
                  <Tag>
                    {CATEGORY_LABELS[resource.resource_category] ||
                      resource.resource_category ||
                      "Tài liệu"}
                  </Tag>

                  {resource.file_type && !isLink && (
                    <span>{String(resource.file_type).toUpperCase()}</span>
                  )}

                  {resource.file_size && !isLink && (
                    <span>{formatFileSize(resource.file_size)}</span>
                  )}
                </div>
              </div>

              <div className="ll-resource-actions">
                {canView && (
                  <>
                    <Tooltip title={isLink ? "Xem liên kết" : "Xem tài liệu"}>
                      <AppButton
                        variant="secondary"
                        size="small"
                        icon={isLink ? <LinkOutlined /> : <EyeOutlined />}
                        onClick={() => openResourceViewer(resource)}
                      />
                    </Tooltip>

                    {!isLink && resourceUrl && (
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
                  description={
                    isLink
                      ? "Đường link sẽ bị xóa khỏi bài học."
                      : "File sẽ bị xóa khỏi hệ thống."
                  }
                  okText="Xóa"
                  cancelText="Hủy"
                  okButtonProps={{ danger: true }}
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

  \======================================================= */

  return (
    <div className="lesson-library-page">
      {/* ===================================================

          SCREEN 1: CHỌN CHƯƠNG TRÌNH

      \=================================================== */}

      {!selectedProgram && !selectedLesson && (
        <>
          <div className="ll-page-heading">
            <div>
              <h1>Thư viện giáo lý</h1>

              <p>Chọn chương trình để xem các bài học và tài liệu.</p>
            </div>

            <AppButton
              size="small"
              icon={<ReloadOutlined />}
              onClick={loadPrograms}
              loading={loading}
            >
              Làm mới
            </AppButton>
          </div>

          {renderProgramSelection()}
        </>
      )}

      {/* ===================================================

          SCREEN 2: DANH SÁCH BÀI HỌC CỦA CHƯƠNG TRÌNH

      \=================================================== */}

      {selectedProgram && !selectedLesson && (
        <>
          <div className="ll-page-heading">
            <div>
              <AppButton
                size="small"
                icon={<ArrowLeftOutlined />}
                onClick={backToPrograms}
                style={{ paddingLeft: 0, marginBottom: 8 }}
              >
                Chọn chương trình khác
              </AppButton>

              <h1>{selectedProgram.name}</h1>

              <p>
                {selectedProgram.code
                  ? `Mã chương trình: ${selectedProgram.code} · `
                  : ""}
                {filteredLessons.length} bài học
              </p>
            </div>

            <AppButton
              size="small"
              icon={<ReloadOutlined />}
              onClick={() => loadLessons(selectedProgram.id)}
              loading={loading}
            >
              Làm mới
            </AppButton>
          </div>

          <div className="ll-topbar">
            <div className="ll-search-box">
              <Input
                allowClear
                prefix={<SearchOutlined />}
                placeholder="Tìm kiếm bài học..."
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
              />
            </div>

            <Select
              className="ll-sort-select"
              value={sortType}
              onChange={setSortType}
              options={[
                { value: "name", label: "Sắp xếp theo tên" },

                { value: "newest", label: "Mới nhất" },

                { value: "oldest", label: "Cũ nhất" },
              ]}
            />

            <div className="ll-view-toggle">
              <button
                type="button"
                aria-label="Xem dạng lưới"
                className={`ll-view-button ${
                  viewMode === "grid" ? "active" : ""
                }`}
                onClick={() => setViewMode("grid")}
              >
                <AppstoreOutlined />
              </button>

              <button
                type="button"
                aria-label="Xem dạng danh sách"
                className={`ll-view-button ${
                  viewMode === "list" ? "active" : ""
                }`}
                onClick={() => setViewMode("list")}
              >
                <MenuOutlined />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="ll-resource-loading">
              <Spin size="large" tip="Đang tải bài học..." />
            </div>
          ) : (
            renderLessonGrid()
          )}
        </>
      )}

      {/* ===================================================

          SCREEN 3: CHI TIẾT BÀI HỌC

      \=================================================== */}

      {selectedLesson && (
        <>
          <div className="ll-detail-header">
            <div className="ll-detail-left">
              <AppButton
                variant="secondary"
                size="small"
                icon={<ArrowLeftOutlined />}
                onClick={backToLibrary}
              >
                Quay lại danh sách bài học
              </AppButton>

              <div className="ll-detail-info">
                <div className="ll-detail-icon">
                  <FolderOpenOutlined />
                </div>

                <div>
                  <div className="ll-detail-type">
                    {selectedProgram?.name || "Chương trình giáo lý"}
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

            {/* QUESTIONS */}

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
                      Làm câu hỏi
                    </AppButton>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </>
      )}

      {/* ===================================================

          UPLOAD MODAL

      \=================================================== */}

      <AppFormModal
        title="Thêm tài liệu bài học"
        subtitle="Thêm giáo trình, tài liệu hoặc đường link cho bài học"
        onCancel={closeUploadModal}
        onOk={handleUpload}
        confirmLoading={uploading}
        okText="Thêm tài liệu"
        cancelText="Hủy"
        width={600}
        className="catechist-modal"
        open={uploadOpen}
      >
        <div className="ll-upload-form">
          <div className="ll-form-label">
            Tên tài liệu
            <span className="ll-required">*</span>
          </div>

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

          <div className="ll-form-label">
            Đường link tài liệu / video
            <span className="ll-form-label-optional">Không bắt buộc</span>
          </div>

          <Input
            size="large"
            placeholder="https://youtube.com/watch?v=..."
            value={uploadData.external_url || ""}
            onChange={handleExternalUrlChange}
            prefix={<LinkOutlined />}
            allowClear
          />

          <div className="ll-form-help">
            Có thể nhập link YouTube, Google Drive hoặc website bên ngoài. Không
            cần chọn file nếu sử dụng đường link.
          </div>

          <Row gutter={14}>
            <Col xs={24} sm={16}>
              <div className="ll-form-label">Loại tài liệu</div>

              <Select
                size="large"
                style={{ width: "100%" }}
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

                    sort_order: Number(event.target.value || 0),
                  }))
                }
              />
            </Col>
          </Row>

          <div className="ll-form-label">
            File tài liệu
            <span className="ll-form-label-optional">
              Không bắt buộc nếu đã có đường link
            </span>
          </div>

          <Upload.Dragger
            multiple={false}
            maxCount={1}
            disabled={Boolean(normalizeUrl(uploadData.external_url))}
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

              ".bmp",

              ".mp4",

              ".webm",

              ".mov",

              ".m4v",

              ".mp3",

              ".wav",

              ".ogg",

              ".m4a",

              ".aac",

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
              PPT, PPTX, PDF, DOC, DOCX, XLS, XLSX, hình ảnh, video, audio, ZIP
            </p>

            <p className="ant-upload-hint">Dung lượng tối đa: 100MB</p>

            {normalizeUrl(uploadData.external_url) && (
              <div className="ll-upload-disabled-note">
                Đang sử dụng đường link — không cần tải file.
              </div>
            )}
          </Upload.Dragger>

          <div className="ll-upload-note">
            <strong>Chương trình:</strong>{" "}
            {selectedProgram?.name || "Chưa chọn chương trình"}
            <br />
            <strong>Bài học:</strong>{" "}
            {selectedLesson?.title || "Chưa chọn bài học"}
          </div>
        </div>
      </AppFormModal>
    </div>
  );
};

export default LessonLibraryPage;
