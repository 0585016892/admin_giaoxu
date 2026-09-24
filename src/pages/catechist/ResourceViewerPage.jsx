import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Empty, Spin, Tag, Tooltip, Typography, message } from "antd";

import {
  ArrowLeftOutlined,
  DownloadOutlined,
  FileOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  ToolOutlined,
} from "@ant-design/icons";

import { useNavigate, useParams } from "react-router-dom";

import AppButton from "../../components/common/AppButton";

import { getLessonResourceById } from "../../api/lessonApi";

import PdfViewer from "../../components/lesson-resource/PdfViewer";
import ImageViewer from "../../components/lesson-resource/ImageViewer";
import VideoViewer from "../../components/lesson-resource/VideoViewer";
import AudioViewer from "../../components/lesson-resource/AudioViewer";
import OfficeViewer from "../../components/lesson-resource/OfficeViewer";
import LinkViewer from "../../components/lesson-resource/LinkViewer";
import UnsupportedViewer from "../../components/lesson-resource/UnsupportedViewer";
import CatechistToolsDrawer from "../../components/CatechistTools/CatechistToolsDrawer";
import {
  getResourceKind,
  getResourceUrl,
  getResourceTypeLabel,
  formatFileSize,
} from "../../utils/resourceUtils";
import studentApi from "../../api/studentApi";

import "../../assets/css/ResourceViewerPage.css";
import ErrorPage from "./ErrorPage";

const { Title, Text } = Typography;

const ResourceViewerPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const pageRef = useRef(null);

  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [toolboxOpen, setToolboxOpen] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [error, setError] = useState(null);
  const [students, setStudents] = useState([]);

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);

      const response = await studentApi.getStudentsByTeacher();

      const data = response?.data;

      if (Array.isArray(data)) {
        setStudents(data);
      } else if (Array.isArray(data?.data)) {
        setStudents(data.data);
      } else {
        setStudents([]);
      }
    } catch (error) {
      setError("Bạn chưa được phân vào lớp học nào!");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  /* =========================================================
     LOAD RESOURCE
  ========================================================= */

  const loadResource = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);

      const response = await getLessonResourceById(id);

      const data =
        response?.data?.data || response?.data?.resource || response?.data;

      if (!data) {
        throw new Error("Không tìm thấy tài liệu");
      }

      setResource(data);
    } catch (error) {
      console.error("Load resource error:", error);

      setResource(null);

      messageApi.error(
        error?.response?.data?.message ||
          error?.message ||
          "Không thể tải tài liệu",
      );
    } finally {
      setLoading(false);
    }
  }, [id, messageApi]);

  useEffect(() => {
    loadResource();
  }, [loadResource]);

  /* =========================================================
     FULLSCREEN STATE
  ========================================================= */

  const handleFullscreenChange = useCallback(() => {
    const fullscreenElement =
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement;

    setIsFullscreen(Boolean(fullscreenElement));
  }, []);

  useEffect(() => {
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);

    document.addEventListener("mozfullscreenchange", handleFullscreenChange);

    document.addEventListener("MSFullscreenChange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);

      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange,
      );

      document.removeEventListener(
        "mozfullscreenchange",
        handleFullscreenChange,
      );

      document.removeEventListener(
        "MSFullscreenChange",
        handleFullscreenChange,
      );
    };
  }, [handleFullscreenChange]);

  /* =========================================================
     RESOURCE INFO
  ========================================================= */

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

  /* =========================================================
     FULLSCREEN
  ========================================================= */

  const enterFullscreen = async () => {
    try {
      const element = pageRef.current;

      if (!element) return;

      if (element.requestFullscreen) {
        await element.requestFullscreen();
      } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen();
      } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
      } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen();
      } else {
        messageApi.info("Trình duyệt không hỗ trợ chế độ toàn màn hình");
      }
    } catch (error) {
      console.error("Enter fullscreen error:", error);

      messageApi.error("Không thể mở chế độ toàn màn hình");
    }
  };

  const exitFullscreen = async () => {
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    } catch (error) {
      console.error("Exit fullscreen error:", error);
    }
  };

  const toggleFullscreen = () => {
    if (isFullscreen) {
      exitFullscreen();
    } else {
      enterFullscreen();
    }
  };

  /* =========================================================
     BACK
  ========================================================= */

  const handleBack = () => {
    navigate(-1);
  };

  /* =========================================================
     DOWNLOAD
  ========================================================= */

  const handleDownload = () => {
    if (!resourceUrl) {
      messageApi.warning("Tài liệu chưa có đường dẫn tải xuống");

      return;
    }

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
  };

  /* =========================================================
     OPEN NEW TAB
  ========================================================= */

  /* =========================================================
     VIEWER
  ========================================================= */

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

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="rvp-loading-page">
        <Spin size="large" />

        <span className="rvp-loading-text">Đang tải tài liệu...</span>
      </div>
    );
  }

  /* =========================================================
     NOT FOUND
  ========================================================= */

  if (!resource) {
    return (
      <div className="rvp-empty-page">
        {contextHolder}

        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Không tìm thấy tài liệu"
        />

        <AppButton icon={<ArrowLeftOutlined />} onClick={handleBack}>
          Quay lại
        </AppButton>
      </div>
    );
  }

  /* =========================================================
     MAIN
  ========================================================= */
  if (error) {
    return (
      <ErrorPage
        title="Không thể tải danh sách học sinh"
        message={error}
        onRetry={() => {
          setError(null);
          fetchStudents();
        }}
      />
    );
  }

  return (
    <div
      ref={pageRef}
      className={`rvp-page ${isFullscreen ? "rvp-page-fullscreen" : ""}`}
    >
      {contextHolder}

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="rvp-header">
        {/* LEFT */}
        <div className="rvp-header-left">
          <Tooltip title="Quay lại thư viện">
            <AppButton
              className="rvp-back-button"
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
              <Title
                level={4}
                className="rvp-title"
                title={resource.title || resource.file_name || "Tài liệu"}
              >
                {resource.title || resource.file_name || "Tài liệu"}
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

        {/* RIGHT */}
        <div className="rvp-header-actions">
          {resourceUrl && resourceKind !== "link" && (
            <Tooltip title="Tải xuống">
              <AppButton icon={<DownloadOutlined />} onClick={handleDownload}>
                <span className="rvp-action-text">Tải xuống</span>
              </AppButton>
            </Tooltip>
          )}

          <Tooltip title="Kho công cụ GLV">
            <AppButton
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

      {/* =====================================================
          VIEWER
      ===================================================== */}
      <CatechistToolsDrawer
        open={toolboxOpen}
        onClose={() => setToolboxOpen(false)}
        students={students}
      />

      <main className="rvp-content">
        <div className="rvp-viewer-container">{renderViewer()}</div>
      </main>
    </div>
  );
};

export default ResourceViewerPage;
