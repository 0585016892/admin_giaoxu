import React from "react";

const CatechistToolCard = ({ tool, onClick }) => {
  return (
    <button type="button" className="catechist-tool-card" onClick={onClick}>
      <div className="catechist-tool-card-icon">{tool.icon}</div>

      <div className="catechist-tool-card-content">
        <div className="catechist-tool-card-title">{tool.title}</div>

        <div className="catechist-tool-card-description">
          {tool.description}
        </div>
      </div>

      <div className="catechist-tool-card-arrow">→</div>
    </button>
  );
};

export default CatechistToolCard;
