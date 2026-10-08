// import React, { useMemo, useState } from "react";

// import {
//   Alert,
//   Button,
//   Card,
//   Col,
//   Empty,
//   Modal,
//   Progress,
//   Row,
//   Select,
//   Space,
//   Statistic,
//   Steps,
//   Table,
//   Tag,
//   Typography,
//   message,
// } from "antd";

// import {
//   CheckCircleOutlined,
//   ExclamationCircleOutlined,
//   ReloadOutlined,
//   RightOutlined,
//   SafetyCertificateOutlined,
//   TeamOutlined,
// } from "@ant-design/icons";

// import academicYearApi from "../../../api/academicYearApi";

// const { Title, Text, Paragraph } = Typography;

// // ============================================================
// // CONSTANTS
// // ============================================================

// const CURRENT_YEAR = new Date().getFullYear();

// // ============================================================
// // HELPERS
// // ============================================================

// const buildAcademicYear = (year) => `${year}-${year + 1}`;

// const getYearNumber = (academicYear) => {
//   if (!academicYear) {
//     return null;
//   }

//   const match = String(academicYear).match(/^(\d{4})-(\d{4})$/);

//   if (!match) {
//     return null;
//   }

//   return Number(match[1]);
// };

// const getNextAcademicYear = (academicYear) => {
//   const year = getYearNumber(academicYear);

//   if (!year) {
//     return null;
//   }

//   return buildAcademicYear(year + 1);
// };

// // ============================================================
// // COMPONENT
// // ============================================================

// const AcademicYearPage = () => {
//   const [messageApi, contextHolder] = message.useMessage();

//   // ==========================================================
//   // STEP
//   // ==========================================================

//   const [currentStep, setCurrentStep] = useState(0);

//   // ==========================================================
//   // YEAR
//   // ==========================================================

//   const [fromAcademicYear, setFromAcademicYear] = useState(
//     buildAcademicYear(CURRENT_YEAR - 1),
//   );

//   const [toAcademicYear, setToAcademicYear] = useState(
//     buildAcademicYear(CURRENT_YEAR),
//   );

//   // ==========================================================
//   // LOADING
//   // ==========================================================

//   const [previewCreateLoading, setPreviewCreateLoading] = useState(false);

//   const [createLoading, setCreateLoading] = useState(false);

//   const [previewPromotionLoading, setPreviewPromotionLoading] = useState(false);

//   const [confirmLoading, setConfirmLoading] = useState(false);

//   // ==========================================================
//   // DATA
//   // ==========================================================

//   const [createPreview, setCreatePreview] = useState(null);

//   const [promotionPreview, setPromotionPreview] = useState(null);

//   // ==========================================================
//   // YEAR OPTIONS
//   // ==========================================================

//   const academicYearOptions = useMemo(() => {
//     const years = [];

//     for (let year = CURRENT_YEAR - 5; year <= CURRENT_YEAR + 3; year++) {
//       years.push({
//         label: buildAcademicYear(year),

//         value: buildAcademicYear(year),
//       });
//     }

//     return years.reverse();
//   }, []);

//   // ==========================================================
//   // RESET
//   // ==========================================================

//   //   const resetPage = () => {
//   //     setCurrentStep(0);

//   //     setCreatePreview(null);

//   //     setPromotionPreview(null);

//   //     setPreviewCreateLoading(false);

//   //     setCreateLoading(false);

//   //     setPreviewPromotionLoading(false);

//   //     setConfirmLoading(false);
//   //   };

//   // ==========================================================
//   // VALIDATE YEAR
//   // ==========================================================

//   const validateYears = () => {
//     const fromYear = getYearNumber(fromAcademicYear);

//     const toYear = getYearNumber(toAcademicYear);

//     if (!fromYear || !toYear) {
//       messageApi.error("Năm học không hợp lệ.");

//       return false;
//     }

//     if (toYear !== fromYear + 1) {
//       messageApi.error(
//         `Chỉ được chuyển từ ${fromAcademicYear} sang ${buildAcademicYear(
//           fromYear + 1,
//         )}.`,
//       );

//       return false;
//     }

//     return true;
//   };

