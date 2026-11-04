import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Empty, Input, Pagination, Select, Spin, Upload } from "antd";

import {
  ArrowLeftOutlined,
  BookOutlined,
  DeleteOutlined,
  EyeOutlined,
  FolderOpenOutlined,
  MoreOutlined,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons";

import { useNavigate } from "react-router-dom";

import {
  getLessons,
  getLessonResources,
  uploadLessonResource,
  deleteLessonResource,
  getQuestionsByLesson,
  getLessonPrograms,
} from "../../../api/lessonApi";

import "../../../assets/css/LessonLibraryPage.css";

import AppButton from "../../../components/common/AppButton";

import { useNotification } from "../../../components/notification";

import ProgramSelectionScreen from "./screens/ProgramSelectionScreen";

import LessonDetailScreen from "./screens/LessonDetailScreen";

import UploadResourceModal from "./components/UploadResourceModal";

import {
  RESOURCE_VIEWER_BASE_PATH,
  DEFAULT_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
  MAX_FILE_SIZE,
  CATEGORY_LABELS,
  CATEGORY_OPTIONS,
  getDefaultUploadData,
  getArrayData,
} from "./utils/lessonHelpers";

import {
  formatFileSize,
  isHttpUrl,
  normalizeUrl,
  getResourceUrl,
  isResourceActive,
  getResourceIcon,
} from "./utils/resourceHelpers";

/* =========================================================
   COMPONENT
========================================================= */

const LessonLibraryPage = () => {
  const navigate = useNavigate();

  const notify = useNotification();

  /* =======================================================
     REFS
  ======================================================= */

  const notifyRef = useRef(notify);

  notifyRef.current = notify;

  const mountedRef = useRef(false);

  const resourceRequestRef = useRef(0);

  const lessonRequestRef = useRef(0);

  const programRequestRef = useRef(0);

  /* =======================================================
     MAIN STATE
  ======================================================= */

  const [loading, setLoading] = useState(false);

  const [programs, setPrograms] = useState([]);

  const [selectedProgram, setSelectedProgram] = useState(null);

  const [lessons, setLessons] = useState([]);

  const [selectedLesson, setSelectedLesson] = useState(null);

  const [searchText, setSearchText] = useState("");

  const [sortType, setSortType] = useState("name");

  const [viewMode] = useState("list");

  const [currentPage, setCurrentPage] = useState(1);

  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  /* =======================================================
     RESOURCES & QUESTIONS
  ======================================================= */

  const [resourceLoading, setResourceLoading] = useState(false);

  const [resources, setResources] = useState([]);

  const [questions, setQuestions] = useState([]);

  const [questionLoading, setQuestionLoading] = useState(false);

  /* =======================================================
     UPLOAD
  ======================================================= */

  const [uploadOpen, setUploadOpen] = useState(false);

  const [uploading, setUploading] = useState(false);

  const [selectedFile, setSelectedFile] = useState(null);

  const [uploadData, setUploadData] = useState(getDefaultUploadData());

  /* =======================================================
     LESSON MENU
  ======================================================= */

  const [menuLessonId, setMenuLessonId] = useState(null);

  /* =======================================================
     MOUNT / UNMOUNT
  ======================================================= */

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;

      programRequestRef.current += 1;

      lessonRequestRef.current += 1;

      resourceRequestRef.current += 1;
    };
  }, []);

  /* =======================================================
     LOAD PROGRAMS
  ======================================================= */

  const loadPrograms = useCallback(async () => {
    const requestId = ++programRequestRef.current;

    try {
      setLoading(true);

      const response = await getLessonPrograms();

      const data = getArrayData(response?.data, ["programs"]);

      if (!mountedRef.current || requestId !== programRequestRef.current) {
        return;
      }

      setPrograms(data);
    } catch (error) {
      if (!mountedRef.current || requestId !== programRequestRef.current) {
        return;
      }

      notifyRef.current.error(
        error?.response?.data?.message ||
          "Không thể tải danh sách chương trình giáo lý",
      );
    } finally {
      if (mountedRef.current && requestId === programRequestRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    loadPrograms();
  }, [loadPrograms]);

  /* =======================================================
     LOAD LESSONS BY PROGRAM
  ======================================================= */

  const loadLessons = useCallback(async (programId) => {
    const requestId = ++lessonRequestRef.current;

    if (!programId) {
      setLessons([]);

      return;
    }

    try {
      setLoading(true);

      const response = await getLessons({
        program_id: programId,
      });

      const data = getArrayData(response?.data?.data, ["lessons"]);

      if (!mountedRef.current || requestId !== lessonRequestRef.current) {
        return;
      }

      setLessons(data);
    } catch (error) {
      if (!mountedRef.current || requestId !== lessonRequestRef.current) {
        return;
      }

      setLessons([]);

      notifyRef.current.error(
        error?.response?.data?.message || "Không thể tải danh sách bài học",
      );
    } finally {
      if (mountedRef.current && requestId === lessonRequestRef.current) {
        setLoading(false);
      }
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
     
     Hai API độc lập:
     - API tài liệu lỗi không làm mất câu hỏi.
     - API câu hỏi lỗi không làm mất tài liệu.
  ======================================================= */

  const loadResources = useCallback(async (lessonId) => {
    const requestId = ++resourceRequestRef.current;

    if (!lessonId) {
      setResources([]);

      setQuestions([]);

      setResourceLoading(false);

      setQuestionLoading(false);

      return;
    }

    setResourceLoading(true);

    setQuestionLoading(true);

    const [resourceResult, questionResult] = await Promise.allSettled([
      getLessonResources(lessonId),

      getQuestionsByLesson(lessonId),
    ]);

    if (!mountedRef.current || requestId !== resourceRequestRef.current) {
      return;
    }

    if (resourceResult.status === "fulfilled") {
      const data = getArrayData(resourceResult.value?.data?.data, [
        "resources",
      ]);

      setResources(data);
    } else {
      setResources([]);

      notifyRef.current.error(
        resourceResult.reason?.response?.data?.message ||
          "Không thể tải tài liệu bài học",
      );
    }

    if (questionResult.status === "fulfilled") {
      const data = getArrayData(questionResult.value?.data, ["questions"]);

      setQuestions(data);
    } else {
      setQuestions([]);

      notifyRef.current.error(
        questionResult.reason?.response?.data?.message ||
          "Không thể tải câu hỏi bài học",
      );
    }

    setResourceLoading(false);

    setQuestionLoading(false);
  }, []);

  useEffect(() => {
    if (selectedLesson?.id) {
      loadResources(selectedLesson.id);
    } else {
      resourceRequestRef.current += 1;

      setResources([]);

      setQuestions([]);

      setResourceLoading(false);

      setQuestionLoading(false);
    }
  }, [selectedLesson?.id, loadResources]);

  /* =======================================================
     PROGRAM NAVIGATION
  ======================================================= */

  const openProgram = useCallback((program) => {
    if (!program?.id) {
      notifyRef.current.warning("Chương trình giáo lý không hợp lệ");

      return;
    }

    lessonRequestRef.current += 1;

    resourceRequestRef.current += 1;

    setSelectedProgram(program);

    setSelectedLesson(null);

    setLessons([]);

    setResources([]);

    setQuestions([]);

    setSearchText("");

    setCurrentPage(1);

    setMenuLessonId(null);

    setResourceLoading(false);

    setQuestionLoading(false);
  }, []);

  const backToPrograms = useCallback(() => {
    lessonRequestRef.current += 1;

    resourceRequestRef.current += 1;

    setSelectedProgram(null);

    setSelectedLesson(null);

    setLessons([]);

    setResources([]);

    setQuestions([]);

    setSearchText("");

    setCurrentPage(1);

    setMenuLessonId(null);

    setLoading(false);

    setResourceLoading(false);

    setQuestionLoading(false);
  }, []);

  /* =======================================================
     LESSON NAVIGATION
  ======================================================= */

  const openLesson = useCallback((lesson) => {
    if (!lesson?.id) {
      notifyRef.current.warning("Không xác định được bài học");

      return;
    }

    resourceRequestRef.current += 1;

    setSelectedLesson(lesson);

    setResources([]);

    setQuestions([]);

    setMenuLessonId(null);

    setResourceLoading(true);

    setQuestionLoading(true);
  }, []);

  const backToLibrary = useCallback(() => {
    resourceRequestRef.current += 1;

    setSelectedLesson(null);

    setResources([]);

    setQuestions([]);

    setMenuLessonId(null);

    setResourceLoading(false);

    setQuestionLoading(false);
  }, []);

  /* =======================================================
     SEARCH / SORT
  ======================================================= */

  const filteredLessons = useMemo(() => {
    let result = [...lessons];

    const keyword = String(searchText || "")
      .trim()
      .toLocaleLowerCase("vi");

    if (keyword) {
      result = result.filter((lesson) => {
        const title = String(lesson.title || "").toLocaleLowerCase("vi");

        const id = String(lesson.id || "");

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

        if (
          Number.isFinite(dateA) &&
          Number.isFinite(dateB) &&
          dateA !== dateB
        ) {
          return dateB - dateA;
        }

        return Number(b.id || 0) - Number(a.id || 0);
      });
    }

    if (sortType === "oldest") {
      result.sort((a, b) => {
        const dateA = new Date(a.created_at || a.updated_at || 0).getTime();

        const dateB = new Date(b.created_at || b.updated_at || 0).getTime();

        if (
          Number.isFinite(dateA) &&
          Number.isFinite(dateB) &&
          dateA !== dateB
        ) {
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
  ======================================================= */

  const openResourceViewer = useCallback(
    (resource) => {
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
    },
    [navigate],
  );

  /* =======================================================
     UPLOAD MODAL
  ======================================================= */

  const openUploadModal = useCallback(() => {
    if (!selectedLesson) {
      notifyRef.current.info("Vui lòng mở một bài học trước");

      return;
    }

    setSelectedFile(null);

    setUploadData(getDefaultUploadData(resources.length));

    setUploadOpen(true);
  }, [selectedLesson, resources.length]);

  const closeUploadModal = useCallback(() => {
    if (uploading) return;

    setUploadOpen(false);

    setSelectedFile(null);

    setUploadData(getDefaultUploadData());
  }, [uploading]);

  const handleExternalUrlChange = useCallback((event) => {
    const value = event?.target?.value || "";

    setUploadData((prev) => ({
      ...prev,
      external_url: value,
    }));

    if (String(value).trim()) {
      setSelectedFile(null);
    }
  }, []);

  const handleBeforeUpload = useCallback(
    (file) => {
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

      return false;
    },
    [uploadData],
  );

  const handleUpload = useCallback(async () => {
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
  }, [selectedLesson, uploadData, selectedFile, loadResources]);

  /* =======================================================
     DELETE RESOURCE
  ======================================================= */

  const handleDelete = useCallback(
    async (resource) => {
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
    },
    [selectedLesson, loadResources],
  );

  /* =======================================================
     DOWNLOAD RESOURCE
  ======================================================= */

  const downloadResource = useCallback(
    (resource) => {
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
    },
    [openResourceViewer],
  );

  /* =======================================================
     PAGINATION
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
     LESSON ACTION MENU
  ======================================================= */

  const renderLessonMenu = (lesson) => {
    if (menuLessonId !== lesson.id) {
      return null;
    }

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
  ======================================================= */

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
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    openLesson(lesson);
                  }
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

                      setMenuLessonId((prev) =>
                        prev === lesson.id ? null : lesson.id,
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
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  openLesson(lesson);
                }
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

                        setMenuLessonId((prev) =>
                          prev === lesson.id ? null : lesson.id,
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
     RESOURCE LIST
  ======================================================= */

  // const renderResources = () => {
  //   if (resourceLoading) {
  //     return (
  //       <div className="ll-resource-loading">
  //         <Spin size="large" />
  //       </div>
  //     );
  //   }

  //   if (!resources.length) {
  //     return (
  //       <div className="ll-resource-empty">
  //         <div className="ll-empty-icon">
  //           <InboxOutlined />
  //         </div>

  //         <h3>Chưa có tài liệu</h3>

  //         <p>
  //           Thêm giáo án, PowerPoint, PDF, Word, hình ảnh, video hoặc đường link
  //           cho bài học này.
  //         </p>

  //         <AppButton
  //           size="small"
  //           icon={<UploadOutlined />}
  //           onClick={openUploadModal}
  //         >
  //           Thêm tài liệu
  //         </AppButton>
  //       </div>
  //     );
  //   }

  //   return (
  //     <div className="ll-resource-list">
  //       {resources.map((resource) => {
  //         const resourceUrl = getResourceUrl(resource);

  //         const isLink = resource.resource_type === "link";

  //         const isActive = isResourceActive(resource);

  //         const canView = Boolean(resource.id && (resourceUrl || isLink));

  //         return (
  //           <div
  //             key={resource.id}
  //             className={`ll-resource ${
  //               !isActive ? "ll-resource-disabled" : ""
  //             }`}
  //           >
  //             <div className="ll-resource-icon">
  //               {getResourceIcon(resource, 30)}
  //             </div>

  //             <div className="ll-resource-main">
  //               <div className="ll-resource-title">
  //                 <span>
  //                   {resource.title || resource.file_name || "Tài liệu"}
  //                 </span>

  //                 {!isActive && <Tag>Đã tắt</Tag>}

  //                 {isLink && <Tag color="blue">Liên kết</Tag>}
  //               </div>

  //               <div className="ll-resource-description">
  //                 {resource.description ||
  //                   resource.file_name ||
  //                   (isLink ? resource.external_url : "Tài liệu bài học")}
  //               </div>

  //               <div className="ll-resource-meta">
  //                 <Tag>
  //                   {CATEGORY_LABELS[resource.resource_category] ||
  //                     resource.resource_category ||
  //                     "Tài liệu"}
  //                 </Tag>

  //                 {resource.file_type && !isLink && (
  //                   <span>{String(resource.file_type).toUpperCase()}</span>
  //                 )}

  //                 {resource.file_size && !isLink && (
  //                   <span>{formatFileSize(resource.file_size)}</span>
  //                 )}
  //               </div>
  //             </div>

  //             <div className="ll-resource-actions">
  //               {canView && (
  //                 <>
  //                   <Tooltip title={isLink ? "Xem liên kết" : "Xem tài liệu"}>
  //                     <AppButton
  //                       variant="secondary"
  //                       size="small"
  //                       icon={isLink ? <LinkOutlined /> : <EyeOutlined />}
  //                       onClick={() => openResourceViewer(resource)}
  //                     />
  //                   </Tooltip>

  //                   {!isLink && resourceUrl && (
  //                     <Tooltip title="Tải xuống">
  //                       <AppButton
  //                         variant="secondary"
  //                         size="small"
  //                         icon={<DownloadOutlined />}
  //                         onClick={() => downloadResource(resource)}
  //                       />
  //                     </Tooltip>
  //                   )}
  //                 </>
  //               )}

  //               <Popconfirm
  //                 title="Xóa tài liệu?"
  //                 description={
  //                   isLink
  //                     ? "Đường link sẽ bị xóa khỏi bài học."
  //                     : "File sẽ bị xóa khỏi hệ thống."
  //                 }
  //                 okText="Xóa"
  //                 cancelText="Hủy"
  //                 okButtonProps={{ danger: true }}
  //                 onConfirm={() => handleDelete(resource)}
  //               >
  //                 <Tooltip title="Xóa">
  //                   <AppButton danger size="small" icon={<DeleteOutlined />} />
  //                 </Tooltip>
  //               </Popconfirm>
  //             </div>
  //           </div>
  //         );
  //       })}
  //     </div>
  //   );
  // };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="lesson-library-page">
      {/* SCREEN 1: CHỌN CHƯƠNG TRÌNH */}

      {!selectedProgram && !selectedLesson && (
        <>
          <ProgramSelectionScreen
            programs={programs}
            loading={loading}
            onRefresh={loadPrograms}
            onSelectProgram={openProgram}
          />
        </>
      )}

      {/* SCREEN 2: DANH SÁCH BÀI HỌC */}

      {selectedProgram && !selectedLesson && (
        <section className="ll-lesson-library">
          {/* Header chương trình */}
          <div className="ll-lesson-header">
            <div className="ll-lesson-header-main">
              <AppButton
                size="small"
                icon={<ArrowLeftOutlined />}
                onClick={backToPrograms}
                className="ll-back-program-button"
              >
                Tất cả chương trình
              </AppButton>

              <div className="ll-lesson-title-row">
                <div className="ll-lesson-title-icon">
                  <BookOutlined />
                </div>

                <div className="ll-lesson-title-content">
                  <h1>{selectedProgram.name}</h1>

                  <div className="ll-lesson-subtitle">
                    {selectedProgram.code && (
                      <span>Mã: {selectedProgram.code}</span>
                    )}

                    {selectedProgram.code && (
                      <span className="ll-meta-dot">•</span>
                    )}

                    <span>{filteredLessons.length} bài học</span>
                  </div>
                </div>
              </div>
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

          {/* Thanh công cụ */}
          <div className="ll-lesson-toolbar">
            <div className="ll-lesson-search">
              <Input
                allowClear
                prefix={<SearchOutlined />}
                placeholder="Tìm tên bài học..."
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
              />
            </div>

            <Select
              className="ll-lesson-sort"
              value={sortType}
              onChange={setSortType}
              options={[
                { value: "name", label: "Tên bài học" },
                { value: "newest", label: "Mới nhất" },
                { value: "oldest", label: "Cũ nhất" },
              ]}
            />
          </div>

          {/* Danh sách bài học */}
          {loading ? (
            <div className="ll-resource-loading">
              <Spin tip="Đang tải bài học..." />
            </div>
          ) : (
            <div className="ll-lesson-content">{renderLessonGrid()}</div>
          )}
        </section>
      )}

      {/* SCREEN 3: CHI TIẾT BÀI HỌC */}

      {selectedLesson && (
        <LessonDetailScreen
          selectedProgram={selectedProgram}
          selectedLesson={selectedLesson}
          resources={resources}
          resourceLoading={resourceLoading}
          questions={questions}
          questionLoading={questionLoading}
          categoryLabels={CATEGORY_LABELS}
          getResourceIcon={getResourceIcon}
          getResourceUrl={getResourceUrl}
          isResourceActive={isResourceActive}
          formatFileSize={formatFileSize}
          backToLibrary={backToLibrary}
          openUploadModal={openUploadModal}
          loadResources={loadResources}
          openResourceViewer={openResourceViewer}
          downloadResource={downloadResource}
          handleDelete={handleDelete}
          onPlayQuestions={() =>
            navigate(`/catechist/questions/play/${selectedLesson.id}`)
          }
        />
      )}

      {/* UPLOAD MODAL */}

      <UploadResourceModal
        open={uploadOpen}
        uploading={uploading}
        uploadData={uploadData}
        setUploadData={setUploadData}
        selectedFile={selectedFile}
        setSelectedFile={setSelectedFile}
        selectedProgram={selectedProgram}
        selectedLesson={selectedLesson}
        categoryOptions={CATEGORY_OPTIONS}
        closeUploadModal={closeUploadModal}
        handleUpload={handleUpload}
        handleExternalUrlChange={handleExternalUrlChange}
        handleBeforeUpload={handleBeforeUpload}
        normalizeUrl={normalizeUrl}
      />
    </div>
  );
};

export default LessonLibraryPage;
