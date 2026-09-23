import React from "react";
import { Card, Select, Typography } from "antd";
import { SafetyCertificateOutlined } from "@ant-design/icons";

const { Text } = Typography;

const COLORS = {
  navy: "#173B5E",
  gold: "#D9A441",
  background: "#F7F9FC",
  white: "#FFFFFF",
  text: "#173B5E",
  textSecondary: "#64748B",
  border: "#E2E8F0",
  navyLight: "#EEF3F7",
  goldLight: "#FBF5E7",
};

const CertificateTypeSelector = ({ certType, certificateTypes, onChange }) => {
  const options = Object.entries(certificateTypes || {}).map(
    ([value, item]) => ({
      value,
      label: item.title,
    }),
  );

  return (
    <>
      <style>{`
        .cert-type-card {
          background: ${COLORS.white};
          border-radius: 10px;
          box-shadow: 0 4px 16px rgba(23, 59, 94, 0.04);
          border: 1px solid ${COLORS.border};
          margin-bottom: 16px;
        }
        .cert-type-card .ant-card-body {
          padding: 16px 20px;
        }
        .cert-type-wrapper {
          display: flex;
          align-items: flex-start;
          gap: 14px;
        }
        .cert-type-icon {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          background: ${COLORS.goldLight};
          color: ${COLORS.gold};
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          flex-shrink: 0;
        }
        .cert-type-content {
          flex: 1;
        }
        .cert-type-label {
          display: block;
          font-size: 10px;
          font-weight: 700;
          color: ${COLORS.textSecondary};
          letter-spacing: 0.8px;
          margin-bottom: 4px;
          text-transform: uppercase;
        }
        .cert-type-select {
          width: 100%;
        }
        .cert-type-select .ant-select-selector {
          border-radius: 6px !important;
          border-color: ${COLORS.border} !important;
        }
        .cert-type-select.ant-select-focused .ant-select-selector {
          border-color: ${COLORS.navy} !important;
          box-shadow: 0 0 0 2px rgba(23, 59, 94, 0.1) !important;
        }
        .cert-type-desc {
          margin-top: 6px;
          font-size: 12px;
          color: ${COLORS.textSecondary};
          background: ${COLORS.background};
          padding: 6px 10px;
          border-radius: 4px;
          border-left: 2px solid ${COLORS.gold};
        }
      `}</style>

      <Card className="cert-type-card" bordered={false}>
        <div className="cert-type-wrapper">
          <div className="cert-type-icon">
            <SafetyCertificateOutlined />
          </div>

          <div className="cert-type-content">
            <Text className="cert-type-label">LOẠI CHỨNG CHỈ</Text>

            <Select
              value={certType}
              options={options}
              onChange={onChange}
              className="cert-type-select"
              size="middle"
              placeholder="Chọn loại chứng chỉ..."
            />
          </div>
        </div>
      </Card>
    </>
  );
};

export default CertificateTypeSelector;
