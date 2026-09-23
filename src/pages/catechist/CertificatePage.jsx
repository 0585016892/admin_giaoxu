import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Card, Col, ConfigProvider, message, Row } from "antd";

import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import * as XLSX from "xlsx";
import JSZip from "jszip";
import dayjs from "dayjs";

import { useUser } from "../../context/UserContext";
import { useChurch } from "../../hooks/useChurch";

import CertificateToolbar from "../../components/certificates/CertificateToolbar";
import CertificatePreview from "../../components/certificates/CertificatePreview";
import CertificateTypeSelector from "../../components/certificates/CertificateTypeSelector";
import CertificateSettingsModal from "../../components/certificates/CertificateSettingsModal";
import CertificateGuideModal from "../../components/certificates/CertificateGuideModal";
import ClassCertificateModal from "../../components/certificates/ClassCertificateModal";

import {
  DEFAULT_CERTIFICATE_DESIGN,
  normalizeCertificateDesign,
  getPrintDimensions,
} from "../../components/certificates/certificateDesign";

import { getIssuedDateParts } from "../../utils/dateUtils";

import classApi from "../../api/classApi";
import studentApi from "../../api/studentApi";

import "../../components/certificates/certificate.css";

/* =========================================================
   CONSTANTS
========================================================= */

const COLORS = {
  navy: "#173B5E",
  background: "#F7F9FC",
  border: "#E2E8F0",
};

const DEFAULT_CERTIFICATE_NUMBER = "001/2026";

/* =========================================================
   CERTIFICATE TYPES
========================================================= */

const CERTIFICATE_TYPES = {
  catechism_course: {
    title: "Chứng chỉ hoàn thành khóa giáo lý",
    subTitle: "GIÁO LÝ CÔNG GIÁO",
    description: "Cấp cho học sinh hoàn thành một khóa giáo lý.",
    template: "default",
  },

  school_year: {
    title: "Chứng chỉ Giáo lý",
    subTitle: "GIÁO LÝ CÔNG GIÁO",
    description: "Chứng nhận kết quả học giáo lý trong năm học.",
    template: "default",
  },

  catechism_exam: {
    title: "Chứng chỉ Giáo lý",
    subTitle: "KỲ THI GIÁO LÝ",
    description: "Chứng nhận kết quả kỳ thi giáo lý.",
    template: "default",
  },

  final_exam: {
    title: "Chứng chỉ hoàn thành Giáo lý",
    subTitle: "GIÁO LÝ CÔNG GIÁO",
    description: "Chứng nhận hoàn thành chương trình giáo lý.",
    template: "default",
  },

  confirmation: {
    title: "Chứng nhận Thêm Sức",
    subTitle: "BÍ TÍCH THÊM SỨC",
    description: "Chứng nhận lãnh nhận Bí tích Thêm Sức.",
    template: "default",
  },

  marriage: {
    title: "Chứng chỉ Giáo lý Hôn nhân & Dự Tòng",
    subTitle: "GIÁO LÝ HÔN NHÂN CÔNG GIÁO",
    description: "Chứng nhận hoàn thành chương trình Giáo lý Hôn nhân.",
    template: "marriage",
  },

  initiation: {
    title: "Chứng chỉ Khai Tâm",
    subTitle: "GIÁO LÝ KHAI TÂM",
    description: "Chứng nhận hoàn thành chương trình khai tâm.",
    template: "default",
  },

  achievement: {
    title: "Giấy Chứng Nhận Thành Tích",
    subTitle: "GIÁO LÝ CÔNG GIÁO",
    description: "Giấy chứng nhận thành tích.",
    template: "default",
  },
};

/* =========================================================
   DEFAULT CERTIFICATE DATA
========================================================= */

const DEFAULT_CERT_DATA = {
  certNo: DEFAULT_CERTIFICATE_NUMBER,

  fullName: "",
  godName: "",
  dob: "",

  course: "",
  schoolYear: "",

  birth_place: "",

  rank: "",

  examName: "",
  score: "",

  achievement: "",

  godFather: "",
  fatherName: "",
  motherName: "",
  baptismDate: "",

  marriageDate: "",
  groomName: "",
  brideName: "",

  className: "",
  classCode: "",

  code: "",
};

