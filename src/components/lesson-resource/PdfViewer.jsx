import React from "react";

const PdfViewer = ({ url, title }) => {
  if (!url) {
    return <div className="resource-viewer-empty">Không có đường dẫn PDF</div>;
  }

  return (
    <div className="resource-pdf-viewer">
      <iframe src={url} title={title || "PDF"} className="resource-pdf-frame" />
    </div>
  );
};

export default PdfViewer;
