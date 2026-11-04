import React from "react";
import { Empty, Pagination } from "antd";
import LessonCard from "./LessonCard";
import "./LessonList.css";

const LessonList = ({
  lessons = [],
  paginatedLessons = [],
  searchText,
  viewMode,
  selectedProgram,
  menuLessonId,
  setMenuLessonId,
  openLesson,
  notify,
  currentPage,
  pageSize,
  setCurrentPage,
  setPageSize,
}) => {
  if (!lessons.length) {
    return (
      <div className="ll-empty">
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            searchText
              ? "Không tìm thấy bài học phù hợp"
              : "Chương trình này chưa có bài học"
          }
        />
      </div>
    );
  }

  return (
    <div className="ll-lesson-list-container">
      <div className={viewMode === "list" ? "ll-list" : "ll-grid"}>
        {paginatedLessons.map((lesson) => (
          <LessonCard
            key={lesson.id}
            lesson={lesson}
            viewMode={viewMode}
            selectedProgram={selectedProgram}
            menuLessonId={menuLessonId}
            setMenuLessonId={setMenuLessonId}
            openLesson={openLesson}
            notify={notify}
          />
        ))}
      </div>

      {lessons.length > pageSize && (
        <div className="ll-pagination">
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={lessons.length}
            showSizeChanger
            pageSizeOptions={["12", "24", "48"]}
            showTotal={(total, range) =>
              `${range[0]}-${range[1]} / ${total} bài học`
            }
            onChange={(page, size) => {
              if (size !== pageSize) {
                setPageSize(size);
                setCurrentPage(1);
                return;
              }

              setCurrentPage(page);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default LessonList;
