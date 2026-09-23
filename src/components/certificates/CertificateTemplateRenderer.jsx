import React from "react";
import DefaultCertificateTemplate from "./templates/DefaultCertificateTemplate";
import MarriageCertificateTemplate from "./templates/MarriageCertificateTemplate";
import BaptismCertificateTemplate from "./templates/BaptismCertificateTemplate";

const CertificateTemplateRenderer = ({
  template,
  certType,
  certificateTypes,
  certData,
  churchData,
  issuedDate,
  design,
  issuedDateParts,
  qrVerificationUrl,
}) => {
  const templateName =
    template || certificateTypes?.[certType]?.template || "default";

  const commonProps = {
    certType,
    certificateTypes,
    certData,
    churchData,
    issuedDate,
    design,
    issuedDateParts,
    qrVerificationUrl,
  };

  const renderTemplate = () => {
    switch (templateName) {
      case "marriage":
        return <MarriageCertificateTemplate {...commonProps} />;
      case "baptism":
        return <BaptismCertificateTemplate {...commonProps} />;
      case "default":
      default:
        return <DefaultCertificateTemplate {...commonProps} />;
    }
  };

  return (
    <>
      <style>{`
        .cert-template-renderer {
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          overflow: hidden;
          background: transparent;
        }
      `}</style>

      <div className="cert-template-renderer">{renderTemplate()}</div>
    </>
  );
};

export default CertificateTemplateRenderer;
