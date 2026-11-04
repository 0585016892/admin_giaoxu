import React from "react";
import { Popconfirm, Tag, Tooltip } from "antd";
import {
  DeleteOutlined,
  DownloadOutlined,
  EyeOutlined,
  LinkOutlined,
} from "@ant-design/icons";

import AppButton from "../../../../components/common/AppButton";
import "./ResourceItem.css";

const ResourceItem = ({
  resource,
  categoryLabels = {},
  getResourceIcon,
  getResourceUrl,
  isResourceActive,
  formatFileSize,
  onView,
  onDownload,
  onDelete,
}) => {
  if (!resource) return null;

  const isLink = resource.resource_type === "link";
  const isActive = isResourceActive(resource);
  const resourceUrl = getResourceUrl(resource);
  const canView = Boolean(resource.id && (resourceUrl || isLink));

  const title = resource.title || resource.file_name || "Tài liệu chưa đặt tên";

  const category =
    categoryLabels[resource.resource_category] ||
    resource.resource_category ||
    "Tài liệu";

  return (
    <tr className={`ll-resource-row ${!isActive ? "is-disabled" : ""}`}>
      {/* Tên tài liệu */}
      <td className="ll-resource-cell ll-resource-name-cell">
        <div className="ll-resource-name-wrap">
          <div className="ll-resource-table-icon">
            {getResourceIcon(resource, 21)}
          </div>

          <div className="ll-resource-name-content">
            <Tooltip title={title}>
              <span className="ll-resource-table-title">{title}</span>
            </Tooltip>

            <span className="ll-resource-table-description">
              {resource.description ||
                resource.file_name ||
                (isLink ? resource.external_url : "Tài liệu bài học")}
            </span>
          </div>
        </div>
      </td>

      {/* Danh mục */}
      <td className="ll-resource-cell ll-resource-category-cell">
        <Tag className="ll-resource-category-tag">{category}</Tag>
      </td>

      {/* Định dạng */}
      <td className="ll-resource-cell ll-resource-type-cell">
        {isLink ? (
          <span className="ll-resource-type-link">
            <LinkOutlined />
            Liên kết
          </span>
        ) : (
          <span className="ll-resource-file-type">
            {resource.file_type
              ? String(resource.file_type).toUpperCase()
              : "Tệp"}
          </span>
        )}
      </td>

      {/* Dung lượng */}
      <td className="ll-resource-cell ll-resource-size-cell">
        {isLink
          ? "—"
          : resource.file_size
            ? formatFileSize(resource.file_size)
            : "—"}
      </td>

      {/* Trạng thái */}
      <td className="ll-resource-cell ll-resource-status-cell">
        {isActive ? (
          <span className="ll-resource-status active">
            <span />
            Đang hoạt động
          </span>
        ) : (
          <span className="ll-resource-status inactive">
            <span />
            Đã tắt
          </span>
        )}
      </td>

      {/* Thao tác */}
      <td className="ll-resource-cell ll-resource-action-cell">
        <div className="ll-resource-table-actions">
          {canView && (
            <Tooltip title={isLink ? "Mở liên kết" : "Xem tài liệu"}>
              <AppButton
                variant="secondary"
                size="small"
                icon={isLink ? <LinkOutlined /> : <EyeOutlined />}
                onClick={() => onView(resource)}
              />
            </Tooltip>
          )}

          {!isLink && resourceUrl && (
            <Tooltip title="Tải xuống">
              <AppButton
                variant="secondary"
                size="small"
                icon={<DownloadOutlined />}
                onClick={() => onDownload(resource)}
              />
            </Tooltip>
          )}

          <Popconfirm
            title="Xóa tài liệu?"
            description={
              isLink
                ? "Đường liên kết sẽ bị xóa khỏi bài học."
                : "Tệp tài liệu sẽ bị xóa khỏi hệ thống."
            }
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
            onConfirm={() => onDelete(resource)}
          >
            <Tooltip title="Xóa tài liệu">
              <AppButton danger size="small" icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </div>
      </td>
    </tr>
  );
};

export default ResourceItem;
