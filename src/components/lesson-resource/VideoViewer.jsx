import React from "react";

const VideoViewer = ({ url, title }) => {
  if (!url) {
    return <div className="resource-viewer-empty">Không có video</div>;
  }

  return (
    <div className="resource-video-viewer">
      <video
        src={url}
        controls
        playsInline
        preload="metadata"
        className="resource-video"
        title={title || "Video"}
      >
        Trình duyệt không hỗ trợ phát video.
      </video>
    </div>
  );
};

export default VideoViewer;
