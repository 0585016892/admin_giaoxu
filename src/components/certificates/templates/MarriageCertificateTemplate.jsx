import React from "react";
import QRCode from "react-qr-code";

import {
  getCertificateBackground,
  getFontFamily,
  normalizeCertificateDesign,
} from "../certificateDesign";

const MarriageCertificateTemplate = ({
  certData,
  churchData,
  issuedDate,
  design,
  qrVerificationUrl,
}) => {
  const currentDesign = normalizeCertificateDesign(design || {});

  // ============================================================
  // DESIGN
  // ============================================================

  const {
    primaryColor = "#173B5E",
    secondaryColor = "#D9A441",
    textColor = "#1E293B",

    borderStyle = "double",
    borderWidth = 3,
    borderRadius = 0,

    fontFamily = "Be Vietnam Pro",
    headingFontFamily = "Cormorant Garamond",

    titleSize = 34,
    nameSize = 30,
    bodySize = 15,

    padding = 28,
    contentWidth = 86,

    showOrnament = true,
    showWatermark = false,
    showShadow = false,

    showSignature = true,
    showQRCode = true,

    qrSize = 80,
    signatureGap = 20,
  } = currentDesign;

  const backgroundImage = getCertificateBackground(currentDesign);

  const bodyFont = getFontFamily(fontFamily);
  const headingFont = getFontFamily(headingFontFamily);

  // ============================================================
  // CHURCH DATA
  // ============================================================

  const churchName = churchData?.name || churchData?.church_name || "";

  const dioceseName = churchData?.address || churchData?.diocese || "";

  const parishName =
    churchData?.parish_name || churchData?.parish || churchName || "";

  const pastorName =
    churchData?.pastor_name || churchData?.pastorName || "Linh mục quản xứ";

  // ============================================================
  // STUDENT DATA
  // ============================================================

  console.log("certData:::", certData);

  const fullName = certData?.fullName || certData?.studentName || "HỌ VÀ TÊN";

  const dateOfBirth = certData?.dateOfBirth || certData?.dob || "";

  const placeOfBirth = certData?.birth_place || certData?.birthPlace || "";

  const address = certData?.birth_place || certData?.residence || "";

  const fatherName = certData?.fatherName || certData?.father || "";

  const motherName = certData?.motherName || certData?.mother || "";

  const courseName =
    certData?.courseName || "ĐÃ HOÀN THÀNH LỚP GIÁO LÝ HÔN NHÂN";

  const courseYear =
    certData?.courseYear || certData?.schoolYear || certData?.year || "";

  const issuePlace = certData?.issuePlace || parishName || "";

  // ============================================================
  // HELPERS
  // ============================================================

  const cleanChurchName = (value = "") =>
    String(value)
      .replace(/^GIÁO PHẬN\s*/i, "")
      .replace(/^GIÁO HẠT\s*/i, "")
      .replace(/^GIÁO XỨ\s*/i, "")
      .trim();

  const cleanDiocese = cleanChurchName(dioceseName);
  const cleanParish = cleanChurchName(parishName);

  const borderValue =
    borderStyle === "none"
      ? "none"
      : `${borderWidth}px ${borderStyle} ${primaryColor}`;

  // ============================================================
  // CSS VARIABLES
  // ============================================================

  const containerStyle = {
    "--cert-primary": primaryColor,
    "--cert-secondary": secondaryColor,
    "--cert-text": textColor,

    "--cert-font": bodyFont,
    "--cert-heading-font": headingFont,

    "--cert-title-size": `${titleSize}px`,
    "--cert-name-size": `${nameSize}px`,
    "--cert-body-size": `${bodySize}px`,

    "--cert-padding": `${padding}px`,
    "--cert-content-width": `${contentWidth}%`,

    "--cert-border-width": `${borderWidth}px`,
    "--cert-border-radius": `${borderRadius}px`,
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div
      className={[
        "certificate-template",
        "certificate-template--marriage",
        showShadow ? "certificate-template--shadow" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        ...containerStyle,
        backgroundImage: backgroundImage ? `url("${backgroundImage}")` : "none",
        border: borderValue,
        borderRadius: `${borderRadius}px`,
        padding: `${padding}px`,
        fontFamily: bodyFont,
      }}
    >
      {/* ======================================================
          BACKGROUND
      ====================================================== */}

      <div className="certificate-background-overlay" />

      {/* ======================================================
          INNER FRAME
      ====================================================== */}

      <div
        className="marriage-inner-frame"
        style={{
          borderColor: secondaryColor,
        }}
      />

      <div
        className="marriage-inner-frame marriage-inner-frame--thin"
        style={{
          borderColor: secondaryColor,
        }}
      />

      {/* ======================================================
          WATERMARK
      ====================================================== */}

      {showWatermark && (
        <div
          className="certificate-watermark marriage-watermark"
          style={{
            color: secondaryColor,
            fontFamily: headingFont,
          }}
        >
          ✝
        </div>
      )}

      {/* ======================================================
          ORNAMENT
      ====================================================== */}

      {showOrnament && (
        <>
          <div
            className="marriage-corner marriage-corner--top-left"
            style={{ color: secondaryColor }}
          >
            ❧
          </div>

          <div
            className="marriage-corner marriage-corner--top-right"
            style={{ color: secondaryColor }}
          >
            ❧
          </div>

          <div
            className="marriage-corner marriage-corner--bottom-left"
            style={{ color: secondaryColor }}
          >
            ❧
          </div>

          <div
            className="marriage-corner marriage-corner--bottom-right"
            style={{ color: secondaryColor }}
          >
            ❧
          </div>
        </>
      )}

      {/* ======================================================
          CONTENT
      ====================================================== */}

      <div className="marriage-certificate-main">
        {/* ====================================================
            HEADER
        ==================================================== */}

        <header className="marriage-certificate-header">
          <div
            className="marriage-church-title"
            style={{
              color: primaryColor,
              fontFamily: headingFont,
            }}
          >
            GIÁO HỘI CÔNG GIÁO
          </div>

          <div
            className="marriage-church-line"
            style={{
              color: textColor,
              fontFamily: bodyFont,
            }}
          >
            {cleanDiocese ? `GIÁO PHẬN ${cleanDiocese}` : "GIÁO PHẬN"}
          </div>

          <div
            className="marriage-church-line marriage-church-line--parish"
            style={{
              color: textColor,
              fontFamily: bodyFont,
            }}
          >
            {cleanParish ? `GIÁO XỨ ${cleanParish}` : "GIÁO XỨ"}
          </div>

          {/* CROSS */}
          <div
            className="marriage-cross"
            style={{
              color: secondaryColor,
              fontFamily: headingFont,
            }}
          >
            ✝
          </div>

          {/* TITLE */}
          <h2
            className="marriage-certificate-title"
            style={{
              color: primaryColor,
              fontFamily: headingFont,
            }}
          >
            CHỨNG CHỈ GIÁO LÝ HÔN NHÂN & DỰ TÒNG
          </h2>

          <div
            className="marriage-certificate-subtitle"
            style={{
              color: secondaryColor,
              fontFamily: headingFont,
            }}
          >
            GIÁO LÝ HÔN NHÂN
          </div>

          <div
            className="marriage-title-divider"
            style={{
              "--divider-color": secondaryColor,
            }}
          >
            <span />
            <i>✦</i>
            <span />
          </div>
        </header>

        {/* ====================================================
            BODY
        ==================================================== */}

        <main className="marriage-certificate-body">
          {/* NAME */}
          <div
            className="marriage-student-label"
            style={{
              color: textColor,
              fontFamily: bodyFont,
            }}
          >
            Chứng nhận
          </div>

          <div
            className="marriage-student-name"
            style={{
              color: primaryColor,
              fontFamily: headingFont,
            }}
          >
            {fullName}
          </div>

          <div
            className="marriage-name-divider"
            style={{
              backgroundColor: secondaryColor,
            }}
          />

          {/* PERSONAL INFORMATION */}

          <section className="marriage-info-box">
            <div className="marriage-info-column">
              <div className="marriage-info-row">
                <span>Ngày sinh</span>
                <strong>{dateOfBirth || "—"}</strong>
              </div>

              <div className="marriage-info-row">
                <span>Nơi sinh</span>
                <strong>{placeOfBirth || "—"}</strong>
              </div>

              <div className="marriage-info-row">
                <span>Địa chỉ</span>
                <strong>{address || "—"}</strong>
              </div>
            </div>

            <div className="marriage-info-divider" />

            <div className="marriage-info-column">
              <div className="marriage-info-row">
                <span>Con ông</span>
                <strong>{fatherName || "—"}</strong>
              </div>

              <div className="marriage-info-row">
                <span>Con bà</span>
                <strong>{motherName || "—"}</strong>
              </div>
            </div>
          </section>

          {/* COURSE */}

          <div
            className="marriage-course"
            style={{
              color: textColor,
              fontFamily: bodyFont,
            }}
          >
            <span>Đã hoàn thành chương trình</span>

            <strong
              style={{
                color: primaryColor,
              }}
            >
              {courseName}
            </strong>

            {courseYear && (
              <em
                style={{
                  color: secondaryColor,
                }}
              >
                {courseYear}
              </em>
            )}
          </div>

          {/* ISSUE */}

          <div
            className="marriage-issued"
            style={{
              color: textColor,
              fontFamily: bodyFont,
            }}
          >
            {issuePlace && <span>Giáo xứ {cleanParish}</span>}

            {issuePlace && issuedDate && (
              <span className="marriage-issued-dot">•</span>
            )}

            {issuedDate && <span>{issuedDate}</span>}
          </div>
        </main>

        {/* ====================================================
            FOOTER
        ==================================================== */}

        <footer className="marriage-certificate-footer">
          {/* QR */}

          <div className="marriage-footer-left">
            {showQRCode && (
              <div className="marriage-qr-wrapper">
                <div
                  className="marriage-qr"
                  style={{
                    borderColor: secondaryColor,
                  }}
                >
                  <QRCode
                    value={qrVerificationUrl || "https://giaolyso.site"}
                    size={qrSize}
                    bgColor="#FFFFFF"
                    fgColor={primaryColor}
                  />
                </div>

                <div
                  className="marriage-qr-label"
                  style={{
                    color: textColor,
                    fontFamily: bodyFont,
                  }}
                >
                  QUÉT ĐỂ XÁC THỰC
                </div>
              </div>
            )}
          </div>

          {/* SIGNATURE */}

          <div className="marriage-footer-right">
            {showSignature && (
              <div
                className="marriage-signature"
                style={{
                  marginLeft: signatureGap,
                }}
              >
                <div
                  className="marriage-signature-place"
                  style={{
                    color: textColor,
                    fontFamily: bodyFont,
                  }}
                >
                  Linh mục quản xứ
                </div>

                <div className="marriage-signature-space" />

                <div
                  className="marriage-signature-name"
                  style={{
                    color: primaryColor,
                    fontFamily: headingFont,
                  }}
                >
                  {pastorName}
                </div>
              </div>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
};

export default MarriageCertificateTemplate;
