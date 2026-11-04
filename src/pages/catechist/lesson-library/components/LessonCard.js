import React from "react";
import { FolderOpenOutlined, MoreOutlined } from "@ant-design/icons";
import LessonActionMenu from "./LessonActionMenu";
import "./LessonCard.css";

const LessonCard = ({
  lesson,
  viewMode = "grid",
  selectedProgram,
  menuLessonId,
  setMenuLessonId,
  openLesson,
  notify,
}) => {
  const isMenuOpen = menuLessonId === lesson.id;

  const toggleMenu = (event) => {
    event.stopPropagation();

    setMenuLessonId(isMenuOpen ? null : lesson.id);
  };

  const handleOpen = () => {
    setMenuLessonId(null);
    openLesson(lesson);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleOpen();
    }
  };

  return viewMode === "list" ? (
    <div
      className="ll-list-item"
      onClick={handleOpen}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
    >
      <div className="ll-list-icon">
        <FolderOpenOutlined />
      </div>

      <div className="ll-list-content">
        <div className="ll-list-title">
          {lesson.title || `Bài học #${lesson.id}`}
        </div>

        <div className="ll-list-meta">
          BÀI HỌC
          <span>•</span>
          ID: {lesson.id}
        </div>
      </div>

      <div className="ll-list-type">
        {selectedProgram?.name || "Chương trình giáo lý"}
      </div>

      <div className="ll-more-wrapper">
        <button
          type="button"
          className="ll-more-button"
          onClick={toggleMenu}
          aria-label="Thao tác bài học"
        >
          <MoreOutlined />
        </button>

        {isMenuOpen && (
          <LessonActionMenu
            lesson={lesson}
            openLesson={openLesson}
            closeMenu={() => setMenuLessonId(null)}
            notify={notify}
          />
        )}
      </div>
    </div>
  ) : (
    <div
      className="ll-file-card"
      onClick={handleOpen}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
    >
      <div className="ll-file-preview">
        <div className="ll-folder-graphic">
          <div className="ll-folder-back" />
          <div className="ll-folder-front">
            <span />
          </div>
        </div>
      </div>

      <div className="ll-file-info">
        <div className="ll-file-row">
          <div className="ll-small-folder">
            <FolderOpenOutlined />
          </div>

          <div className="ll-file-name">
            {lesson.title || `Bài học #${lesson.id}`}
          </div>

          <div className="ll-more-wrapper">
            <button
              type="button"
              className="ll-more-button"
              onClick={toggleMenu}
              aria-label="Thao tác bài học"
            >
              <MoreOutlined />
            </button>

            {isMenuOpen && (
              <LessonActionMenu
                lesson={lesson}
                openLesson={openLesson}
                closeMenu={() => setMenuLessonId(null)}
                notify={notify}
              />
            )}
          </div>
        </div>

        <div className="ll-file-meta">
          <span>BÀI HỌC</span>
          <span>•</span>
          <span>ID: {lesson.id}</span>
        </div>
      </div>
    </div>
  );
};

export default LessonCard;
