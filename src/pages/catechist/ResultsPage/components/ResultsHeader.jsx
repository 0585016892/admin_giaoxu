import React from "react";

import { PlusOutlined, TrophyOutlined } from "@ant-design/icons";

import PageHeroHeader from "../../../../components/common/PageHeroHeader";

const ResultsHeader = ({
  onRefresh,
  refreshLoading = false,
  onCreate,
  createDisabled = false,
}) => {
  return (
    <PageHeroHeader
      icon={<TrophyOutlined />}
      badgeText="QUẢN LÝ KẾT QUẢ"
      title="Bảng điểm học viên"
      description="Quản lý kết quả học tập và tính điểm theo quy tắc của giáo xứ."
      // =====================================================
      // REFRESH
      // =====================================================

      onRefresh={onRefresh}
      refreshLoading={refreshLoading}
      refreshTooltip="Làm mới dữ liệu"
      // =====================================================
      // PRIMARY ACTION
      // =====================================================

      primaryButtonText="Nhập điểm"
      primaryButtonIcon={<PlusOutlined />}
      onPrimaryClick={onCreate}
      primaryDisabled={createDisabled}
    />
  );
};

export default ResultsHeader;
