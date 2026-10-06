// src/pages/help/HelpCenterStyles.jsx

export const HELP_STYLES = `
/* =========================================================
   FAITHEDU HELP CENTER
   Complete UI System
========================================================= */

.faith-help-page,
.faith-help-page *,
.faith-help-page *::before,
.faith-help-page *::after {
  box-sizing: border-box;
}

.faith-help-page {
  --fh-navy: #173B5E;
  --fh-navy-deep: #102A43;

  --fh-gold: #D9A441;
  --fh-gold-soft: #F4E7C1;

  --fh-cream: #FFF9EE;

  --fh-bg: #F7F9FC;
  --fh-white: #FFFFFF;

  --fh-border: #E2E8F0;
  --fh-border-soft: #EDF1F4;

  --fh-text: #243447;
  --fh-muted: #6B7280;
  --fh-muted-light: #8A98A6;

  --fh-success: #2E7D5B;

  --fh-radius-sm: 10px;
  --fh-radius-md: 14px;
  --fh-radius-lg: 18px;
  --fh-radius-xl: 24px;

  --fh-shadow-sm:
    0 4px 15px rgba(16, 42, 67, 0.045);

  --fh-shadow-md:
    0 12px 30px rgba(16, 42, 67, 0.075);

  --fh-shadow-lg:
    0 24px 55px rgba(16, 42, 67, 0.11);

  min-height: 100%;
  width: 100%;

  overflow-x: hidden;

  background: var(--fh-bg);
  color: var(--fh-text);

  font-family:
    "Be Vietnam Pro",
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
}

/* =========================================================
   GLOBAL
========================================================= */

.faith-help-page button {
  font-family: inherit;
}

.faith-help-page button:focus-visible {
  outline:
    3px solid rgba(217, 164, 65, 0.35);

  outline-offset: 2px;
}

.faith-help-page .ant-btn {
  font-family: inherit;
}

.faith-help-container {
  width: min(
    1180px,
    calc(100% - 48px)
  );

  margin: 0 auto;
}

/* =========================================================
   HERO
========================================================= */

.faith-help-hero-new {
  position: relative;

  isolation: isolate;

  overflow: visible;

  min-height: 500px;

  background:
    linear-gradient(
      135deg,
      #FFF9EE 0%,
      #FCF8EF 45%,
      #F2F6F8 100%
    );

  border-bottom:
    1px solid #ECE6DB;
}

.faith-help-hero-decoration {
  position: absolute;

  z-index: -1;

  pointer-events: none;

  border-radius: 50%;
}

.faith-help-decoration-one {
  width: 420px;
  height: 420px;

  right: -170px;
  top: -240px;

  background:
    rgba(217, 164, 65, 0.09);
}

.faith-help-decoration-two {
  width: 280px;
  height: 280px;

  left: -150px;
  bottom: -200px;

  border:
    1px solid rgba(23, 59, 94, 0.07);
}

.faith-help-hero-inner {
  position: relative;

  min-height: 500px;

  display: grid;

  grid-template-columns:
    minmax(0, 1.15fr)
    minmax(360px, 0.85fr);

  align-items: center;

  gap: 70px;

  padding: 65px 0;
}

/* =========================================================
   HERO COPY
========================================================= */

.faith-help-hero-copy {
  position: relative;

  z-index: 20;

  min-width: 0;
}

.faith-help-brand-badge {
  display: inline-flex;
  align-items: center;

  gap: 8px;

  margin-bottom: 20px;
  padding: 7px 12px;

  border:
    1px solid rgba(23, 59, 94, 0.08);

  border-radius: 999px;

  background:
    rgba(255, 255, 255, 0.62);

  color: var(--fh-navy);

  font-size: 10px;
  font-weight: 800;

  letter-spacing: 1.2px;
}

.faith-help-brand-badge svg {
  color: var(--fh-gold);

  font-size: 13px;
}

.faith-help-hero-copy h1 {
  max-width: 680px;

  margin:
    0 0 18px !important;

  color:
    var(--fh-navy) !important;

  font-family:
    "Be Vietnam Pro",
    sans-serif;

  font-size:
    clamp(42px, 5vw, 62px) !important;

  font-weight: 800 !important;

  line-height:
    1.08 !important;

  letter-spacing:
    -2.2px;
}

.faith-help-hero-copy > p {
  max-width: 570px;

  margin:
    0 0 30px !important;

  color:
    var(--fh-muted) !important;

  font-size: 15px;

  line-height: 1.8;
}

/* =========================================================
   SEARCH WRAPPER
========================================================= */

.faith-help-search-wrapper {
  position: relative;

  z-index: 100;

  width: min(
    650px,
    100%
  );
}

.faith-help-search-new {
  position: relative;

  z-index: 101;

  display: flex;
  align-items: center;

  width: 100%;
  height: 62px;

  padding:
    6px 7px 6px 20px;

  border:
    1px solid #DED8CD;

  border-radius: 16px;

  background:
    rgba(255, 255, 255, 0.96);

  box-shadow:
    0 14px 40px
    rgba(23, 59, 94, 0.08);

  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.faith-help-search-new:focus-within {
  border-color:
    rgba(217, 164, 65, 0.75);

  box-shadow:
    0 14px 40px
    rgba(23, 59, 94, 0.11),
    0 0 0 3px
    rgba(217, 164, 65, 0.08);
}

.faith-help-search-new > svg {
  flex: 0 0 auto;

  color:
    var(--fh-muted-light);

  font-size: 19px;
}

.faith-help-search-new .ant-input {
  min-width: 0;

  flex: 1;

  height: 48px;

  padding:
    0 12px;

  color:
    var(--fh-text);

  background:
    transparent;

  font-size: 14px;
}

.faith-help-search-new .ant-input::placeholder {
  color:
    #A4ADB5;
}

.faith-help-search-shortcut {
  flex: 0 0 auto;

  display: flex;
  align-items: center;

  height: 36px;

  padding:
    0 13px;

  border-radius:
    9px;

  background:
    #F5F7F9;

  color:
    #87929D;

  font-size: 10px;
  font-weight: 700;
}

/* =========================================================
   SEARCH RESULTS
========================================================= */

.faith-help-search-results {
  position: absolute;

  top:
    calc(100% + 8px);

  left: 0;

  z-index: 1000;

  width: 100%;

  overflow: hidden;

  border:
    1px solid var(--fh-border);

  border-radius:
    15px;

  background:
    #FFFFFF;

  box-shadow:
    0 20px 50px
    rgba(16, 42, 67, 0.15);
}

.faith-help-search-results-header {
  display: flex;
  align-items: center;
  justify-content: space-between;

  height: 42px;

  padding:
    0 16px;

  border-bottom:
    1px solid var(--fh-border-soft);

  color:
    var(--fh-muted);

  font-size: 10px;
  font-weight: 800;

  letter-spacing: 0.4px;
  text-transform: uppercase;
}

.faith-help-search-results-header span:last-child {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  min-width: 24px;
  height: 22px;

  padding:
    0 7px;

  border-radius:
    999px;

  background:
    var(--fh-cream);

  color:
    var(--fh-navy);
}

.faith-help-search-result-item {
  display: flex;
  align-items: center;

  gap: 16px;

  width: 100%;

  padding:
    13px 16px;

  border: 0;
  border-bottom:
    1px solid #F1F3F5;

  background:
    #FFFFFF;

  color:
    inherit;

  text-align:
    left;

  cursor:
    pointer;

  transition:
    background 0.15s ease;
}

.faith-help-search-result-item:last-child {
  border-bottom: 0;
}

.faith-help-search-result-item:hover {
  background:
    #F9FBFC;
}

.faith-help-search-result-item > div {
  min-width: 0;
  flex: 1;
}

.faith-help-result-title {
  margin-bottom: 3px;

  overflow: hidden;

  color:
    var(--fh-navy);

  font-size: 13px;
  font-weight: 800;

  white-space:
    nowrap;

  text-overflow:
    ellipsis;
}

.faith-help-result-description {
  overflow: hidden;

  color:
    var(--fh-muted-light);

  font-size: 11px;

  white-space:
    nowrap;

  text-overflow:
    ellipsis;
}

.faith-help-search-result-item > svg {
  flex: 0 0 auto;

  color:
    var(--fh-gold);

  font-size: 12px;
}

.faith-help-no-result {
  display: flex;
  align-items: center;

  gap: 10px;

  min-height: 100px;

  padding:
    20px;

  color:
    var(--fh-muted);

  font-size: 12px;
}

.faith-help-no-result svg {
  color:
    var(--fh-gold);

  font-size: 18px;
}

/* =========================================================
   HERO ILLUSTRATION
========================================================= */

.faith-help-hero-illustration {
  position: relative;

  z-index: 2;

  width: 100%;
  height: 350px;

  pointer-events: none;
}

.faith-help-illustration-glow {
  position: absolute;

  width: 320px;
  height: 320px;

  left: 50%;
  top: 50%;

  transform:
    translate(-50%, -50%);

  border-radius: 50%;

  background:
    radial-gradient(
      circle,
      rgba(217, 164, 65, 0.20)
      0%,
      rgba(217, 164, 65, 0)
      70%
    );
}

.faith-help-illustration-card.main {
  position: absolute;

  width: 270px;

  left: 50%;
  top: 50%;

  transform:
    translate(-50%, -50%)
    rotate(-3deg);

  padding: 28px;

  border:
    1px solid
    rgba(23, 59, 94, 0.07);

  border-radius:
    24px;

  background:
    rgba(255, 255, 255, 0.96);

  box-shadow:
    0 25px 65px
    rgba(23, 59, 94, 0.13);
}

.faith-help-illustration-icon {
  width: 62px;
  height: 62px;

  display: flex;
  align-items: center;
  justify-content: center;

  margin-bottom: 24px;

  border-radius:
    17px;

  background:
    var(--fh-navy);

  color:
    var(--fh-gold-soft);

  font-size: 29px;
  font-weight: 800;
}

.faith-help-illustration-line {
  width: 76%;
  height: 8px;

  margin-bottom: 10px;

  border-radius:
    999px;

  background:
    #E7ECF0;
}

.faith-help-illustration-line.large {
  width: 92%;

  background:
    #DCE4EA;
}

.faith-help-illustration-line.short {
  width: 52%;
}

.faith-help-illustration-check {
  display: flex;
  align-items: center;

  gap: 8px;

  margin-top: 24px;

  color:
    var(--fh-success);

  font-size: 11px;
  font-weight: 800;
}

.faith-help-illustration-check svg {
  font-size: 14px;
}

.faith-help-floating-card {
  position: absolute;

  display: flex;
  align-items: center;

  gap: 8px;

  padding:
    10px 14px;

  border:
    1px solid
    rgba(23, 59, 94, 0.06);

  border-radius:
    12px;

  background:
    #FFFFFF;

  color:
    var(--fh-navy);

  font-size: 11px;
  font-weight: 800;

  box-shadow:
    var(--fh-shadow-md);
}

.faith-help-floating-card svg {
  color:
    var(--fh-gold);
}

.faith-help-floating-card.one {
  left: 1%;
  top: 17%;

  transform:
    rotate(-6deg);
}

.faith-help-floating-card.two {
  right: 0;
  bottom: 15%;

  transform:
    rotate(5deg);
}

/* =========================================================
   SECTION
========================================================= */

.faith-help-section {
  padding-top:
    68px;
}

.faith-help-section-heading {
  margin-bottom:
    25px;
}

.faith-help-section-heading.compact {
  margin-bottom:
    20px;
}

.faith-help-overline {
  margin-bottom:
    6px;

  color:
    var(--fh-gold);

  font-size: 10px;
  font-weight: 900;

  letter-spacing:
    1.4px;
}

.faith-help-section-heading h2,
.faith-help-popular-header h2 {
  margin:
    0 0 5px !important;

  color:
    var(--fh-navy) !important;

  font-size:
    27px !important;

  font-weight:
    800 !important;

  letter-spacing:
    -0.5px;
}

.faith-help-section-heading p {
  margin:
    0 !important;

  color:
    var(--fh-muted) !important;

  font-size:
    13px;
}

/* =========================================================
   QUICK CARDS
========================================================= */

.faith-help-quick-grid {
  display: grid;

  grid-template-columns:
    repeat(4, minmax(0, 1fr));

  gap:
    14px;
}

.faith-help-quick-card {
  position: relative;

  min-width: 0;
  min-height: 225px;

  display: flex;
  flex-direction: column;

  padding:
    22px;

  border:
    1px solid var(--fh-border);

  border-radius:
    var(--fh-radius-lg);

  background:
    var(--fh-white);

  text-align:
    left;

  cursor:
    pointer;

  appearance:
    none;

  box-shadow:
    none;

  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    background 0.2s ease;
}

.faith-help-quick-card:hover {
  border-color:
    #D7C38F;

  background:
    #FFFDFC;

  box-shadow:
    var(--fh-shadow-md);
}

.faith-help-quick-card:active {
  background:
    #FBF9F4;
}

.faith-help-quick-icon {
  width: 48px;
  height: 48px;

  display: flex;
  align-items: center;
  justify-content: center;

  margin-bottom:
    21px;

  border-radius:
    14px;

  background:
    var(--fh-cream);

  color:
    var(--fh-gold);

  font-size:
    20px;
}

.faith-help-quick-content {
  min-width: 0;

  display: flex;
  flex-direction: column;

  flex: 1;
}

.faith-help-quick-title {
  margin-bottom:
    7px;

  color:
    var(--fh-navy);

  font-size:
    15px;

  font-weight:
    800;
}

.faith-help-quick-description {
  color:
    var(--fh-muted);

  font-size:
    11.5px;

  line-height:
    1.7;
}

.faith-help-quick-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;

  margin-top:
    auto;

  padding-top:
    18px;

  color:
    var(--fh-navy);

  font-size:
    10px;

  font-weight:
    800;
}

.faith-help-quick-footer svg {
  color:
    var(--fh-gold);

  font-size:
    11px;
}

/* =========================================================
   ALL CATEGORY
========================================================= */

.faith-help-category-grid {
  display: grid;

  grid-template-columns:
    repeat(3, minmax(0, 1fr));

  gap:
    10px;
}

.faith-help-category-card {
  position: relative;

  min-width: 0;

  display: flex;
  align-items: center;

  gap:
    14px;

  width: 100%;

  padding:
    15px;

  border:
    1px solid var(--fh-border);

  border-radius:
    var(--fh-radius-md);

  background:
    #FFFFFF;

  text-align:
    left;

  cursor:
    pointer;

  appearance:
    none;

  transition:
    border-color 0.2s ease,
    background 0.2s ease,
    box-shadow 0.2s ease;
}

.faith-help-category-card:hover {
  border-color:
    #D7C38F;

  background:
    #FFFDFC;

  box-shadow:
    var(--fh-shadow-sm);
}

.faith-help-category-card-icon {
  width: 40px;
  height: 40px;

  flex: 0 0 40px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius:
    11px;

  background:
    #EEF3F7;

  color:
    var(--fh-navy);

  font-size:
    16px;
}

.faith-help-category-card-body {
  min-width: 0;

  flex: 1;
}

.faith-help-category-card-title {
  margin-bottom:
    3px;

  color:
    var(--fh-navy);

  font-size:
    12.5px;

  font-weight:
    800;
}

.faith-help-category-card-description {
  overflow: hidden;

  color:
    var(--fh-muted-light);

  font-size:
    10.5px;

  white-space:
    nowrap;

  text-overflow:
    ellipsis;
}

.faith-help-category-card-count {
  margin-top:
    4px;

  color:
    #ADB5BC;

  font-size:
    9.5px;
}

.faith-help-category-card > svg {
  flex: 0 0 auto;

  color:
    #AEB7BF;

  font-size:
    11px;
}

/* =========================================================
   POPULAR
========================================================= */

.faith-help-popular-section {
  margin-top:
    70px;

  padding:
    28px 30px;

  border:
    1px solid var(--fh-border);

  border-radius:
    var(--fh-radius-xl);

  background:
    #FFFFFF;
}

.faith-help-popular-header {
  display: flex;
  align-items: center;
  justify-content: space-between;

  margin-bottom:
    16px;
}

.faith-help-popular-header .ant-btn {
  height: auto;

  padding:
    5px 0;

  color:
    var(--fh-navy);

  font-size:
    12px;

  font-weight:
    700;
}

.faith-help-popular-list {
  display: flex;
  flex-direction: column;
}

.faith-help-popular-item {
  display: grid;

  grid-template-columns:
    34px
    40px
    minmax(0, 1fr)
    18px;

  align-items: center;

  gap:
    13px;

  width: 100%;

  padding:
    13px 5px;

  border: 0;
  border-top:
    1px solid #EEF1F4;

  background:
    transparent;

  text-align:
    left;

  cursor:
    pointer;

  appearance:
    none;

  transition:
    background 0.15s ease;
}

.faith-help-popular-item:first-child {
  border-top: 0;
}

.faith-help-popular-item:hover {
  background:
    #FBFCFD;
}

.faith-help-popular-number {
  color:
    #C2CBD2;

  font-size:
    11px;

  font-weight:
    800;
}

.faith-help-popular-icon {
  width: 38px;
  height: 38px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius:
    10px;

  background:
    var(--fh-cream);

  color:
    var(--fh-gold);
}

.faith-help-popular-copy {
  min-width: 0;
}

.faith-help-popular-copy > div {
  margin-bottom:
    3px;

  overflow:
    hidden;

  color:
    var(--fh-navy);

  font-size:
    12.5px;

  font-weight:
    800;

  white-space:
    nowrap;

  text-overflow:
    ellipsis;
}

.faith-help-popular-copy span {
  display: block;

  overflow:
    hidden;

  color:
    var(--fh-muted-light);

  font-size:
    10.5px;

  white-space:
    nowrap;

  text-overflow:
    ellipsis;
}

.faith-help-popular-item > svg {
  color:
    #AAB4BD;

  font-size:
    11px;
}

/* =========================================================
   CONTACT
========================================================= */

.faith-help-contact {
  display: flex;
  align-items: center;

  gap:
    18px;

  margin-top:
    42px;

  padding:
    22px 25px;

  border-radius:
    var(--fh-radius-lg);

  background:
    linear-gradient(
      135deg,
      var(--fh-navy),
      var(--fh-navy-deep)
    );

  box-shadow:
    var(--fh-shadow-md);
}

.faith-help-contact-icon {
  width: 46px;
  height: 46px;

  flex: 0 0 46px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius:
    13px;

  background:
    rgba(255,255,255,0.09);

  color:
    var(--fh-gold-soft);

  font-size:
    20px;
}

.faith-help-contact-copy {
  min-width: 0;

  flex: 1;
}

.faith-help-contact-title {
  margin-bottom:
    3px;

  color:
    #FFFFFF;

  font-size:
    14px;

  font-weight:
    800;
}

.faith-help-contact-description {
  color:
    rgba(255,255,255,0.62);

  font-size:
    11.5px;

  line-height:
    1.6;
}

.faith-help-contact .ant-btn {
  flex: 0 0 auto;

  height:
    38px;

  padding:
    0 15px;

  border:
    0;

  border-radius:
    9px;

  background:
    var(--fh-gold-soft);

  color:
    var(--fh-navy);

  font-size:
    11px;

  font-weight:
    800;
}

/* =========================================================
   CATEGORY PAGE
========================================================= */

.faith-help-back-button {
  display: inline-flex;
  align-items: center;

  gap:
    8px;

  margin:
    27px 0 24px;

  padding:
    0;

  border:
    0;

  background:
    transparent;

  color:
    var(--fh-navy);

  font-size:
    12px;

  font-weight:
    800;

  cursor:
    pointer;

  appearance:
    none;
}

.faith-help-back-button:hover {
  color:
    var(--fh-gold);
}

.faith-help-category-header {
  display: flex;
  align-items: center;

  gap:
    22px;

  margin-bottom:
    42px;

  padding:
    34px;

  border:
    1px solid #E9E4D9;

  border-radius:
    var(--fh-radius-xl);

  background:
    linear-gradient(
      135deg,
      #FFF9EE,
      #F7F9FC
    );
}

.faith-help-category-header-icon {
  width: 68px;
  height: 68px;

  flex: 0 0 68px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius:
    19px;

  background:
    var(--fh-navy);

  color:
    var(--fh-gold-soft);

  font-size:
    26px;

  box-shadow:
    0 12px 25px
    rgba(23, 59, 94, 0.13);
}

.faith-help-category-header h1 {
  margin:
    0 0 6px !important;

  color:
    var(--fh-navy) !important;

  font-size:
    32px !important;

  line-height:
    1.2 !important;

  font-weight:
    800 !important;
}

.faith-help-category-header p {
  max-width:
    700px;

  margin:
    0 !important;

  color:
    var(--fh-muted) !important;

  font-size:
    13px;

  line-height:
    1.7;
}

.faith-help-category-articles {
  padding-bottom:
    70px;
}

.faith-help-category-articles-heading {
  margin-bottom:
    18px;
}

.faith-help-category-articles-heading h2 {
  margin:
    0 !important;

  color:
    var(--fh-navy) !important;

  font-size:
    22px !important;

  font-weight:
    800 !important;
}

.faith-help-article-list {
  display:
    flex;

  flex-direction:
    column;

  gap:
    10px;
}

.faith-help-article-list-item {
  display:
    flex;

  align-items:
    center;

  gap:
    15px;

  width:
    100%;

  padding:
    16px 17px;

  border:
    1px solid var(--fh-border);

  border-radius:
    var(--fh-radius-md);

  background:
    #FFFFFF;

  text-align:
    left;

  cursor:
    pointer;

  appearance:
    none;

  transition:
    border-color 0.2s ease,
    background 0.2s ease,
    box-shadow 0.2s ease;
}

.faith-help-article-list-item:hover {
  border-color:
    #D7C38F;

  background:
    #FFFDFC;

  box-shadow:
    var(--fh-shadow-sm);
}

.faith-help-article-list-icon {
  width:
    42px;

  height:
    42px;

  flex:
    0 0 42px;

  display:
    flex;

  align-items:
    center;

  justify-content:
    center;

  border-radius:
    11px;

  background:
    #EEF3F7;

  color:
    var(--fh-navy);
}

.faith-help-article-list-content {
  min-width:
    0;

  flex:
    1;
}

.faith-help-article-list-title {
  margin-bottom:
    4px;

  color:
    var(--fh-navy);

  font-size:
    13px;

  font-weight:
    800;
}

.faith-help-article-list-description {
  overflow:
    hidden;

  color:
    var(--fh-muted-light);

  font-size:
    11px;

  white-space:
    nowrap;

  text-overflow:
    ellipsis;
}

.faith-help-article-list-item > svg {
  flex:
    0 0 auto;

  color:
    #AAB4BD;

  font-size:
    11px;
}

.faith-help-empty {
  min-height:
    180px;

  display:
    flex;

  flex-direction:
    column;

  align-items:
    center;

  justify-content:
    center;

  gap:
    10px;

  border:
    1px dashed #DCE3E9;

  border-radius:
    16px;

  background:
    #FFFFFF;

  color:
    var(--fh-muted-light);

  font-size:
    12px;
}

.faith-help-empty svg {
  color:
    var(--fh-gold);

  font-size:
    24px;
}

/* =========================================================
   ARTICLE DETAIL
========================================================= */

.faith-help-detail-layout {
  display:
    grid;

  grid-template-columns:
    minmax(0, 1fr)
    270px;

  gap:
    55px;

  padding-bottom:
    70px;
}

.faith-help-detail-main {
  min-width:
    0;

  max-width:
    800px;
}

.faith-help-detail-category {
  display:
    inline-flex;

  align-items:
    center;

  min-height:
    27px;

  padding:
    0 11px;

  border-radius:
    999px;

  background:
    var(--fh-gold-soft);

  color:
    var(--fh-navy);

  font-size:
    9px;

  font-weight:
    800;
}

.faith-help-detail-title {
  margin:
    15px 0 11px !important;

  color:
    var(--fh-navy) !important;

  font-size:
    38px !important;

  line-height:
    1.2 !important;

  font-weight:
    800 !important;

  letter-spacing:
    -1px;
}

.faith-help-detail-description {
  margin:
    0 !important;

  color:
    var(--fh-muted) !important;

  font-size:
    14px;

  line-height:
    1.8;
}

.faith-help-detail-divider {
  height:
    1px;

  margin:
    30px 0;

  background:
    var(--fh-border);
}

.faith-help-step-list {
  display:
    flex;

  flex-direction:
    column;

  gap:
    28px;
}

.faith-help-step-row {
  display:
    grid;

  grid-template-columns:
    40px minmax(0, 1fr);

  gap:
    17px;
}

.faith-help-step-index {
  width:
    38px;

  height:
    38px;

  display:
    flex;

  align-items:
    center;

  justify-content:
    center;

  border-radius:
    11px;

  background:
    var(--fh-navy);

  color:
    #FFFFFF;

  font-size:
    12px;

  font-weight:
    800;
}

.faith-help-step-body h3 {
  margin:
    2px 0 7px !important;

  color:
    var(--fh-navy) !important;

  font-size:
    16px !important;

  font-weight:
    800 !important;
}

.faith-help-step-body p {
  margin:
    0 !important;

  color:
    #6F7D89 !important;

  font-size:
    13px;

  line-height:
    1.85;
}

.faith-help-tip-box {
  display:
    flex;

  gap:
    13px;

  margin-top:
    34px;

  padding:
    19px;

  border:
    1px solid #F0DFB1;

  border-radius:
    15px;

  background:
    var(--fh-cream);
}

.faith-help-tip-icon {
  flex:
    0 0 auto;

  font-size:
    20px;
}

.faith-help-tip-title {
  margin-bottom:
    5px;

  color:
    var(--fh-navy);

  font-size:
    12px;

  font-weight:
    800;
}

.faith-help-tip-box ul {
  margin:
    0;

  padding-left:
    17px;

  color:
    var(--fh-muted);

  font-size:
    12px;

  line-height:
    1.8;
}

.faith-help-detail-bottom {
  margin-top:
    34px;

  padding-top:
    20px;

  border-top:
    1px solid var(--fh-border);
}

.faith-help-detail-bottom .ant-btn {
  border-radius:
    9px;

  font-size:
    12px;
}

/* =========================================================
   ARTICLE SIDE
========================================================= */

.faith-help-detail-side {
  padding-top:
    88px;
}

.faith-help-side-card {
  position:
    sticky;

  top:
    25px;

  padding:
    21px;

  border:
    1px solid var(--fh-border);

  border-radius:
    var(--fh-radius-lg);

  background:
    #FFFFFF;

  box-shadow:
    var(--fh-shadow-sm);
}

.faith-help-side-icon {
  width:
    42px;

  height:
    42px;

  display:
    flex;

  align-items:
    center;

  justify-content:
    center;

  margin-bottom:
    15px;

  border-radius:
    11px;

  background:
    var(--fh-cream);

  color:
    var(--fh-gold);

  font-size:
    18px;
}

.faith-help-side-title {
  margin-bottom:
    6px;

  color:
    var(--fh-navy);

  font-size:
    13px;

  font-weight:
    800;
}

.faith-help-side-description {
  margin-bottom:
    16px;

  color:
    var(--fh-muted);

  font-size:
    11px;

  line-height:
    1.7;
}

.faith-help-side-card .ant-btn {
  height:
    36px;

  border-radius:
    9px;

  color:
    var(--fh-navy);

  font-size:
    11px;

  font-weight:
    700;
}

/* =========================================================
   BOTTOM
========================================================= */

.faith-help-bottom-space {
  height:
    70px;
}

/* =========================================================
   TABLET
========================================================= */

@media (max-width: 1050px) {

  .faith-help-hero-inner {
    grid-template-columns:
      minmax(0, 1fr)
      330px;

    gap:
      30px;
  }

  .faith-help-quick-grid {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }

  .faith-help-category-grid {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }

  .faith-help-detail-layout {
    grid-template-columns:
      minmax(0, 1fr);
  }

  .faith-help-detail-side {
    display:
      none;
  }
}

/* =========================================================
   MOBILE
========================================================= */

@media (max-width: 760px) {

  .faith-help-container {
    width:
      calc(100% - 24px);
  }

  /* HERO */

  .faith-help-hero-new {
    min-height:
      auto;

    overflow:
      visible;
  }

  .faith-help-hero-inner {
    min-height:
      auto;

    display:
      block;

    padding:
      42px 0 48px;
  }

  .faith-help-hero-copy {
    width:
      100%;
  }

  .faith-help-brand-badge {
    margin-bottom:
      16px;

    font-size:
      8.5px;
  }

  .faith-help-hero-copy h1 {
    margin-bottom:
      14px !important;

    font-size:
      37px !important;

    line-height:
      1.1 !important;

    letter-spacing:
      -1.3px;
  }

  .faith-help-hero-copy > p {
    margin-bottom:
      23px !important;

    font-size:
      13px;

    line-height:
      1.7;
  }

  .faith-help-search-new {
    height:
      56px;

    padding-left:
      16px;

    border-radius:
      14px;
  }

  .faith-help-search-new .ant-input {
    height:
      44px;

    font-size:
      13px;
  }

  .faith-help-search-shortcut {
    display:
      none;
  }

  .faith-help-search-results {
    border-radius:
      13px;
  }

  .faith-help-search-result-item {
    padding:
      12px;
  }

  .faith-help-hero-illustration {
    display:
      none;
  }

  /* SECTIONS */

  .faith-help-section {
    padding-top:
      42px;
  }

  .faith-help-section-heading h2,
  .faith-help-popular-header h2 {
    font-size:
      21px !important;
  }

  .faith-help-section-heading p {
    font-size:
      11px;
  }

  /* QUICK */

  .faith-help-quick-grid {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));

    gap:
      9px;
  }

  .faith-help-quick-card {
    min-height:
      180px;

    padding:
      16px;

    border-radius:
      15px;
  }

  .faith-help-quick-icon {
    width:
      42px;

    height:
      42px;

    margin-bottom:
      16px;

    border-radius:
      12px;

    font-size:
      17px;
  }

  .faith-help-quick-title {
    font-size:
      13px;
  }

  .faith-help-quick-description {
    font-size:
      10.5px;

    line-height:
      1.6;
  }

  .faith-help-quick-footer {
    padding-top:
      12px;

    font-size:
      9.5px;
  }

  /* CATEGORIES */

  .faith-help-category-grid {
    grid-template-columns:
      1fr;

    gap:
      8px;
  }

  .faith-help-category-card {
    padding:
      14px;
  }

  /* POPULAR */

  .faith-help-popular-section {
    margin-top:
      45px;

    padding:
      20px 16px;

    border-radius:
      17px;
  }

  .faith-help-popular-header {
    align-items:
      center;
  }

  .faith-help-popular-header .ant-btn {
    font-size:
      10px;
  }

  .faith-help-popular-item {
    grid-template-columns:
      25px
      35px
      minmax(0, 1fr)
      12px;

    gap:
      8px;

    padding:
      12px 0;
  }

  .faith-help-popular-icon {
    width:
      34px;

    height:
      34px;
  }

  .faith-help-popular-copy > div {
    font-size:
      11.5px;
  }

  .faith-help-popular-copy span {
    font-size:
      9.5px;
  }

  /* CONTACT */

  .faith-help-contact {
    flex-wrap:
      wrap;

    gap:
      13px;

    margin-top:
      35px;

    padding:
      19px;

    border-radius:
      16px;
  }

  .faith-help-contact-copy {
    flex:
      1 1 calc(100% - 62px);
  }

  .faith-help-contact .ant-btn {
    width:
      100%;

    margin-top:
      2px;
  }

  /* CATEGORY */

  .faith-help-category-header {
    align-items:
      flex-start;

    gap:
      14px;

    margin-bottom:
      30px;

    padding:
      21px;

    border-radius:
      17px;
  }

  .faith-help-category-header-icon {
    width:
      50px;

    height:
      50px;

    flex:
      0 0 50px;

    border-radius:
      14px;

    font-size:
      20px;
  }

  .faith-help-category-header h1 {
    font-size:
      24px !important;
  }

  .faith-help-category-header p {
    font-size:
      11px;

    line-height:
      1.65;
  }

  .faith-help-category-articles-heading h2 {
    font-size:
      20px !important;
  }

  .faith-help-article-list-item {
    gap:
      12px;

    padding:
      13px;

    border-radius:
      13px;
  }

  .faith-help-article-list-icon {
    width:
      38px;

    height:
      38px;

    flex:
      0 0 38px;
  }

  .faith-help-article-list-title {
    font-size:
      12px;
  }

  .faith-help-article-list-description {
    white-space:
      normal;

    font-size:
      10px;

    line-height:
      1.5;
  }

  /* ARTICLE */

  .faith-help-back-button {
    margin:
      20px 0;
  }

  .faith-help-detail-title {
    font-size:
      28px !important;

    letter-spacing:
      -0.5px;
  }

  .faith-help-detail-description {
    font-size:
      12.5px;
  }

  .faith-help-detail-divider {
    margin:
      24px 0;
  }

  .faith-help-step-list {
    gap:
      23px;
  }

  .faith-help-step-row {
    grid-template-columns:
      34px minmax(0, 1fr);

    gap:
      11px;
  }

  .faith-help-step-index {
    width:
      32px;

    height:
      32px;

    border-radius:
      9px;

    font-size:
      11px;
  }

  .faith-help-step-body h3 {
    margin-top:
      1px !important;

    font-size:
      14px !important;
  }

  .faith-help-step-body p {
    font-size:
      12px;

    line-height:
      1.75;
  }

  .faith-help-tip-box {
    padding:
      16px;
  }

  .faith-help-tip-box ul {
    font-size:
      11px;
  }

  .faith-help-bottom-space {
    height:
      45px;
  }
}

/* =========================================================
   SMALL MOBILE
========================================================= */

@media (max-width: 420px) {

  .faith-help-container {
    width:
      calc(100% - 20px);
  }

  .faith-help-hero-inner {
    padding-top:
      35px;
  }

  .faith-help-hero-copy h1 {
    font-size:
      32px !important;
  }

  .faith-help-quick-grid {
    grid-template-columns:
      1fr;
  }

  .faith-help-quick-card {
    min-height:
      145px;
  }

  .faith-help-quick-description {
    max-width:
      290px;
  }

  .faith-help-contact-icon {
    width:
      42px;

    height:
      42px;

    flex:
      0 0 42px;
  }

  .faith-help-contact-copy {
    flex-basis:
      calc(100% - 55px);
  }

  .faith-help-popular-section {
    padding:
      18px 13px;
  }
}

/* =========================================================
   REDUCED MOTION
========================================================= */

@media (prefers-reduced-motion: reduce) {

  .faith-help-page *,
  .faith-help-page *::before,
  .faith-help-page *::after {
    scroll-behavior:
      auto !important;

    transition:
      none !important;
  }
}
  /* =========================================================
   SUPPORT MODAL
========================================================= */

.faith-help-support-modal .ant-modal-content {
  padding: 0;
  overflow: hidden;
  border-radius: 24px;
  background: #ffffff;
  box-shadow: 0 24px 70px rgba(16, 42, 67, 0.2);
}

.faith-help-support-modal .ant-modal-close {
  top: 16px;
  right: 16px;
  z-index: 10;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  color: #6b7280;
}

.faith-help-support-modal .ant-modal-close:hover {
  color: #173b5e;
  background: #f7f9fc;
}

.faith-help-support-modal-content {
  padding: 36px 32px 32px;
  text-align: center;
}

.faith-help-support-modal-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 18px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 20px;

  background: #fff9ee;
  border: 1px solid #f4e7c1;

  color: #d9a441;
  font-size: 30px;
}

.faith-help-support-modal-title {
  color: #173b5e;
  font-size: 24px;
  font-weight: 800;
  line-height: 1.3;
  letter-spacing: -0.3px;
}

.faith-help-support-modal-description {
  max-width: 350px;
  margin: 10px auto 24px;

  color: #6b7280;
  font-size: 14px;
  line-height: 1.7;
}

/* =========================================================
   ZALO CARD
========================================================= */

.faith-help-zalo-card {
  margin-bottom: 20px;
  padding: 22px 20px;

  border-radius: 18px;

  background: linear-gradient(
    135deg,
    #f7f9fc 0%,
    #eef3f7 100%
  );

  border: 1px solid #e2e8f0;
}

.faith-help-zalo-label {
  margin-bottom: 7px;

  color: #6b7280;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1.2px;
  text-transform: uppercase;
}

.faith-help-zalo-number {
  color: #173b5e;
  font-size: 30px;
  font-weight: 800;
  line-height: 1.25;
  letter-spacing: 0.5px;
}

.faith-help-zalo-note {
  margin-top: 7px;

  color: #6b7280;
  font-size: 12px;
}

/* =========================================================
   BUTTON
========================================================= */

.faith-help-zalo-button {
  height: 48px;

  border: none;
  border-radius: 12px;

  background: #173b5e;

  font-size: 14px;
  font-weight: 700;

  box-shadow: 0 8px 20px rgba(23, 59, 94, 0.16);
}

.faith-help-zalo-button:hover,
.faith-help-zalo-button:focus {
  background: #102a43 !important;
}

/* =========================================================
   CONTACT BUTTON
========================================================= */

.faith-help-contact-button {
  flex-shrink: 0;

  height: 44px;
  padding: 0 18px;

  border: none;
  border-radius: 11px;

  background: #173b5e;

  font-weight: 700;

  box-shadow: none;
}

.faith-help-contact-button:hover,
.faith-help-contact-button:focus {
  background: #102a43 !important;
}

/* =========================================================
   MOBILE
========================================================= */

@media (max-width: 760px) {
  .faith-help-support-modal-content {
    padding: 30px 22px 24px;
  }

  .faith-help-support-modal-title {
    font-size: 21px;
  }

  .faith-help-zalo-number {
    font-size: 26px;
  }

  .faith-help-contact-button {
    width: 100%;
    margin-top: 16px;
  }
}
`;
