import React from "react";
import { ArrowLeftOutlined, ReloadOutlined } from "@ant-design/icons";
import { Spin } from "antd";
import { AppButton } from "../../../../components/common/AppButton";
import LessonToolbar from "../components/LessonToolbar";
import LessonList from "../components/LessonList";
import "./LessonListScreen.css";

const LessonListScreen = ({
  selectedProgram,
  lessons,
  paginatedLessons,
  loading,
  searchText,
  setSearchText,
  sortType,
  setSortType,
  viewMode,
  setViewMode,
  menuLessonId,
  setMenuLessonId,
  openLesson,
  backToPrograms,
  loadLessons,
  notify,
  currentPage,
  pageSize,
  setCurrentPage,
  setPageSize,
}) => {
  return (
    <section className="ll-lesson-screen">
      <div className="ll-lesson-screen-header">
        <div className="ll-lesson-heading">
          <button
            type="button"
            className="ll-back-button"
            onClick={backToPrograms}
          >
            <ArrowLeftOutlined />
            <span>Chương trình giáo lý</span>
          </button>

          <div className="ll-lesson-title-row">
            <div>
              <div className="ll-lesson-eyebrow">
                {selectedProgram?.code || "CHƯƠNG TRÌNH GIÁO LÝ"}
              </div>

              <h2>{selectedProgram?.name || "Danh sách bài học"}</h2>

              <p>Quản lý và xem nội dung các bài học trong chương trình.</p>
            </div>

            <AppButton
              variant="secondary"
              icon={<ReloadOutlined />}
              onClick={loadLessons}
            >
              Làm mới
            </AppButton>
          </div>
        </div>
      </div>

      <LessonToolbar
        searchText={searchText}
        setSearchText={setSearchText}
        sortType={sortType}
        setSortType={setSortType}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      {loading ? (
        <div className="ll-lesson-loading">
          <Spin size="large" tip="Đang tải danh sách bài học..." />
        </div>
      ) : (
        <LessonList
          lessons={lessons}
          paginatedLessons={paginatedLessons}
          searchText={searchText}
          viewMode={viewMode}
          selectedProgram={selectedProgram}
          menuLessonId={menuLessonId}
          setMenuLessonId={setMenuLessonId}
          openLesson={openLesson}
          notify={notify}
          currentPage={currentPage}
          pageSize={pageSize}
          setCurrentPage={setCurrentPage}
          setPageSize={setPageSize}
        />
      )}
    </section>
  );
};

export default LessonListScreen;
