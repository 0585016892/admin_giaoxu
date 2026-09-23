// ============================================================
// CERTIFICATE DESIGN CONFIG
// ============================================================

// ============================================================
// BACKGROUND IMAGES
// ============================================================

// Nếu certificateDesign.js nằm trực tiếp trong src/
import Chungchichiennon from "../../assets/images/chungchichiennon.png";
import Chungchiaunhi from "../../assets/images/chungchiaunhi1.png";
import Chungchithieunhi from "../../assets/images/template-chungchi.png";
import Chungchinghiasi from "../../assets/images/chungchinghiasi.png";
import Chungnghihiepsi from "../../assets/images/chungchihiepsi.png";
import Chungchihuynhtruong from "../../assets/images/chungchiglv.png";
import Chungchihonphoi from "../../assets/images/chungchihonphoi.png";

// ============================================================
// PAPER SIZES
// ============================================================

export const PAPER_SIZES_MM = {
  A4: {
    label: "A4",
    width: 297,
    height: 210,
  },

  A5: {
    label: "A5",
    width: 210,
    height: 148,
  },

  A3: {
    label: "A3",
    width: 420,
    height: 297,
  },

  Letter: {
    label: "Letter",
    width: 279.4,
    height: 215.9,
  },

  Legal: {
    label: "Legal",
    width: 355.6,
    height: 215.9,
  },
};

// ============================================================
// FONT OPTIONS
// ============================================================

export const FONT_OPTIONS = [
  {
    value: "Be Vietnam Pro",
    label: "Be Vietnam Pro",
    family: '"Be Vietnam Pro", Arial, sans-serif',
  },

  {
    value: "Playfair Display",
    label: "Playfair Display",
    family: '"Playfair Display", Georgia, serif',
  },

  {
    value: "Cormorant Garamond",
    label: "Cormorant Garamond",
    family: '"Cormorant Garamond", Georgia, serif',
  },

  {
    value: "Merriweather",
    label: "Merriweather",
    family: '"Merriweather", Georgia, serif',
  },

  {
    value: "Roboto",
    label: "Roboto",
    family: '"Roboto", Arial, sans-serif',
  },

  {
    value: "Times New Roman",
    label: "Times New Roman",
    family: '"Times New Roman", Times, serif',
  },
];

// ============================================================
// BORDER OPTIONS
// ============================================================

export const BORDER_OPTIONS = [
  {
    value: "none",
    label: "Không viền",
  },

  {
    value: "solid",
    label: "Viền đơn",
  },

  {
    value: "double",
    label: "Viền đôi",
  },

  {
    value: "dashed",
    label: "Nét đứt",
  },
];

// ============================================================
// STYLE PRESETS
// ============================================================

export const STYLE_PRESETS = {
  // ----------------------------------------------------------
  // SACRED
  // ----------------------------------------------------------

  sacred: {
    label: "Chiên non",

    description: "Bằng danh cho các em chiên non.",

    backgroundImage: Chungchichiennon,

    primaryColor: "#173B5E",
    secondaryColor: "#D9A441",
    textColor: "#1E293B",

    borderStyle: "double",
    borderWidth: 3,
    borderRadius: 0,

    shadow: false,
    ornament: true,
    watermark: true,
  },

  // ----------------------------------------------------------
  // CLASSIC
  // ----------------------------------------------------------

  classic: {
    label: "Ấu nhi",

    description: "Bằng dành cho nghành ấu nhi",

    backgroundImage: Chungchiaunhi,

    primaryColor: "#243447",
    secondaryColor: "#B58B35",
    textColor: "#252525",

    borderStyle: "double",
    borderWidth: 4,
    borderRadius: 0,

    shadow: false,
    ornament: true,
    watermark: false,
  },

  // ----------------------------------------------------------
  // MODERN
  // ----------------------------------------------------------

  modern: {
    label: "Thiếu Nhi",

    description: "Bằng dành cho nghành thiếu nhi.",

    backgroundImage: Chungchithieunhi,

    primaryColor: "#173B5E",
    secondaryColor: "#D9A441",
    textColor: "#1E293B",

    borderStyle: "solid",
    borderWidth: 2,
    borderRadius: 8,

    shadow: false,
    ornament: false,
    watermark: false,
  },

  // ----------------------------------------------------------
  // SOLEMN
  // ----------------------------------------------------------

  solemn: {
    label: "Nghĩa sĩ",

    description: "Bằng dành cho nghành nghĩa sĩ.",

    backgroundImage: Chungchinghiasi,

    primaryColor: "#263238",
    secondaryColor: "#C6A15B",
    textColor: "#202124",

    borderStyle: "double",
    borderWidth: 4,
    borderRadius: 0,

    shadow: false,
    ornament: true,
    watermark: true,
  },

  // ----------------------------------------------------------
  // MINIMAL
  // ----------------------------------------------------------

  minimal: {
    label: "Hiệp sĩ",

    description: "Bằng dành cho hiệp sĩ.",

    backgroundImage: Chungnghihiepsi,

    primaryColor: "#334155",
    secondaryColor: "#94A3B8",
    textColor: "#1E293B",

    borderStyle: "solid",
    borderWidth: 1,
    borderRadius: 4,

    shadow: false,
    ornament: false,
    watermark: false,
  },
  catechist: {
    label: "Huynh trưởng",

    description: "Bằng dành cho huynh trưởng.",

    backgroundImage: Chungchihuynhtruong,

    primaryColor: "#334155",
    secondaryColor: "#94A3B8",
    textColor: "#1E293B",

    borderStyle: "solid",
    borderWidth: 1,
    borderRadius: 4,

    shadow: false,
    ornament: false,
    watermark: false,
  },
  honphoi: {
    label: "Hôn nhân & Dự tòng",

    description: "Bằng dành cho giáo lý hôn nhân.",

    backgroundImage: Chungchihonphoi,

    primaryColor: "#334155",
    secondaryColor: "#94A3B8",
    textColor: "#1E293B",

    borderStyle: "solid",
    borderWidth: 1,
    borderRadius: 4,

    shadow: false,
    ornament: false,
    watermark: false,
  },
};

