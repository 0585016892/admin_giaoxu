// src/pages/auth/register/RegisterStyles.jsx

const REGISTER_STYLES = `
* {
  box-sizing: border-box;
}

html,
body,
#root {
  width: 100%;
  min-height: 100%;
  margin: 0;
}

body {
  font-family:
    Inter,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;

  color: #334155;
  background: #F4F9FD;
  -webkit-font-smoothing: antialiased;
}

button,
input,
textarea,
select {
  font-family: inherit;
}

.register-page {
  width: 100%;
  min-height: 100vh;

  display: flex;
  flex-direction: column;

  overflow: hidden;
  position: relative;

  background:
    radial-gradient(
      circle at 10% 20%,
      rgba(65,155,220,.12),
      transparent 28%
    ),
    radial-gradient(
      circle at 90% 85%,
      rgba(242,201,76,.11),
      transparent 25%
    ),
    linear-gradient(
      135deg,
      #EFF8FF,
      #F8FBFF 45%,
      #FFFFFF
    );
}

/* ============================================================
   HEADER
============================================================ */

.register-topbar {
  height: 72px;
  min-height: 72px;

  padding: 8px 5%;

  display: flex;
  align-items: center;
  justify-content: space-between;

  position: relative;
  z-index: 20;
}

.register-logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.register-logo-image {
  width: 52px;
  height: 52px;

  object-fit: contain;
  border-radius: 15px;

  filter:
    drop-shadow(
      0 6px 14px
      rgba(23,105,170,.18)
    );
}

.register-logo-name {
  font-family:
    Georgia,
    "Times New Roman",
    serif;

  font-size: 30px;
  font-weight: 800;

  color: #103F70;
}

.register-logo-name span {
  color: #D6A52D;
}

.register-logo-slogan {
  margin-top: 5px;

  color: #718096;

  font-size: 10px;
  font-weight: 600;
}

.register-login {
  display: flex;
  align-items: center;
  gap: 13px;

  color: #718096;
  font-size: 13px;
}

.register-login-btn {
  height: 40px;

  padding: 0 19px;

  border-radius: 999px;

  border: 1.5px solid #1769AA;

  color: #1769AA;

  background: rgba(255,255,255,.8);

  font-weight: 700;

  cursor: pointer;

  display: flex;
  align-items: center;
  gap: 8px;

  transition: .2s ease;
}

.register-login-btn:hover {
  background: #1769AA;
  color: #fff;
}

/* ============================================================
   MAIN
============================================================ */

.register-main {
  flex: 1;

  width: 100%;

  padding: 8px 4% 12px;

  display: flex;
}

.register-container {
  width: 100%;
  max-width: 1450px;

  min-height: 0;

  margin: 0 auto;

  display: grid;
  grid-template-columns: 34% 66%;

  overflow: hidden;

  border-radius: 28px;

  background: rgba(255,255,255,.82);

  border: 1px solid rgba(255,255,255,.95);

  box-shadow:
    0 20px 60px
    rgba(20,75,115,.11);

  backdrop-filter: blur(18px);
}

/* ============================================================
   VISUAL
============================================================ */

.register-visual {
  position: relative;

  min-height: 600px;

  overflow: hidden;

  background:
    linear-gradient(
      145deg,
      #CFEAFF,
      #EAF6FF
    );
}

.register-visual-image {
  position: absolute;
  inset: 0;

  width: 100%;
  height: 100%;

  object-fit: cover;
}

.register-visual-overlay {
  position: absolute;
  inset: 0;

  background:
    linear-gradient(
      180deg,
      rgba(17,76,125,.02),
      rgba(17,76,125,.05) 38%,
      rgba(8,48,84,.62)
    );
}

.register-visual-content {
  position: absolute;

  left: 38px;
  right: 38px;
  bottom: 38px;

  color: white;
}

.visual-badge {
  display: inline-flex;
  align-items: center;
  gap: 7px;

  padding: 7px 13px;

  border-radius: 999px;

  background: rgba(255,255,255,.18);

  border: 1px solid rgba(255,255,255,.35);

  backdrop-filter: blur(10px);

  font-size: 10px;
  font-weight: 800;

  letter-spacing: 1.2px;
}

.register-visual-title {
  margin: 15px 0 8px;

  font-family:
    Georgia,
    "Times New Roman",
    serif;

  font-size: clamp(30px,3vw,45px);

  line-height: 1.12;

  font-style: italic;
  font-weight: 700;

  text-shadow:
    0 4px 18px
    rgba(0,0,0,.16);
}

.register-visual-description {
  max-width: 360px;

  margin: 0;

  font-size: 13px;
  line-height: 1.7;

  color: rgba(255,255,255,.92);
}

.visual-features {
  margin-top: 20px;

  display: flex;
  flex-wrap: wrap;

  gap: 7px;
}

.visual-feature {
  display: flex;
  align-items: center;
  gap: 7px;

  padding: 7px 10px;

  border-radius: 12px;

  background: rgba(255,255,255,.16);

  border: 1px solid rgba(255,255,255,.25);

  backdrop-filter: blur(8px);

  font-size: 10px;
  font-weight: 700;
}

/* ============================================================
   FORM AREA
============================================================ */

.register-form-area {
  min-width: 0;

  padding: 22px 38px 18px;

  background: rgba(255,255,255,.95);

  overflow-y: auto;

  scrollbar-width: thin;
  scrollbar-color: #C7D9E8 transparent;
}

.register-form-area::-webkit-scrollbar {
  width: 5px;
}

.register-form-area::-webkit-scrollbar-thumb {
  background: #C7D9E8;
  border-radius: 999px;
}

/* ============================================================
   HEADING
============================================================ */

.register-heading {
  text-align: center;

  margin-bottom: 19px;
}

.register-heading-icon {
  width: 48px;
  height: 48px;

  margin: 0 auto 9px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 15px;

  background: #EAF5FF;

  color: #1769AA;

  font-size: 21px;
}

.register-heading h1 {
  margin: 0;

  color: #103F70;

  font-family:
    Georgia,
    "Times New Roman",
    serif;

  font-size: 34px;
  line-height: 1.15;

  font-weight: 800;
}

.register-heading p {
  margin: 6px auto 0;

  color: #718096;

  font-size: 12px;
  line-height: 1.5;
}

.register-error,
.verify-error {
  margin-bottom: 15px;

  border-radius: 13px !important;
}

/* ============================================================
   FORM
============================================================ */

.register-form-columns {
  display: grid;

  grid-template-columns:
    1fr 1fr;

  gap: 16px;
}

.form-box {
  min-width: 0;

  padding:
    18px 18px 9px;

  border-radius: 20px;

  border: 1px solid;
}

.account-box {
  background:
    linear-gradient(
      145deg,
      #F1F8FF,
      #F8FBFF
    );

  border-color: #DCECF9;
}

.church-box {
  background:
    linear-gradient(
      145deg,
      #FFF9EA,
      #FFFDF7
    );

  border-color: #F1E6C7;
}

.section-heading {
  display: flex;
  align-items: center;

  gap: 10px;

  padding-bottom: 12px;
  margin-bottom: 6px;

  border-bottom:
    1px solid
    rgba(23,105,170,.09);
}

.church-box .section-heading {
  border-bottom-color:
    rgba(166,125,20,.1);
}

.section-icon {
  width: 38px;
  height: 38px;

  flex: 0 0 38px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 12px;

  background: rgba(255,255,255,.85);

  color: #1769AA;

  font-size: 17px;

  box-shadow:
    0 5px 15px
    rgba(23,105,170,.07);
}

.church-box .section-icon {
  color: #A97913;
}

.section-title {
  color: #103F70;

  font-size: 14px;
  font-weight: 800;
}

.church-box .section-title {
  color: #90650D;
}

.section-description {
  margin-top: 2px;

  color: #718096;

  font-size: 9.5px;
}

/* ============================================================
   ANT FORM
============================================================ */

.register-form .ant-form-item {
  margin-bottom: 9px;
}

.register-form .ant-form-item-label {
  padding: 0 0 4px !important;
}

.register-form .ant-form-item-label > label {
  color: #103F70;

  font-size: 10.5px;
  font-weight: 700;
}

.church-box .ant-form-item-label > label {
  color: #72510E;
}

.register-form .ant-input,
.register-form .ant-input-affix-wrapper,
.register-form .ant-select-selector {
  border-radius: 10px !important;

  border-color: #D7E3EF !important;

  background: rgba(255,255,255,.9) !important;

  box-shadow: none !important;

  font-size: 11.5px;
}

.register-form .ant-input {
  height: 38px;
}

.register-form .ant-input-affix-wrapper {
  min-height: 38px;
}

.register-form .ant-input-prefix {
  color: #8AA1B7;

  margin-right: 6px;
}

.register-form .ant-select {
  width: 100%;
}

.register-form .ant-select-selector {
  min-height: 38px !important;
  height: 38px !important;

  display: flex !important;
  align-items: center;
}

/* ============================================================
   SECURITY
============================================================ */

.security-box {
  margin-top: 3px;

  padding: 10px 11px;

  border-radius: 11px;

  background: rgba(255,255,255,.72);

  border:
    1px solid
    rgba(166,125,20,.12);

  display: flex;

  gap: 8px;
  align-items: center;
}

.security-icon {
  color: #A97913;

  font-size: 17px;

  flex: 0 0 auto;
}

.security-text {
  color: #718096;

  font-size: 9px;
  line-height: 1.45;
}

/* ============================================================
   TRIAL
============================================================ */

.trial-box {
  margin-top: 14px;

  padding: 11px 13px;

  border-radius: 14px;

  display: flex;
  align-items: center;

  gap: 10px;

  background:
    linear-gradient(
      135deg,
      #EFF9FF,
      #F7FCFF
    );

  border: 1px solid #D9EDF9;
}

.trial-icon {
  width: 32px;
  height: 32px;

  flex: 0 0 32px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 9px;

  background: #DDF3FF;

  color: #159447;

  font-size: 16px;
}

.trial-title {
  color: #103F70;

  font-size: 10.5px;
  font-weight: 800;
}

.trial-description {
  margin-top: 2px;

  color: #718096;

  font-size: 9px;
  line-height: 1.4;
}

/* ============================================================
   TERMS
============================================================ */

.terms-row {
  margin-top: 11px;

  display: flex;
  align-items: flex-start;
  justify-content: center;

  gap: 7px;

  color: #718096;

  font-size: 10px;
  line-height: 1.5;
}

.terms-link {
  border: 0;
  padding: 0;

  background: none;

  color: #1769AA;

  font-weight: 700;

  cursor: pointer;
}

/* ============================================================
   SUBMIT
============================================================ */

.register-submit {
  margin-top: 13px;

  height: 47px !important;

  border: none !important;

  border-radius: 999px !important;

  background:
    linear-gradient(
      135deg,
      #1769AA,
      #287ED0
    ) !important;

  box-shadow:
    0 10px 25px
    rgba(23,105,170,.25) !important;

  font-size: 13px !important;
  font-weight: 800 !important;
}

/* ============================================================
   LOGIN
============================================================ */

.login-bottom {
  margin-top: 8px;

  display: flex;
  justify-content: center;
  align-items: center;

  gap: 4px;

  color: #718096;

  font-size: 10.5px;
}

/* ============================================================
   VERIFY
============================================================ */

.verify-wrapper {
  max-width: 500px;

  margin: 30px auto;

  padding: 10px 20px;

  text-align: center;
}

.verify-icon {
  width: 76px;
  height: 76px;

  margin: 0 auto 20px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 24px;

  background:
    linear-gradient(
      145deg,
      #EAF5FF,
      #F5FAFF
    );

  color: #1769AA;

  font-size: 34px;

  box-shadow:
    0 15px 35px
    rgba(23,105,170,.12);
}

.verify-heading h1 {
  margin: 0;

  color: #103F70;

  font-family:
    Georgia,
    "Times New Roman",
    serif;

  font-size: 34px;

  font-weight: 800;
}

.verify-heading p {
  margin: 9px 0 12px;

  color: #718096;

  font-size: 13px;
}

.verify-email {
  display: inline-flex;

  align-items: center;

  gap: 8px;

  padding: 9px 14px;

  border-radius: 999px;

  background: #F3F8FC;

  border: 1px solid #E1EDF5;

  color: #1769AA;

  font-size: 12px;
}

.verify-email strong {
  color: #334155;
}

.otp-area {
  margin-top: 28px;
}

.otp-label {
  display: block;

  margin-bottom: 9px;

  color: #334155;

  font-size: 12px;
  font-weight: 700;
}

.otp-input {
  height: 62px !important;

  text-align: center;

  letter-spacing: 12px;

  font-size: 30px !important;

  font-weight: 800;

  border-radius: 16px !important;

  border-color: #CFE0EE !important;
}

.otp-input:focus {
  border-color: #1769AA !important;

  box-shadow:
    0 0 0 4px
    rgba(23,105,170,.08) !important;
}

.otp-hint {
  margin-top: 7px;

  color: #94A3B8;

  font-size: 10px;
}

.otp-countdown {
  margin: 17px 0;

  display: flex;
  align-items: center;
  justify-content: center;

  gap: 6px;

  color: #718096;

  font-size: 11px;
}

.otp-countdown strong {
  color: #1769AA;

  font-size: 12px;
}

.expired-text {
  color: #E85B66;
  font-weight: 700;
}

.verify-submit {
  height: 48px !important;

  border: none !important;

  border-radius: 999px !important;

  background:
    linear-gradient(
      135deg,
      #1769AA,
      #287ED0
    ) !important;

  font-weight: 800 !important;

  box-shadow:
    0 10px 25px
    rgba(23,105,170,.22) !important;
}

.resend-button {
  margin-top: 7px;

  color: #1769AA !important;

  font-size: 11px !important;
}

.verify-security {
  margin-top: 20px;

  padding: 11px 13px;

  display: flex;

  align-items: flex-start;

  gap: 8px;

  text-align: left;

  border-radius: 13px;

  background: #FFFBF0;

  border: 1px solid #F0E4C3;

  color: #A97913;

  font-size: 10px;

  line-height: 1.5;
}

.verify-security span {
  color: #718096;
}

.verify-back {
  margin-top: 15px;

  color: #718096 !important;

  font-size: 11px !important;
}

/* ============================================================
   FOOTER
============================================================ */

.register-footer {
  height: 42px;
  min-height: 42px;

  display: flex;
  align-items: center;
  justify-content: center;

  gap: 8px;

  color: #8291A2;

  font-size: 10px;

  position: relative;
  z-index: 5;
}

.footer-heart {
  color: #D6A52D;
}

/* ============================================================
   DECORATION
============================================================ */

.decorative-blob {
  position: fixed;

  z-index: 0;

  border-radius: 50%;

  pointer-events: none;

  filter: blur(70px);
}

.blob-one {
  width: 280px;
  height: 280px;

  left: -100px;
  top: 200px;

  background: rgba(74,163,225,.13);
}

.blob-two {
  width: 300px;
  height: 300px;

  right: -120px;
  bottom: -100px;

  background: rgba(242,201,76,.12);
}

/* ============================================================
   LEGAL
============================================================ */

.legal-modal .ant-modal-content {
  border-radius: 24px;

  overflow: hidden;

  padding: 0;

  box-shadow:
    0 30px 80px
    rgba(15,61,96,.22);
}

.legal-modal .ant-modal-body {
  padding: 0;
}

.legal-header {
  padding: 24px 28px 20px;

  background:
    linear-gradient(
      135deg,
      #EFF8FF,
      #FFFFFF
    );

  border-bottom:
    1px solid
    #E1EDF7;
}

.privacy-header {
  background:
    linear-gradient(
      135deg,
      #FFF9EA,
      #FFFFFF
    );
}

.legal-header-icon {
  width: 46px;
  height: 46px;

  margin-bottom: 11px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 14px;

  background: #E2F1FF;

  color: #1769AA;

  font-size: 21px;
}

.privacy-header .legal-header-icon {
  background: #FFF0C7;
  color: #A97913;
}

.legal-header h2 {
  margin: 0;

  color: #103F70;

  font-family:
    Georgia,
    "Times New Roman",
    serif;

  font-size: 24px;
  font-weight: 800;
}

.legal-header p {
  margin: 5px 0 0;

  color: #718096;

  font-size: 12px;
}

.legal-content {
  max-height: 58vh;

  overflow-y: auto;

  padding: 22px 28px 26px;
}

.legal-intro {
  display: flex;
  align-items: center;

  gap: 12px;

  padding: 13px 15px;

  margin-bottom: 20px;

  border-radius: 14px;

  background: #F4FAFF;

  border: 1px solid #DDEEF9;
}

.privacy-intro {
  background: #FFFBF1;
  border-color: #F3E8C9;
}

.legal-intro > svg {
  color: #1769AA;
  font-size: 22px;
}

.privacy-intro > svg {
  color: #A97913;
}

.legal-intro div {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.legal-intro strong {
  color: #103F70;
  font-size: 12px;
}

.legal-intro span {
  color: #718096;
  font-size: 10px;
}

.legal-content section {
  margin-bottom: 18px;
}

.legal-content section h3 {
  margin: 0 0 7px;

  color: #103F70;

  font-size: 13px;
  font-weight: 800;
}

.legal-content section p {
  margin: 0;

  color: #334155;

  font-size: 11.5px;
  line-height: 1.7;
}

.legal-footer-note {
  display: flex;
  align-items: flex-start;

  gap: 9px;

  padding: 12px 14px;

  margin-top: 20px;

  border-radius: 13px;

  background:
    linear-gradient(
      135deg,
      #F3FAFF,
      #F9FCFF
    );

  border: 1px solid #DFEEF9;

  color: #1769AA;
}

.legal-footer-note span {
  color: #718096;

  font-size: 10.5px;
  line-height: 1.5;
}

.privacy-note {
  background:
    linear-gradient(
      135deg,
      #FFFBF0,
      #FFFDF8
    );

  border-color: #F0E4C3;

  color: #A97913;
}

/* ============================================================
   TABLET
============================================================ */

@media (max-width: 1000px) {
  .register-page {
    overflow: visible;
  }

  .register-main {
    flex: none;

    padding: 10px 20px 25px;
  }

  .register-container {
    grid-template-columns: 1fr;
  }

  .register-visual {
    min-height: 300px;
    height: 300px;
  }

  .register-form-area {
    overflow: visible;

    padding: 32px 28px 28px;
  }
}

/* ============================================================
   MOBILE
============================================================ */

@media (max-width: 700px) {
  .register-topbar {
    height: 64px;
    min-height: 64px;

    padding: 8px 15px;
  }

  .register-logo-image {
    width: 43px;
    height: 43px;
  }

  .register-logo-name {
    font-size: 25px;
  }

  .register-logo-slogan {
    display: none;
  }

  .register-login > span {
    display: none;
  }

  .register-login-btn {
    height: 36px;

    padding: 0 13px;

    font-size: 11px;
  }

  .register-main {
    padding: 8px 10px 20px;
  }

  .register-container {
    border-radius: 22px;
  }

  .register-visual {
    height: 235px;
    min-height: 235px;
  }

  .register-visual-content {
    left: 18px;
    right: 18px;
    bottom: 18px;
  }

  .register-visual-description {
    display: none;
  }

  .register-visual-title {
    font-size: 28px;
  }

  .register-form-area {
    padding: 25px 13px 22px;
  }

  .register-form-columns {
    grid-template-columns: 1fr;
  }

  .form-box {
    padding: 16px 13px 8px;
  }

  .register-heading h1 {
    font-size: 25px;
  }

  .verify-wrapper {
    padding: 5px;
  }

  .verify-heading h1 {
    font-size: 28px;
  }

  .otp-input {
    letter-spacing: 7px;
    font-size: 26px !important;
  }

  .register-footer {
    height: auto;
    min-height: 42px;

    flex-direction: column;

    gap: 2px;

    padding: 8px 15px 15px;

    font-size: 9px;
  }

  .footer-dot {
    display: none;
  }

  .legal-modal {
    width: calc(100vw - 20px) !important;
    max-width: calc(100vw - 20px) !important;
  }

  .legal-header {
    padding: 20px 18px 17px;
  }

  .legal-content {
    max-height: 60vh;

    padding: 17px 18px 20px;
  }
}

/* ============================================================
   SMALL PHONE
============================================================ */

@media (max-width: 400px) {
  .register-logo-name {
    font-size: 22px;
  }

  .register-login-btn {
    padding: 0 10px;
  }

  .register-visual {
    height: 215px;
    min-height: 215px;
  }

  .register-visual-title {
    font-size: 25px;
  }

  .register-form-area {
    padding: 22px 10px 20px;
  }

  .otp-input {
    letter-spacing: 4px;
    font-size: 23px !important;
  }
}
`;

export default REGISTER_STYLES;