//   // ==========================================================
//   // PREVIEW CREATE
//   // ==========================================================

//   const handlePreviewCreate = async () => {
//     if (!validateYears()) {
//       return;
//     }

//     setPreviewCreateLoading(true);

//     try {
//       const result = await academicYearApi.previewCreate({
//         fromAcademicYear,
//         toAcademicYear,
//       });

//       setCreatePreview(result);

//       if (!result.can_create) {
//         messageApi.warning("Chưa thể khởi tạo năm học.");

//         return;
//       }

//       messageApi.success("Kiểm tra năm học thành công.");
//     } catch (error) {
//       console.error("PREVIEW CREATE ERROR:", error);

//       messageApi.error(
//         error?.response?.data?.message || "Không thể kiểm tra năm học.",
//       );
//     } finally {
//       setPreviewCreateLoading(false);
//     }
//   };

//   // ==========================================================
//   // CREATE YEAR
//   // ==========================================================

//   const handleCreateAcademicYear = () => {
//     if (!createPreview?.can_create) {
//       return;
//     }

//     Modal.confirm({
//       title: `Khởi tạo năm học ${toAcademicYear}?`,

//       icon: <SafetyCertificateOutlined />,

//       content: (
//         <div>
//           <Paragraph>
//             Hệ thống sẽ tạo cơ cấu lớp mới dựa trên năm học{" "}
//             <b>{fromAcademicYear}</b>.
//           </Paragraph>

//           <Alert
//             type="info"
//             showIcon
//             message="Chưa chuyển học sinh"
//             description="Sau bước này, bạn sẽ sang bước phân lớp học sinh."
//           />
//         </div>
//       ),

//       okText: "Khởi tạo",

//       cancelText: "Hủy",

//       centered: true,

//       onOk: handleCreateAcademicYearConfirm,
//     });
//   };

//   const handleCreateAcademicYearConfirm = async () => {
//     setCreateLoading(true);

//     try {
//       const result = await academicYearApi.create({
//         fromAcademicYear,
//         toAcademicYear,
//       });

//       messageApi.success(result.message || "Đã khởi tạo năm học.");

//       setCurrentStep(1);

//       await handlePreviewPromotion();
//     } catch (error) {
//       console.error("CREATE ACADEMIC YEAR ERROR:", error);

//       messageApi.error(
//         error?.response?.data?.message || "Không thể khởi tạo năm học.",
//       );
//     } finally {
//       setCreateLoading(false);
//     }
//   };

//   // ==========================================================
//   // PREVIEW PROMOTION
//   // ==========================================================

//   const handlePreviewPromotion = async () => {
//     if (!validateYears()) {
//       return;
//     }

//     setPreviewPromotionLoading(true);

//     try {
//       const result = await academicYearApi.previewPromotion({
//         fromAcademicYear,
//         toAcademicYear,
//       });

//       setPromotionPreview(result);
//     } catch (error) {
//       console.error("PREVIEW PROMOTION ERROR:", error);

//       messageApi.error(
//         error?.response?.data?.message || "Không thể tạo dữ liệu phân lớp.",
//       );
//     } finally {
//       setPreviewPromotionLoading(false);
//     }
//   };

//   // ==========================================================
//   // CHANGE DESTINATION CLASS
//   // ==========================================================

//   const handleChangeStudentClass = (studentId, destinationClassId) => {
//     setPromotionPreview((previous) => {
//       if (!previous) {
//         return previous;
//       }

//       const nextStudents = previous.students.map((student) => {
//         if (Number(student.student_id) !== Number(studentId)) {
//           return student;
//         }

//         const destination = previous.classes
//           .flatMap((item) => (item.destination ? [item.destination] : []))
//           .find((item) => Number(item.id) === Number(destinationClassId));

//         return {
//           ...student,

//           destination_class_id: destination?.id || null,

//           destination_class_name: destination?.name || null,

//           destination_class_code: destination?.code || null,

//           destination_level_order: destination?.level_order ?? null,

//           action: destination ? "promote" : "unassigned",

//           reason: destination ? "MANUAL" : "NO_TARGET_CLASS",
//         };
//       });

