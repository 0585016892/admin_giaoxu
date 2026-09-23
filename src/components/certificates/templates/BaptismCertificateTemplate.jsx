import React from "react";

import QRCode from "react-qr-code";

const BaptismCertificateTemplate = ({
  certData,
  churchData,
  issuedDate,
  design,
  qrVerificationUrl,
}) => {
  return (
    <div className="certificate-template certificate-template--baptism">
      <div className="certificate-header">
        <div className="certificate-church">{churchData?.name || ""}</div>

        <div className="certificate-cross">✝</div>

        <div
          className="certificate-subtitle"
          style={{
            fontFamily: "var(--cert-heading-font)",
          }}
        >
          BÍ TÍCH RỬA TỘI
        </div>

        <h1
          className="certificate-title"
          style={{
            fontFamily: "var(--cert-heading-font)",
            color: "var(--cert-primary)",
          }}
        >
          CHỨNG NHẬN RỬA TỘI
        </h1>

        <div className="certificate-title-line">
          <span />
          <i />
          <span />
        </div>
      </div>

      <div className="certificate-content">
        <div className="certificate-intro">Chứng nhận</div>

        <div
          className="certificate-name"
          style={{
            fontFamily: "var(--cert-heading-font)",
            fontSize: "var(--cert-name-size)",
            color: "var(--cert-primary)",
          }}
        >
          {certData?.fullName || "HỌ VÀ TÊN"}
        </div>

        {certData?.godName && (
          <div className="certificate-line">
            <strong>Tên Thánh:</strong> {certData.godName}
          </div>
        )}

        {certData?.dob && (
          <div className="certificate-line">
            <strong>Ngày sinh:</strong> {certData.dob}
          </div>
        )}

        {certData?.baptismDate && (
          <div className="certificate-line">
            <strong>Ngày Rửa Tội:</strong> {certData.baptismDate}
          </div>
        )}

        {certData?.godFather && (
          <div className="certificate-line">
            <strong>Người đỡ đầu:</strong> {certData.godFather}
          </div>
        )}
      </div>

      <div className="certificate-footer">
        <div className="certificate-issued">
          Ngày cấp: <strong>{issuedDate || "...."}</strong>
        </div>

        <div className="certificate-footer-spacer" />

        {design.showQRCode && (
          <div className="certificate-qr">
            <QRCode
              value={qrVerificationUrl || "https://giaolyso.site"}
              size={design.qrSize}
            />

            <small>Quét để xác thực</small>
          </div>
        )}

        {design.showSignature && (
          <div
            className="certificate-signature"
            style={{
              marginLeft: design.signatureGap,
            }}
          >
            <div className="certificate-signature-title">
              LINH MỤC PHỤ TRÁCH
            </div>

            <div className="certificate-signature-space" />

            <div className="certificate-signature-name">
              {churchData?.pastor_name || "Linh mục phụ trách"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BaptismCertificateTemplate;
