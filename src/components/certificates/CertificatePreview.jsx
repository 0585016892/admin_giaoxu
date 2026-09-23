import React, { forwardRef, useMemo } from "react";
import CertificateTemplateRenderer from "./CertificateTemplateRenderer";
import {
  getFontFamily,
  getPrintDimensions,
  normalizeCertificateDesign,
} from "./certificateDesign";

const COLORS = {
  background: "#F7F9FC",
  border: "#E2E8F0",
};

const CertificatePreview = forwardRef(
  (
    {
      certType,
      certificateTypes,
      certData,
      churchData,
      issuedDate,
      design,
      issuedDateParts,
      qrVerificationUrl,
    },
    ref,
  ) => {
    const normalizedDesign = useMemo(
      () => normalizeCertificateDesign(design),
      [design],
    );

    const dimensions = useMemo(
      () => getPrintDimensions(normalizedDesign),
      [normalizedDesign],
    );

    const fontFamily = getFontFamily(normalizedDesign.fontFamily);

    const headingFontFamily = getFontFamily(normalizedDesign.headingFontFamily);

    const cssVariables = {
      "--cert-primary": normalizedDesign.primaryColor,

      "--cert-secondary": normalizedDesign.secondaryColor,

      "--cert-text": normalizedDesign.textColor,

      "--cert-font": fontFamily,

      "--cert-heading-font": headingFontFamily,

      "--cert-body-size": `${normalizedDesign.bodyFontSize}px`,

      "--cert-title-size": `${normalizedDesign.titleFontSize}px`,

      "--cert-subtitle-size": `${normalizedDesign.subtitleFontSize}px`,

      "--cert-name-size": `${normalizedDesign.nameFontSize}px`,

      "--cert-name-weight": normalizedDesign.nameFontWeight,

      "--cert-line-height": normalizedDesign.lineHeight,

      "--cert-letter-spacing": `${normalizedDesign.letterSpacing}px`,

      "--cert-content-width": `${normalizedDesign.contentWidth}%`,

      "--cert-border-width": `${normalizedDesign.borderWidth}px`,

      "--cert-border-style": normalizedDesign.borderStyle,

      "--cert-border-radius": `${normalizedDesign.borderRadius}px`,
    };

    return (
      <>
        <style>{`
          .certificate-sheet-wrapper {
            background: ${COLORS.background};
            padding: 24px;
            border-radius: 12px;
            border: 1px solid ${COLORS.border};
            display: flex;
            justify-content: center;
            align-items: center;
            overflow: auto;
          }

          .certificate-sheet {
            box-sizing: border-box;
            position: relative;
            overflow: hidden;
            margin: 0 auto;
            isolation: isolate;

            /*
             * Template tự quản lý khung.
             * Không thêm border/padding ngoài.
             */
            border: none !important;
            padding: 0 !important;

            background:
              var(--cert-background, #FFFDF8);
          }

          .certificate-sheet--shadow {
            box-shadow:
              0 10px 30px
              rgba(23, 59, 94, 0.08);
          }

          /*
           * Khi dùng để export:
           * không cần wrapper tạo padding 24px.
           */
          .certificate-sheet[data-certificate-render="true"] {
            flex-shrink: 0;
          }
        `}</style>

        <div className="certificate-sheet-wrapper">
          <div
            ref={ref}
            data-certificate-render="true"
            className={[
              "certificate-sheet",
              normalizedDesign.shadow ? "certificate-sheet--shadow" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            style={{
              ...cssVariables,

              width: `${dimensions.width}mm`,

              height: `${dimensions.height}mm`,

              minWidth: `${dimensions.width}mm`,

              minHeight: `${dimensions.height}mm`,

              color: normalizedDesign.textColor,

              borderRadius: `${normalizedDesign.borderRadius}px`,

              fontFamily,

              lineHeight: normalizedDesign.lineHeight,

              letterSpacing: `${normalizedDesign.letterSpacing}px`,
            }}
          >
            <div
              className="certificate-sheet__inner"
              style={{
                width: "100%",
                height: "100%",
                margin: "0 auto",
                position: "relative",
                zIndex: 2,
              }}
            >
              <CertificateTemplateRenderer
                certType={certType}
                certificateTypes={certificateTypes}
                template={certificateTypes?.[certType]?.template}
                certData={certData}
                churchData={churchData}
                issuedDate={issuedDate}
                issuedDateParts={issuedDateParts}
                design={normalizedDesign}
                qrVerificationUrl={qrVerificationUrl}
              />
            </div>
          </div>
        </div>
      </>
    );
  },
);

CertificatePreview.displayName = "CertificatePreview";

export default CertificatePreview;
