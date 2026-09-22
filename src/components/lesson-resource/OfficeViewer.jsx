import React from "react";
import { Empty } from "antd";

const OfficeViewer = ({ resource, url }) => {
  if (!url) {
    return (
      <div className="office-viewer-empty">
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Không có đường dẫn tài liệu"
        />
      </div>
    );
  }

  const viewerUrl = `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(
    url,
  )}`;

  return (
    <div className="office-viewer">
      <iframe
        title={resource?.title || resource?.file_name || "Office document"}
        src={viewerUrl}
        className="office-viewer-frame"
        frameBorder="0"
        allowFullScreen
      />
    </div>
  );
};

export default OfficeViewer;
