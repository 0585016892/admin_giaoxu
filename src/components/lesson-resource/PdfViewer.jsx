import React, { useState } from "react";
import {
  FilePdfOutlined,
  ExportOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { Button } from "antd";
import "../../assets/css/ResourceViewer.css";

const PdfViewer = ({ url, title }) => {
  const [iframeError, setIframeError] = useState(false);

  if (!url) {
    return (
      <div className="resource-viewer-empty">
        <div className="resource-viewer-empty-icon resource-viewer-empty-icon-pdf">
          <FilePdfOutlined />
        </div>

        <div className="resource-viewer-empty-title">Không có tài liệu PDF</div>

        <div className="resource-viewer-empty-text">
          Tài liệu PDF hiện chưa có đường dẫn để hiển thị.
        </div>
      </div>
    );
  }

  const openPdf = () => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const reloadPdf = () => {
    setIframeError(false);
  };

  return (
    <div className="resource-pdf-viewer">
      {/* =====================================================
          HEADER
          ===================================================== */}
      <div className="resource-viewer-header">
        <div className="resource-viewer-header-icon resource-viewer-header-icon-pdf">
          <FilePdfOutlined />
        </div>

        <div className="resource-viewer-header-content">
          <div className="resource-viewer-header-title">
            {title || "Tài liệu PDF"}
          </div>

          <div className="resource-viewer-header-subtitle">
            Xem trực tiếp tài liệu PDF trên hệ thống
          </div>
        </div>

        <div className="resource-pdf-header-actions">
          <Button icon={<ExportOutlined />} onClick={openPdf}>
            Mở ngoài
          </Button>
        </div>
      </div>

      {/* =====================================================
          PDF CONTENT
          ===================================================== */}
      <div className="resource-pdf-stage">
        {iframeError ? (
          <div className="resource-pdf-error">
            <div className="resource-pdf-error-icon">
              <FilePdfOutlined />
            </div>

            <div className="resource-pdf-error-title">
              Không thể hiển thị PDF
            </div>

            <div className="resource-pdf-error-text">
              Trình duyệt không thể hiển thị trực tiếp tài liệu này. Bạn có thể
              thử tải lại hoặc mở tài liệu trong tab mới.
            </div>

            <div className="resource-pdf-error-actions">
              <Button icon={<ReloadOutlined />} onClick={reloadPdf}>
                Tải lại
              </Button>

              <Button
                type="primary"
                icon={<ExportOutlined />}
                onClick={openPdf}
              >
                Mở tài liệu
              </Button>
            </div>
          </div>
        ) : (
          <iframe
            src={url}
            title={title || "PDF"}
            className="resource-pdf-frame"
            onError={() => setIframeError(true)}
            loading="lazy"
          />
        )}
      </div>

      {/* =====================================================
          FOOTER
          ===================================================== */}
      <div className="resource-pdf-footer">
        <div className="resource-pdf-footer-info">
          <FilePdfOutlined />

          <span>{title || "Tài liệu PDF"}</span>
        </div>

        <Button type="link" icon={<ExportOutlined />} onClick={openPdf}>
          Mở trong tab mới
        </Button>
      </div>
    </div>
  );
};

export default PdfViewer;
