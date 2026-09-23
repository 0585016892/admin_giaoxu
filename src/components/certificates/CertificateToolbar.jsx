import React from "react";

import {
  TeamOutlined,
  FileExcelOutlined,
  DownloadOutlined,
  FileZipOutlined,
  SettingOutlined,
  QuestionCircleOutlined,
  ReloadOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
} from "@ant-design/icons";

import { Tooltip } from "antd";

import AppButton from "../common/AppButton";
// sửa path nếu AppButton của m nằm chỗ khác

const COLORS = {
  navy: "#173B5E",
  gold: "#D9A441",

  white: "#FFFFFF",

  text: "#173B5E",
  textSecondary: "#64748B",

  border: "#E2E8F0",

  navyLight: "#EEF3F7",

  warningBg: "#FFF7E5",
  warning: "#B7791F",
};

const CertificateToolbar = ({
  exporting,
  batchExporting,
  fullscreenPreview,

  onClassCertificate,
  onImportExcel,
  onDownloadTemplate,
  onGuide,

  onSettings,
  onReset,
  onFullscreen,
  onExportPdf,

  settingsOpen,
}) => {
  return (
    <>
      <style>{`
        /* =====================================================
           TOOLBAR
        ===================================================== */

        .cert-toolbar {
          position: relative;

          background:
            ${COLORS.white};

          border:
            1px solid ${COLORS.border};

          border-radius:
            12px;

          padding:
            14px 16px;

          margin-bottom:
            14px;

          box-shadow:
            0 4px 18px
            rgba(23, 59, 94, 0.045);
        }

        .cert-toolbar-main {
          display:
            flex;

          align-items:
            center;

          justify-content:
            space-between;

          gap:
            16px;
        }

        /* =====================================================
           TITLE
        ===================================================== */

        .cert-toolbar-title {
          display:
            flex;

          align-items:
            center;

          gap:
            11px;

          min-width:
            220px;
        }

        .cert-toolbar-icon {
          width:
            40px;

          height:
            40px;

          flex:
            0 0 40px;

          display:
            flex;

          align-items:
            center;

          justify-content:
            center;

          border-radius:
            9px;

          background:
            ${COLORS.navyLight};

          color:
            ${COLORS.navy};

          font-size:
            18px;
        }

        .cert-toolbar-title-content {
          min-width:
            0;
        }

        .cert-toolbar-title h1 {
          margin:
            0;

          color:
            ${COLORS.text};

          font-size:
            15px;

          line-height:
            1.3;

          font-weight:
            700;

          letter-spacing:
            -0.1px;
        }

        .cert-toolbar-title p {
          margin:
            3px 0 0;

          color:
            ${COLORS.textSecondary};

          font-size:
            11px;

          line-height:
            1.4;
        }

        /* =====================================================
           ACTIONS
        ===================================================== */

        .cert-toolbar-actions {
          display:
            flex;

          align-items:
            center;

          justify-content:
            flex-end;

          gap:
            6px;

          flex-wrap:
            wrap;
        }

        .cert-toolbar-divider {
          width:
            1px;

          height:
            24px;

          margin:
            0 2px;

          background:
            ${COLORS.border};
        }

        /* =====================================================
           BATCH
        ===================================================== */

        .cert-toolbar-batch {
          margin-top:
            10px;

          padding:
            8px 11px;

          display:
            flex;

          align-items:
            center;

          gap:
            8px;

          border:
            1px solid #F1DFAF;

          border-radius:
            8px;

          background:
            ${COLORS.warningBg};

          color:
            ${COLORS.warning};

          font-size:
            12px;

          font-weight:
            600;
        }

        .cert-toolbar-batch-icon {
          display:
            flex;

          align-items:
            center;

          justify-content:
            center;

          font-size:
            14px;
        }

        /* =====================================================
           RESPONSIVE
        ===================================================== */

        @media (max-width: 1100px) {
          .cert-toolbar-main {
            align-items:
              flex-start;

            flex-direction:
              column;
          }

          .cert-toolbar-title {
            width:
              100%;
          }

          .cert-toolbar-actions {
            width:
              100%;

            justify-content:
              flex-start;
          }
        }

        @media (max-width: 640px) {
          .cert-toolbar {
            padding:
              12px;
          }

          .cert-toolbar-actions {
            gap:
              5px;
          }

          .cert-toolbar-title h1 {
            font-size:
              14px;
          }

          .cert-toolbar-title p {
            font-size:
              10px;
          }
        }
      `}</style>

      <div className="cert-toolbar">
        {/* ===================================================
            MAIN
        =================================================== */}

        <div className="cert-toolbar-main">
          {/* TITLE */}

          <div className="cert-toolbar-title">
            <div className="cert-toolbar-icon">
              <DownloadOutlined />
            </div>

            <div className="cert-toolbar-title-content">
              <h1>Cấp chứng chỉ & văn bằng</h1>

              <p>Quản lý và xuất chứng chỉ giáo lý</p>
            </div>
          </div>

          {/* ACTIONS */}

          <div className="cert-toolbar-actions">
            {/* CẤP THEO LỚP */}

            <AppButton
              size="small"
              icon={<TeamOutlined />}
              onClick={onClassCertificate}
            >
              Cấp theo lớp
            </AppButton>

            {/* EXCEL */}

            <AppButton
              size="small"
              variant="outline"
              icon={<FileExcelOutlined />}
              onClick={onImportExcel}
            >
              Nhập Excel
            </AppButton>

            {/* TEMPLATE */}

            <Tooltip title="Tải file Excel mẫu">
              <AppButton
                variant="ghost"
                icon={<FileExcelOutlined />}
                onClick={onDownloadTemplate}
              />
            </Tooltip>

            {/* GUIDE */}

            <Tooltip title="Hướng dẫn">
              <AppButton
                variant="ghost"
                icon={<QuestionCircleOutlined />}
                onClick={onGuide}
              />
            </Tooltip>

            <span className="cert-toolbar-divider" />

            {/* SETTINGS */}

            <Tooltip title="Cấu hình chứng chỉ">
              <AppButton
                variant={settingsOpen ? "soft" : "ghost"}
                icon={<SettingOutlined />}
                onClick={onSettings}
              />
            </Tooltip>

            {/* RESET */}

            <Tooltip title="Khôi phục mặc định">
              <AppButton
                variant="ghost"
                icon={<ReloadOutlined />}
                onClick={onReset}
              />
            </Tooltip>

            {/* FULLSCREEN */}

            <Tooltip
              title={
                fullscreenPreview ? "Thoát toàn màn hình" : "Toàn màn hình"
              }
            >
              <AppButton
                variant="ghost"
                icon={
                  fullscreenPreview ? (
                    <FullscreenExitOutlined />
                  ) : (
                    <FullscreenOutlined />
                  )
                }
                onClick={onFullscreen}
              />
            </Tooltip>

            {/* EXPORT */}

            <AppButton
              size="small"
              variant="gold"
              icon={<DownloadOutlined />}
              loading={exporting}
              onClick={onExportPdf}
              minWidth={110}
            >
              Xuất PDF
            </AppButton>
          </div>
        </div>

        {/* ===================================================
            BATCH EXPORT
        =================================================== */}

        {batchExporting && (
          <div className="cert-toolbar-batch">
            <span className="cert-toolbar-batch-icon">
              <FileZipOutlined />
            </span>

            <span>Đang tạo bộ chứng chỉ ZIP...</span>
          </div>
        )}
      </div>
    </>
  );
};

export default CertificateToolbar;
