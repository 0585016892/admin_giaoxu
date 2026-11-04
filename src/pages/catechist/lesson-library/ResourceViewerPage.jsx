import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { createPortal } from "react-dom";

import { Empty, Spin, Tag, Tooltip, Typography } from "antd";

import {
  ArrowLeftOutlined,
  DownloadOutlined,
  FileOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  ToolOutlined,
  ReloadOutlined,
} from "@ant-design/icons";

import { useNavigate, useParams } from "react-router-dom";

import AppButton from "../../../components/common/AppButton";
import { useNotification } from "../../../components/notification";

import { getLessonResourceById } from "../../../api/lessonApi";

import studentApi from "../../../api/studentApi";

import PdfViewer from "../../../components/lesson-resource/PdfViewer";
import ImageViewer from "../../../components/lesson-resource/ImageViewer";
import VideoViewer from "../../../components/lesson-resource/VideoViewer";
import AudioViewer from "../../../components/lesson-resource/AudioViewer";
import OfficeViewer from "../../../components/lesson-resource/OfficeViewer";
import LinkViewer from "../../../components/lesson-resource/LinkViewer";
import UnsupportedViewer from "../../../components/lesson-resource/UnsupportedViewer";

import CatechistToolsDrawer from "../../../components/CatechistTools/CatechistToolsDrawer";

import {
  getResourceKind,
  getResourceUrl,
  getResourceTypeLabel,
  formatFileSize,
} from "../../../utils/resourceUtils";

import "../../../assets/css/ResourceViewerPage.css";

const { Title, Text } = Typography;

