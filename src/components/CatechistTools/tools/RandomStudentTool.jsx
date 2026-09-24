import React, { useMemo, useState } from "react";
import { AimOutlined, ReloadOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Empty, Tag } from "antd";

const RandomStudentTool = ({ students = [] }) => {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [rolling, setRolling] = useState(false);

  const normalizedStudents = useMemo(() => {
    return students
      .map((student, index) => ({
        id: student.id ?? index,
        name:
          student.name ||
          student.full_name ||
          student.student_name ||
          `Học viên ${index + 1}`,
        code: student.code || student.student_code || "",
      }))
      .filter((student) => student.name);
  }, [students]);

  const handleRandom = () => {
    if (!normalizedStudents.length) {
      return;
    }

    setRolling(true);

    let count = 0;

    const interval = setInterval(() => {
      const random =
        normalizedStudents[
          Math.floor(Math.random() * normalizedStudents.length)
        ];

      setSelectedStudent(random);

      count += 1;

      if (count >= 12) {
        clearInterval(interval);

        const finalStudent =
          normalizedStudents[
            Math.floor(Math.random() * normalizedStudents.length)
          ];

        setSelectedStudent(finalStudent);
        setRolling(false);
      }
    }, 100);
  };

  return (
    <div className="tool-panel random-student-tool">
      <div className="random-student-info">
        <div className="tool-info-icon">
          <UserOutlined />
        </div>

        <div>
          <div className="tool-info-title">Chọn học viên ngẫu nhiên</div>

          <div className="tool-info-description">
            Hệ thống sẽ chọn một học viên từ danh sách hiện tại.
          </div>
        </div>
      </div>

      {normalizedStudents.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Chưa có danh sách học viên"
        />
      ) : (
        <>
          <div
            className={`random-student-result ${rolling ? "is-rolling" : ""}`}
          >
            {selectedStudent ? (
              <>
                <div className="random-student-avatar">
                  <UserOutlined />
                </div>

                <div className="random-student-name">
                  {selectedStudent.name}
                </div>

                {selectedStudent.code && <Tag>{selectedStudent.code}</Tag>}
              </>
            ) : (
              <>
                <AimOutlined className="random-student-placeholder-icon" />

                <div className="random-student-placeholder">
                  Ai sẽ được chọn?
                </div>
              </>
            )}
          </div>

          <div className="tool-actions tool-actions-center">
            <Button
              type="primary"
              size="large"
              icon={<AimOutlined />}
              loading={rolling}
              onClick={handleRandom}
            >
              {rolling ? "Đang chọn..." : "Chọn học viên"}
            </Button>

            {selectedStudent && !rolling && (
              <Button
                size="large"
                icon={<ReloadOutlined />}
                onClick={handleRandom}
              >
                Chọn lại
              </Button>
            )}
          </div>

          <div className="tool-meta">
            Có <strong>{normalizedStudents.length}</strong> học viên trong danh
            sách.
          </div>
        </>
      )}
    </div>
  );
};

export default RandomStudentTool;
