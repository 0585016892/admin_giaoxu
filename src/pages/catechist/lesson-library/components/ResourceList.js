import React from "react";
import { Spin } from "antd";
import { InboxOutlined, UploadOutlined } from "@ant-design/icons";

import AppButton from "../../../../components/common/AppButton";
import ResourceItem from "./ResourceItem";

import "./ResourceList.css";

const ResourceList = ({
  resources = [],
  loading = false,
  categoryLabels = {},
  getResourceIcon,
  getResourceUrl,
  isResourceActive,
  formatFileSize,
  onView,
  onDownload,
  onDelete,
  onUpload,
}) => {
  return (
    <section className="ll-resource-list-section">
      {/* Loading */}
      {loading ? (
        <div className="ll-resource-loading">
          <Spin tip="Đang tải tài liệu..." />
        </div>
      ) : resources.length === 0 ? (
        /* Empty */
        <div className="ll-resource-empty">
          <div className="ll-empty-icon">
            <InboxOutlined />
          </div>

          <h3>Chưa có tài liệu</h3>

          <p>
            Bài học này chưa có tài liệu. Hãy thêm giáo án, PDF, Word,
            PowerPoint, hình ảnh, video hoặc liên kết.
          </p>

          <AppButton size="small" icon={<UploadOutlined />} onClick={onUpload}>
            Thêm tài liệu đầu tiên
          </AppButton>
        </div>
      ) : (
        /* Table */
        <div className="ll-resource-table-wrapper">
          <table className="ll-resource-table">
            <thead>
              <tr>
                <th>Tên tài liệu</th>
                <th>Danh mục</th>
                <th>Loại</th>
                <th>Dung lượng</th>
                <th>Trạng thái</th>
                <th className="ll-resource-th-actions">Thao tác</th>
              </tr>
            </thead>

            <tbody>
              {resources.map((resource) => (
                <ResourceItem
                  key={resource.id}
                  resource={resource}
                  categoryLabels={categoryLabels}
                  getResourceIcon={getResourceIcon}
                  getResourceUrl={getResourceUrl}
                  isResourceActive={isResourceActive}
                  formatFileSize={formatFileSize}
                  onView={onView}
                  onDownload={onDownload}
                  onDelete={onDelete}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default ResourceList;
