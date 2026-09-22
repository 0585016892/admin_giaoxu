import React from "react";
import { Image } from "antd";

const ImageViewer = ({ url, title }) => {
  if (!url) {
    return <div className="resource-viewer-empty">Không có hình ảnh</div>;
  }

  return (
    <div className="resource-image-viewer">
      <Image
        src={url}
        alt={title || "Hình ảnh"}
        preview
        className="resource-image"
      />
    </div>
  );
};

export default ImageViewer;