const ResourceViewerPage = () => {
  const notify = useNotification();

  const { id } = useParams();
  const navigate = useNavigate();

  const pageRef = useRef(null);

  // =========================================
  // STATE
  // =========================================

  const [resource, setResource] = useState(null);

  const [resourceLoading, setResourceLoading] = useState(true);

  const [students, setStudents] = useState([]);

  const [studentsLoading, setStudentsLoading] = useState(false);

  const [studentsError, setStudentsError] = useState(null);

  const [isFullscreen, setIsFullscreen] = useState(false);

  const [toolboxOpen, setToolboxOpen] = useState(false);

  const [resourceError, setResourceError] = useState(null);

  // =========================================
  // LOAD RESOURCE
  // =========================================

  const loadResource = useCallback(async () => {
    if (!id) {
      setResource(null);
      setResourceError("Không tìm thấy mã tài liệu.");
      setResourceLoading(false);
      return;
    }

    try {
      console.log("[ResourceViewer] Bắt đầu tải tài liệu:", id);

      setResourceLoading(true);
      setResourceError(null);

      const response = await getLessonResourceById(id);

      const data =
        response?.data?.data || response?.data?.resource || response?.data;

      if (!data) {
        throw new Error("Không tìm thấy tài liệu.");
      }

      console.log("[ResourceViewer] Tải tài liệu thành công:", data);

      setResource(data);
    } catch (error) {
      console.error("[ResourceViewer] Lỗi tải tài liệu:", error);

      setResource(null);

      setResourceError(
        error?.response?.data?.message ||
          error?.message ||
          "Không thể tải tài liệu.",
      );
    } finally {
      setResourceLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadResource();
  }, [loadResource]);

  // =========================================
  // LOAD STUDENTS
  // =========================================

  const fetchStudents = useCallback(async () => {
    try {
      console.log("[ResourceViewer] Bắt đầu tải danh sách học sinh");

      setStudentsLoading(true);
      setStudentsError(null);

      const response = await studentApi.getStudentsByTeacher();

      const data = response?.data;

      let studentList = [];

      if (Array.isArray(data)) {
        studentList = data;
      } else if (Array.isArray(data?.data)) {
        studentList = data.data;
      } else if (Array.isArray(data?.students)) {
        studentList = data.students;
      }

      setStudents(studentList);

      console.log(
        "[ResourceViewer] Tải danh sách học sinh thành công:",
        studentList.length,
      );
    } catch (error) {
      console.error("[ResourceViewer] Lỗi tải học sinh:", error);

      setStudents([]);

      setStudentsError(
        error?.response?.data?.message || "Không thể tải danh sách học sinh.",
      );
    } finally {
      setStudentsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // =========================================
  // RESOURCE INFORMATION
  // =========================================

  const resourceUrl = useMemo(() => {
    return getResourceUrl(resource);
  }, [resource]);

  const resourceKind = useMemo(() => {
    return getResourceKind(resource);
  }, [resource]);

  const resourceTypeLabel = useMemo(() => {
    return getResourceTypeLabel(resource);
  }, [resource]);

  const resourceFileSize = useMemo(() => {
    return formatFileSize(resource?.file_size);
  }, [resource]);

  const resourceTitle = resource?.title || resource?.file_name || "Tài liệu";

  // =========================================
  // FULLSCREEN STATE
  // =========================================

  const handleFullscreenChange = useCallback(() => {
    const fullscreenElement =
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement;

    const active = fullscreenElement === pageRef.current;

    setIsFullscreen(active);

    console.log("[ResourceViewer] Fullscreen:", active ? "ON" : "OFF");
  }, []);

  useEffect(() => {
    const events = [
      "fullscreenchange",
      "webkitfullscreenchange",
      "mozfullscreenchange",
      "MSFullscreenChange",
    ];

    events.forEach((event) => {
      document.addEventListener(event, handleFullscreenChange);
    });

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleFullscreenChange);
      });
    };
  }, [handleFullscreenChange]);

  // =========================================
  // LOCK BODY SCROLL
  // =========================================

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousMargin = document.body.style.margin;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.margin = previousMargin;
    };
  }, []);

  // =========================================
  // FULLSCREEN ACTION
  // =========================================

  const enterFullscreen = async () => {
    try {
      const element = pageRef.current;

      if (!element) {
        return;
      }

      if (element.requestFullscreen) {
        await element.requestFullscreen();
      } else if (element.webkitRequestFullscreen) {
        await element.webkitRequestFullscreen();
      } else if (element.mozRequestFullScreen) {
        await element.mozRequestFullScreen();
      } else if (element.msRequestFullscreen) {
        await element.msRequestFullscreen();
      } else {
        notify.info("Trình duyệt không hỗ trợ chế độ toàn màn hình.");
      }
    } catch (error) {
      console.error("[ResourceViewer] Fullscreen error:", error);

      notify.error("Không thể bật toàn màn hình. Vui lòng thử lại.");
    }
  };

  const exitFullscreen = async () => {
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        await document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        await document.mozCancelFullScreen();
      } else if (document.msExitFullscreen) {
        await document.msExitFullscreen();
      }
    } catch (error) {
      console.error("[ResourceViewer] Exit fullscreen error:", error);
    }
  };

  const toggleFullscreen = () => {
    if (isFullscreen) {
      exitFullscreen();
    } else {
      enterFullscreen();
    }
  };

  // =========================================
  // BACK
  // =========================================

  const handleBack = () => {
    if (isFullscreen) {
      exitFullscreen();
    }

    setToolboxOpen(false);

    navigate(-1);
  };

  // =========================================
  // DOWNLOAD
  // =========================================

  const handleDownload = () => {
    if (!resourceUrl) {
      notify.warning("Tài liệu chưa có đường dẫn tải xuống.");
      return;
    }

    try {
      const link = document.createElement("a");

      link.href = resourceUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";

      if (resource?.file_name) {
        link.download = resource.file_name;
      }

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);
    } catch (error) {
      console.error("[ResourceViewer] Download error:", error);

      notify.error("Không thể tải tài liệu.");
    }
  };

  // =========================================
  // RENDER VIEWER
  // =========================================

  const renderViewer = () => {
    if (!resource) {
      return (
        <div className="rvp-empty">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Không có dữ liệu tài liệu"
          />
        </div>
      );
    }

    if (!resourceUrl && resourceKind !== "unsupported") {
      return (
        <div className="rvp-empty">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Tài liệu chưa có đường dẫn"
          />
        </div>
      );
    }

    switch (resourceKind) {
      case "pdf":
        return <PdfViewer resource={resource} url={resourceUrl} />;

      case "image":
        return <ImageViewer resource={resource} url={resourceUrl} />;

      case "video":
        return <VideoViewer resource={resource} url={resourceUrl} />;

      case "audio":
        return <AudioViewer resource={resource} url={resourceUrl} />;

      case "office":
        return <OfficeViewer resource={resource} url={resourceUrl} />;

      case "link":
        return <LinkViewer resource={resource} url={resourceUrl} />;

      default:
        return <UnsupportedViewer resource={resource} url={resourceUrl} />;
    }
  };

  // =========================================
  // LOADING
  // Portal giúp loading không bị sidebar che
  // =========================================

  if (resourceLoading) {
    return createPortal(
      <div className="rvp-loading-page">
        <Spin size="large" />

        <span className="rvp-loading-text">Đang tải tài liệu...</span>
      </div>,
      document.body,
    );
  }

  // =========================================
  // RESOURCE ERROR
  // =========================================

  if (resourceError || !resource) {
    return createPortal(
      <div className="rvp-empty-page">
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={resourceError || "Không tìm thấy tài liệu"}
        />

        <AppButton
          size="small"
          icon={<ArrowLeftOutlined />}
          onClick={handleBack}
        >
          Quay lại
        </AppButton>

        <AppButton
          variant="secondary"
          size="small"
          icon={<ReloadOutlined />}
          onClick={loadResource}
        >
          Thử lại
        </AppButton>
      </div>,
      document.body,
    );
  }

  // =========================================
  // MAIN VIEWER
  // Render trực tiếp vào document.body
  // =========================================

  return createPortal(
    <div
      ref={pageRef}
      className={`rvp-page ${isFullscreen ? "rvp-page-fullscreen" : ""}`}
    >
      {/* =====================================
          HEADER
      ===================================== */}

      <header className="rvp-header">
        {/* LEFT */}
        <div className="rvp-header-left">
          <Tooltip title="Quay lại thư viện">
            <AppButton
              className="rvp-back-button"
              size="small"
              icon={<ArrowLeftOutlined />}
              onClick={handleBack}
            >
              <span className="rvp-back-text">Quay lại</span>
            </AppButton>
          </Tooltip>

          <div className="rvp-title-wrapper">
            <div className="rvp-file-icon">
              <FileOutlined />
            </div>

            <div className="rvp-title-content">
              <Title level={4} className="rvp-title" title={resourceTitle}>
                {resourceTitle}
              </Title>

              <div className="rvp-meta">
                <Tag className="rvp-type-tag">{resourceTypeLabel}</Tag>

                {resourceFileSize && (
                  <Text className="rvp-meta-text">{resourceFileSize}</Text>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT TOOLBAR */}
        <div className="rvp-header-actions">
          {resourceUrl && resourceKind !== "link" && (
            <Tooltip title="Tải xuống">
              <AppButton
                size="small"
                icon={<DownloadOutlined />}
                onClick={handleDownload}
              >
                <span className="rvp-action-text">Tải xuống</span>
              </AppButton>
            </Tooltip>
          )}

          <Tooltip title="Kho công cụ GLV">
            <AppButton
              size="small"
              className="rvp-toolbox-button"
              icon={<ToolOutlined />}
              onClick={() => setToolboxOpen(true)}
            >
              <span className="rvp-action-text">Kho công cụ GLV</span>
            </AppButton>
          </Tooltip>

          <Tooltip
            title={isFullscreen ? "Thoát toàn màn hình" : "Toàn màn hình"}
          >
            <AppButton
              size="small"
              className="rvp-fullscreen-button"
              icon={
                isFullscreen ? (
                  <FullscreenExitOutlined />
                ) : (
                  <FullscreenOutlined />
                )
              }
              onClick={toggleFullscreen}
            >
              <span className="rvp-action-text">
                {isFullscreen ? "Thoát" : "Toàn màn hình"}
              </span>
            </AppButton>
          </Tooltip>
        </div>
      </header>

      {/* =====================================
          VIEWER CONTENT
      ===================================== */}

      <main className="rvp-content">
        <div className="rvp-viewer-container">{renderViewer()}</div>
      </main>

      {/* =====================================
          CATECHIST TOOLS
      ===================================== */}

      <CatechistToolsDrawer
        open={toolboxOpen}
        onClose={() => setToolboxOpen(false)}
        students={students}
      />

      {/* STUDENT LOADING INDICATOR */}
      {studentsLoading && (
        <div className="rvp-students-loading">
          <Spin size="small" />
          <span>Đang tải danh sách học sinh...</span>
        </div>
      )}

      {/* STUDENT ERROR */}
      {studentsError && (
        <div className="rvp-students-error">
          Không thể tải danh sách học sinh.
        </div>
      )}
    </div>,
    document.body,
  );
};

export default ResourceViewerPage;