//       const promoteCount = nextStudents.filter(
//         (item) => item.action !== "unassigned",
//       ).length;

//       const unassignedCount = nextStudents.filter(
//         (item) => item.action === "unassigned",
//       ).length;

//       return {
//         ...previous,

//         students: nextStudents,

//         summary: {
//           ...previous.summary,

//           promote_count: promoteCount,

//           unassigned_count: unassignedCount,
//         },
//       };
//     });
//   };

//   // ==========================================================
//   // UNASSIGN
//   // ==========================================================

//   const handleUnassignStudent = (studentId) => {
//     setPromotionPreview((previous) => {
//       if (!previous) {
//         return previous;
//       }

//       const nextStudents = previous.students.map((student) => {
//         if (Number(student.student_id) !== Number(studentId)) {
//           return student;
//         }

//         return {
//           ...student,

//           destination_class_id: null,

//           destination_class_name: null,

//           destination_class_code: null,

//           action: "unassigned",

//           reason: "MANUAL",
//         };
//       });

//       return {
//         ...previous,

//         students: nextStudents,

//         summary: {
//           ...previous.summary,

//           promote_count: nextStudents.filter(
//             (item) => item.action !== "unassigned",
//           ).length,

//           unassigned_count: nextStudents.filter(
//             (item) => item.action === "unassigned",
//           ).length,
//         },
//       };
//     });
//   };

//   // ==========================================================
//   // CONFIRM
//   // ==========================================================

//   const handleConfirm = () => {
//     if (!promotionPreview) {
//       return;
//     }

//     const students = promotionPreview.students || [];

//     const unassigned = students.filter((item) => item.action === "unassigned");

//     if (unassigned.length > 0) {
//       Modal.confirm({
//         title: "Vẫn còn học sinh chưa phân lớp",

//         icon: <ExclamationCircleOutlined />,

//         content: `Hiện có ${unassigned.length} học sinh chưa được phân lớp. Bạn có chắc muốn chốt không?`,

//         okText: "Vẫn chốt",

//         cancelText: "Quay lại",

//         okButtonProps: {
//           danger: true,
//         },

//         onOk: handleConfirmPromotion,
//       });

//       return;
//     }

//     Modal.confirm({
//       title: `Chốt phân lớp ${toAcademicYear}?`,

//       icon: <SafetyCertificateOutlined />,

//       content: `Sau khi chốt, học sinh sẽ được tạo lớp học mới trong năm ${toAcademicYear} và lớp cũ sẽ được đóng lịch sử.`,

//       okText: "Chốt phân lớp",

//       cancelText: "Hủy",

//       centered: true,

//       onOk: handleConfirmPromotion,
//     });
//   };

//   const handleConfirmPromotion = async () => {
//     if (!promotionPreview) {
//       return;
//     }

//     setConfirmLoading(true);

//     try {
//       const students = promotionPreview.students.map((student) => ({
//         student_id: student.student_id,

//         from_class_id: student.source_class_id,

//         to_class_id: student.destination_class_id,

//         action: student.action,
//       }));

//       const result = await academicYearApi.confirmPromotion({
//         fromAcademicYear,
//         toAcademicYear,
//         students,
//       });

//       messageApi.success(result.message || "Đã chốt phân lớp.");

//       setCurrentStep(2);

//       await handlePreviewPromotion();
//     } catch (error) {
//       console.error("CONFIRM PROMOTION ERROR:", error);

//       messageApi.error(
//         error?.response?.data?.message || "Không thể chốt phân lớp.",
//       );
//     } finally {
//       setConfirmLoading(false);
//     }
//   };

//   // ==========================================================
//   // CLASS OPTIONS
//   // ==========================================================

//   const targetClassOptions = useMemo(() => {
//     if (!promotionPreview) {
//       return [];
//     }

//     const map = new Map();

//     (promotionPreview.classes || []).forEach((item) => {
//       if (item.destination) {
//         map.set(item.destination.id, item.destination);
//       }
//     });

//     return Array.from(map.values()).map((item) => ({
//       value: item.id,

//       label: item.name,

//       code: item.code,