// ============================================================
// DEFAULT CERTIFICATE DESIGN
// ============================================================

export const DEFAULT_CERTIFICATE_DESIGN = {
  // ----------------------------------------------------------
  // PAPER
  // ----------------------------------------------------------

  paperSize: "A4",

  orientation: "landscape",

  customWidth: 297,

  customHeight: 210,

  // ----------------------------------------------------------
  // LAYOUT
  // ----------------------------------------------------------

  padding: 10,

  contentWidth: 86,

  // ----------------------------------------------------------
  // STYLE
  // ----------------------------------------------------------

  stylePreset: "sacred",

  backgroundImage: Chungchichiennon,

  primaryColor: "#173B5E",

  secondaryColor: "#D9A441",

  textColor: "#1E293B",

  borderStyle: "double",

  borderWidth: 3,

  borderRadius: 0,

  shadow: false,

  ornament: true,

  watermark: true,

  // ----------------------------------------------------------
  // TYPOGRAPHY
  // ----------------------------------------------------------

  fontFamily: "Be Vietnam Pro",

  headingFontFamily: "Playfair Display",

  bodyFontSize: 15,

  titleFontSize: 28,

  subtitleFontSize: 15,

  nameFontSize: 54,

  nameFontWeight: 700,

  lineHeight: 1.6,

  letterSpacing: 0,

  // ----------------------------------------------------------
  // ELEMENTS
  // ----------------------------------------------------------

  showSignature: true,

  showQRCode: true,

  qrSize: 72,

  signatureGap: 24,

  // ----------------------------------------------------------
  // RENDER
  // ----------------------------------------------------------

  renderScale: 3,
};

// ============================================================
// GET PAPER SIZE
// ============================================================

export const getPrintDimensions = (design = {}) => {
  const paperSize = design.paperSize || "A4";

  let base;

  if (paperSize === "CUSTOM") {
    base = {
      width: Number(design.customWidth) || 297,

      height: Number(design.customHeight) || 210,
    };
  } else {
    base = PAPER_SIZES_MM[paperSize] || PAPER_SIZES_MM.A4;
  }

  const orientation = design.orientation || "landscape";

  if (orientation === "portrait") {
    return {
      width: base.height,

      height: base.width,
    };
  }

  return {
    width: base.width,

    height: base.height,
  };
};

// ============================================================
// GET FONT FAMILY
// ============================================================

export const getFontFamily = (fontName) => {
  const found = FONT_OPTIONS.find((item) => item.value === fontName);

  return found?.family || '"Be Vietnam Pro", Arial, sans-serif';
};

// ============================================================
// GET STYLE PRESET
// ============================================================

export const getStylePreset = (presetKey) => {
  return STYLE_PRESETS[presetKey] || STYLE_PRESETS.sacred;
};

// ============================================================
// GET BACKGROUND IMAGE
// ============================================================

export const getCertificateBackground = (design = {}) => {
  if (design.backgroundImage) {
    return design.backgroundImage;
  }

  const preset = STYLE_PRESETS[design.stylePreset];

  return preset?.backgroundImage || STYLE_PRESETS.sacred.backgroundImage;
};

// ============================================================
// MERGE DESIGN
// ============================================================

export const normalizeCertificateDesign = (design = {}) => {
  const normalized = {
    ...DEFAULT_CERTIFICATE_DESIGN,

    ...design,
  };

  // Nếu design cũ chưa có backgroundImage
  // thì lấy background theo stylePreset
  if (!design.backgroundImage) {
    const preset = STYLE_PRESETS[normalized.stylePreset];

    normalized.backgroundImage =
      preset?.backgroundImage || STYLE_PRESETS.sacred.backgroundImage;
  }

  return normalized;
};
