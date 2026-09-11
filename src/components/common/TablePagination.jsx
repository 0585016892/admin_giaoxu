import React from "react";
import { Pagination, Select, Typography } from "antd";
import {
  LeftOutlined,
  RightOutlined,
  DatabaseOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

// =========================================================
// COLORS — NAVY & GOLD PALETTE
// =========================================================

const COLORS = {
  primary: "#173B5E",
  primaryHover: "#244F78",
  primaryLight: "#EEF2F7",
  gold: "#D9A441",
  border: "#D9E2EC",
  textDark: "#173B5E",
  textMuted: "#64748B",
};

const TablePagination = ({
  current = 1,
  pageSize = 10,
  total = 0,
  onChange,
  onPageSizeChange,
}) => {
  // =========================================================
  // SAFE VALUES
  // =========================================================

  const safeTotal = Number.isFinite(Number(total))
    ? Math.max(0, Number(total))
    : 0;

  const safePageSize =
    Number.isFinite(Number(pageSize)) && Number(pageSize) > 0
      ? Number(pageSize)
      : 10;

  const safeCurrent =
    Number.isFinite(Number(current)) && Number(current) > 0
      ? Number(current)
      : 1;

  const totalPages = safeTotal > 0 ? Math.ceil(safeTotal / safePageSize) : 1;

  const safePage = Math.min(Math.max(1, safeCurrent), totalPages);

  const start = safeTotal === 0 ? 0 : (safePage - 1) * safePageSize + 1;

  const end =
    safeTotal === 0 ? 0 : Math.min(safePage * safePageSize, safeTotal);

  return (
    <>
      <style>
        {`
          /* =====================================================
             CONTAINER
          ===================================================== */

          .navy-gold-pagination-container {
            width: 100%;
            box-sizing: border-box;
          }

          /* =====================================================
             TOP INFO
          ===================================================== */

          .navy-gold-pagination-info {
            display: flex;
            align-items: center;
            min-width: 0;
            flex: 1 1 auto;
          }

          .navy-gold-pagination-info-text {
            min-width: 0;
          }

          .navy-gold-pagination-info-title {
            white-space: nowrap;
          }

          /* =====================================================
             PAGINATION
          ===================================================== */

          .navy-gold-pagination {
            display: flex;
            align-items: center;
            justify-content: center;
            min-width: 0;
          }

          .navy-gold-pagination .ant-pagination {
            margin: 0 !important;
          }

          .navy-gold-pagination .ant-pagination-item {
            border-radius: 12px !important;
            border: 1.5px solid ${COLORS.border} !important;
            background: #FFFFFF !important;
            font-weight: 700;
            font-family: 'Be Vietnam Pro', -apple-system, sans-serif;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 2px 6px rgba(23, 59, 94, 0.04);
          }

          .navy-gold-pagination .ant-pagination-item a {
            color: ${COLORS.textMuted} !important;
          }

          .navy-gold-pagination .ant-pagination-item-active {
            background: linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryHover} 100%) !important;
            border-color: ${COLORS.primary} !important;
            box-shadow: 0 4px 12px rgba(23, 59, 94, 0.2) !important;
          }

          .navy-gold-pagination .ant-pagination-item-active a {
            color: #FFFFFF !important;
          }

          .navy-gold-pagination .ant-pagination-item:hover:not(.ant-pagination-item-active) {
            border-color: ${COLORS.primary} !important;
            background-color: ${COLORS.primaryLight} !important;
          }

          .navy-gold-pagination .ant-pagination-item:hover a {
            color: ${COLORS.primary} !important;
          }

          /* Prev / Next */

          .navy-gold-pagination .ant-pagination-prev,
          .navy-gold-pagination .ant-pagination-next {
            border-radius: 12px !important;
            border: 1.5px solid ${COLORS.border} !important;
            background: #FFFFFF !important;
            transition: all 0.2s ease;
          }

          .navy-gold-pagination .ant-pagination-prev:hover,
          .navy-gold-pagination .ant-pagination-next:hover {
            border-color: ${COLORS.primary} !important;
            background-color: ${COLORS.primaryLight} !important;
          }

          /* Disabled */

          .navy-gold-pagination .ant-pagination-disabled {
            opacity: 0.45;
          }

          /* =====================================================
             PAGE SIZE
          ===================================================== */

          .navy-gold-pagination-size {
            display: flex;
            align-items: center;
            flex: 0 0 auto;
          }

          .navy-gold-select {
            min-width: 120px;
          }

          .navy-gold-select .ant-select-selector {
            border-radius: 12px !important;
            border: 1.5px solid ${COLORS.border} !important;
            background: #FFFFFF !important;
            font-weight: 600 !important;
            font-family: 'Be Vietnam Pro', -apple-system, sans-serif !important;
            box-shadow: 0 2px 6px rgba(23, 59, 94, 0.04);
            transition: all 0.2s ease;
          }

          .navy-gold-select:hover .ant-select-selector,
          .navy-gold-select.ant-select-focused .ant-select-selector {
            border-color: ${COLORS.primary} !important;
            box-shadow: 0 0 0 4px rgba(23, 59, 94, 0.08) !important;
          }

          /* =====================================================
             TABLET
          ===================================================== */

          @media (max-width: 900px) {
            .navy-gold-pagination-container {
              padding: 14px 16px !important;
              border-radius: 18px !important;
            }

            .navy-gold-pagination-info {
              flex: 1 1 100%;
            }

            .navy-gold-pagination {
              flex: 1 1 auto;
            }

            .navy-gold-pagination-size {
              flex: 0 0 auto;
            }
          }

          /* =====================================================
             MOBILE
          ===================================================== */

          @media (max-width: 600px) {
            .navy-gold-pagination-container {
              margin-top: 14px !important;
              padding: 14px !important;
              border-radius: 16px !important;
              gap: 14px !important;
            }

            .navy-gold-pagination-info {
              width: 100%;
              flex: 1 1 100%;
            }

            .navy-gold-pagination-icon {
              width: 40px !important;
              height: 40px !important;
              min-width: 40px !important;
              border-radius: 12px !important;
              font-size: 16px !important;
            }

            .navy-gold-pagination-info-title {
              font-size: 14px !important;
            }

            .navy-gold-pagination-info-subtitle {
              font-size: 12px !important;
            }

            .navy-gold-pagination {
              width: 100%;
              flex: 1 1 100%;
              overflow: hidden;
            }

            .navy-gold-pagination .ant-pagination {
              width: 100%;
              justify-content: center;
              flex-wrap: nowrap;
            }

            .navy-gold-pagination .ant-pagination-item {
              margin-inline-end: 4px !important;
              border-radius: 10px !important;
            }

            .navy-gold-pagination .ant-pagination-prev,
            .navy-gold-pagination .ant-pagination-next {
              margin-inline-end: 4px !important;
              border-radius: 10px !important;
            }

            .navy-gold-pagination-size {
              width: 100%;
              flex: 1 1 100%;
              justify-content: space-between;
            }

            .navy-gold-select {
              width: 140px !important;
              min-width: 140px !important;
            }
          }

          /* =====================================================
             SMALL MOBILE
          ===================================================== */

          @media (max-width: 400px) {
            .navy-gold-pagination-container {
              padding: 12px !important;
            }

            .navy-gold-pagination-info {
              gap: 10px !important;
            }

            .navy-gold-pagination-icon {
              width: 36px !important;
              height: 36px !important;
              min-width: 36px !important;
              border-radius: 10px !important;
            }

            .navy-gold-pagination .ant-pagination-item,
            .navy-gold-pagination .ant-pagination-prev,
            .navy-gold-pagination .ant-pagination-next {
              width: 32px !important;
              min-width: 32px !important;
              height: 32px !important;
              line-height: 28px !important;
              margin-inline-end: 3px !important;
            }

            .navy-gold-select {
              width: 125px !important;
              min-width: 125px !important;
            }
          }
        `}
      </style>

      <div
        className="navy-gold-pagination-container"
        style={{
          marginTop: 20,
          padding: "16px 24px",
          background: "#FFFFFF",
          borderRadius: 20,
          border: `1.5px solid ${COLORS.border}`,
          boxShadow: "0 10px 30px -5px rgba(23, 59, 94, 0.06)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
          boxSizing: "border-box",
        }}
      >
        {/* =====================================================
            LEFT INFO
        ===================================================== */}

        <div
          className="navy-gold-pagination-info"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <div
            className="navy-gold-pagination-icon"
            style={{
              width: 44,
              height: 44,
              minWidth: 44,
              borderRadius: 14,
              background: COLORS.primaryLight,
              border: `1.5px solid ${COLORS.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: COLORS.primary,
              fontSize: 18,
              boxSizing: "border-box",
            }}
          >
            <DatabaseOutlined />
          </div>

          <div className="navy-gold-pagination-info-text">
            <Text
              strong
              className="navy-gold-pagination-info-title"
              style={{
                display: "block",
                color: COLORS.textDark,
                fontSize: 15,
                fontFamily: "Be Vietnam Pro, -apple-system, sans-serif",
                lineHeight: 1.5,
              }}
            >
              Hiển thị{" "}
              <span
                style={{
                  color: COLORS.primary,
                  fontWeight: 800,
                }}
              >
                {start}
              </span>{" "}
              –{" "}
              <span
                style={{
                  color: COLORS.primary,
                  fontWeight: 800,
                }}
              >
                {end}
              </span>
            </Text>

            <Text
              type="secondary"
              className="navy-gold-pagination-info-subtitle"
              style={{
                fontSize: 13,
                lineHeight: 1.5,
                fontFamily: "Be Vietnam Pro, -apple-system, sans-serif",
              }}
            >
              Tổng số{" "}
              <span
                style={{
                  fontWeight: 700,
                  color: COLORS.textDark,
                }}
              >
                {safeTotal.toLocaleString("vi-VN")}
              </span>{" "}
              bản ghi
            </Text>
          </div>
        </div>

        {/* =====================================================
            PAGINATION
        ===================================================== */}

        <div className="navy-gold-pagination">
          <Pagination
            current={safePage}
            pageSize={safePageSize}
            total={safeTotal}
            showSizeChanger={false}
            showQuickJumper={false}
            responsive
            hideOnSinglePage={false}
            onChange={(page) => {
              onChange?.(page);
            }}
            itemRender={(page, type, originalElement) => {
              if (type === "prev") {
                return (
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <LeftOutlined
                      style={{
                        fontSize: 12,
                        color: COLORS.primary,
                      }}
                    />
                  </div>
                );
              }

              if (type === "next") {
                return (
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <RightOutlined
                      style={{
                        fontSize: 12,
                        color: COLORS.primary,
                      }}
                    />
                  </div>
                );
              }

              return originalElement;
            }}
          />
        </div>

        {/* =====================================================
            PAGE SIZE
        ===================================================== */}

        <div className="navy-gold-pagination-size">
          <Text
            type="secondary"
            className="chibi-page-size-label"
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: COLORS.textMuted,
              fontFamily: "Be Vietnam Pro, -apple-system, sans-serif",
            }}
          >
            Số dòng:
          </Text>

          <Select
            className="navy-gold-select"
            value={safePageSize}
            style={{
              width: 120,
            }}
            options={[
              {
                value: 10,
                label: "10 / trang",
              },
              {
                value: 20,
                label: "20 / trang",
              },
              {
                value: 50,
                label: "50 / trang",
              },
              {
                value: 100,
                label: "100 / trang",
              },
            ]}
            onChange={(size) => {
              onPageSizeChange?.(size);
            }}
          />
        </div>
      </div>
    </>
  );
};

export default TablePagination;
