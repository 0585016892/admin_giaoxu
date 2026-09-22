import React from "react";
import { FileOutlined, DownloadOutlined } from "@ant-design/icons";
import { Button } from "antd";

import { getResourceTypeLabel } from "../../utils/resourceUtils";

const UnsupportedViewer = ({ resource, url }) => {
  const download = () => {
    if (!url) return;

    const link = document.createElement("a");

    link.href = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";

    link.download = resource?.file_name || resource?.title || "tai-lieu";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="resource-unsupported-viewer">
      <div className="resource-unsupported-card">
        <div className="resource-unsupported-icon">
          <FileOutlined />
        </div>

        <h2>{resource?.title || "Tài liệu"}</h2>

        <p>
          Định dạng <strong>{getResourceTypeLabel(resource)}</strong> chưa hỗ
          trợ xem trực tiếp.
        </p>

        {resource?.file_name && (
          <div className="resource-file-name">{resource.file_name}</div>
        )}

        {url && (
          <Button type="primary" icon={<DownloadOutlined />} onClick={download}>
            Tải tài liệu
          </Button>
        )}
      </div>
    </div>
  );
};

export default UnsupportedViewer;