//       level: item.level_order,
//     }));
//   }, [promotionPreview]);

//   // ==========================================================
//   // TABLE
//   // ==========================================================

//   const studentColumns = useMemo(
//     () => [
//       {
//         title: "HỌC SINH",

//         key: "student",

//         width: 250,

//         render: (_, record) => (
//           <div>
//             <div
//               style={{
//                 fontWeight: 600,
//               }}
//             >
//               {record.saint_name ? `${record.saint_name} ` : ""}
//               {record.name}
//             </div>

//             <Text
//               type="secondary"
//               style={{
//                 fontSize: 12,
//               }}
//             >
//               {record.code || "Chưa có mã"}
//             </Text>
//           </div>
//         ),
//       },

//       {
//         title: "LỚP CŨ",

//         key: "source",

//         width: 180,

//         render: (_, record) => (
//           <div>
//             <Text strong>{record.source_class_name}</Text>

//             <br />

//             <Text
//               type="secondary"
//               style={{
//                 fontSize: 12,
//               }}
//             >
//               {record.source_class_code || ""}
//             </Text>
//           </div>
//         ),
//       },

//       {
//         title: "LỚP MỚI",

//         key: "destination",

//         width: 270,

//         render: (_, record) => (
//           <Select
//             style={{
//               width: "100%",
//             }}
//             value={record.destination_class_id || undefined}
//             placeholder="Chọn lớp mới"
//             options={targetClassOptions.map((item) => ({
//               value: item.value,

//               label: (
//                 <div>
//                   <b>{item.label}</b>

//                   {item.code && (
//                     <span
//                       style={{
//                         marginLeft: 8,
//                         color: "#8c8c8c",
//                       }}
//                     >
//                       {item.code}
//                     </span>
//                   )}
//                 </div>
//               ),
//             }))}
//             onChange={(value) =>
//               handleChangeStudentClass(record.student_id, value)
//             }
//           />
//         ),
//       },

//       {
//         title: "TRẠNG THÁI",

//         key: "action",

//         width: 150,

//         render: (_, record) => {
//           if (record.action === "unassigned") {
//             return <Tag color="orange">Chưa phân lớp</Tag>;
//           }

//           if (record.reason === "MANUAL") {
//             return <Tag color="blue">Đã chỉnh</Tag>;
//           }

//           return <Tag color="green">Tự động phân lớp</Tag>;
//         },
//       },

//       {
//         title: "",

//         key: "action_button",

//         width: 110,

//         render: (_, record) => {
//           if (record.action !== "unassigned") {
//             return (
//               <Button
//                 type="link"
//                 size="small"
//                 onClick={() => handleUnassignStudent(record.student_id)}
//               >
//                 Bỏ lớp
//               </Button>
//             );
//           }

//           return null;
//         },
//       },
//     ],
//     [targetClassOptions, promotionPreview],
//   );

//   // ==========================================================
//   // RENDER
//   // ==========================================================

//   return (
//     <div
//       className="academic-year-page"
//       style={{
//         padding: 24,
//         maxWidth: 1500,
//         margin: "0 auto",
//       }}
//     >
//       {contextHolder}

//       {/* ====================================================== */}
//       {/* HEADER */}
//       {/* ====================================================== */}

//       <div
//         style={{
//           marginBottom: 24,
//         }}
//       >
//         <Title
//           level={2}
//           style={{
//             marginBottom: 4,
//           }}
//         >
//           Quản lý năm học
//         </Title>

//         <Text type="secondary">
//           Khởi tạo năm học mới và tự động phân lớp học sinh.
//         </Text>
//       </div>

//       {/* ====================================================== */}
//       {/* STEPS */}
//       {/* ====================================================== */}

//       <Card
//         style={{
//           marginBottom: 24,
//           borderRadius: 16,
//         }}
//       >
//         <Steps
//           current={currentStep}
//           items={[
//             {
//               title: "Khởi tạo năm học",

//               description: "Tạo cơ cấu lớp",
//             },

//             {
//               title: "Phân lớp",

//               description: "Kiểm tra học sinh",
//             },

//             {
//               title: "Hoàn tất",

