import React from "react";
import { Col, Input, Row, Select, Upload } from "antd";
import { InboxOutlined, LinkOutlined } from "@ant-design/icons";

import AppFormModal from "../../../../components/common/AppFormModal";

import "./UploadResourceModal.css";

const { Dragger } = Upload;

const ACCEPTED_FILE_TYPES = [
  ".ppt",
  ".pptx",
  ".pdf",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".webp",
  ".svg",
  ".bmp",
  ".mp4",
  ".webm",
  ".mov",
  ".m4v",
  ".mp3",
  ".wav",
  ".ogg",
  ".m4a",
  ".aac",
  ".zip",
].join(",");

const UploadResourceModal = ({
  open,
  uploading,
  uploadData,
  setUploadData,
  selectedFile,
  setSelectedFile,
  selectedProgram,
  selectedLesson,
  categoryOptions,
  closeUploadModal,
  handleUpload,
  handleExternalUrlChange,
  handleBeforeUpload,
  normalizeUrl,
}) => {
  const hasExternalUrl = Boolean(normalizeUrl(uploadData?.external_url));

  const handleFieldChange = (field, value) => {
    setUploadData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <AppFormModal
      title="Thêm tài liệu bài học"
      subtitle="Thêm giáo trình, tài liệu hoặc đường link cho bài học"
      onCancel={closeUploadModal}
      onOk={handleUpload}
      confirmLoading={uploading}
      okText="Thêm tài liệu"
      cancelText="Hủy"
      width={600}
      className="catechist-modal ll-upload-modal"
      open={open}
    >
      <div className="ll-upload-form">
        {/* Tên tài liệu */}
        <div className="ll-form-label">
          Tên tài liệu
          <span className="ll-required">*</span>
        </div>

        <Input
          size="large"
          placeholder="VD: Giáo án Bài 1 - Hôn nhân"
          value={uploadData.title}
          onChange={(event) => handleFieldChange("title", event.target.value)}
        />

        {/* Mô tả */}
        <div className="ll-form-label">Mô tả</div>

        <Input.TextArea
          rows={3}
          placeholder="Mô tả ngắn về tài liệu..."
          value={uploadData.description}
          onChange={(event) =>
            handleFieldChange("description", event.target.value)
          }
        />

        {/* Đường link */}
        <div className="ll-form-label">
          Đường link tài liệu / video
          <span className="ll-form-label-optional">Không bắt buộc</span>
        </div>

        <Input
          size="large"
          placeholder="https://youtube.com/watch?v=..."
          value={uploadData.external_url || ""}
          onChange={handleExternalUrlChange}
          prefix={<LinkOutlined />}
          allowClear
        />

        <div className="ll-form-help">
          Có thể nhập link YouTube, Google Drive hoặc website bên ngoài. Không
          cần chọn file nếu sử dụng đường link.
        </div>

        {/* Loại tài liệu và thứ tự */}
        <Row gutter={14}>
          <Col xs={24} sm={16}>
            <div className="ll-form-label">Loại tài liệu</div>

            <Select
              size="large"
              style={{ width: "100%" }}
              value={uploadData.resource_category}
              options={categoryOptions}
              onChange={(value) =>
                handleFieldChange("resource_category", value)
              }
            />
          </Col>

          <Col xs={24} sm={8}>
            <div className="ll-form-label">Thứ tự</div>

            <Input
              size="large"
              type="number"
              min={0}
              value={uploadData.sort_order}
              onChange={(event) =>
                handleFieldChange("sort_order", Number(event.target.value || 0))
              }
            />
          </Col>
        </Row>

        {/* Chọn file */}
        <div className="ll-form-label">
          File tài liệu
          <span className="ll-form-label-optional">
            Không bắt buộc nếu đã có đường link
          </span>
        </div>

        <Dragger
          className="ll-upload-dragger"
          multiple={false}
          maxCount={1}
          disabled={hasExternalUrl}
          accept={ACCEPTED_FILE_TYPES}
          fileList={
            selectedFile
              ? [
                  {
                    uid: "-1",
                    name: selectedFile.name,
                    status: "done",
                  },
                ]
              : []
          }
          beforeUpload={handleBeforeUpload}
          onRemove={() => {
            setSelectedFile(null);
          }}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>

          <p className="ant-upload-text">Kéo file vào đây hoặc click để chọn</p>

          <p className="ant-upload-hint">
            PPT, PPTX, PDF, DOC, DOCX, XLS, XLSX, hình ảnh, video, audio, ZIP
          </p>

          <p className="ant-upload-hint">Dung lượng tối đa: 100MB</p>

          {hasExternalUrl && (
            <div className="ll-upload-disabled-note">
              Đang sử dụng đường link — không cần tải file.
            </div>
          )}
        </Dragger>

        {/* Thông tin chương trình */}
        <div className="ll-upload-note">
          <div>
            <strong>Chương trình:</strong>{" "}
            {selectedProgram?.name || "Chưa chọn chương trình"}
          </div>

          <div>
            <strong>Bài học:</strong>{" "}
            {selectedLesson?.title || "Chưa chọn bài học"}
          </div>
        </div>
      </div>
    </AppFormModal>
  );
};

export default UploadResourceModal;
