import React from "react";

import { Col, Input, Row, Select } from "antd";

import { FilterOutlined, SearchOutlined } from "@ant-design/icons";

const ResultsFilters = ({
  searchText,
  setSearchText,
  scoreFilter,
  setScoreFilter,
  rule,
}) => {
  const passScore = Number(rule?.pass_score || 5);

  return (
    <div className="results-filters">
      <Row gutter={[12, 12]}>
        <Col xs={24} md={16}>
          <Input
            size="large"
            allowClear
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="Tìm theo tên, mã học viên..."
          />
        </Col>

        <Col xs={24} md={8}>
          <Select
            size="large"
            value={scoreFilter}
            onChange={setScoreFilter}
            suffixIcon={<FilterOutlined />}
            style={{
              width: "100%",
            }}
            options={[
              {
                value: "all",
                label: "Tất cả kết quả",
              },
              {
                value: "good",
                label: "Giỏi · từ 8 điểm",
              },
              {
                value: "pass",
                label: `Đạt · từ ${passScore} điểm`,
              },
              {
                value: "fail",
                label: `Chưa đạt · dưới ${passScore} điểm`,
              },
              {
                value: "pending",
                label: "Chưa đủ điểm",
              },
            ]}
          />
        </Col>
      </Row>
    </div>
  );
};

export default ResultsFilters;
