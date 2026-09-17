import React, { useEffect, useRef, useState } from "react";

import {
  Button,
  message,
  ConfigProvider,
  Form,
  Input,
  Select,
  Tag,
  Row,
  Col,
  Table,
  Upload,
  Modal,
  Progress,
  DatePicker,
  Empty,
  Tooltip,
} from "antd";

import {
  DownloadOutlined,
  SettingOutlined,
  FileExcelOutlined,
  TeamOutlined,
  FileZipOutlined,
  CalendarOutlined,
  SafetyCertificateOutlined,
  ReloadOutlined,
  EyeOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  TrophyOutlined,
  BookOutlined,
  UserOutlined,
  CheckCircleOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";

import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import QRCode from "react-qr-code";
import * as XLSX from "xlsx";
import JSZip from "jszip";
import dayjs from "dayjs";

import { getMyLicense } from "../../api/dashboardApi";
import DSex from "../../assets/docs/Danh_Sach_Cap_Bang_Lop_Hon_Nhan.xlsx";
/* =========================================================
   LINK EXCEL MẪU
========================================================= */

const EXCEL_TEMPLATE_URL = DSex;

/* =========================================================
   CẤU HÌNH CÁC LOẠI CHỨNG CHỈ
========================================================= */

const CERT_TYPES = {
  /* -------------------------------------------------------
     HOÀN THÀNH KHÓA GIÁO LÝ
  ------------------------------------------------------- */

  catechism_course: {
    key: "catechism_course",
    title: "Chứng Chỉ Giáo Lý",
    subTitle: "CHƯƠNG TRÌNH GIÁO LÝ",
    actionText: "ĐÃ HOÀN THÀNH CHƯƠNG TRÌNH GIÁO LÝ",
    themeColor: "#8B0000",
    category: "Học tập",
    icon: <BookOutlined />,
  },

  /* -------------------------------------------------------
     HOÀN THÀNH NĂM HỌC
  ------------------------------------------------------- */

  school_year: {
    key: "school_year",
    title: "Chứng Nhận Hoàn Thành Năm Học",
    subTitle: "CHƯƠNG TRÌNH GIÁO LÝ",
    actionText: "ĐÃ HOÀN THÀNH CHƯƠNG TRÌNH GIÁO LÝ NĂM HỌC",
    themeColor: "#1B365D",
    category: "Học tập",
    icon: <BookOutlined />,
  },

  /* -------------------------------------------------------
     THI GIÁO LÝ
  ------------------------------------------------------- */

  catechism_exam: {
    key: "catechism_exam",
    title: "Chứng Nhận Kỳ Thi Giáo Lý",
    subTitle: "KỲ THI GIÁO LÝ",
    actionText: "ĐÃ HOÀN THÀNH KỲ THI GIÁO LÝ",
    themeColor: "#B8860B",
    category: "Kỳ thi",
    icon: <CheckCircleOutlined />,
  },

  /* -------------------------------------------------------
     THI CUỐI KHÓA
  ------------------------------------------------------- */

  final_exam: {
    key: "final_exam",
    title: "Chứng Nhận Hoàn Thành Khóa Giáo Lý",
    subTitle: "KỲ THI TỐT NGHIỆP GIÁO LÝ",
    actionText: "ĐÃ HOÀN THÀNH CHƯƠNG TRÌNH VÀ ĐẠT YÊU CẦU",
    themeColor: "#7A1F1F",
    category: "Kỳ thi",
    icon: <TrophyOutlined />,
  },

  /* -------------------------------------------------------
     RỬA TỘI
  ------------------------------------------------------- */

  baptism: {
    key: "baptism",
    title: "Chứng Nhận Bí Tích Rửa Tội",
    subTitle: "RỬA TỘI & GIA NHẬP HỘI THÁNH",
    actionText: "ĐÃ LĨNH NHẬN BÍ TÍCH RỬA TỘI",
    themeColor: "#1B365D",
    category: "Bí tích",
    icon: <SafetyCertificateOutlined />,
  },

  /* -------------------------------------------------------
     THÊM SỨC
  ------------------------------------------------------- */

  confirmation: {
    key: "confirmation",
    title: "Chứng Nhận Bí Tích Thêm Sức",
    subTitle: "BAN ƠN CHÚA THÁNH THẦN",
    actionText: "ĐÃ LĨNH NHẬN BÍ TÍCH THÊM SỨC",
    themeColor: "#B8860B",
    category: "Bí tích",
    icon: <SafetyCertificateOutlined />,
  },

  /* -------------------------------------------------------
     HÔN NHÂN
  ------------------------------------------------------- */

  marriage: {
    key: "marriage",
    title: "Chứng Chỉ Giáo Lý Hôn Nhân",
    subTitle: "GIÁO LÝ HÔN NHÂN GIA ĐÌNH",
    actionText: "ĐÃ HOÀN THÀNH CHƯƠNG TRÌNH GIÁO LÝ HÔN NHÂN",
    themeColor: "#8B0000",
    category: "Học tập",
    icon: <SafetyCertificateOutlined />,
  },

  /* -------------------------------------------------------
     DỰ TÒNG
  ------------------------------------------------------- */

  catechumen: {
    key: "catechumen",
    title: "Chứng Nhận Hoàn Thành Giáo Lý Dự Tòng",
    subTitle: "GIÁO LÝ DỰ TÒNG",
    actionText: "ĐÃ HOÀN THÀNH CHƯƠNG TRÌNH GIÁO LÝ DỰ TÒNG",
    themeColor: "#4B5563",
    category: "Học tập",
    icon: <BookOutlined />,
  },

  /* -------------------------------------------------------
     KHAI TÂM
  ------------------------------------------------------- */

  initiation: {
    key: "initiation",
    title: "Chứng Nhận Hoàn Thành Giáo Lý Khai Tâm",
    subTitle: "GIÁO LÝ KHAI TÂM",
    actionText: "ĐÃ HOÀN THÀNH CHƯƠNG TRÌNH GIÁO LÝ KHAI TÂM",
    themeColor: "#2F5D50",
    category: "Học tập",
    icon: <BookOutlined />,
  },

  /* -------------------------------------------------------
     THÀNH TÍCH
  ------------------------------------------------------- */

  achievement: {
    key: "achievement",
    title: "Chứng Nhận Thành Tích Giáo Lý",
    subTitle: "GIÁO LÝ & ĐỜI SỐNG ĐỨC TIN",
    actionText: "ĐÃ ĐẠT THÀNH TÍCH TRONG HỌC TẬP GIÁO LÝ",
    themeColor: "#9A6A00",
    category: "Thành tích",
    icon: <TrophyOutlined />,
  },
};

/* =========================================================
   COMPONENT
========================================================= */

const CertificatePage = () => {
  const certificateRef = useRef(null);

  /* =======================================================
     STATE
  ======================================================= */

  const [exporting, setExporting] = useState(false);

  const [batchExporting, setBatchExporting] = useState(false);

  const [exportProgress, setExportProgress] = useState(0);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [batchModalOpen, setBatchModalOpen] = useState(false);

  const [fullscreenPreview, setFullscreenPreview] = useState(false);

  const [certType, setCertType] = useState("school_year");

  const [showSignature] = useState(true);

  const [showQRCode] = useState(true);

  /* =======================================================
     GIÁO XỨ
  ======================================================= */

  const [churchData, setChurchData] = useState({
    name: "",
    address: "",
    pastor_name: "",
    avatar: "",
  });

  /* =======================================================
     DỮ LIỆU CHỨNG CHỈ
  ======================================================= */

  const [certData, setCertData] = useState({
    certNo: "CC-2026-0001",

    godName: "Giuse",

    fullName: "Nguyễn Văn A",

    dobDay: "01",

    dobMonth: "01",

    dobYear: "1998",

    course: "2025 – 2026",

    schoolYear: "2025 – 2026",

    examName: "Kỳ thi Giáo lý cuối năm",

    score: "9.0",

    rank: "Xuất Sắc",

    achievement: "Xuất sắc trong học tập Giáo lý",

    godFather: "",
  });

  /* =======================================================
     NGÀY CẤP
  ======================================================= */

  const [issuedDate, setIssuedDate] = useState(dayjs());

  /* =======================================================
     EXCEL
  ======================================================= */

  const [studentsList, setStudentsList] = useState([]);

  const currentCertConfig = CERT_TYPES[certType] || CERT_TYPES.school_year;

  /* =======================================================
     LOAD LICENSE
  ======================================================= */

  useEffect(() => {
    const loadLicense = async () => {
      try {
        const data = await getMyLicense();

        if (data?.success && data?.church) {
          setChurchData({
            name: data.church.name || "",
            address: data.church.address || "",
            pastor_name: data.church.pastor_name || "",
          });
        }
      } catch (error) {
        message.error("Lỗi khi tải thông tin giáo xứ:", error);
      }
    };

    loadLicense();
  }, []);

  /* =======================================================
     ESC FULLSCREEN
  ======================================================= */

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setFullscreenPreview(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  /* =======================================================
     REMOVE PREFIX
  ======================================================= */

  const removePrefix = (value, prefixes = []) => {
    const text = String(value || "").trim();

    for (const prefix of prefixes) {
      const regex = new RegExp(`^${prefix}\\s*`, "i");

      if (regex.test(text)) {
        return text.replace(regex, "").trim();
      }
    }

    return text;
  };

  /* =======================================================
     GIÁO XỨ / GIÁO PHẬN
  ======================================================= */

  const parish = removePrefix(churchData?.name, ["Giáo xứ"]);

  const diocese = removePrefix(churchData?.address, ["Giáo phận"]);

  /* =======================================================
     NGÀY CẤP
  ======================================================= */

  const formattedIssuedDate = issuedDate
    ? `ngày ${issuedDate.format("DD")} tháng ${issuedDate.format(
        "MM",
      )} năm ${issuedDate.format("YYYY")}`
    : "";

  /* =======================================================
     QR
  ======================================================= */

  const qrVerificationUrl = `${
    window.location.origin
  }/xac-thuc?code=${encodeURIComponent(
    certData.certNo,
  )}&type=${encodeURIComponent(certType)}&student=${encodeURIComponent(
    certData.fullName,
  )}&parish=${encodeURIComponent(parish)}&diocese=${encodeURIComponent(diocese)}&pastor_name=${encodeURIComponent(churchData.pastor_name)}`;

  /* =======================================================
     UPDATE CERT DATA
  ======================================================= */

  const updateCertData = (field, value) => {
    setCertData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  /* =======================================================
     RESET
  ======================================================= */

  const resetCertificate = () => {
    setCertType("school_year");

    setCertData({
      certNo: "CC-2026-0001",
      godName: "Giuse",
      fullName: "Nguyễn Văn A",
      dobDay: "01",
      dobMonth: "01",
      dobYear: "1998",
      course: "2025 – 2026",
      schoolYear: "2025 – 2026",
      examName: "Kỳ thi Giáo lý cuối năm",
      score: "9.0",
      rank: "Xuất Sắc",
      achievement: "Xuất sắc trong học tập Giáo lý",
      godFather: "",
    });

    setIssuedDate(dayjs());

    message.success("Đã khôi phục dữ liệu mẫu");
  };

  /* =======================================================
     PRINT
  ======================================================= */

  /* =======================================================
     PDF
  ======================================================= */

  const handleDownloadPDF = async () => {
    const element = certificateRef.current;

    if (!element) return;

    try {
      setExporting(true);

      message.loading({
        content: "Đang tạo file PDF...",
        key: "pdf",
      });

      const canvas = await html2canvas(element, {
        scale: 3,
        useCORS: true,
        logging: false,
        backgroundColor: "#FFFDF7",
      });

      const imgData = canvas.toDataURL("image/jpeg", 1);

      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      pdf.addImage(imgData, "JPEG", 0, 0, 297, 210);

      const safeName = certData.fullName?.replace(/\s+/g, "_") || "HocVien";

      pdf.save(`Chung_Nhan_${safeName}.pdf`);

      message.success({
        content: "Xuất PDF thành công!",
        key: "pdf",
      });
    } catch (error) {
      message.error({
        content: "Có lỗi khi xuất PDF!",
        key: "pdf",
      });
    } finally {
      setExporting(false);
    }
  };

  /* =======================================================
     EXCEL MẪU
  ======================================================= */

  const handleExcelTemplate = () => {
    if (
      !EXCEL_TEMPLATE_URL ||
      EXCEL_TEMPLATE_URL === "DAN_LINK_EXCEL_MAU_CUA_BAN"
    ) {
      message.info("Bạn hãy điền link Excel mẫu vào EXCEL_TEMPLATE_URL.");

      return;
    }

    window.open(EXCEL_TEMPLATE_URL, "_blank", "noopener,noreferrer");
  };

  /* =======================================================
     IMPORT EXCEL
  ======================================================= */

  const handleExcelUpload = (file) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);

        const workbook = XLSX.read(data, {
          type: "array",
        });

        const sheetName = workbook.SheetNames[0];

        const sheet = workbook.Sheets[sheetName];

        const parsedData = XLSX.utils.sheet_to_json(sheet);

        if (!parsedData.length) {
          message.warning("File Excel không có dữ liệu.");

          return;
        }

        setStudentsList(parsedData);

        message.success(`Đã nạp ${parsedData.length} học viên.`);

        setBatchModalOpen(true);
      } catch (error) {
        message.error("Không thể đọc file Excel.");
      }
    };

    reader.readAsArrayBuffer(file);

    return false;
  };

  /* =======================================================
     PARSE NGÀY SINH
  ======================================================= */

  const parseDob = (student) => {
    let dDay = certData.dobDay;

    let dMonth = certData.dobMonth;

    let dYear = certData.dobYear;

    if (student.dob && typeof student.dob === "string") {
      const value = student.dob.trim();

      if (value.includes("/")) {
        const parts = value.split("/");

        if (parts.length === 3) {
          dDay = parts[0];
          dMonth = parts[1];
          dYear = parts[2];
        }
      }
    }

    return {
      dDay,
      dMonth,
      dYear,
    };
  };

  /* =======================================================
     LOAD STUDENT
  ======================================================= */

  const loadStudentToCertificate = (student) => {
    const { dDay, dMonth, dYear } = parseDob(student);

    setCertData((prev) => ({
      ...prev,

      certNo: student.code || prev.certNo,

      godName: student.godName || student.tenThanh || "",

      fullName: student.fullName || student.name || "",

      dobDay: dDay,

      dobMonth: dMonth,

      dobYear: dYear,

      rank: student.rank || student.rankLevel || prev.rank,

      course: student.course || student.nienKhoa || prev.course,

      schoolYear:
        student.schoolYear ||
        student.namHoc ||
        student.course ||
        prev.schoolYear,

      examName: student.examName || student.kyThi || prev.examName,

      score: student.score || student.diem || prev.score,

      achievement: student.achievement || student.thanhTich || prev.achievement,

      godFather: student.godFather || student.nguoiDoDau || "",
    }));
  };

  /* =======================================================
     EXPORT ZIP
  ======================================================= */

  const handleExportBatchZIP = async () => {
    if (!studentsList.length) {
      message.warning("Chưa có học viên.");

      return;
    }

    try {
      setBatchExporting(true);

      setExportProgress(0);

      const zip = new JSZip();

      for (let i = 0; i < studentsList.length; i++) {
        const student = studentsList[i];

        const { dDay, dMonth, dYear } = parseDob(student);

        setCertData((prev) => ({
          ...prev,

          certNo: student.code || `CC-2026-${String(i + 1).padStart(3, "0")}`,

          godName: student.godName || student.tenThanh || "",

          fullName: student.fullName || student.name || "Học viên",

          rank: student.rank || student.rankLevel || prev.rank,

          dobDay: dDay,

          dobMonth: dMonth,

          dobYear: dYear,

          course: student.course || student.nienKhoa || prev.course,

          schoolYear:
            student.schoolYear ||
            student.namHoc ||
            student.course ||
            prev.schoolYear,

          examName: student.examName || student.kyThi || prev.examName,

          score: student.score || student.diem || prev.score,

          achievement:
            student.achievement || student.thanhTich || prev.achievement,

          godFather: student.godFather || student.nguoiDoDau || "",
        }));

        await new Promise((resolve) => setTimeout(resolve, 350));

        const element = certificateRef.current;

        if (!element) continue;

        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: "#FFFDF7",
        });

        const imgData = canvas.toDataURL("image/jpeg", 0.95);

        const pdf = new jsPDF({
          orientation: "landscape",
          unit: "mm",
          format: "a4",
        });

        pdf.addImage(imgData, "JPEG", 0, 0, 297, 210);

        const pdfArrayBuffer = pdf.output("arraybuffer");

        const fileName = `ChungChi_${(
          student.fullName ||
          student.name ||
          `HocVien_${i + 1}`
        ).replace(/\s+/g, "_")}.pdf`;

        zip.file(fileName, pdfArrayBuffer);

        setExportProgress(Math.round(((i + 1) / studentsList.length) * 100));
      }

      const zipContent = await zip.generateAsync({
        type: "blob",
      });

      const downloadUrl = URL.createObjectURL(zipContent);

      const link = document.createElement("a");

      link.href = downloadUrl;

      link.download = `Danh_Sach_Chung_Chi_${certType.toUpperCase()}.zip`;

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);

      URL.revokeObjectURL(downloadUrl);

      message.success("Đã xuất toàn bộ chứng chỉ!");
    } catch (error) {
      message.error("Có lỗi khi tạo file ZIP.");
    } finally {
      setBatchExporting(false);
    }
  };

  /* =======================================================
     TABLE
  ======================================================= */

  const studentColumns = [
    {
      title: "Mã số",
      dataIndex: "code",
      width: 130,

      render: (value, record, index) =>
        value || `CC-2026-${String(index + 1).padStart(3, "0")}`,
    },

    {
      title: "Tên Thánh",
      dataIndex: "godName",
      width: 120,

      render: (value, record) => value || record.tenThanh || "—",
    },

    {
      title: "Họ và tên",
      dataIndex: "fullName",

      render: (value, record) => <strong>{value || record.name || "—"}</strong>,
    },

    {
      title: "Ngày sinh",
      dataIndex: "dob",
      width: 110,
    },

    {
      title: "Xếp loại",
      dataIndex: "rank",
      width: 110,

      render: (value, record) => (
        <Tag color="gold">{value || record.rankLevel || "—"}</Tag>
      ),
    },

    {
      title: "",
      width: 100,
      fixed: "right",

      render: (_, record) => (
        <Button
          size="small"
          icon={<EyeOutlined />}
          onClick={() => {
            loadStudentToCertificate(record);

            setBatchModalOpen(false);

            message.success(
              `Đã chọn ${record.fullName || record.name || "học viên"}`,
            );
          }}
        >
          Xem
        </Button>
      ),
    },
  ];

  /* =======================================================
     RENDER FIELD THEO LOẠI CHỨNG CHỈ
  ======================================================= */

  const renderCertificateFields = () => {
    /* HÔN NHÂN */

    if (certType === "marriage") {
      return (
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Niên khóa">
              <Input
                size="large"
                value={certData.course}
                onChange={(e) => updateCertData("course", e.target.value)}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item label="Xếp loại">
              <Select
                size="large"
                value={certData.rank}
                onChange={(value) => updateCertData("rank", value)}
                style={{
                  width: "100%",
                }}
              >
                <Select.Option value="Xuất Sắc">Xuất Sắc</Select.Option>

                <Select.Option value="Giỏi">Giỏi</Select.Option>

                <Select.Option value="Khá">Khá</Select.Option>

                <Select.Option value="Trung Bình">Trung Bình</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
      );
    }

    /* NĂM HỌC */

    if (
      certType === "school_year" ||
      certType === "catechism_course" ||
      certType === "catechumen" ||
      certType === "initiation"
    ) {
      return (
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Năm học / Niên khóa">
              <Input
                size="large"
                value={certData.schoolYear}
                onChange={(e) => updateCertData("schoolYear", e.target.value)}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item label="Xếp loại">
              <Select
                size="large"
                value={certData.rank}
                onChange={(value) => updateCertData("rank", value)}
                style={{
                  width: "100%",
                }}
              >
                <Select.Option value="Xuất Sắc">Xuất Sắc</Select.Option>

                <Select.Option value="Giỏi">Giỏi</Select.Option>

                <Select.Option value="Khá">Khá</Select.Option>

                <Select.Option value="Trung Bình">Trung Bình</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
      );
    }

    /* THI */

    if (certType === "catechism_exam" || certType === "final_exam") {
      return (
        <>
          <Form.Item label="Tên kỳ thi">
            <Input
              size="large"
              value={certData.examName}
              onChange={(e) => updateCertData("examName", e.target.value)}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Điểm">
                <Input
                  size="large"
                  value={certData.score}
                  onChange={(e) => updateCertData("score", e.target.value)}
                  placeholder="Ví dụ: 9.5/10"
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="Xếp loại">
                <Select
                  size="large"
                  value={certData.rank}
                  onChange={(value) => updateCertData("rank", value)}
                  style={{
                    width: "100%",
                  }}
                >
                  <Select.Option value="Xuất Sắc">Xuất Sắc</Select.Option>

                  <Select.Option value="Giỏi">Giỏi</Select.Option>

                  <Select.Option value="Khá">Khá</Select.Option>

                  <Select.Option value="Đạt">Đạt</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </>
      );
    }

    /* BÍ TÍCH */

    if (certType === "baptism" || certType === "confirmation") {
      return (
        <Form.Item label="Người đỡ đầu">
          <Input
            size="large"
            prefix={<UserOutlined />}
            value={certData.godFather}
            onChange={(e) => updateCertData("godFather", e.target.value)}
            placeholder="Nhập tên người đỡ đầu"
          />
        </Form.Item>
      );
    }

    /* THÀNH TÍCH */

    if (certType === "achievement") {
      return (
        <>
          <Form.Item label="Thành tích">
            <Input
              size="large"
              value={certData.achievement}
              onChange={(e) => updateCertData("achievement", e.target.value)}
              placeholder="Ví dụ: Xuất sắc trong học tập Giáo lý"
            />
          </Form.Item>

          <Form.Item label="Năm học / Niên khóa">
            <Input
              size="large"
              value={certData.schoolYear}
              onChange={(e) => updateCertData("schoolYear", e.target.value)}
            />
          </Form.Item>
        </>
      );
    }

    return null;
  };

  /* =======================================================
     RENDER THÔNG TIN TRÊN CHỨNG CHỈ
  ======================================================= */

  const renderCertificateDetails = () => {
    /* NĂM HỌC */

    if (
      certType === "school_year" ||
      certType === "catechism_course" ||
      certType === "catechumen" ||
      certType === "initiation"
    ) {
      return (
        <p className="details-line">
          Năm học <span className="val">{certData.schoolYear}</span>
          <span className="spacer" />
          Xếp loại <span className="val">{certData.rank}</span>
        </p>
      );
    }

    /* HÔN NHÂN */

    if (certType === "marriage") {
      return (
        <p className="details-line">
          Niên khóa <span className="val">{certData.course}</span>
          <span className="spacer" />
          Xếp loại <span className="val">{certData.rank}</span>
        </p>
      );
    }

    /* THI */

    if (certType === "catechism_exam" || certType === "final_exam") {
      return (
        <>
          <p className="details-line">
            Kỳ thi <span className="val">{certData.examName}</span>
          </p>

          <p className="details-line compact">
            Điểm <span className="val">{certData.score}</span>
            <span className="spacer" />
            Xếp loại <span className="val">{certData.rank}</span>
          </p>
        </>
      );
    }

    /* BÍ TÍCH */

    if (certType === "baptism" || certType === "confirmation") {
      return (
        <p className="details-line">
          Người đỡ đầu <span className="val">{certData.godFather || "—"}</span>
        </p>
      );
    }

    /* THÀNH TÍCH */

    if (certType === "achievement") {
      return (
        <>
          <p className="details-line">
            Thành tích <span className="val">{certData.achievement}</span>
          </p>

          <p className="details-line">
            Năm học <span className="val">{certData.schoolYear}</span>
          </p>
        </>
      );
    }

    return null;
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#1B365D",

          borderRadius: 10,

          fontFamily: "'Be Vietnam Pro', sans-serif",
        },
      }}
    >
      <div
        className={`certificate-page ${
          fullscreenPreview ? "fullscreen-mode" : ""
        }`}
      >
        {/* =================================================
            TOP HEADER
        ================================================= */}

        <div className="top-header">
          <div className="page-heading">
            <div className="page-eyebrow">FAITHEDU · GIÁO LÝ SỐ</div>

            <h1>Cấp chứng chỉ & văn bằng</h1>

            <p>Tạo, xem trước và xuất chứng chỉ giáo lý cho học viên.</p>
          </div>

          <div className="header-actions">
            <Upload
              beforeUpload={handleExcelUpload}
              showUploadList={false}
              accept=".xlsx,.xls"
            >
              <Button icon={<FileExcelOutlined />}>Nhập Excel</Button>
            </Upload>

            <Tooltip title="Mở file Excel mẫu">
              <Button
                icon={<FileExcelOutlined />}
                onClick={handleExcelTemplate}
              >
                Excel mẫu
              </Button>
            </Tooltip>

            {studentsList.length > 0 && (
              <Tooltip title="Xem danh sách học viên">
                <Button
                  icon={<TeamOutlined />}
                  onClick={() => setBatchModalOpen(true)}
                >
                  {studentsList.length} học viên
                </Button>
              </Tooltip>
            )}

            <Tooltip title="Cấu hình nội dung chứng chỉ">
              <Button
                icon={<SettingOutlined />}
                onClick={() => setSettingsOpen(true)}
              >
                Cấu hình
              </Button>
            </Tooltip>
            <Tooltip title="Hướng dẫn sử dụng">
              <Button
                icon={<QuestionCircleOutlined />}
                onClick={() => setGuideOpen(true)}
              >
                Hướng dẫn
              </Button>
            </Tooltip>
            <Tooltip title="Xuất chứng chỉ thành PDF">
              <Button
                icon={<DownloadOutlined />}
                loading={exporting}
                disabled={batchExporting}
                onClick={handleDownloadPDF}
              >
                Xuất PDF
              </Button>
            </Tooltip>

            <Tooltip
              title={
                fullscreenPreview ? "Thoát toàn màn hình" : "Xem toàn màn hình"
              }
            >
              <Button
                icon={
                  fullscreenPreview ? (
                    <FullscreenExitOutlined />
                  ) : (
                    <FullscreenOutlined />
                  )
                }
                onClick={() => setFullscreenPreview(!fullscreenPreview)}
              >
                {fullscreenPreview ? "Thoát" : "Toàn màn hình"}
              </Button>
            </Tooltip>
          </div>
        </div>

        {/* =================================================
            PREVIEW
        ================================================= */}

        <main className="preview-area">
          <div className="preview-toolbar">
            <div className="preview-toolbar-info">
              <div
                className="preview-toolbar-icon"
                style={{
                  background: currentCertConfig.themeColor,
                }}
              >
                {currentCertConfig.icon}
              </div>

              <div>
                <span>XEM TRƯỚC VĂN BẰNG</span>

                <strong>A4 · Landscape</strong>
              </div>
            </div>

            <div className="preview-toolbar-right">
              <Tag color="blue">{currentCertConfig.category}</Tag>

              {studentsList.length > 0 && (
                <Tag color="blue">{studentsList.length} hs</Tag>
              )}

              <Tag color={currentCertConfig.themeColor}>
                {currentCertConfig.title}
              </Tag>
            </div>
          </div>

          <div className="certificate-stage">
            <div className="certificate-container" ref={certificateRef}>
              {/* WATERMARK */}

              <div
                className="watermark-cross"
                style={{
                  color: currentCertConfig.themeColor,
                }}
              >
                ✝
              </div>

              <div className="outer-border">
                <div className="inner-border">
                  <div className="corner-decoration top-left" />
                  <div className="corner-decoration top-right" />
                  <div className="corner-decoration bottom-left" />
                  <div className="corner-decoration bottom-right" />

                  {/* =========================================
                      HEADER
                  ========================================= */}

                  <header className="cert-header">
                    <div className="diocese-info">
                      <p className="diocese-title">
                        Giáo phận {diocese || "—"}
                      </p>

                      <p
                        className="parish-title"
                        style={{
                          color: currentCertConfig.themeColor,
                        }}
                      >
                        Giáo xứ {parish || "—"}
                      </p>
                    </div>

                    <div className="cert-no-badge">
                      <span>MÃ SỐ</span>

                      <strong>{certData.certNo}</strong>
                    </div>
                  </header>

                  {/* =========================================
                      BODY
                  ========================================= */}

                  <main className="cert-body">
                    <h1
                      className="main-title"
                      style={{
                        color: currentCertConfig.themeColor,
                      }}
                    >
                      {currentCertConfig.title}
                    </h1>

                    <h2 className="sub-title">LINH MỤC QUẢN XỨ CHỨNG NHẬN</h2>

                    <div className="recipient-info">
                      <p className="intro-text">Tên Thánh & Họ Tên</p>

                      <div
                        className="student-name"
                        style={{
                          color: currentCertConfig.themeColor,
                          borderBottomColor: currentCertConfig.themeColor,
                        }}
                      >
                        {certData.godName ? `${certData.godName} ` : ""}

                        {certData.fullName}
                      </div>

                      <p className="details-line">
                        Sinh ngày{" "}
                        <span className="val">
                          {certData.dobDay}/{certData.dobMonth}/
                          {certData.dobYear}
                        </span>
                        <span className="spacer" />
                        Trực thuộc{" "}
                        <span className="val">{churchData.name || "—"}</span>
                      </p>

                      <div
                        className="achievement-box"
                        style={{
                          borderColor: currentCertConfig.themeColor,
                        }}
                      >
                        <p className="achievement-title">
                          {currentCertConfig.actionText}
                        </p>

                        <h3
                          className="course-name"
                          style={{
                            color: currentCertConfig.themeColor,
                          }}
                        >
                          {currentCertConfig.subTitle}
                        </h3>
                      </div>

                      {renderCertificateDetails()}
                    </div>
                  </main>

                  {/* =========================================
                      FOOTER
                  ========================================= */}

                  <footer className="cert-footer">
                    <div className="seal-qr-group">
                      {showQRCode && (
                        <div className="qr-code-box">
                          <QRCode
                            value={qrVerificationUrl}
                            size={64}
                            bgColor="#FFFDF7"
                            fgColor="#1B365D"
                          />

                          <span className="qr-label">QUÉT TRA CỨU</span>
                        </div>
                      )}

                      <div className="seal-placeholder">
                        ẤN DẤU
                        <br />
                        GIÁO XỨ
                      </div>
                    </div>

                    <div className="signature-area">
                      <p className="date-line">
                        {parish}, {formattedIssuedDate}
                      </p>

                      <p className="signer-title">Linh mục Quản xứ</p>

                      <div className="signer-chuky" />

                      <div className="signature-space">
                        {showSignature && churchData.pastor_name && (
                          <span className="sign-handwritten">
                            {churchData.pastor_name}
                          </span>
                        )}
                      </div>
                    </div>
                  </footer>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* =================================================
            MODAL CẤU HÌNH
        ================================================= */}

        <Modal
          open={settingsOpen}
          onCancel={() => setSettingsOpen(false)}
          title={
            <div className="modal-title">
              <SettingOutlined />

              <div>
                <strong>Cấu hình chứng chỉ</strong>

                <span>Nội dung và thông tin hiển thị trên văn bằng</span>
              </div>
            </div>
          }
          footer={null}
          width={720}
          centered
          destroyOnClose={false}
        >
          <div className="settings-modal-content">
            {/* =============================================
                LOẠI CHỨNG CHỈ
            ============================================== */}

            <div className="settings-section">
              <div className="settings-section-head">
                <div
                  className="settings-section-icon"
                  style={{
                    background: currentCertConfig.themeColor,
                  }}
                >
                  {currentCertConfig.icon}
                </div>

                <div>
                  <h3>Loại chứng chỉ</h3>

                  <p>Chọn mẫu văn bằng muốn cấp</p>
                </div>
              </div>

              <div className="cert-type-grid">
                {Object.values(CERT_TYPES).map((type) => (
                  <button
                    key={type.key}
                    type="button"
                    className={`cert-type-card ${
                      certType === type.key ? "active" : ""
                    }`}
                    onClick={() => setCertType(type.key)}
                    style={
                      certType === type.key
                        ? {
                            borderColor: type.themeColor,
                            background: `${type.themeColor}08`,
                          }
                        : {}
                    }
                  >
                    <span
                      className="cert-type-icon"
                      style={{
                        color: type.themeColor,
                      }}
                    >
                      {type.icon}
                    </span>

                    <span className="cert-type-content">
                      <strong>{type.title}</strong>

                      <small>{type.category}</small>
                    </span>

                    {certType === type.key && (
                      <CheckCircleOutlined
                        className="cert-type-check"
                        style={{
                          color: type.themeColor,
                        }}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* =============================================
                THÔNG TIN HỌC VIÊN
            ============================================== */}

            <div className="settings-section">
              <div className="settings-section-head">
                <div className="settings-section-icon">
                  <UserOutlined />
                </div>

                <div>
                  <h3>Thông tin học viên</h3>

                  <p>Dữ liệu xuất hiện trên chứng chỉ</p>
                </div>
              </div>

              <Form layout="vertical">
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item label="Mã số">
                      <Input
                        size="large"
                        value={certData.certNo}
                        onChange={(e) =>
                          updateCertData("certNo", e.target.value)
                        }
                      />
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item label="Tên Thánh">
                      <Input
                        size="large"
                        value={certData.godName}
                        onChange={(e) =>
                          updateCertData("godName", e.target.value)
                        }
                        placeholder="Ví dụ: Giuse"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item label="Họ và tên">
                  <Input
                    size="large"
                    value={certData.fullName}
                    onChange={(e) => updateCertData("fullName", e.target.value)}
                  />
                </Form.Item>

                <Form.Item label="Ngày sinh">
                  <Row gutter={10}>
                    <Col span={8}>
                      <Input
                        size="large"
                        placeholder="Ngày"
                        value={certData.dobDay}
                        onChange={(e) =>
                          updateCertData("dobDay", e.target.value)
                        }
                      />
                    </Col>

                    <Col span={8}>
                      <Input
                        size="large"
                        placeholder="Tháng"
                        value={certData.dobMonth}
                        onChange={(e) =>
                          updateCertData("dobMonth", e.target.value)
                        }
                      />
                    </Col>

                    <Col span={8}>
                      <Input
                        size="large"
                        placeholder="Năm"
                        value={certData.dobYear}
                        onChange={(e) =>
                          updateCertData("dobYear", e.target.value)
                        }
                      />
                    </Col>
                  </Row>
                </Form.Item>

                {/* FIELD ĐỘNG */}

                {renderCertificateFields()}

                <Form.Item label="Ngày cấp">
                  <DatePicker
                    value={issuedDate}
                    onChange={setIssuedDate}
                    format="DD/MM/YYYY"
                    size="large"
                    style={{
                      width: "100%",
                    }}
                    suffixIcon={<CalendarOutlined />}
                  />
                </Form.Item>

                <div className="modal-date-preview">
                  <CalendarOutlined />

                  <span>
                    {parish || "Giáo xứ"}, {formattedIssuedDate}
                  </span>
                </div>
              </Form>
            </div>

            {/* =============================================
                THÔNG TIN GIÁO XỨ
            ============================================== */}

            <div className="settings-section">
              <div className="settings-section-head">
                <div className="settings-section-icon church-icon">✝</div>

                <div>
                  <h3>Thông tin giáo xứ</h3>

                  <p>Đơn vị cấp chứng chỉ</p>
                </div>
              </div>

              <div className="church-preview-modal">
                <div>
                  <span>Giáo xứ</span>

                  <strong>{churchData.name || "—"}</strong>
                </div>

                <div>
                  <span>Giáo phận</span>

                  <strong>{diocese || "—"}</strong>
                </div>

                <div>
                  <span>Linh mục quản xứ</span>

                  <strong>{churchData.pastor_name || "—"}</strong>
                </div>
              </div>
            </div>

            {/* =============================================
                FOOTER
            ============================================== */}

            <div className="modal-actions">
              <Button icon={<ReloadOutlined />} onClick={resetCertificate}>
                Khôi phục mẫu
              </Button>

              <Button
                type="primary"
                size="large"
                icon={<EyeOutlined />}
                onClick={() => setSettingsOpen(false)}
              >
                Cập nhật xem trước
              </Button>
            </div>
          </div>
        </Modal>
        {/* =================================================
    MODAL HƯỚNG DẪN SỬ DỤNG
================================================= */}

        <Modal
          open={guideOpen}
          onCancel={() => setGuideOpen(false)}
          footer={null}
          width={760}
          centered
          destroyOnClose={false}
          title={
            <div className="modal-title">
              <QuestionCircleOutlined />

              <div>
                <strong>Hướng dẫn sử dụng</strong>

                <span>Cấp chứng chỉ và văn bằng trên FaithEdu</span>
              </div>
            </div>
          }
        >
          <div className="guide-modal-content">
            {/* INTRO */}
            <div className="guide-intro">
              <div className="guide-intro-icon">
                <SafetyCertificateOutlined />
              </div>

              <div>
                <h3>Cấp chứng chỉ giáo lý</h3>

                <p>
                  FaithEdu hỗ trợ tạo chứng chỉ cho từng học viên hoặc cấp hàng
                  loạt cho cả lớp từ file Excel.
                </p>
              </div>
            </div>

            {/* STEPS */}
            <div className="guide-steps">
              {/* STEP 1 */}
              <div className="guide-step">
                <div className="guide-step-number">1</div>

                <div className="guide-step-icon">
                  <SettingOutlined />
                </div>

                <div className="guide-step-content">
                  <h4>Chọn loại chứng chỉ</h4>

                  <p>
                    Nhấn <strong>Cấu hình</strong> và chọn loại chứng chỉ phù
                    hợp với chương trình:
                  </p>

                  <div className="guide-tags">
                    <Tag>Giáo lý</Tag>
                    <Tag>Năm học</Tag>
                    <Tag>Kỳ thi</Tag>
                    <Tag>Bí tích</Tag>
                    <Tag>Hôn nhân</Tag>
                    <Tag>Dự tòng</Tag>
                    <Tag>Thành tích</Tag>
                  </div>
                </div>
              </div>

              {/* STEP 2 */}
              <div className="guide-step">
                <div className="guide-step-number">2</div>

                <div className="guide-step-icon">
                  <UserOutlined />
                </div>

                <div className="guide-step-content">
                  <h4>Nhập thông tin học viên</h4>

                  <p>
                    Điền mã số, Tên Thánh, họ tên, ngày sinh và các thông tin
                    tương ứng với loại chứng chỉ.
                  </p>

                  <div className="guide-note">
                    <CheckCircleOutlined />

                    <span>
                      Thông tin được cập nhật ngay trên bản xem trước.
                    </span>
                  </div>
                </div>
              </div>

              {/* STEP 3 */}
              <div className="guide-step">
                <div className="guide-step-number">3</div>

                <div className="guide-step-icon">
                  <FileExcelOutlined />
                </div>

                <div className="guide-step-content">
                  <h4>Cấp hàng loạt bằng Excel</h4>

                  <p>
                    Nếu cần cấp cho nhiều học viên, hãy tải
                    <strong> Excel mẫu</strong>, nhập dữ liệu rồi chọn{" "}
                    <strong>Nhập Excel</strong>.
                  </p>

                  <div className="guide-note warning">
                    <FileExcelOutlined />

                    <span>
                      Mỗi dòng trong Excel tương ứng với một học viên.
                    </span>
                  </div>
                </div>
              </div>

              {/* STEP 4 */}
              <div className="guide-step">
                <div className="guide-step-number">4</div>

                <div className="guide-step-icon">
                  <EyeOutlined />
                </div>

                <div className="guide-step-content">
                  <h4>Kiểm tra bản xem trước</h4>

                  <p>
                    Kiểm tra tên học viên, giáo xứ, giáo phận, ngày cấp và nội
                    dung chứng chỉ trước khi xuất.
                  </p>

                  <div className="guide-note">
                    <EyeOutlined />

                    <span>
                      Có thể chọn <strong>Toàn màn hình</strong> để kiểm tra bố
                      cục A4.
                    </span>
                  </div>
                </div>
              </div>

              {/* STEP 5 */}
              <div className="guide-step">
                <div className="guide-step-number">5</div>

                <div className="guide-step-icon">
                  <DownloadOutlined />
                </div>

                <div className="guide-step-content">
                  <h4>Xuất chứng chỉ</h4>

                  <p>
                    Với một học viên, chọn <strong>Xuất PDF</strong>. Với danh
                    sách nhiều học viên, chọn
                    <strong> Xuất ZIP cả lớp</strong>.
                  </p>

                  <div className="guide-export-options">
                    <div>
                      <DownloadOutlined />
                      <span>PDF từng chứng chỉ</span>
                    </div>

                    <div>
                      <FileZipOutlined />
                      <span>ZIP toàn bộ lớp</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* STEP 6 */}
              <div className="guide-step">
                <div className="guide-step-number">6</div>

                <div className="guide-step-icon">
                  <SafetyCertificateOutlined />
                </div>

                <div className="guide-step-content">
                  <h4>Tra cứu bằng mã QR</h4>

                  <p>
                    Mỗi chứng chỉ có mã QR. Khi quét mã, người nhận có thể truy
                    cập trang xác thực để kiểm tra thông tin chứng chỉ.
                  </p>

                  <div className="guide-note success">
                    <SafetyCertificateOutlined />

                    <span>QR được tạo tự động theo mã chứng chỉ.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* QUICK TIPS */}
            <div className="guide-tips">
              <div className="guide-tips-title">
                <CheckCircleOutlined />

                <strong>Lưu ý khi cấp chứng chỉ</strong>
              </div>

              <ul>
                <li>Kiểm tra chính xác họ tên và ngày sinh trước khi xuất.</li>

                <li>Đảm bảo mã số chứng chỉ không bị trùng.</li>

                <li>
                  Với cấp hàng loạt, nên kiểm tra một học viên trước khi xuất
                  toàn bộ ZIP.
                </li>

                <li>
                  Thông tin giáo xứ và linh mục quản xứ được lấy tự động từ hệ
                  thống FaithEdu.
                </li>
              </ul>
            </div>

            {/* FOOTER */}
            <div className="guide-footer">
              <div>
                <strong>FAITHEDU · GIÁO LÝ SỐ</strong>

                <span>Số hóa giáo lý - Kết nối đức tin</span>
              </div>

              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={() => setGuideOpen(false)}
              >
                Đã hiểu
              </Button>
            </div>
          </div>
        </Modal>

        {/* =================================================
            BATCH MODAL
        ================================================= */}

        <Modal
          title={
            <div className="modal-title">
              <TeamOutlined />

              <div>
                <strong>Danh sách học viên</strong>

                <span>Chọn học viên hoặc xuất chứng chỉ cả lớp</span>
              </div>
            </div>
          }
          open={batchModalOpen}
          onCancel={() => setBatchModalOpen(false)}
          width={950}
          footer={
            <div className="batch-footer">
              <div>
                <Tag color="blue">{studentsList.length} học viên</Tag>

                {batchExporting && <span>Đang tạo PDF...</span>}
              </div>

              <Button
                type="primary"
                icon={<FileZipOutlined />}
                loading={batchExporting}
                onClick={handleExportBatchZIP}
              >
                Xuất ZIP cả lớp
              </Button>
            </div>
          }
        >
          {batchExporting && (
            <div className="batch-progress">
              <Progress percent={exportProgress} status="active" />

              <span>Đang render từng chứng chỉ, vui lòng chờ...</span>
            </div>
          )}

          {studentsList.length > 0 ? (
            <Table
              dataSource={studentsList}
              columns={studentColumns}
              rowKey={(record, index) => record.code || `student-${index}`}
              pagination={{
                pageSize: 8,
              }}
              scroll={{
                x: 750,
              }}
            />
          ) : (
            <Empty description="Chưa có học viên" />
          )}
        </Modal>

        {/* =================================================
            CSS
        ================================================= */}

        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,600;0,700;1,600&display=swap');

          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            background: #f4f6f8;
          }

          /* =================================================
             PAGE
          ================================================= */

          .certificate-page {
            min-height: 100vh;
            padding: 24px;

            background:
              linear-gradient(
                135deg,
                #f7f9fb 0%,
                #eef2f6 100%
              );

            font-family:
              "Be Vietnam Pro",
              sans-serif;

            color: #1e293b;
          }

          /* =================================================
             HEADER
          ================================================= */

          .top-header {
            max-width: 1500px;
            margin: 0 auto 18px;

            display: flex;
            justify-content: space-between;
            align-items: center;

            gap: 20px;
          }

          .page-heading {
            min-width: 0;
          }

          .page-eyebrow {
            font-size: 10px;
            font-weight: 800;
            letter-spacing: 2px;

            color: #d4af37;

            margin-bottom: 4px;
          }

          .top-header h1 {
            margin: 0;

            color: #1b365d;

            font-size: 25px;
            font-weight: 800;
          }

          .top-header p {
            margin: 5px 0 0;

            color: #64748b;

            font-size: 12px;
          }

          .header-actions {
            display: flex;
            align-items: center;

            gap: 7px;

            flex-wrap: wrap;
            justify-content: flex-end;
          }

          .header-actions .ant-btn {
            height: 38px;

            border-radius: 9px;

            font-size: 12px;
          }

          /* =================================================
             PREVIEW
          ================================================= */

          .preview-area {
            width: 100%;
            max-width: 1500px;

            margin: 0 auto;
          }

          .preview-toolbar {
            background: #fff;

            border:
              1px solid #e5e7eb;

            border-radius:
              13px 13px 0 0;

            padding:
              11px 16px;

            display: flex;

            justify-content:
              space-between;

            align-items: center;

            gap: 15px;
          }

          .preview-toolbar-info {
            display: flex;
            align-items: center;

            gap: 10px;
          }

          .preview-toolbar-icon {
            width: 36px;
            height: 36px;

            border-radius: 9px;

            color: #fff;

            display: flex;
            align-items: center;
            justify-content: center;

            font-size: 16px;
          }

          .preview-toolbar span {
            display: block;

            color: #94a3b8;

            font-size: 8px;

            letter-spacing: 1.5px;

            font-weight: 800;
          }

          .preview-toolbar strong {
            display: block;

            margin-top: 2px;

            color: #1b365d;

            font-size: 11px;
          }

          .preview-toolbar-right {
            display: flex;
            align-items: center;

            gap: 7px;

            flex-wrap: wrap;
            justify-content: flex-end;
          }

          .certificate-stage {
            background:
              radial-gradient(
                circle at center,
                #dce2e8,
                #c7ced6
              );

            min-height: 760px;

            padding: 35px;

            display: flex;

            justify-content: center;
            align-items: center;

            overflow: auto;

            border-radius:
              0 0 13px 13px;
          }

          /* =================================================
             FULLSCREEN
          ================================================= */

          .fullscreen-mode {
            position: fixed;

            inset: 0;

            z-index: 3000;

            padding: 14px;

            overflow: auto;

            background: #cbd2da;
          }

          .fullscreen-mode .top-header {
            display: none;
          }

          .fullscreen-mode .preview-area {
            max-width: none;

            height:
              calc(100vh - 28px);
          }

          .fullscreen-mode .certificate-stage {
            height:
              calc(100vh - 85px);

            min-height: 0;
          }

          /* =================================================
             CERTIFICATE
          ================================================= */

          .certificate-container {
            width: 297mm;
            height: 210mm;

            flex-shrink: 0;

            padding: 12mm;

            position: relative;

            overflow: hidden;

            background: #fffdf7;

            box-shadow:
              0 25px 60px
              rgba(
                0,
                0,
                0,
                .28
              );

            border-radius: 3px;
          }

          .watermark-cross {
            position: absolute;

            top: 50%;
            left: 50%;

            transform:
              translate(
                -50%,
                -50%
              );

            font-size: 260px;

            opacity: .035;

            pointer-events: none;

            z-index: 0;
          }

          .outer-border {
            width: 100%;
            height: 100%;

            padding: 4px;

            border:
              3px solid #d4af37;

            position: relative;

            z-index: 1;
          }

          .inner-border {
            width: 100%;
            height: 100%;

            position: relative;

            border:
              1px solid #1b365d;
          }

          .corner-decoration {
            position: absolute;

            width: 36px;
            height: 36px;

            border:
              2px solid #d4af37;

            z-index: 3;
          }

          .top-left {
            top: 6px;
            left: 6px;

            border-right: none;
            border-bottom: none;
          }

          .top-right {
            top: 6px;
            right: 6px;

            border-left: none;
            border-bottom: none;
          }

          .bottom-left {
            bottom: 6px;
            left: 6px;

            border-right: none;
            border-top: none;
          }

          .bottom-right {
            bottom: 6px;
            right: 6px;

            border-left: none;
            border-top: none;
          }

          /* =================================================
             CERT HEADER
          ================================================= */

          .cert-header {
            position: absolute;

            top: 24px;

            left: 45px;
            right: 45px;

            display: flex;

            justify-content:
              space-between;

            align-items: center;

            z-index: 5;
          }

          .diocese-title {
            margin: 0;

            font-family:
              "Be Vietnam Pro",
              sans-serif;

            font-size: 13px;

            font-weight: 600;

            color: #1b365d;
          }

          .parish-title {
            margin: 3px 0 0;

            font-family:
              "Playfair Display",
              serif;

            font-size: 17px;

            font-weight: 700;

            letter-spacing: .2px;
          }

          .cert-logo-badge {
            width: 45px;
            height: 45px;

            border-radius: 50%;

            border:
              1px solid #d4af37;

            display: flex;

            align-items: center;
            justify-content: center;

            font-size: 21px;

            background:
              rgba(
                255,
                255,
                255,
                .8
              );
          }

          .cert-no-badge {
            text-align: right;
          }

          .cert-no-badge span {
            display: block;

            font-size: 8px;

            color: #94a3b8;

            letter-spacing: 1px;

            font-weight: 700;
          }

          .cert-no-badge strong {
            display: block;

            margin-top: 2px;

            font-family:
              "Be Vietnam Pro",
              sans-serif;

            font-size: 11px;

            color: #64748b;

            letter-spacing: .5px;
          }

          /* =================================================
             BODY
          ================================================= */

          .cert-body {
            position: absolute;

            top: 102px;

            left: 0;
            right: 0;

            text-align: center;

            padding:
              0 50px;

            z-index: 5;
          }

          .certificate-type-label {
            margin-bottom: 7px;

            font-family:
              "Be Vietnam Pro",
              sans-serif;

            font-size: 9px;

            font-weight: 800;

            letter-spacing: 3px;

            text-transform:
              uppercase;

            opacity: .75;
          }

          .main-title {
            margin: 0;

            font-family:
              "Playfair Display",
              serif;

            font-size: 42px;

            line-height: 1.15;

            font-weight: 700;

            letter-spacing: .2px;
          }

          .sub-title {
            margin:
              18px 0 17px;

            font-family:
              "Be Vietnam Pro",
              sans-serif;

            font-size: 11px;

            letter-spacing: 2.8px;

            color: #1b365d;

            font-weight: 800;
          }

          .recipient-info {
            display: flex;

            flex-direction: column;

            gap: 15px;

            font-family:
              "Playfair Display",
              serif;

            color: #1e293b;
          }

          .intro-text {
            margin:
              0 0 6px;

            font-size: 14px;
          }

          .student-name {
            display: inline-block;

            align-self: center;

            font-family:
              "Playfair Display",
              serif;

            font-size: 27px;

            font-weight: 700;

            border-bottom:
              1.5px solid #d4af37;

            padding:
              0 20px 4px;

            text-transform:
              uppercase;

            max-width: 90%;
          }

          .details-line {
            margin:
              9px 0 0;

            font-size: 15px;

            line-height: 1.5;
          }

          .details-line.compact {
            margin-top: 5px;
          }

          .spacer {
            display: inline-block;

            width: 35px;
          }

          .val {
            font-weight: 700;

            font-style: italic;

            color: #1b365d;
          }

          .achievement-box {
            max-width: 700px;

            margin:
              11px auto 8px;

            padding:
              9px 20px;

            border-top:
              1px solid #d4af37;

            border-bottom:
              1px solid #d4af37;
          }

          .achievement-title {
            margin: 0;

            font-size: 10px;

            letter-spacing: 1.5px;

            color: #64748b;

            font-family:
              "Be Vietnam Pro",
              sans-serif;

            font-weight: 700;
          }

          .course-name {
            margin:
              6px 0 ;

            font-size: 25px;

            font-family:
              "Playfair Display",
              serif;

            font-weight: 700;
          }

          /* =================================================
             FOOTER
          ================================================= */

          .cert-footer {
            position: absolute;

            bottom: 24px;

            left: 45px;
            right: 45px;

            display: flex;

            justify-content:
              space-between;

            align-items: flex-end;

            z-index: 5;
          }

          .seal-qr-group {
            display: flex;

            align-items: flex-end;

            gap: 16px;
          }

          .qr-code-box {
            display: flex;

            flex-direction: column;

            align-items: center;

            gap: 4px;
          }

          .qr-label {
            font-size: 8px;

            font-family:
              "Be Vietnam Pro",
              sans-serif;

            font-weight: 700;

            color: #64748b;
          }

          .seal-placeholder {
            width: 80px;
            height: 80px;

            border:
              1px dashed #d4af37;

            border-radius: 50%;

            display: flex;

            align-items: center;
            justify-content: center;

            text-align: center;

            color: #64748b;

            font-size: 8px;

            line-height: 1.5;

            font-weight: 700;

            font-family:
              "Be Vietnam Pro",
              sans-serif;
          }

          .signature-area {
            min-width: 260px;

            text-align: center;
          }

          .date-line {
            margin:
              0 0 9px;

            font-style: italic;

            font-family:
              "Playfair Display",
              serif;

            font-size: 13px;

            color: #475569;
          }

          .signer-title {
            margin: 5px 0;

            font-weight: 700;

            font-size: 13px;

            text-transform:
              uppercase;

            color: #1b365d;

            font-family:
              "Be Vietnam Pro",
              sans-serif;
          }

          .signer-chuky {
            padding: 35px 0;
          }

          .signature-space {
            height: 50px;

            display: flex;

            align-items: center;
            justify-content: center;
          }

          .sign-handwritten {
            font-family:
              "Playfair Display",
              serif;

            font-size: 25px;

            font-style: italic;

            color: #1b365d;

            transform:
              rotate(-3deg);
          }

          /* =================================================
             MODAL TITLE
          ================================================= */

          .modal-title {
            display: flex;

            align-items: center;

            gap: 9px;

            color: #1b365d;

            font-weight: 700;
          }

          .modal-title > div {
            display: flex;
            flex-direction: column;
          }

          .modal-title strong {
            font-size: 14px;
          }

          .modal-title span {
            margin-top: 2px;

            color: #94a3b8;

            font-size: 10px;

            font-weight: 400;
          }

          .settings-modal-content {
            padding-top: 4px;
          }

          /* =================================================
             SETTINGS SECTION
          ================================================= */

          .settings-section {
            padding: 16px;

            border:
              1px solid #e5e7eb;

            border-radius: 13px;

            margin-bottom: 14px;

            background: #fff;
          }

          .settings-section-head {
            display: flex;

            align-items: center;

            gap: 11px;

            margin-bottom: 17px;
          }

          .settings-section-icon {
            width: 40px;
            height: 40px;

            flex-shrink: 0;

            border-radius: 10px;

            background: #1b365d;

            color: #fff;

            display: flex;

            align-items: center;
            justify-content: center;

            font-size: 18px;
          }

          .settings-section-icon.church-icon {
            background:
              #d4af37;

            font-size: 18px;
          }

          .settings-section-head h3 {
            margin: 0;

            color: #1b365d;

            font-size: 13px;

            font-weight: 800;
          }

          .settings-section-head p {
            margin: 3px 0 0;

            color: #94a3b8;

            font-size: 10px;
          }

          /* =================================================
             CERTIFICATE TYPE GRID
          ================================================= */

          .cert-type-grid {
            display: grid;

            grid-template-columns:
              repeat(
                2,
                minmax(
                  0,
                  1fr
                )
              );

            gap: 9px;
          }

          .cert-type-card {
            appearance: none;

            width: 100%;

            border:
              1px solid #e2e8f0;

            background: #fff;

            border-radius: 10px;

            padding: 11px;

            display: flex;

            align-items: center;

            gap: 10px;

            text-align: left;

            cursor: pointer;

            transition:
              .18s ease;

            position: relative;
          }

          .cert-type-card:hover {
            border-color:
              #94a3b8;

            transform:
              translateY(-1px);
          }

          .cert-type-card.active {
            box-shadow:
              0 5px 18px
              rgba(
                27,
                54,
                93,
                .08
              );
          }

          .cert-type-icon {
            width: 34px;
            height: 34px;

            flex-shrink: 0;

            border-radius: 8px;

            background: #f8fafc;

            display: flex;

            align-items: center;
            justify-content: center;

            font-size: 16px;
          }

          .cert-type-content {
            min-width: 0;
          }

          .cert-type-content strong {
            display: block;

            color: #1e293b;

            font-size: 11px;

            line-height: 1.35;
          }

          .cert-type-content small {
            display: block;

            margin-top: 2px;

            color: #94a3b8;

            font-size: 9px;
          }

          .cert-type-check {
            margin-left: auto;
          }

          /* =================================================
             DATE PREVIEW
          ================================================= */

          .modal-date-preview {
            display: flex;

            justify-content:
              center;

            align-items: center;

            gap: 8px;

            margin-top: -4px;

            padding: 11px;

            border:
              1px solid #e2e8f0;

            background:
              #f8fafc;

            border-radius: 9px;

            color: #1b365d;

            font-family:
              "Playfair Display",
              serif;

            font-size: 12px;
          }

          /* =================================================
             CHURCH
          ================================================= */

          .church-preview-modal {
            display: grid;

            grid-template-columns:
              repeat(
                3,
                1fr
              );

            gap: 10px;
          }

          .church-preview-modal > div {
            padding: 11px;

            border:
              1px solid #e2e8f0;

            background:
              #f8fafc;

            border-radius: 9px;
          }

          .church-preview-modal span {
            display: block;

            font-size: 9px;

            color: #94a3b8;
          }

          .church-preview-modal strong {
            display: block;

            margin-top: 3px;

            color: #1e293b;

            font-size: 11px;

            line-height: 1.4;
          }

          /* =================================================
             MODAL ACTIONS
          ================================================= */

          .modal-actions {
            display: flex;

            justify-content:
              space-between;

            gap: 10px;

            margin-top: 18px;

            padding-top: 15px;

            border-top:
              1px solid #f1f5f9;
          }

          /* =================================================
             BATCH
          ================================================= */

          .batch-progress {
            margin-bottom: 18px;

            background:
              #f8fafc;

            padding: 14px;

            border-radius: 10px;
          }

          .batch-progress span {
            display: block;

            text-align: center;

            font-size: 11px;

            color: #64748b;
          }

          .batch-footer {
            display: flex;

            justify-content:
              space-between;

            align-items: center;
          }

          .batch-footer > div {
            display: flex;

            align-items: center;

            gap: 10px;
          }

          /* =================================================
             RESPONSIVE
          ================================================= */

          @media (max-width: 1000px) {
            .certificate-page {
              padding: 14px;
            }

            .top-header {
              flex-direction:
                column;

              align-items:
                flex-start;
            }

            .header-actions {
              width: 100%;

              justify-content:
                flex-start;
            }

            .preview-toolbar {
              align-items:
                flex-start;

              flex-direction:
                column;
            }

            .preview-toolbar-right {
              width: 100%;

              justify-content:
                flex-start;
            }
          }

          @media (max-width: 700px) {
            .certificate-page {
              padding: 10px;
            }

            .top-header h1 {
              font-size: 20px;
            }

            .header-actions .ant-btn {
              height: 36px;
            }

            .certificate-stage {
              padding: 15px;
            }

            .cert-type-grid {
              grid-template-columns:
                1fr;
            }

            .church-preview-modal {
              grid-template-columns:
                1fr;
            }

            .modal-actions {
              flex-direction:
                column;
            }

            .modal-actions .ant-btn {
              width: 100%;
            }
          }

          /* =================================================
             PRINT
          ================================================= */

          @media print {
            @page {
              size:
                A4 landscape;

              margin: 0;
            }

            html,
            body {
              margin: 0 !important;

              padding: 0 !important;

              background:
                #fffdf7 !important;
            }

            .certificate-page {
              padding: 0 !important;

              background:
                transparent !important;
            }

            .top-header,
            .preview-toolbar {
              display:
                none !important;
            }

            .preview-area {
              display:
                block !important;

              max-width:
                none !important;
            }

            .certificate-stage {
              padding: 0 !important;

              min-height:
                0 !important;

              background:
                transparent !important;

              display:
                block !important;
            }

            .certificate-container {
              width:
                297mm !important;

              height:
                210mm !important;

              margin: 0 !important;

              box-shadow:
                none !important;

              border-radius:
                0 !important;
            }
          }
            /* =================================================
   GUIDE MODAL
================================================= */

.guide-modal-content {
  padding-top: 4px;
}

/* =================================================
   GUIDE INTRO
================================================= */

.guide-intro {
  display: flex;
  align-items: center;
  gap: 14px;

  padding: 15px 17px;

  margin-bottom: 18px;

  border-radius: 12px;

  background:
    linear-gradient(
      135deg,
      #f8fafc 0%,
      #fffdf7 100%
    );

  border:
    1px solid #e5e7eb;
}

.guide-intro-icon {
  width: 48px;
  height: 48px;

  flex-shrink: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 12px;

  background: #1b365d;

  color: #d4af37;

  font-size: 23px;
}

.guide-intro h3 {
  margin: 0;

  color: #1b365d;

  font-size: 15px;
  font-weight: 800;
}

.guide-intro p {
  margin: 4px 0 0;

  color: #64748b;

  font-size: 11px;

  line-height: 1.6;
}

/* =================================================
   GUIDE STEPS
================================================= */

.guide-steps {
  position: relative;

  display: flex;
  flex-direction: column;

  gap: 10px;
}

.guide-steps::before {
  content: "";

  position: absolute;

  left: 17px;
  top: 24px;
  bottom: 24px;

  width: 1px;

  background: #e2e8f0;
}

.guide-step {
  position: relative;

  display: grid;

  grid-template-columns:
    35px
    38px
    minmax(0, 1fr);

  align-items: start;

  gap: 9px;

  padding: 11px 12px 11px 0;

  border:
    1px solid #e5e7eb;

  border-radius: 11px;

  background: #fff;

  transition:
    .18s ease;
}

.guide-step:hover {
  border-color: #cbd5e1;

  box-shadow:
    0 5px 18px
    rgba(
      27,
      54,
      93,
      .06
    );
}

.guide-step-number {
  width: 34px;
  height: 34px;

  margin-left: 0;

  border-radius: 50%;

  background: #1b365d;

  color: #fff;

  display: flex;
  align-items: center;
  justify-content: center;

  font-size: 11px;
  font-weight: 800;

  position: relative;

  z-index: 2;
}

.guide-step-icon {
  width: 36px;
  height: 36px;

  border-radius: 9px;

  background: #f8fafc;

  color: #1b365d;

  display: flex;
  align-items: center;
  justify-content: center;

  font-size: 16px;
}

.guide-step-content {
  min-width: 0;
}

.guide-step-content h4 {
  margin: 1px 0 4px;

  color: #1e293b;

  font-size: 12px;

  font-weight: 800;
}

.guide-step-content p {
  margin: 0;

  color: #64748b;

  font-size: 10px;

  line-height: 1.65;
}

.guide-step-content strong {
  color: #1b365d;
}

/* =================================================
   GUIDE TAGS
================================================= */

.guide-tags {
  display: flex;

  flex-wrap: wrap;

  gap: 5px;

  margin-top: 7px;
}

.guide-tags .ant-tag {
  margin: 0;

  border-radius: 6px;

  font-size: 9px;
}

/* =================================================
   GUIDE NOTE
================================================= */

.guide-note {
  display: flex;

  align-items: center;

  gap: 7px;

  margin-top: 7px;

  padding: 7px 9px;

  border-radius: 7px;

  background: #f8fafc;

  color: #64748b;

  font-size: 9px;
}

.guide-note .anticon {
  color: #1b365d;

  font-size: 12px;
}

.guide-note.warning {
  background: #fffbeb;
}

.guide-note.warning .anticon {
  color: #b8860b;
}

.guide-note.success {
  background: #f0fdf4;
}

.guide-note.success .anticon {
  color: #2f5d50;
}

/* =================================================
   EXPORT OPTIONS
================================================= */

.guide-export-options {
  display: flex;

  gap: 8px;

  margin-top: 8px;
}

.guide-export-options > div {
  display: flex;

  align-items: center;

  gap: 6px;

  padding: 7px 10px;

  border:
    1px solid #e2e8f0;

  border-radius: 7px;

  background: #f8fafc;

  color: #64748b;

  font-size: 9px;
}

.guide-export-options .anticon {
  color: #1b365d;

  font-size: 12px;
}

/* =================================================
   GUIDE TIPS
================================================= */

.guide-tips {
  margin-top: 16px;

  padding: 13px 15px;

  border:
    1px solid #eadfb8;

  border-radius: 11px;

  background:
    linear-gradient(
      135deg,
      #fffdf5,
      #fffaf0
    );
}

.guide-tips-title {
  display: flex;

  align-items: center;

  gap: 7px;

  color: #8a6a12;

  font-size: 11px;
}

.guide-tips-title .anticon {
  color: #d4af37;
}

.guide-tips ul {
  margin: 8px 0 0;

  padding-left: 19px;

  color: #64748b;

  font-size: 9px;

  line-height: 1.8;
}

.guide-tips li::marker {
  color: #d4af37;
}

/* =================================================
   GUIDE FOOTER
================================================= */

.guide-footer {
  display: flex;

  justify-content:
    space-between;

  align-items: center;

  gap: 12px;

  margin-top: 17px;

  padding-top: 14px;

  border-top:
    1px solid #f1f5f9;
}

.guide-footer > div {
  display: flex;

  flex-direction: column;
}

.guide-footer strong {
  color: #1b365d;

  font-size: 10px;

  letter-spacing: 1px;
}

.guide-footer span {
  margin-top: 3px;

  color: #94a3b8;

  font-size: 9px;
}

.guide-footer .ant-btn {
  height: 38px;

  border-radius: 9px;

  padding:
    0 18px;
}

/* =================================================
   GUIDE RESPONSIVE
================================================= */

@media (max-width: 700px) {
  .guide-step {
    grid-template-columns:
      32px
      34px
      minmax(0, 1fr);

    gap: 7px;
  }

  .guide-step-number {
    width: 31px;
    height: 31px;
  }

  .guide-step-icon {
    width: 32px;
    height: 32px;
  }

  .guide-export-options {
    flex-direction: column;
  }

  .guide-footer {
    align-items: stretch;

    flex-direction: column;
  }

  .guide-footer .ant-btn {
    width: 100%;
  }
}
        `}</style>
      </div>
    </ConfigProvider>
  );
};

export default CertificatePage;
