import React from "react";
import { LinkOutlined, ExportOutlined } from "@ant-design/icons";
import { Button } from "antd";

const LinkViewer = ({ resource, url }) => {
  if (!url) {
    return <div className="resource-viewer-empty">Không có đường dẫn</div>;
  }

  const openLink = () => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="resource-link-viewer">
      <div className="resource-link-card">
        <div className="resource-link-icon">
          <LinkOutlined />
        </div>

        <h2>{resource?.title || "Tài liệu liên kết"}</h2>

        {resource?.description && <p>{resource.description}</p>}

        <div className="resource-link-url">{url}</div>

        <Button
          type="primary"
          size="large"
          icon={<ExportOutlined />}
          onClick={openLink}
        >
          Mở liên kết
        </Button>
      </div>
    </div>
  );
};

export default LinkViewer;
