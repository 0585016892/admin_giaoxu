import React from "react";

import { Button, Popconfirm, Space, Tag } from "antd";

import {
  CheckOutlined,
  DeleteOutlined,
  SaveOutlined,
  SettingOutlined,
} from "@ant-design/icons";

import PageHeroHeader from "../../../../components/common/PageHeroHeader";

const GradingRuleHeader = ({
  rule,
  saving = false,
  refreshing = false,
  onRefresh,
  onSave,
  onDelete,
}) => {
  const hasRule = Boolean(rule?.id);

  return (
    <>
      <PageHeroHeader
        icon={<SettingOutlined />}
        badgeText="CẤU HÌNH TÍNH ĐIỂM"
        title="Quy tắc tính điểm"
        description="Thiết lập cách tính điểm chung cho học sinh trong giáo xứ."
        onRefresh={onRefresh}
        refreshLoading={refreshing || saving}
        primaryButtonText={hasRule ? "Lưu thay đổi" : "Tạo quy tắc"}
        primaryButtonIcon={hasRule ? <SaveOutlined /> : <CheckOutlined />}
        onPrimaryClick={onSave}
        primaryDisabled={saving || refreshing}
      />

      <div className="grading-rule-header-actions">
        <Space wrap size={10}>
          <Tag
            className="grading-rule-status-tag"
            color={rule?.status === "active" ? "success" : "default"}
          >
            {rule?.status === "active"
              ? "Đang áp dụng"
              : hasRule
                ? "Tạm ngưng"
                : "Chưa thiết lập"}
          </Tag>

          {hasRule && (
            <Popconfirm
              title="Xóa quy tắc tính điểm?"
              description="Thao tác này sẽ xóa quy tắc hiện tại. Chỉ thực hiện khi bạn chắc chắn."
              okText="Xóa"
              cancelText="Hủy"
              okButtonProps={{
                danger: true,
                loading: saving,
              }}
              onConfirm={onDelete}
            >
              <Button danger icon={<DeleteOutlined />} disabled={saving}>
                Xóa quy tắc
              </Button>
            </Popconfirm>
          )}
        </Space>
      </div>
    </>
  );
};

export default GradingRuleHeader;
