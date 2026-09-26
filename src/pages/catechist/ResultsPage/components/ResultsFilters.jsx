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
    <>
      <div className="results-filters">
        <Row className="results-filters-row" gutter={[12, 12]} align="middle">
          {/* =================================================
              SEARCH
          ================================================= */}

          <Col xs={24} md={16} lg={17}>
            <div className="results-filter-field">
              <label>Tìm kiếm học viên</label>

              <Input
                className="results-search-input"
                size="large"
                allowClear
                prefix={<SearchOutlined className="results-search-icon" />}
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                placeholder="Tìm theo tên, mã học viên..."
              />
            </div>
          </Col>

          {/* =================================================
              SCORE FILTER
          ================================================= */}

          <Col xs={24} md={8} lg={7}>
            <div className="results-filter-field">
              <label>Kết quả</label>

              <Select
                className="results-score-select"
                size="large"
                value={scoreFilter}
                onChange={setScoreFilter}
                suffixIcon={<FilterOutlined />}
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
            </div>
          </Col>
        </Row>
      </div>

      <style>{`
        /* ===================================================
           FILTER CONTAINER
        =================================================== */

        .results-filters {
          width: 100%;
          margin-bottom: 16px;
          padding: 16px 18px;

          background: #ffffff;

          border: 1px solid #e2e8f0;
          border-radius: 16px;

          box-shadow: 0 3px 14px rgba(23, 59, 94, 0.035);
        }

        .results-filters-row {
          width: 100%;
        }

        /* ===================================================
           FIELD
        =================================================== */

        .results-filter-field {
          width: 100%;

          display: flex;
          flex-direction: column;

          gap: 6px;
        }

        .results-filter-field > label {
          color: #64748b;

          font-size: 11px;
          font-weight: 700;

          letter-spacing: 0.035em;
          text-transform: uppercase;
        }

        /* ===================================================
           SEARCH
        =================================================== */

        .results-search-input {
          width: 100%;

          height: 44px;

          border-color: #dfe5eb !important;
          border-radius: 10px !important;

          background: #ffffff;

          box-shadow: none !important;

          color: #334155;

          transition:
            border-color 0.18s ease,
            box-shadow 0.18s ease;
        }

        .results-search-input:hover {
          border-color: #b8c5d0 !important;
        }

        .results-search-input:focus,
        .results-search-input.ant-input-affix-wrapper-focused {
          border-color: #173b5e !important;

          box-shadow:
            0 0 0 3px rgba(23, 59, 94, 0.08) !important;
        }

        .results-search-input
          input {
          color: #334155;

          font-size: 13px;
        }

        .results-search-input
          input::placeholder {
          color: #a0aab5;
        }

        .results-search-icon {
          margin-right: 4px;

          color: #94a3b8;

          font-size: 16px;
        }

        .results-search-input:focus-within
          .results-search-icon {
          color: #173b5e;
        }

        /* ===================================================
           SELECT
        =================================================== */

        .results-score-select {
          width: 100%;
        }

        .results-score-select
          .ant-select-selector {
          height: 44px !important;

          padding: 0 13px !important;

          display: flex;
          align-items: center;

          border-color: #dfe5eb !important;
          border-radius: 10px !important;

          box-shadow: none !important;

          transition:
            border-color 0.18s ease,
            box-shadow 0.18s ease;
        }

        .results-score-select:hover
          .ant-select-selector {
          border-color: #b8c5d0 !important;
        }

        .results-score-select.ant-select-focused
          .ant-select-selector {
          border-color: #173b5e !important;

          box-shadow:
            0 0 0 3px rgba(23, 59, 94, 0.08) !important;
        }

        .results-score-select
          .ant-select-selection-item {
          color: #334155;

          font-size: 13px;
          font-weight: 500;

          line-height: 42px !important;
        }

        .results-score-select
          .ant-select-selection-placeholder {
          color: #a0aab5;

          line-height: 42px !important;
        }

        .results-score-select
          .ant-select-arrow {
          color: #94a3b8;
        }

        /* ===================================================
           SELECT DROPDOWN
        =================================================== */

        .ant-select-dropdown {
          border: 1px solid #e2e8f0;

          border-radius: 10px;

          box-shadow:
            0 10px 30px rgba(23, 59, 94, 0.1);
        }

        .ant-select-item {
          min-height: 38px;

          border-radius: 7px;

          color: #475569;

          font-size: 13px;
        }

        .ant-select-item-option-active {
          background: #f4f7f9 !important;
        }

        .ant-select-item-option-selected {
          background: #eef3f7 !important;

          color: #173b5e !important;

          font-weight: 600;
        }

        /* ===================================================
           RESPONSIVE
        =================================================== */

        @media (max-width: 768px) {
          .results-filters {
            margin-bottom: 14px;
            padding: 14px;

            border-radius: 14px;
          }

          .results-filter-field > label {
            font-size: 10px;
          }

          .results-search-input,
          .results-score-select
            .ant-select-selector {
            height: 42px !important;
          }

          .results-score-select
            .ant-select-selection-item {
            line-height: 40px !important;
          }

          .results-score-select
            .ant-select-selection-placeholder {
            line-height: 40px !important;
          }
        }

        @media (max-width: 480px) {
          .results-filters {
            padding: 12px;
          }

          .results-filter-field {
            gap: 5px;
          }
        }
      `}</style>
    </>
  );
};

export default ResultsFilters;
