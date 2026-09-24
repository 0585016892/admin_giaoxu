import React, { useEffect, useMemo, useState } from "react";
import {
  AppstoreOutlined,
  ClockCircleOutlined,
  CloseOutlined,
  AimOutlined,
  TeamOutlined,
  NumberOutlined,
  GiftOutlined,
  DollarOutlined,
  BookOutlined,
} from "@ant-design/icons";
import { Drawer, Empty, Select, Tag } from "antd";

import CatechistToolCard from "./CatechistToolCard";

import TimerTool from "./tools/TimerTool";
import RandomStudentTool from "./tools/RandomStudentTool";
import GroupGeneratorTool from "./tools/GroupGeneratorTool";
import NumberPickerTool from "./tools/NumberPickerTool";
import DiceTool from "./tools/DiceTool";
import CoinTool from "./tools/CoinTool";

import "./catechistTools.css";

const TOOLS = [
  {
    key: "timer",
    title: "Bộ đếm giờ",
    description: "Đếm ngược thời gian cho hoạt động hoặc trò chơi.",
    icon: <ClockCircleOutlined />,
    component: TimerTool,
  },
  {
    key: "random-student",
    title: "Chọn học viên",
    description: "Chọn ngẫu nhiên một học viên trong lớp.",
    icon: <AimOutlined />,
    component: RandomStudentTool,
    requireClass: true,
  },
  {
    key: "group",
    title: "Chia nhóm",
    description: "Tự động chia học viên trong lớp thành các nhóm.",
    icon: <TeamOutlined />,
    component: GroupGeneratorTool,
    requireClass: true,
  },
  {
    key: "number",
    title: "Bốc số",
    description: "Bốc một số ngẫu nhiên trong khoảng bạn chọn.",
    icon: <NumberOutlined />,
    component: NumberPickerTool,
  },
  {
    key: "dice",
    title: "Xúc xắc",
    description: "Tung xúc xắc nhanh cho các hoạt động trên lớp.",
    icon: <GiftOutlined />,
    component: DiceTool,
  },
  {
    key: "coin",
    title: "Tung đồng xu",
    description: "Ngửa hoặc sấp — phù hợp để quyết định nhanh.",
    icon: <DollarOutlined />,
    component: CoinTool,
  },
];

