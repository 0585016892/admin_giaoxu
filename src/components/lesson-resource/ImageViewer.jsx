import React from "react";
import { Image } from "antd";
import { FileImageOutlined, ZoomInOutlined } from "@ant-design/icons";
import "../../assets/css/ResourceViewer.css";
const ImageViewer = ({ url, title }) => {
  if (!url) {
    return (
      <div className="resource-viewer-empty">
        <div className="resource-viewer-empty-icon">
          <FileImageOutlined />
        </div>

        <div className="resource-viewer-empty-title">Không có hình ảnh</div>

        <div className="resource-viewer-empty-text">
          Hình ảnh của tài liệu hiện chưa khả dụng.
        </div>
      </div>
    );
  }

  return (
    <div className="resource-image-viewer">
      <div className="resource-viewer-header">
        <div className="resource-viewer-header-icon">
          <FileImageOutlined />
        </div>

        <div className="resource-viewer-header-content">
          <div className="resource-viewer-header-title">
            {title || "Hình ảnh tài liệu"}
          </div>

          <div className="resource-viewer-header-subtitle">
            Nhấn vào hình ảnh để phóng to
          </div>
        </div>
      </div>

      <div className="resource-image-stage">
        <Image
          src={url}
          alt={title || "Hình ảnh tài liệu"}
          preview={{
            mask: (
              <div className="resource-image-preview-mask">
                <ZoomInOutlined />
                <span>Phóng to</span>
              </div>
            ),
          }}
          className="resource-image"
        />
      </div>
    </div>
  );
};

export default ImageViewer;