//               description: "Chốt dữ liệu",
//             },
//           ]}
//         />
//       </Card>

//       {/* ====================================================== */}
//       {/* YEAR SELECT */}
//       {/* ====================================================== */}

//       <Card
//         style={{
//           marginBottom: 24,
//           borderRadius: 16,
//         }}
//       >
//         <Row gutter={[16, 16]} align="bottom">
//           <Col xs={24} md={9}>
//             <Text strong>Năm học hiện tại</Text>

//             <Select
//               style={{
//                 width: "100%",
//                 marginTop: 8,
//               }}
//               value={fromAcademicYear}
//               options={academicYearOptions}
//               onChange={(value) => {
//                 setFromAcademicYear(value);

//                 const next = getNextAcademicYear(value);

//                 if (next) {
//                   setToAcademicYear(next);
//                 }

//                 setCreatePreview(null);

//                 setPromotionPreview(null);
//               }}
//             />
//           </Col>

//           <Col xs={24} md={9}>
//             <Text strong>Năm học mới</Text>

//             <Select
//               style={{
//                 width: "100%",
//                 marginTop: 8,
//               }}
//               value={toAcademicYear}
//               options={academicYearOptions}
//               onChange={(value) => {
//                 setToAcademicYear(value);

//                 setCreatePreview(null);

//                 setPromotionPreview(null);
//               }}
//             />
//           </Col>

//           <Col xs={24} md={6}>
//             <Button
//               block
//               icon={<ReloadOutlined />}
//               loading={previewCreateLoading}
//               onClick={handlePreviewCreate}
//             >
//               Kiểm tra
//             </Button>
//           </Col>
//         </Row>
//       </Card>

//       {/* ====================================================== */}
//       {/* STEP 1 */}
//       {/* ====================================================== */}

//       {currentStep === 0 && (
//         <>
//           {!createPreview && (
//             <Card
//               style={{
//                 borderRadius: 16,
//               }}
//             >
//               <Empty
//                 description={
//                   <>
//                     <Text strong>Chưa kiểm tra năm học</Text>

//                     <br />

//                     <Text type="secondary">
//                       Chọn năm học hiện tại và năm học mới rồi bấm "Kiểm tra".
//                     </Text>
//                   </>
//                 }
//               />
//             </Card>
//           )}

//           {createPreview && (
//             <>
//               {/* SUMMARY */}

//               <Row
//                 gutter={[16, 16]}
//                 style={{
//                   marginBottom: 24,
//                 }}
//               >
//                 <Col xs={24} sm={12} md={8}>
//                   <Card
//                     style={{
//                       borderRadius: 16,
//                     }}
//                   >
//                     <Statistic
//                       title="Lớp hiện tại"
//                       value={createPreview.source?.class_count || 0}
//                       prefix={<TeamOutlined />}
//                     />
//                   </Card>
//                 </Col>

//                 <Col xs={24} sm={12} md={8}>
//                   <Card
//                     style={{
//                       borderRadius: 16,
//                     }}
//                   >
//                     <Statistic
//                       title="Học sinh"
//                       value={createPreview.source?.student_count || 0}
//                     />
//                   </Card>
//                 </Col>

//                 <Col xs={24} sm={12} md={8}>
//                   <Card
//                     style={{
//                       borderRadius: 16,
//                     }}
//                   >
//                     <Statistic
//                       title="Lớp năm mới"
//                       value={createPreview.target?.class_count || 0}
//                     />
//                   </Card>
//                 </Col>
//               </Row>

//               {/* WARNINGS */}

//               {createPreview.warnings?.length > 0 && (
//                 <div
//                   style={{
//                     marginBottom: 20,
//                   }}
//                 >
//                   {createPreview.warnings.map((warning, index) => (
//                     <Alert
//                       key={index}
//                       type={
//                         warning.code === "TARGET_YEAR_EXISTS"
//                           ? "error"
//                           : "warning"
//                       }
//                       showIcon
//                       style={{
//                         marginBottom: 8,
//                       }}
//                       message={warning.message}
//                     />
//                   ))}
//                 </div>
//               )}

//               {/* CLASS LIST */}

