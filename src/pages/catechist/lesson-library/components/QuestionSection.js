import React from "react";
import { Spin } from "antd";
import {
  BookOutlined,
  CheckCircleOutlined,
  RightOutlined,
} from "@ant-design/icons";

import AppButton from "../../../../components/common/AppButton";
import "./QuestionSection.css";

const QuestionSection = ({ questions = [], loading = false, onPlay }) => {
  return (
    <section className="ll-question-section">
      <div className="ll-question-heading">
        <BookOutlined />
        <span>Câu hỏi kiến thức</span>

        {!loading && (
          <span className="ll-question-count">{questions.length} câu hỏi</span>
        )}
      </div>

      <div className="ll-question-content">
        {loading ? (
          <div className="ll-question-message">
            <Spin size="small" />
            <span>Đang tải câu hỏi...</span>
          </div>
        ) : questions.length === 0 ? (
          <div className="ll-question-message empty">
            Chưa có câu hỏi kiến thức cho bài học này.
          </div>
        ) : (
          <>
            <div className="ll-question-message ready">
              <CheckCircleOutlined />
              <span>Đã có bộ câu hỏi để ôn tập.</span>
            </div>

            <AppButton
              size="small"
              variant="secondary"
              icon={<BookOutlined />}
              onClick={onPlay}
            >
              Làm câu hỏi
              <RightOutlined />
            </AppButton>
          </>
        )}
      </div>
    </section>
  );
};

export default QuestionSection;
