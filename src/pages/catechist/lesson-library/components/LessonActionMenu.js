import React from "react";
import {
  BookOutlined,
  DeleteOutlined,
  EyeOutlined,
  FolderOpenOutlined,
} from "@ant-design/icons";
import "./LessonActionMenu.css";

const LessonActionMenu = ({ lesson, openLesson, closeMenu, notify }) => {
  if (!lesson) return null;

  const handleAction = (message) => {
    closeMenu?.();
    notify?.(message);
  };

  return (
    <div
      className="ll-action-menu"
      onClick={(event) => event.stopPropagation()}
    >
      <button
        type="button"
        onClick={() => {
          closeMenu?.();
          openLesson?.(lesson);
        }}
      >
        <EyeOutlined />
        <span>Xem chi tiết</span>
      </button>

      <button
        type="button"
        onClick={() => {
          closeMenu?.();
          openLesson?.(lesson);
        }}
      >
        <FolderOpenOutlined />
        <span>Mở bài học</span>
      </button>

      <button
        type="button"
        onClick={() => handleAction("Chức năng chỉnh sửa sẽ được bổ sung.")}
      >
        <BookOutlined />
        <span>Chỉnh sửa</span>
      </button>

      <button
        type="button"
        onClick={() => handleAction("Chức năng sao chép sẽ được bổ sung.")}
      >
        <BookOutlined />
        <span>Sao chép</span>
      </button>

      <div className="ll-action-divider" />

      <button
        type="button"
        className="danger"
        onClick={() =>
          handleAction("Chức năng xóa bài học chưa được cấu hình.")
        }
      >
        <DeleteOutlined />
        <span>Xóa</span>
      </button>
    </div>
  );
};

export default LessonActionMenu;