//               <Card
//                 title={<span>Cơ cấu lớp sẽ được tạo</span>}
//                 style={{
//                   borderRadius: 16,
//                   marginBottom: 20,
//                 }}
//               >
//                 <Table
//                   rowKey="id"
//                   pagination={false}
//                   scroll={{
//                     x: 800,
//                   }}
//                   dataSource={createPreview.source?.classes || []}
//                   columns={[
//                     {
//                       title: "LỚP",

//                       dataIndex: "name",

//                       render: (value) => <Text strong>{value}</Text>,
//                     },

//                     {
//                       title: "MÃ LỚP",

//                       dataIndex: "code",
//                     },

//                     {
//                       title: "CẤP ĐỘ",

//                       dataIndex: "level_order",

//                       render: (value) => value ?? "-",
//                     },

//                     {
//                       title: "HỌC SINH",

//                       dataIndex: "student_count",

//                       render: (value) => <Tag>{value || 0}</Tag>,
//                     },
//                   ]}
//                 />
//               </Card>

//               {/* CREATE BUTTON */}

//               <div
//                 style={{
//                   display: "flex",
//                   justifyContent: "flex-end",
//                 }}
//               >
//                 <Button
//                   type="primary"
//                   size="large"
//                   icon={<RightOutlined />}
//                   disabled={!createPreview.can_create}
//                   loading={createLoading}
//                   onClick={handleCreateAcademicYear}
//                 >
//                   Khởi tạo {toAcademicYear}
//                 </Button>
//               </div>
//             </>
//           )}
//         </>
//       )}

//       {/* ====================================================== */}
//       {/* STEP 2 */}
//       {/* ====================================================== */}

//       {currentStep === 1 && (
//         <>
//           {promotionPreview && (
//             <>
//               {/* HEADER */}

//               <Card
//                 style={{
//                   borderRadius: 16,
//                   marginBottom: 20,
//                 }}
//               >
//                 <Row gutter={[16, 16]} align="middle">
//                   <Col xs={24} md={14}>
//                     <Title
//                       level={4}
//                       style={{
//                         margin: 0,
//                       }}
//                     >
//                       Phân lớp năm học {toAcademicYear}
//                     </Title>

//                     <Text type="secondary">
//                       Kiểm tra và chỉnh lớp trước khi chốt.
//                     </Text>
//                   </Col>

//                   <Col xs={24} md={10}>
//                     <Progress
//                       percent={
//                         promotionPreview.summary?.student_count
//                           ? Math.round(
//                               (promotionPreview.summary.promote_count /
//                                 promotionPreview.summary.student_count) *
//                                 100,
//                             )
//                           : 0
//                       }
//                       format={() =>
//                         `${promotionPreview.summary?.promote_count || 0} / ${
//                           promotionPreview.summary?.student_count || 0
//                         }`
//                       }
//                     />
//                   </Col>
//                 </Row>
//               </Card>

//               {/* STATISTICS */}

//               <Row
//                 gutter={[16, 16]}
//                 style={{
//                   marginBottom: 20,
//                 }}
//               >
//                 <Col xs={12} md={6}>
//                   <Card
//                     style={{
//                       borderRadius: 16,
//                     }}
//                   >
//                     <Statistic
//                       title="Tổng học sinh"
//                       value={promotionPreview.summary?.student_count || 0}
//                       prefix={<TeamOutlined />}
//                     />
//                   </Card>
//                 </Col>

//                 <Col xs={12} md={6}>
//                   <Card
//                     style={{
//                       borderRadius: 16,
//                     }}
//                   >
//                     <Statistic
//                       title="Tự động"
//                       value={promotionPreview.summary?.promote_count || 0}
//                       valueStyle={{
//                         color: "#2e7d5b",
//                       }}
//                     />
//                   </Card>
//                 </Col>

//                 <Col xs={12} md={6}>
//                   <Card
//                     style={{
//                       borderRadius: 16,
//                     }}
//                   >
//                     <Statistic
//                       title="Chưa phân lớp"
//                       value={promotionPreview.summary?.unassigned_count || 0}
//                       valueStyle={{
//                         color: "#b7791f",
//                       }}
//                     />
//                   </Card>
//                 </Col>

