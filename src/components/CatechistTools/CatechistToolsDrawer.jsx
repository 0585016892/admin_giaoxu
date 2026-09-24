import React, { useMemo, useState } from "react";
import {
  AppstoreOutlined,
  ClockCircleOutlined,
  CloseOutlined,
  AimOutlined,
  TeamOutlined,
  NumberOutlined,
  GiftOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import { Drawer, Empty } from "antd";

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
    description: "Chọn ngẫu nhiên một học viên trong danh sách.",
    icon: <AimOutlined />,
    component: RandomStudentTool,
  },
  {
    key: "group",
    title: "Chia nhóm",
    description: "Tự động chia danh sách học viên thành các nhóm.",
    icon: <TeamOutlined />,
    component: GroupGeneratorTool,
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

  const selectedTool = useMemo(
    () => TOOLS.find((item) => item.key === activeTool),
    [activeTool],
  );

  const handleOpenTool = (tool) => {
    setActiveTool(tool.key);
  };

  const handleBack = () => {
    setActiveTool(null);
  };

  const handleClose = () => {
    setActiveTool(null);
    onClose?.();
  };

  const ToolComponent = selectedTool?.component;

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
      {!selectedTool ? (
        <div className="catechist-tools-content">
          <div className="catechist-tools-intro">
            <div className="catechist-tools-intro-title">
              Trợ thủ của Giáo lý viên
            </div>

            <div className="catechist-tools-intro-text">
              Sử dụng nhanh các công cụ trong giờ học, sinh hoạt và trò chơi.
            </div>
          </div>

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
        </div>
      ) : (
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
            {ToolComponent ? <ToolComponent students={students} /> : null}
          </div>
        </div>
      )}
    </Drawer>
  );
};

export default CatechistToolsDrawer;
