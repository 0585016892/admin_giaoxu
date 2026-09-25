import React from "react";
import { Button, Space, Tooltip } from "antd";

import {
  PlusOutlined,
  ReloadOutlined,
  TrophyOutlined,
} from "@ant-design/icons";

const ResultsHeader = ({
  onRefresh,
  refreshLoading = false,
  onCreate,
  createDisabled = false,
}) => {
  return (
    <div className="results-header">
      <div className="results-header-left">
        <div className="results-header-icon">
          <TrophyOutlined />
        </div>

        <div>
          <div className="results-header-badge">QUẢN LÝ KẾT QUẢ</div>

          <h1 className="results-header-title">Bảng điểm học viên</h1>

          <p className="results-header-description">
            Quản lý kết quả học tập và tính điểm theo quy tắc của giáo xứ.
          </p>
        </div>
      </div>

      <Space className="results-header-actions" size={8}>
        <Tooltip title="Làm mới dữ liệu">
          <Button
            icon={<ReloadOutlined />}
            onClick={onRefresh}
            loading={refreshLoading}
          >
            Làm mới
          </Button>
        </Tooltip>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={onCreate}
          disabled={createDisabled}
        >
          Nhập điểm
        </Button>
      </Space>
    </div>
  );
};

export default ResultsHeader;
