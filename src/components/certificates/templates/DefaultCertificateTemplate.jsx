import React from "react";
import QRCode from "react-qr-code";

import { getCertificateBackground, getFontFamily } from "../certificateDesign";

const DefaultCertificateTemplate = ({
  certType,
  certificateTypes,
  certData,
  churchData,
  issuedDate,
  issuedDateParts,
  design,
  qrVerificationUrl,
}) => {
  const config = certificateTypes?.[certType] || {};

  // =========================================================
  // DEBUG
  // =========================================================

  console.log("certData:::", certData);
  console.log("churchData:::", churchData);
  console.log("issuedDateParts:::", issuedDateParts);
  console.log("certType:::", certType);
  console.log("design:::", design);

  // =========================================================
  // DESIGN
  // =========================================================

  const currentDesign = {
    ...design,
  };

  // Background được lấy từ design.backgroundImage
  // Nếu chưa có thì tự lấy theo stylePreset
  const backgroundImage = getCertificateBackground(currentDesign);

  // Font
  const certFont = getFontFamily(currentDesign.fontFamily);

  const headingFont = getFontFamily(currentDesign.headingFontFamily);

  // =========================================================
  // LOGO
  // =========================================================

  const CERT_LOGO_URL = "DÁN_LINK_LOGO_CỦA_BẠN_VÀO_ĐÂY";

  const logoUrl = design?.customImageUrl || churchData?.image || CERT_LOGO_URL;

  // =========================================================
  // LOGO URL
  // =========================================================

  const getImageUrl = (image) => {
    if (!image) return "";

    // Link online
    if (
      image.startsWith("http://") ||
      image.startsWith("https://") ||
      image.startsWith("data:")
    ) {
      return image;
    }

    // Nếu ảnh đã bắt đầu bằng /
    if (image.startsWith("/")) {
      return image;
    }

    // API URL
    const apiUrl = process.env.REACT_APP_API_URL || "";

    if (apiUrl) {
      return `${apiUrl.replace(/\/$/, "")}/${image.replace(/^\//, "")}`;
    }

    return image;
  };

  const finalLogoUrl = getImageUrl(logoUrl);

  // =========================================================
  // DATA
  // =========================================================

  const churchName = churchData?.name || churchData?.church_name || "Giáo xứ";

  const dioceseName = churchData?.address;

  const pastorName =
    churchData?.pastor_name || churchData?.pastorName || "Đang cập nhật";

  const studentName = certData?.fullName || certData?.godName || "Tên Học Sinh";

  const certificateNo = certData?.certNo || "KTGL/TN/062025";

  const dateFull = issuedDateParts?.full || issuedDate || "";

  // =========================================================
  // DESIGN VALUES
  // =========================================================

  const primaryColor = currentDesign.primaryColor || "#173B5E";

  const secondaryColor = currentDesign.secondaryColor || "#D9A441";

  const textColor = currentDesign.textColor || "#1E293B";

  const borderWidth = currentDesign.borderWidth ?? 3;

  const borderRadius = currentDesign.borderRadius ?? 0;

  const borderStyle = currentDesign.borderStyle || "double";

  const titleFontSize = currentDesign.titleFontSize || 42;

  const bodyFontSize = currentDesign.bodyFontSize || 15;

  const subtitleFontSize = currentDesign.subtitleFontSize || 12;

  const nameFontSize = currentDesign.nameFontSize || 54;

  const contentWidth = currentDesign.contentWidth || 86;

  const padding = currentDesign.padding || 10;

  // =========================================================
  // BACKGROUND STYLE
  // =========================================================

  const certificateBackgroundStyle = backgroundImage
    ? {
        backgroundImage: `url("${backgroundImage}")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }
    : {
        backgroundColor: "#ffffff",
      };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <>
      <style>{`

        @import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&family=Great+Vibes&display=swap');

        * {
          box-sizing: border-box;
        }

        /* =====================================================
           CONTAINER
        ===================================================== */

        .cert-container-modern-pro {
          width: 100%;
          height: 100%;
          min-height: 100%;

          margin: 0 auto;

          position: relative;

          overflow: hidden;

          font-family:
            var(--cert-font),
            'Montserrat',
            sans-serif;

          color: ${primaryColor};

          border-radius: ${borderRadius}px;

          background-color: #ffffff;

          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
        }

        /* =====================================================
           BACKGROUND OVERLAY
        ===================================================== */

        .cert-background-overlay {
          position: absolute;

          inset: 0;

          background:
            rgba(255, 255, 255, 0.12);

          z-index: 1;

          pointer-events: none;
        }

        /* =====================================================
           BORDER
        ===================================================== */

        .cert-border {
          position: absolute;

          inset: ${18 + padding}px;

          border:
            ${borderWidth}px
            ${borderStyle}
            ${secondaryColor};

          border-radius:
            ${Math.max(borderRadius - 2, 0)}px;

          z-index: 2;

          pointer-events: none;
        }

        .cert-border-inner {
          position: absolute;

          inset: ${26 + padding}px;

          border:
            1px solid
            ${secondaryColor};

          opacity: 0.75;

          border-radius:
            ${Math.max(borderRadius - 4, 0)}px;

          z-index: 2;

          pointer-events: none;
        }

        /* =====================================================
           LOGO
        ===================================================== */

        .cert-custom-image-badge {
          position: absolute;

             top: 72px;
            left: 60px;
            width: 100px;
            height: 100px;

          border-radius: 50%;

          background: #ffffff;

          border:
            3px solid
            ${secondaryColor};

          box-shadow:
            ${currentDesign.shadow ? "0 5px 14px rgba(0,0,0,0.20)" : "none"};

          display: flex;

          justify-content: center;

          align-items: center;

          z-index: 5;

          overflow: hidden;
        }

        .cert-custom-image-badge img {
          width: 100%;

          height: 100%;

          object-fit: contain;
        }

        .cert-image-placeholder {
          width: 100%;

          height: 100%;

          display: flex;

          justify-content: center;

          align-items: center;

          flex-direction: column;

          text-align: center;

          font-size: 9px;

          font-weight: 700;

          color: #64748b;

          background: #f8fafc;

          padding: 8px;
        }

        /* =====================================================
           QR
        ===================================================== */

        .cert-floating-qr-area {
          position: absolute;

          bottom: 40px;

          left: 42px;

          display: flex;

          align-items: center;

          justify-content: center;

          gap: 8px;

          background:
            rgba(255, 255, 255, 0.90);

          padding: 6px 8px;

          border-radius: 6px;

          border:
            1px solid
            ${secondaryColor};

          box-shadow:
            ${currentDesign.shadow ? "0 3px 10px rgba(0,0,0,0.10)" : "none"};

          z-index: 6;
        }

        .cert-floating-qr-area-inner {
          flex-direction: column;

          display: flex;

          align-items: center;

          justify-content: center;

          gap: 2px;
        }

        .cert-floating-qr-area small {
          font-size: 8px;

          font-weight: 600;

          color: ${primaryColor};

          white-space: nowrap;
        }

        /* =====================================================
           CONTENT
        ===================================================== */

        .cert-inner-content-box {
          position: relative;

          z-index: 4;

          width: 100%;

          height: 100%;

          padding:
            42px
            60px
            34px
            260px;

          display: flex;

          flex-direction: column;

          justify-content: space-between;

          font-family: ${certFont};
        }

        /* =====================================================
           HEADER
        ===================================================== */

        .cert-top-header-pro {
          text-align: center;

          padding-left: 80px;

          margin-bottom: 8px;

          margin-top: 10px;
        }

        .cert-org-line-1 {
          font-family:
            ${headingFont};

          font-size: 25px;

          font-weight: 700;

          color: ${primaryColor};

          text-transform: uppercase;

          letter-spacing: 0.7px;
        }

        .cert-org-line-2 {
          font-family:
            ${headingFont};

          font-size: 16px;

          font-weight: 700;

          color: ${primaryColor};

          margin-top: 3px;

          letter-spacing: 0.4px;
        }

        .cert-org-line-3 {
          font-family:
            'Great Vibes',
            cursive;

          font-size: 18px;

          font-weight: 400;

          color: ${primaryColor};

          margin-top: 7px;

          letter-spacing: 0.4px;
        }

        /* =====================================================
           TITLE
        ===================================================== */

        .cert-titles-area {
          text-align: center;

          padding-top: 30px;

          width: ${contentWidth}%;

          margin-left: auto;

          margin-right: auto;
        }

        .cert-main-title-pro {
          font-family:
            ${headingFont};

          font-size:
            ${titleFontSize}px;

          font-weight: 700;

          color: ${primaryColor};

          letter-spacing: 1px;

          text-transform: uppercase;

          margin: 0;

          line-height: 1.15;
        }

        .cert-main-title-subpro {
          font-family:'Great Vibes';

          font-size: 25px;

          color: ${primaryColor};

          margin: 0;

          padding-top: 7px;
        }

        /* =====================================================
           BODY
        ===================================================== */

        .cert-body-area {
          text-align: center;

          margin: 4px auto;

          flex: 1;

          width: ${contentWidth}%;

          display: flex;

          flex-direction: column;

          gap: 20px;

          justify-content: center;
        }

        .cert-action-awarded {
          font-family:
            ${headingFont};

          font-size: 22px;

          font-style: italic;

          color: ${textColor};

          margin-bottom: 4px;
        }

        .cert-person-name {
          font-family:
            'Great Vibes',
            cursive;

          font-size:
            ${nameFontSize}px;

          font-weight:
            ${currentDesign.nameFontWeight || 700};

          color: ${primaryColor};

          margin: 2px 0 10px;

          line-height: 1.1;
        }

        .cert-meta-grid {
          display: flex;

          justify-content: center;

          align-items: center;

          gap: 18px;

          flex-wrap: wrap;

          font-family:
            ${certFont};

          font-size: 20px;

          color: ${textColor};

          margin-bottom: 8px;
        }

        .cert-meta-grid strong {
          color: ${primaryColor};
        }

        .cert-achievement-text {
          max-width: 720px;

          margin: 4px auto;

          font-family:
            ${certFont};

          font-size:
            ${bodyFontSize}px;

          font-weight: 500;

          color: ${textColor};

          line-height:
            ${currentDesign.lineHeight || 1.5};
        }

        .cert-rank-badge-box {
          font-family:
            ${certFont};

          font-size: 14px;

          color: ${textColor};

          margin-top: 4px;
        }

        .cert-rank-badge-box strong {
          color: ${primaryColor};

          font-weight: 700;
        }

        /* =====================================================
           FOOTER
        ===================================================== */

        .cert-footer-pro {
          display: flex;

          justify-content: flex-end;

          align-items: flex-end;

          gap: 20px;

          margin-top: 10px;

          padding-top: 12px;

          border-top:
            1px solid
            rgba(23, 59, 94, 0.25);
        }

        .cert-serial-info {
          font-family:
            ${certFont};

          font-size: 10px;

          color: #4b5563;

          line-height: 1.5;

          min-width: 120px;

          padding-top: 38px;
        }

        /* =====================================================
           SIGNATURE
        ===================================================== */

        .cert-signature-box {
          text-align: center;

          min-width: 240px;
        }

        .cert-date-loc {
          font-family:
            ${headingFont};

          font-size:
            ${subtitleFontSize}px;

          font-style: italic;

          color: ${textColor};

          margin-bottom: 4px;
        }

        .cert-sig-position {
          font-size:
            ${subtitleFontSize}px;

          font-weight: 700;

          color: ${primaryColor};

          text-transform: uppercase;
        }

        .cert-signature-blank {
          height: 65px;
        }

        .cert-signer-fullname {
          font-family:
            ${headingFont};

          font-size:
            ${bodyFontSize}px;

          font-weight: 700;

          color: ${primaryColor};
        }

        /* =====================================================
           ORNAMENT
        ===================================================== */

        ${
          currentDesign.ornament
            ? `
              .cert-container-modern-pro::after {
                content: "";

                position: absolute;

                inset: 8px;

                border:
                  1px solid
                  rgba(212, 175, 55, 0.35);

                pointer-events: none;

                z-index: 2;
              }
            `
            : ""
        }

        /* =====================================================
           WATERMARK
        ===================================================== */

        ${
          currentDesign.watermark
            ? `
              .cert-container-modern-pro::before {
                content: "✝";

                position: absolute;

                left: 50%;

                top: 50%;

                transform:
                  translate(-50%, -50%);

                font-size: 180px;

                color:
                  ${secondaryColor};

                opacity: 0.045;

                pointer-events: none;

                z-index: 1;
              }
            `
            : ""
        }

        /* =====================================================
           MOBILE
        ===================================================== */

        @media (max-width: 768px) {

          .cert-inner-content-box {
            padding: 24px;
          }

          .cert-custom-image-badge {
            width: 70px;

            height: 70px;

            top: 28px;

            left: 28px;
          }

          .cert-floating-qr-area {
            bottom: 25px;

            left: 28px;
          }

          .cert-top-header-pro {
            padding-left: 60px;
          }

          .cert-main-title-pro {
            font-size: 28px;
          }

          .cert-person-name {
            font-size: 40px;
          }

          .cert-footer-pro {
            gap: 10px;
          }

          .cert-serial-info {
            padding-left: 0;
          }

          .cert-signature-box {
            min-width: 160px;
          }

        }

      `}</style>

      {/* ======================================================
          CERTIFICATE
      ====================================================== */}

      <div
        className="cert-container-modern-pro"
        style={certificateBackgroundStyle}
      >
        {/* ====================================================
            BACKGROUND OVERLAY
        ==================================================== */}

        <div className="cert-background-overlay" />

        {/* ====================================================
            BORDER
        ==================================================== */}

        <div className="cert-border" />

        <div className="cert-border-inner" />

        {/* ====================================================
            LOGO
        ==================================================== */}

        <div className="cert-custom-image-badge">
          {finalLogoUrl ? (
            <img src={finalLogoUrl} alt="Logo giáo xứ" />
          ) : (
            <div className="cert-image-placeholder">
              <span>🖼️</span>

              <span>DÁN LINK LOGO</span>
            </div>
          )}
        </div>

        {/* ====================================================
            QR CODE
        ==================================================== */}

        {design?.showQRCode && qrVerificationUrl && (
          <div className="cert-floating-qr-area">
            <div className="cert-floating-qr-area-inner">
              <QRCode value={qrVerificationUrl} size={design?.qrSize || 48} />

              <small>Xác thực điện tử</small>
            </div>

            <div className="cert-serial-info">
              <div>Vào sổ khen thưởng</div>

              <div>Số: {certificateNo}</div>
            </div>
          </div>
        )}

        {/* ====================================================
            MAIN CONTENT
        ==================================================== */}

        <div className="cert-inner-content-box">
          {/* ==================================================
              HEADER
          ================================================== */}

          <div className="cert-top-header-pro">
            <div className="cert-org-line-1">GIÁO PHẬN {dioceseName}</div>

            <div className="cert-org-line-2">BAN GIÁO LÝ</div>

            <div className="cert-org-line-3">
              "Anh em hãy mang lấy ách của tôi, và hãy học với tôi, vì tôi có
              lòng hiền hậu và khiêm nhường." (Mt 11,29)
            </div>
          </div>

          {/* ==================================================
              TITLE
          ================================================== */}

          <div className="cert-titles-area">
            <h1 className="cert-main-title-pro">
              {config.title || "GIẤY KHEN"}
            </h1>

            <h3 className="cert-main-title-subpro">
              Linh Mục Giáo xứ {churchName}
              {dioceseName ? ` Giáo phận ${dioceseName}` : ""}
            </h3>
          </div>

          {/* ==================================================
              BODY
          ================================================== */}

          <div className="cert-body-area">
            <div className="cert-action-awarded">CHỨNG NHẬN</div>

            <div className="cert-person-name">
              {certData.godName} {studentName}
            </div>

            <div className="cert-meta-grid">
              {certData?.dob && (
                <div>
                  <strong>Ngày sinh:</strong> {certData.dob}
                </div>
              )}

              {certData?.className && (
                <div>
                  <strong>Ngành / Lớp:</strong> {certData.className}
                </div>
              )}
            </div>

            <div className="cert-achievement-text">
              {certData?.achievement ||
                "Đã đạt thành tích xuất sắc trong học tập và sinh hoạt năm học 2024 – 2025"}
            </div>

            {certData?.rank && (
              <div className="cert-rank-badge-box">
                <span>Xếp loại / Danh hiệu:</span>{" "}
                <strong>{certData.rank}</strong>
              </div>
            )}
          </div>

          {/* ==================================================
              FOOTER
          ================================================== */}

          <div className="cert-footer-pro">
            {design?.showSignature && (
              <div className="cert-signature-box">
                <div className="cert-date-loc">
                  {churchName}, {dateFull}
                </div>

                <div className="cert-sig-position">LINH MỤC XỨ</div>

                <div className="cert-signature-blank" />

                <div className="cert-signer-fullname">{pastorName}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default DefaultCertificateTemplate;
