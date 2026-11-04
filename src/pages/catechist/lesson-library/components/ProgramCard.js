import React from "react";
import { Tag } from "antd";
import { BookOpen, ChevronRight, GraduationCap } from "lucide-react";
import "./ProgramCard.css";

const ProgramCard = ({ program, index = 0, onClick }) => {
  if (!program) return null;

  const handleClick = () => onClick?.(program);

  return (
    <div
      className="ll-program-list-item"
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      <div className="ll-program-list-number">
        {String(index + 1).padStart(2, "0")}
      </div>

      <div className="ll-program-list-icon">
        <GraduationCap size={21} strokeWidth={1.8} />
      </div>

      <div className="ll-program-list-content">
        <div className="ll-program-list-heading">
          <h3>{program.name || "Chương trình chưa đặt tên"}</h3>

          {program.code && (
            <Tag className="ll-program-list-code">{program.code}</Tag>
          )}
        </div>

        <p>
          {program.description ||
            "Chương trình học giáo lý và tài liệu học tập."}
        </p>
      </div>

      <div className="ll-program-list-action">
        <span className="ll-program-list-open-text">
          <BookOpen size={15} />
          <span>Xem bài học</span>
        </span>

        <span className="ll-program-list-arrow">
          <ChevronRight size={19} />
        </span>
      </div>
    </div>
  );
};

export default ProgramCard;
