import React from "react";
import { AudioOutlined } from "@ant-design/icons";

const AudioViewer = ({ url, title }) => {
  if (!url) {
    return <div className="resource-viewer-empty">Không có file âm thanh</div>;
  }

  return (
    <div className="resource-audio-viewer">
      <div className="resource-audio-card">
        <div className="resource-audio-icon">
          <AudioOutlined />
        </div>

        <h2>{title || "Tệp âm thanh"}</h2>

        <p>Phát nội dung âm thanh</p>

        <audio src={url} controls preload="metadata" />
      </div>
    </div>
  );
};

export default AudioViewer;
