import React from "react";
import { Card } from "antd";
import {
  ArrowLeftOutlined,
  FolderOpenOutlined,
  UploadOutlined,
} from "@ant-design/icons";

import AppButton from "../../../../components/common/AppButton";

import ResourceList from "../components/ResourceList";
import QuestionSection from "../components/QuestionSection";

import "./LessonDetailScreen.css";

const LessonDetailScreen = ({
  selectedProgram,
  selectedLesson,

  resources,
  resourceLoading,

  questions,
  questionLoading,

  categoryLabels,
  getResourceIcon,
  getResourceUrl,
  isResourceActive,
  formatFileSize,

  backToLibrary,
  openUploadModal,
  loadResources,

  openResourceViewer,
  downloadResource,
  handleDelete,

  onPlayQuestions,
}) => {
  if (!selectedLesson) return null;

  return (
    <section className="ll-detail-screen">
      {/* HEADER */}
      <div className="ll-detail-header">
        <div className="ll-detail-left">
          <AppButton
            variant="secondary"
            size="small"
            icon={<ArrowLeftOutlined />}
            onClick={backToLibrary}
          >
            Quay lại danh sách bài học
          </AppButton>

          <div className="ll-detail-info">
            <div className="ll-detail-icon">
              <FolderOpenOutlined />
            </div>

            <div className="ll-detail-heading">
              <div className="ll-detail-type">
                {selectedProgram?.name || "Chương trình giáo lý"}
              </div>

              <h2>{selectedLesson.title || `Bài học #${selectedLesson.id}`}</h2>
            </div>
          </div>
        </div>

        <AppButton
          variant="secondary"
          size="small"
          icon={<UploadOutlined />}
          onClick={openUploadModal}
        >
          Thêm tài liệu
        </AppButton>
      </div>

      {/* RESOURCES */}
      <Card bordered={false} className="ll-resources-card">
        <ResourceList
          resources={resources}
          loading={resourceLoading}
          categoryLabels={categoryLabels}
          getResourceIcon={getResourceIcon}
          getResourceUrl={getResourceUrl}
          isResourceActive={isResourceActive}
          formatFileSize={formatFileSize}
          onView={openResourceViewer}
          onDownload={downloadResource}
          onDelete={handleDelete}
          onUpload={openUploadModal}
        />

        <QuestionSection
          questions={questions}
          loading={questionLoading}
          onPlay={onPlayQuestions}
        />
      </Card>
    </section>
  );
};

export default LessonDetailScreen;