/* =========================================================
   HELPERS
========================================================= */

const cloneDesign = () => ({
  ...DEFAULT_CERTIFICATE_DESIGN,
});

const removePrefix = (value, prefixes = []) => {
  if (!value) return "";

  let result = String(value).trim();

  prefixes.forEach((prefix) => {
    const escapedPrefix = String(prefix).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const regex = new RegExp(`^${escapedPrefix}\\s*`, "i");

    result = result.replace(regex, "");
  });

  return result.trim();
};

const sanitizeFileName = (value) => {
  return String(value || "Chung_Chi")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .replace(/[^a-zA-Z0-9-_ ]/g, "")
    .trim()
    .replace(/\s+/g, "_");
};

const waitForNextPaint = () =>
  new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(resolve);
    });
  });

const waitForElement = async (getElement, options = {}) => {
  const { timeout = 3000, interval = 50 } = options;

  const startedAt = Date.now();

  while (Date.now() - startedAt < timeout) {
    const element = getElement();

    if (element) {
      return element;
    }

    await new Promise((resolve) => setTimeout(resolve, interval));
  }

  return null;
};

const parseDob = (student) => {
  if (!student) return "";

  const value =
    student.dob ||
    student.date_of_birth ||
    student.birth_date ||
    student.ngay_sinh ||
    "";

  if (!value) return "";

  if (typeof value === "string" && /^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
    return value;
  }

  const parsed = dayjs(value);

  if (parsed.isValid()) {
    return parsed.format("DD/MM/YYYY");
  }

  return String(value);
};

/* =========================================================
   BUILD CERTIFICATE DATA
========================================================= */

const buildCertificateDataFromStudent = (student, previousData = {}) => {
  console.log("STUDENT:::", student);

  return {
    ...DEFAULT_CERT_DATA,

    ...previousData,

    certNo: previousData?.certNo || DEFAULT_CERTIFICATE_NUMBER,

    fullName: student?.fullName || student?.full_name || student?.name || "",

    godName:
      student?.saint_name ||
      student?.god_name ||
      student?.tenThanh ||
      student?.ten_thanh ||
      "",

    dob: parseDob(student),
    birth_place: student.birth_place,
    fatherName: student.father_name,
    motherName: student.mother_name,

    /*
     * Không lấy rank ở đây làm quyết định cuối.
     *
     * Rank sẽ được set riêng từ danh sách cấp chứng chỉ.
     */
    rank: "",
    className: student?.className || student?.class_name || "",

    classCode: student?.classCode || student?.class_code || "",

    code: student?.code || student?.student_code || "",

    course: previousData?.course || "",

    schoolYear: previousData?.schoolYear || "",
  };
};

/* =========================================================
   QR URL
========================================================= */

const buildVerificationUrl = ({
  certData,
  certType,
  parish,
  diocese,
  pastorName,
}) => {
  if (!certData?.certNo) {
    return "";
  }

  const params = new URLSearchParams({
    code: certData.certNo,
    type: certType,
    student: certData.fullName || "",
    parish: parish || "",
    diocese: diocese || "",
    pastor_name: pastorName || "",
  });

  return `${window.location.origin}/xac-thuc?${params.toString()}`;
};

/* =========================================================
   EXCEL HELPERS
========================================================= */

const getExcelValue = (row, keys = []) => {
  for (const key of keys) {
    const value = row?.[key];

    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return value;
    }
  }

  return "";
};

const normalizeExcelDate = (value) => {
  if (!value) return "";

  if (typeof value === "number") {
    try {
      return XLSX.SSF.format("dd/mm/yyyy", value);
    } catch {
      return String(value);
    }
  }

  const text = String(value).trim();

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(text)) {
    return text;
  }

  const parsed = dayjs(text);

  if (parsed.isValid()) {
    return parsed.format("DD/MM/YYYY");
  }

  return text;
};

/* =========================================================
   PAGE
========================================================= */

