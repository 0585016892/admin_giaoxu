import React from "react";
import { motion } from "framer-motion";

export default function LessonModal({ lesson, onClose, onNext, hasNext }) {
  const image = lesson.image || lesson.thumbnail || lesson.imageUrl;
  const status = lesson.status || "current";
  return (
    <motion.div
      className="lesson-modal-backdrop"
      role="presentation"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <motion.section
        className="lesson-modal"
        role="dialog"
        aria-modal="true"
        aria-label={lesson.title || "Chi tiết bài học"}
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 18, scale: 0.97 }}
        transition={{ type: "spring", stiffness: 280, damping: 25 }}
      >
        <button
          className="lesson-modal-close"
          onClick={onClose}
          aria-label="Đóng"
        >
          ×
        </button>
        <div className="lesson-modal-art">
          {image ? (
            <img src={image} alt="" />
          ) : (
            <div className="lesson-modal-placeholder">
              <span>{lesson.icon || "📖"}</span>
              <small>ẢNH MINH HỌA BÀI HỌC</small>
            </div>
          )}
          <span className="lesson-modal-badge">
            {lesson.className || "Lớp giáo lý"} · BÀI {lesson.lessonNumber || 1}
          </span>
        </div>
        <div className="lesson-modal-body">
          <div className="modal-kicker">✦ CHẶNG HỌC CỦA BẠN</div>
          <h2>{lesson.title || lesson.name || "Bài học"}</h2>
          <p>
            {lesson.description ||
              lesson.summary ||
              lesson.chapterTitle ||
              "Cùng khám phá nội dung bài học và hoàn thành thử thách hôm nay."}
          </p>
          <div className="modal-meta">
            <span>📚 Chương trình giáo lý</span>
            <span>
              {status === "completed"
                ? "✅ Đã hoàn thành"
                : status === "locked"
                  ? "🔒 Chưa mở khóa"
                  : "⭐ Sẵn sàng học"}
            </span>
          </div>
          {lesson.content && (
            <div className="modal-content-preview">{lesson.content}</div>
          )}
          <div className="modal-buttons">
            <button
              className="modal-primary"
              onClick={() => {
                if (lesson.onStart) lesson.onStart();
                else if (lesson.url) window.location.href = lesson.url;
                else onClose();
              }}
            >
              🚀 Bắt đầu bài học <span>→</span>
            </button>
            {hasNext && (
              <button className="modal-secondary" onClick={onNext}>
                Bài tiếp theo ↗
              </button>
            )}
          </div>
        </div>
      </motion.section>
    </motion.div>
  );
}
