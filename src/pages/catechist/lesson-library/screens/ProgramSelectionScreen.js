import React from "react";
import { Empty, Spin } from "antd";
import { BookOpen, RefreshCw, GraduationCap } from "lucide-react";

import AppButton from "../../../../components/common/AppButton";
import ProgramCard from "../components/ProgramCard";

import "./ProgramSelectionScreen.css";

const ProgramSelectionScreen = ({
  programs = [],
  loading = false,
  onRefresh,
  onSelectProgram,
}) => {
  return (
    <section className="ll-program-selection">
      {/* Header */}
      <div className="ll-program-selection-header">
        <div className="ll-program-selection-heading">
          <div className="ll-program-selection-icon">
            <GraduationCap size={21} />
          </div>

          <div>
            <h2>Chương trình giáo lý</h2>
            <p>Lựa chọn chương trình để xem danh sách bài học và tài liệu.</p>
          </div>
        </div>

        <div className="ll-program-selection-tools">
          <span className="ll-program-count">
            <BookOpen size={15} />
            <strong>{programs.length}</strong>
            chương trình
          </span>

          <AppButton
            icon={<RefreshCw size={15} />}
            onClick={onRefresh}
            disabled={loading}
          >
            Làm mới
          </AppButton>
        </div>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="ll-program-loading">
          <Spin tip="Đang tải chương trình giáo lý..." />
        </div>
      ) : programs.length === 0 ? (
        /* Empty */
        <div className="ll-program-empty">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Chưa có chương trình giáo lý đang hoạt động"
          >
            <AppButton icon={<RefreshCw size={15} />} onClick={onRefresh}>
              Tải lại danh sách
            </AppButton>
          </Empty>
        </div>
      ) : (
        /* Program list */
        <div className="ll-program-list-wrapper">
          <div className="ll-program-list">
            {programs.map((program, index) => (
              <ProgramCard
                key={program.id}
                program={program}
                index={index}
                onClick={onSelectProgram}
              />
            ))}
          </div>

          <div className="ll-program-list-footer">
            Hiển thị {programs.length} chương trình giáo lý
          </div>
        </div>
      )}
    </section>
  );
};

export default ProgramSelectionScreen;