//                 <Col xs={12} md={6}>
//                   <Card
//                     style={{
//                       borderRadius: 16,
//                     }}
//                   >
//                     <Statistic
//                       title="Lớp mới"
//                       value={promotionPreview.summary?.target_class_count || 0}
//                     />
//                   </Card>
//                 </Col>
//               </Row>

//               {/* WARNINGS */}

//               {promotionPreview.warnings?.length > 0 && (
//                 <div
//                   style={{
//                     marginBottom: 20,
//                   }}
//                 >
//                   {promotionPreview.warnings.map((warning, index) => (
//                     <Alert
//                       key={index}
//                       type="warning"
//                       showIcon
//                       style={{
//                         marginBottom: 8,
//                       }}
//                       message={warning.message}
//                     />
//                   ))}
//                 </div>
//               )}

//               {/* TABLE */}

//               <Card
//                 style={{
//                   borderRadius: 16,
//                   marginBottom: 20,
//                 }}
//                 bodyStyle={{
//                   padding: 0,
//                 }}
//               >
//                 <Table
//                   rowKey="student_id"
//                   loading={previewPromotionLoading}
//                   columns={studentColumns}
//                   dataSource={promotionPreview.students || []}
//                   pagination={{
//                     pageSize: 20,
//                     showSizeChanger: true,
//                     showTotal: (total) => `${total} học sinh`,
//                   }}
//                   scroll={{
//                     x: 1000,
//                   }}
//                 />
//               </Card>

//               {/* ACTION */}

//               <div
//                 style={{
//                   display: "flex",
//                   justifyContent: "space-between",
//                   gap: 12,
//                   flexWrap: "wrap",
//                 }}
//               >
//                 <Button
//                   icon={<ReloadOutlined />}
//                   loading={previewPromotionLoading}
//                   onClick={handlePreviewPromotion}
//                 >
//                   Tải lại phân lớp
//                 </Button>

//                 <Button
//                   type="primary"
//                   size="large"
//                   icon={<CheckCircleOutlined />}
//                   loading={confirmLoading}
//                   onClick={handleConfirm}
//                 >
//                   Chốt phân lớp
//                 </Button>
//               </div>
//             </>
//           )}
//         </>
//       )}

//       {/* ====================================================== */}
//       {/* STEP 3 */}
//       {/* ====================================================== */}

//       {currentStep === 2 && (
//         <Card
//           style={{
//             borderRadius: 20,
//             textAlign: "center",
//             padding: "40px 20px",
//           }}
//         >
//           <CheckCircleOutlined
//             style={{
//               fontSize: 64,
//               color: "#2E7D5B",
//               marginBottom: 20,
//             }}
//           />

//           <Title level={3}>Đã hoàn tất phân lớp</Title>

//           <Paragraph type="secondary">
//             Năm học <b>{toAcademicYear}</b> đã được cập nhật thành công.
//           </Paragraph>

//           {promotionPreview && (
//             <Row
//               gutter={[16, 16]}
//               justify="center"
//               style={{
//                 marginTop: 24,
//               }}
//             >
//               <Col xs={12} sm={6}>
//                 <Statistic
//                   title="Tổng"
//                   value={promotionPreview.summary?.student_count || 0}
//                 />
//               </Col>

//               <Col xs={12} sm={6}>
//                 <Statistic
//                   title="Đã phân lớp"
//                   value={promotionPreview.summary?.promote_count || 0}
//                 />
//               </Col>

//               <Col xs={12} sm={6}>
//                 <Statistic
//                   title="Chưa xếp"
//                   value={promotionPreview.summary?.unassigned_count || 0}
//                 />
//               </Col>
//             </Row>
//           )}

//           <Space
//             style={{
//               marginTop: 32,
//             }}
//           >
//             <Button
//               type="primary"
//               onClick={() => {
//                 window.location.reload();
//               }}
//             >
//               Hoàn tất
//             </Button>
//           </Space>
//         </Card>
//       )}
//     </div>
//   );
// };

// export default AcademicYearPage;