const CertificatePage = () => {
  const { user } = useUser();
  const { getChurchId } = useChurch();

  /* =======================================================
     REFS
  ======================================================= */

  const certificatePreviewRef = useRef(null);
  const batchCertificateRef = useRef(null);
  const uploadRef = useRef(null);

  /* =======================================================
     UI STATE
  ======================================================= */

  const [certType, setCertType] = useState("catechism_course");

  const [settingsOpen, setSettingsOpen] = useState(false);

  const [guideOpen, setGuideOpen] = useState(false);

  const [classModalOpen, setClassModalOpen] = useState(false);

  const [fullscreenPreview, setFullscreenPreview] = useState(false);

  /* =======================================================
     EXPORT STATE
  ======================================================= */

  const [exporting, setExporting] = useState(false);

  const [batchExporting, setBatchExporting] = useState(false);

  const [exportProgress, setExportProgress] = useState(0);

  const [batchCertificateData, setBatchCertificateData] = useState(null);

  /* =======================================================
     CERTIFICATE STATE
  ======================================================= */

  const [issuedDate, setIssuedDate] = useState(dayjs().format("DD/MM/YYYY"));

  const [certData, setCertData] = useState({
    ...DEFAULT_CERT_DATA,
  });

  const [certificateDesign, setCertificateDesign] = useState(cloneDesign());

  /* =======================================================
     CHURCH STATE
  ======================================================= */

  const [churchData, setChurchData] = useState({});

  /* =======================================================
     CHURCH ID
  ======================================================= */

  const churchId =
    user?.church_id || user?.church?.id || user?.parish_id || user?.parish?.id;

  /* =======================================================
     DATE
  ======================================================= */

  const issuedDateParts = useMemo(
    () => getIssuedDateParts(issuedDate),
    [issuedDate],
  );

  /* =======================================================
     NORMALIZED DESIGN
  ======================================================= */

  const normalizedDesign = useMemo(
    () => normalizeCertificateDesign(certificateDesign),
    [certificateDesign],
  );

  /* =======================================================
     PRINT DIMENSIONS
  ======================================================= */

  const printDimensions = useMemo(
    () => getPrintDimensions(normalizedDesign),
    [normalizedDesign],
  );

  /* =======================================================
     LOAD CHURCH
  ======================================================= */

  useEffect(() => {
    let cancelled = false;

    const loadChurchData = async () => {
      if (!churchId) {
        console.warn("CertificatePage: Không tìm thấy churchId.");
        return;
      }

      try {
        const response = await getChurchId(churchId);

        const rawData = response?.data ?? response;

        const data = rawData?.church ?? rawData ?? {};

        if (!cancelled) {
          setChurchData(data);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Load church data error:", error);

          message.error("Không thể tải thông tin giáo xứ.");
        }
      }
    };

    loadChurchData();

    return () => {
      cancelled = true;
    };
  }, [churchId, getChurchId]);

  /* =======================================================
     CHURCH DISPLAY
  ======================================================= */

  const parish = useMemo(
    () => removePrefix(churchData?.name, ["Giáo xứ"]),
    [churchData],
  );

  const diocese = useMemo(
    () => removePrefix(churchData?.diocese, ["Giáo phận"]),
    [churchData],
  );

  const displayChurchData = useMemo(
    () => ({
      ...churchData,

      name: parish || churchData?.name || "",
    }),
    [churchData, parish],
  );

  /* =======================================================
     QR URL - MAIN PREVIEW
  ======================================================= */

  const qrVerificationUrl = useMemo(
    () =>
      buildVerificationUrl({
        certData,
        certType,
        parish,
        diocese,
        pastorName: churchData?.pastor_name || "",
      }),
    [certData, certType, parish, diocese, churchData?.pastor_name],
  );

  /* =======================================================
     QR URL - BATCH
  ======================================================= */

  const batchQrUrl = useMemo(
    () =>
      buildVerificationUrl({
        certData: batchCertificateData,
        certType,
        parish,
        diocese,
        pastorName: churchData?.pastor_name || "",
      }),
    [batchCertificateData, certType, parish, diocese, churchData?.pastor_name],
  );

  /* =======================================================
     DESIGN
  ======================================================= */

  const updateCertificateDesign = useCallback((field, value) => {
    setCertificateDesign((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const resetDesign = useCallback(() => {
    setCertificateDesign(cloneDesign());

    message.success("Đã khôi phục thiết kế mặc định.");
  }, []);

  /* =======================================================
     RESET PAGE
  ======================================================= */

  const resetCertificate = useCallback(() => {
    setCertData({
      ...DEFAULT_CERT_DATA,
    });

    setIssuedDate(dayjs().format("DD/MM/YYYY"));

    setCertificateDesign(cloneDesign());

    setBatchCertificateData(null);

    message.success("Đã khôi phục chứng chỉ và thiết kế mặc định.");
  }, []);

  /* =======================================================
     PREVIEW STUDENT
  ======================================================= */

  const handlePreviewStudent = useCallback(
    (student) => {
      if (!student) {
        return;
      }

      const data = buildCertificateDataFromStudent(student, certData);

      /*
       * Rank phải là quyết định của người cấp.
       */
      data.rank = student?.rank || "";

      setCertData(data);

      setClassModalOpen(false);
    },
    [certData],
  );

  /* =======================================================
     CREATE PDF FROM ELEMENT
  ======================================================= */

  const createPdfFromElement = useCallback(
    async ({ element, fileName, download = true }) => {
      if (!element) {
        throw new Error("Không tìm thấy vùng render chứng chỉ.");
      }

      const dimensions = printDimensions;

      const renderScale = Math.max(
        1,
        Number(normalizedDesign.renderScale || 3),
      );

      const canvas = await html2canvas(element, {
        scale: renderScale,

        useCORS: true,

        allowTaint: false,

        backgroundColor: normalizedDesign.backgroundColor || "#FFFFFF",

        logging: false,

        imageTimeout: 15000,

        width: element.scrollWidth,

        height: element.scrollHeight,

        windowWidth: element.scrollWidth,

        windowHeight: element.scrollHeight,
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.95);

      const pdf = new jsPDF({
        orientation:
          dimensions.width >= dimensions.height ? "landscape" : "portrait",

        unit: "mm",

        format: [dimensions.width, dimensions.height],

        compress: true,
      });

      pdf.addImage(
        imgData,
        "JPEG",
        0,
        0,
        dimensions.width,
        dimensions.height,
        undefined,
        "FAST",
      );

      if (download) {
        pdf.save(fileName);
      }

      return pdf;
    },
    [printDimensions, normalizedDesign],
  );

  /* =======================================================
     EXPORT SINGLE PDF
  ======================================================= */

  const handleExportPdf = useCallback(async () => {
    if (!certificatePreviewRef.current) {
      message.error("Không tìm thấy vùng chứng chỉ.");

      return;
    }

    setExporting(true);

    try {
      await waitForNextPaint();

      const fileName = `${sanitizeFileName(
        certData.fullName || "Chung_Chi",
      )}_${certType}.pdf`;

      await createPdfFromElement({
        element: certificatePreviewRef.current,

        fileName,

        download: true,
      });

      message.success("Đã xuất chứng chỉ PDF.");
    } catch (error) {
      console.error("Export certificate error:", error);

      message.error(error?.message || "Không thể xuất chứng chỉ.");
    } finally {
      setExporting(false);
    }
  }, [certData.fullName, certType, createPdfFromElement]);

  /* =======================================================
     BATCH EXPORT
  ======================================================= */

  const handleBatchExport = useCallback(
    async (students) => {
      if (!Array.isArray(students) || students.length === 0) {
        message.warning("Chưa có học sinh để cấp chứng chỉ.");

        return;
      }

      if (batchExporting) {
        return;
      }

      setBatchExporting(true);
      setExportProgress(0);

      const zip = new JSZip();

      try {
        for (let index = 0; index < students.length; index++) {
          const student = students[index];

          /* =========================================
               BUILD DATA
            ========================================= */

          const data = buildCertificateDataFromStudent(student, certData);

          /*
           * Rank lấy từ danh sách cấp chứng chỉ.
           *
           * Đây là giá trị cuối cùng người dùng
           * đã lựa chọn.
           */
          data.rank = student?.rank || "";

          /* =========================================
               REQUIRE RANK
            ========================================= */

          if (!data.rank) {
            throw new Error(
              `Học sinh "${
                data.fullName || data.code || `#${index + 1}`
              }" chưa được chọn xếp loại.`,
            );
          }

          /* =========================================
               SET BATCH DATA
            ========================================= */

          setBatchCertificateData(data);

          /*
           * React phải render component trước.
           */
          await waitForNextPaint();

          /*
           * Đợi thêm một frame cho layout/image/font.
           */
          await new Promise((resolve) => requestAnimationFrame(resolve));

          /* =========================================
               FIND ELEMENT
            ========================================= */

          const element = await waitForElement(
            () => batchCertificateRef.current,
            {
              timeout: 4000,
              interval: 50,
            },
          );

          if (!element) {
            throw new Error(
              `Không tìm thấy vùng render chứng chỉ cho học sinh: ${
                data.fullName || data.code || index + 1
              }`,
            );
          }

          /* =========================================
               CREATE PDF
            ========================================= */

          const pdf = await createPdfFromElement({
            element,

            fileName: `${sanitizeFileName(
              data.fullName || data.code || `Hoc_Sinh_${index + 1}`,
            )}.pdf`,

            download: false,
          });

          /* =========================================
               ZIP FILE
            ========================================= */

          const fileName = sanitizeFileName(
            data.fullName || data.code || `Hoc_Sinh_${index + 1}`,
          );

          const pdfBlob = pdf.output("blob");

          zip.file(
            `${String(index + 1).padStart(3, "0")}_${fileName}.pdf`,
            pdfBlob,
          );

          /* =========================================
               PROGRESS
            ========================================= */

          setExportProgress(Math.round(((index + 1) / students.length) * 100));

          /*
           * Cho UI update progress.
           */
          await new Promise((resolve) => setTimeout(resolve, 0));
        }

        /* =========================================
             GENERATE ZIP
          ========================================= */

        const zipBlob = await zip.generateAsync({
          type: "blob",

          compression: "DEFLATE",

          compressionOptions: {
            level: 6,
          },

          onUpdate: (metadata) => {
            /*
             * Progress 0-100 của tạo ZIP.
             * Giữ tối đa 99 trước khi download.
             */
            if (typeof metadata?.percent === "number") {
              setExportProgress(Math.min(99, Math.round(metadata.percent)));
            }
          },
        });

        /* =========================================
             DOWNLOAD
          ========================================= */

        const url = URL.createObjectURL(zipBlob);

        const anchor = document.createElement("a");

        anchor.href = url;

        anchor.download = `Danh_Sach_Chung_Chi_${certType.toUpperCase()}.zip`;

        document.body.appendChild(anchor);

        anchor.click();

        anchor.remove();

        setTimeout(() => {
          URL.revokeObjectURL(url);
        }, 1500);

        setExportProgress(100);

        message.success(`Đã tạo ZIP ${students.length} chứng chỉ.`);
      } catch (error) {
        console.error("Batch export error:", error);

        message.error(error?.message || "Không thể tạo file ZIP chứng chỉ.");
      } finally {
        setBatchCertificateData(null);

        setBatchExporting(false);

        setExportProgress(0);
      }
    },
    [batchExporting, certData, certType, createPdfFromElement],
  );

  /* =======================================================
     EXCEL IMPORT
  ======================================================= */

  const handleImportExcel = useCallback(async ({ file }) => {
    if (!file) {
      return false;
    }

    try {
      const arrayBuffer = await file.arrayBuffer();

      const workbook = XLSX.read(arrayBuffer, {
        type: "array",
        cellDates: false,
      });

      const sheetName = workbook.SheetNames?.[0];

      if (!sheetName) {
        message.error("File Excel không có sheet.");

        return false;
      }

      const sheet = workbook.Sheets[sheetName];

      const rows = XLSX.utils.sheet_to_json(sheet, {
        defval: "",
        raw: true,
      });

      if (!rows.length) {
        message.warning("File Excel không có dữ liệu.");

        return false;
      }

      const students = rows
        .map((item, index) => {
          const code = getExcelValue(item, [
            "Mã học sinh",
            "Mã HS",
            "Code",
            "code",
          ]);

          const fullName = getExcelValue(item, [
            "Họ và tên",
            "Họ tên",
            "Tên học sinh",
            "fullName",
            "full_name",
          ]);

          const godName = getExcelValue(item, [
            "Tên Thánh",
            "Tên thánh",
            "godName",
            "god_name",
          ]);

          const dob = getExcelValue(item, ["Ngày sinh", "DOB", "dob"]);

          const course = getExcelValue(item, ["Niên khóa", "course"]);

          const schoolYear = getExcelValue(item, ["Năm học", "schoolYear"]);

          const className = getExcelValue(item, ["Lớp", "className"]);

          const classCode = getExcelValue(item, ["Mã lớp", "classCode"]);

          /*
           * Rank Excel KHÔNG dùng làm rank cuối.
           */
          const excelRank = getExcelValue(item, [
            "Xếp loại",
            "Xep loai",
            "rank",
          ]);

          return {
            _key: `${code || "student"}-${index}`,

            code: String(code || "").trim(),

            fullName: String(fullName || "").trim(),

            godName: String(godName || "").trim(),

            dob: normalizeExcelDate(dob),

            rank: "",

            originalRank: String(excelRank || "").trim(),

            course: String(course || "").trim(),

            schoolYear: String(schoolYear || "").trim(),

            className: String(className || "").trim(),

            classCode: String(classCode || "").trim(),
          };
        })
        .filter((student) => student.fullName || student.code);

      if (!students.length) {
        message.warning("Không tìm thấy học sinh hợp lệ trong file Excel.");

        return false;
      }

      /*
       * Excel hiện là một nguồn dữ liệu riêng.
       *
       * ClassCertificateModal cần hỗ trợ prop
       * excelStudents để hiển thị danh sách này.
       */
      setExcelStudents(students);

      setClassModalOpen(true);

      const hasRank = students.some((student) => student.originalRank);

      if (hasRank) {
        message.info(
          "Xếp loại trong Excel chỉ là dữ liệu tham khảo. Vui lòng chọn lại xếp loại trên danh sách cấp chứng chỉ.",
        );
      } else {
        message.success(`Đã đọc ${students.length} học sinh từ Excel.`);
      }

      return false;
    } catch (error) {
      console.error("Import Excel error:", error);

      message.error("Không thể đọc file Excel.");

      return false;
    }
  }, []);

  /* =======================================================
     EXCEL STUDENTS
  ======================================================= */

  const [excelStudents, setExcelStudents] = useState([]);

  /* =======================================================
     CLOSE CLASS MODAL
  ======================================================= */

  const handleCloseClassModal = useCallback(() => {
    setClassModalOpen(false);

    /*
     * Không xóa excelStudents ngay nếu modal
     * chỉ đang đóng tạm để mở lại.
     *
     * Người dùng có thể mở lại và tiếp tục.
     */
  }, []);

  /* =======================================================
     DOWNLOAD EXCEL TEMPLATE
  ======================================================= */

  const downloadExcelTemplate = useCallback(() => {
    const worksheet = XLSX.utils.json_to_sheet([
      {
        "Mã học sinh": "HS000001",

        "Họ và tên": "Nguyễn Văn A",

        "Tên Thánh": "Phêrô",

        "Ngày sinh": "01/01/2010",

        Lớp: "Lớp 6",

        "Mã lớp": "GL06",

        "Niên khóa": "2026 - 2027",

        "Năm học": "2026 - 2027",

        "Xếp loại": "",
      },
    ]);

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "DanhSach");

    XLSX.writeFile(workbook, "Mau_Danh_Sach_Cap_Chung_Chi.xlsx");
  }, []);

  /* =======================================================
     CLEAR EXCEL DATA
  ======================================================= */

  const clearExcelStudents = useCallback(() => {
    setExcelStudents([]);
  }, []);

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: COLORS.navy,

          borderRadius: 9,

          fontFamily: '"Be Vietnam Pro", Arial, sans-serif',
        },
      }}
    >
      <style>
        {`
          .certificate-page {
            background: ${COLORS.background};
            padding: 24px;
            min-height: 100vh;
            box-sizing: border-box;
          }

          .certificate-page-fullscreen {
            background: ${COLORS.background};
            padding: 16px;
            position: fixed;
            inset: 0;
            z-index: 1000;
            overflow: auto;
          }

          .certificate-card-preview {
            border-radius: 14px;
            border: 1px solid ${COLORS.border};
            box-shadow:
              0 4px 20px
              rgba(23, 59, 94, 0.04);
            overflow: hidden;
          }

          /*
           * Batch render:
           * vẫn nằm trong DOM nhưng không hiển thị
           * trên màn hình.
           *
           * Không dùng display:none.
           */
          .certificate-batch-render-root {
            position: fixed;
            left: -100000px;
            top: 0;
            width: max-content;
            height: max-content;
            overflow: visible;
            pointer-events: none;
            visibility: visible;
            z-index: -1000;
          }
        `}
      </style>

      <div
        className={
          fullscreenPreview ? "certificate-page-fullscreen" : "certificate-page"
        }
      >
        {/* =================================================
            TOOLBAR
        ================================================= */}

        <CertificateToolbar
          exporting={exporting}
          batchExporting={batchExporting}
          fullscreenPreview={fullscreenPreview}
          onClassCertificate={() => setClassModalOpen(true)}
          onImportExcel={() => uploadRef.current?.click()}
          onDownloadTemplate={downloadExcelTemplate}
          onGuide={() => setGuideOpen(true)}
          onSettings={() => setSettingsOpen((prev) => !prev)}
          onCloseSettings={() => setSettingsOpen(false)}
          onReset={resetCertificate}
          onFullscreen={() => setFullscreenPreview((prev) => !prev)}
          onExportPdf={handleExportPdf}
          settingsOpen={settingsOpen}
          design={certificateDesign}
          onDesignChange={updateCertificateDesign}
        />

        {/* =================================================
            SETTINGS
        ================================================= */}

        <CertificateSettingsModal
          open={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          design={certificateDesign}
          onChange={updateCertificateDesign}
          onReset={resetDesign}
        />

        {/* =================================================
            HIDDEN EXCEL INPUT
        ================================================= */}

        <input
          ref={uploadRef}
          type="file"
          accept=".xlsx,.xls"
          style={{
            display: "none",
          }}
          onChange={(event) => {
            const file = event.target.files?.[0];

            if (file) {
              handleImportExcel({
                file,
              });
            }

            /*
             * Cho phép chọn lại cùng file.
             */
            event.target.value = "";
          }}
        />

        {/* =================================================
            MAIN
        ================================================= */}

        <Row
          gutter={[20, 20]}
          style={{
            marginTop: 16,
          }}
        >
          {/* ===============================================
              CERTIFICATE TYPE
          =============================================== */}

          <Col xs={24}>
            <CertificateTypeSelector
              certType={certType}
              certificateTypes={CERTIFICATE_TYPES}
              onChange={setCertType}
            />
          </Col>

          {/* ===============================================
              PREVIEW
          =============================================== */}

          <Col xs={24}>
            <Card bordered={false} className="certificate-card-preview">
              <CertificatePreview
                ref={certificatePreviewRef}
                certType={certType}
                certificateTypes={CERTIFICATE_TYPES}
                certData={certData}
                churchData={displayChurchData}
                issuedDate={issuedDate}
                issuedDateParts={issuedDateParts}
                design={normalizedDesign}
                qrVerificationUrl={qrVerificationUrl}
              />
            </Card>
          </Col>
        </Row>

        {/* =================================================
            CLASS CERTIFICATE MODAL
        ================================================= */}

        <ClassCertificateModal
          open={classModalOpen}
          onClose={handleCloseClassModal}
          classApi={classApi}
          studentApi={studentApi}
          excelStudents={excelStudents}
          onClearExcel={clearExcelStudents}
          onPreviewStudent={handlePreviewStudent}
          onBatchExport={handleBatchExport}
          exporting={exporting}
          batchExporting={batchExporting}
          exportProgress={exportProgress}
        />

        {/* =================================================
            GUIDE
        ================================================= */}

        <CertificateGuideModal
          open={guideOpen}
          onClose={() => setGuideOpen(false)}
        />

        {/* =================================================
            BATCH RENDER
        ================================================= */}

        {batchCertificateData && (
          <div className="certificate-batch-render-root">
            <CertificatePreview
              ref={batchCertificateRef}
              certType={certType}
              certificateTypes={CERTIFICATE_TYPES}
              certData={batchCertificateData}
              churchData={displayChurchData}
              issuedDate={issuedDate}
              issuedDateParts={issuedDateParts}
              design={normalizedDesign}
              qrVerificationUrl={batchQrUrl}
              isExport
            />
          </div>
        )}
      </div>
    </ConfigProvider>
  );
};

export default CertificatePage;