const CatechistToolsDrawer = ({ open, onClose, students = [] }) => {
  const [activeTool, setActiveTool] = useState(null);

  /**
   * classId đang được chọn
   *
   * null = chưa chọn lớp
   */
  const [selectedClassId, setSelectedClassId] = useState(null);

  /**
   * =========================================================
   * LẤY DANH SÁCH LỚP TỪ STUDENTS
   * =========================================================
   *
   * Data student của bạn:
   *
   * {
   *   class_id: 53,
   *   class_code: "GLHN207",
   *   class_name: "a"
   * }
   */
  const classes = useMemo(() => {
    const map = new Map();

    students.forEach((student) => {
      if (!student?.class_id) return;

      const classId = String(student.class_id);

      if (!map.has(classId)) {
        map.set(classId, {
          id: student.class_id,
          name: student.class_name || "Chưa đặt tên",
          code: student.class_code || "",
          studentCount: 0,
        });
      }

      map.get(classId).studentCount += 1;
    });

    return Array.from(map.values()).sort((a, b) =>
      String(a.name).localeCompare(String(b.name), "vi"),
    );
  }, [students]);

  /**
   * =========================================================
   * HỌC VIÊN CỦA LỚP ĐANG CHỌN
   * =========================================================
   */
  const filteredStudents = useMemo(() => {
    if (!selectedClassId) {
      return [];
    }

    return students.filter(
      (student) => String(student?.class_id) === String(selectedClassId),
    );
  }, [students, selectedClassId]);

  /**
   * =========================================================
   * CLASS ĐANG CHỌN
   * =========================================================
   */
  const selectedClass = useMemo(() => {
    return (
      classes.find((item) => String(item.id) === String(selectedClassId)) ||
      null
    );
  }, [classes, selectedClassId]);

  /**
   * =========================================================
   * TOOL ĐANG CHỌN
   * =========================================================
   */
  const selectedTool = useMemo(
    () => TOOLS.find((item) => item.key === activeTool),
    [activeTool],
  );

  const ToolComponent = selectedTool?.component;

  /**
   * =========================================================
   * KHI STUDENTS THAY ĐỔI
   * =========================================================
   *
   * Nếu lớp hiện tại không còn tồn tại
   * thì reset.
   */
  useEffect(() => {
    if (!selectedClassId) return;

    const exists = classes.some(
      (item) => String(item.id) === String(selectedClassId),
    );

    if (!exists) {
      setSelectedClassId(null);
    }
  }, [classes, selectedClassId]);

  /**
   * =========================================================
   * MỞ TOOL
   * =========================================================
   */
  const handleOpenTool = (tool) => {
    /**
     * Tool cần lớp nhưng chưa chọn lớp
     *
     * Vẫn cho mở tool để user thấy
     * nhưng bên trong tool sẽ yêu cầu chọn lớp.
     */
    setActiveTool(tool.key);
  };

  /**
   * =========================================================
   * QUAY LẠI
   * =========================================================
   */
  const handleBack = () => {
    setActiveTool(null);
  };

  /**
   * =========================================================
   * ĐÓNG DRAWER
   * =========================================================
   */
  const handleClose = () => {
    setActiveTool(null);
    onClose?.();
  };

  /**
   * =========================================================
   * CHỌN LỚP
   * =========================================================
   */
  const handleClassChange = (value) => {
    setSelectedClassId(value);
  };

  /**
   * =========================================================
   * RESET KHI MỞ DRAWER
   *
   * Không reset lớp mỗi lần render.
   * Chỉ khi drawer mở lần đầu sau khi đóng.
   * =========================================================
   */
  useEffect(() => {
    if (!open) {
      setActiveTool(null);
    }
  }, [open]);

  return (
    <Drawer
      className="catechist-tools-drawer"
      placement="right"
      width={460}
      open={open}
      onClose={handleClose}
      destroyOnClose
      closeIcon={<CloseOutlined />}
      title={
        <div className="catechist-tools-header">
          <div className="catechist-tools-header-icon">
            <AppstoreOutlined />
          </div>

          <div className="catechist-tools-header-content">
            <div className="catechist-tools-header-title">Kho công cụ GLV</div>

            <div className="catechist-tools-header-subtitle">
              Công cụ hỗ trợ giờ giáo lý
            </div>
          </div>
        </div>
      }
    >
      <div className="catechist-tools-content">
        {/* =====================================================
            CHỌN LỚP
        ===================================================== */}
        <div className="catechist-tools-class-selector">
          <div className="catechist-tools-class-selector-label">
            <BookOutlined />

            <span>Lớp đang thao tác</span>
          </div>

          <Select
            className="catechist-tools-class-select"
            placeholder="Chọn lớp học"
            value={selectedClassId}
            onChange={handleClassChange}
            allowClear
            showSearch
            optionFilterProp="label"
            options={classes.map((item) => ({
              value: item.id,
              label: `${item.name}${item.code ? ` · ${item.code}` : ""}`,
            }))}
            notFoundContent={
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Chưa có lớp"
              />
            }
          />

          {selectedClass && (
            <div className="catechist-tools-selected-class">
              <div className="catechist-tools-selected-class-info">
                <span className="catechist-tools-selected-class-name">
                  {selectedClass.name}
                </span>

                {selectedClass.code && (
                  <Tag color="gold">{selectedClass.code}</Tag>
                )}
              </div>

              <span className="catechist-tools-selected-class-count">
                {filteredStudents.length} học viên
              </span>
            </div>
          )}
        </div>

        {!selectedTool ? (
          <>
            {/* =================================================
                INTRO
            ================================================= */}
            <div className="catechist-tools-intro">
              <div className="catechist-tools-intro-title">
                Trợ thủ của Giáo lý viên
              </div>

              <div className="catechist-tools-intro-text">
                Sử dụng nhanh các công cụ trong giờ học, sinh hoạt và trò chơi.
              </div>
            </div>

            {/* =================================================
                TOOL GRID
            ================================================= */}
            <div className="catechist-tools-grid">
              {TOOLS.map((tool) => (
                <CatechistToolCard
                  key={tool.key}
                  tool={tool}
                  onClick={() => handleOpenTool(tool)}
                />
              ))}
            </div>

            {!TOOLS.length && <Empty description="Chưa có công cụ" />}
          </>
        ) : (
          /* ===================================================
             TOOL DETAIL
          =================================================== */
          <div className="catechist-tool-detail">
            <button
              type="button"
              className="catechist-tool-back"
              onClick={handleBack}
            >
              ← Quay lại kho công cụ
            </button>

            <div className="catechist-tool-detail-heading">
              <div className="catechist-tool-detail-icon">
                {selectedTool.icon}
              </div>

              <div>
                <div className="catechist-tool-detail-title">
                  {selectedTool.title}
                </div>

                <div className="catechist-tool-detail-description">
                  {selectedTool.description}
                </div>
              </div>
            </div>

            <div className="catechist-tool-detail-body">
              {selectedTool.requireClass && !selectedClassId ? (
                <div className="catechist-tool-require-class">
                  <div className="catechist-tool-require-class-icon">
                    <BookOutlined />
                  </div>

                  <div className="catechist-tool-require-class-title">
                    Chưa chọn lớp
                  </div>

                  <div className="catechist-tool-require-class-text">
                    Vui lòng chọn lớp ở phía trên để sử dụng công cụ này.
                  </div>
                </div>
              ) : selectedTool.requireClass && filteredStudents.length === 0 ? (
                <div className="catechist-tool-require-class">
                  <div className="catechist-tool-require-class-icon">
                    <TeamOutlined />
                  </div>

                  <div className="catechist-tool-require-class-title">
                    Lớp chưa có học viên
                  </div>

                  <div className="catechist-tool-require-class-text">
                    Lớp <strong>{selectedClass?.name}</strong> hiện chưa có học
                    viên để thao tác.
                  </div>
                </div>
              ) : ToolComponent ? (
                <ToolComponent
                  students={
                    selectedTool.requireClass ? filteredStudents : students
                  }
                  selectedClass={selectedClass}
                />
              ) : null}
            </div>
          </div>
        )}
      </div>
    </Drawer>
  );
};

export default CatechistToolsDrawer;
