import React, { useMemo, useState } from "react";
import { TeamOutlined, ReloadOutlined } from "@ant-design/icons";
import { Button, Empty, InputNumber, Tag } from "antd";

const shuffle = (array) => {
  const result = [...array];

  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));

    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
};

const GroupGeneratorTool = ({ students = [] }) => {
  const [groupCount, setGroupCount] = useState(4);
  const [groups, setGroups] = useState([]);

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

  const handleGenerate = () => {
    if (!normalizedStudents.length) return;

    const count = Math.min(
      Math.max(Number(groupCount) || 1, 1),
      normalizedStudents.length,
    );

    const newGroups = Array.from({ length: count }, (_, index) => ({
      id: index + 1,
      members: [],
    }));

    const shuffled = shuffle(normalizedStudents);

    shuffled.forEach((student, index) => {
      newGroups[index % count].members.push(student);
    });

    setGroups(newGroups);
  };

  return (
    <div className="tool-panel group-tool">
      {normalizedStudents.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Chưa có danh sách học viên"
        />
      ) : (
        <>
          <div className="group-settings">
            <div>
              <div className="tool-section-label">Số nhóm</div>

              <div className="group-count-input">
                <InputNumber
                  min={1}
                  max={normalizedStudents.length}
                  value={groupCount}
                  onChange={(value) => setGroupCount(value ?? 1)}
                />

                <span>nhóm</span>
              </div>
            </div>

            <Button
              type="primary"
              icon={<TeamOutlined />}
              onClick={handleGenerate}
            >
              Chia nhóm
            </Button>
          </div>

          {groups.length > 0 && (
            <>
              <div className="group-result">
                {groups.map((group) => (
                  <div key={group.id} className="generated-group">
                    <div className="generated-group-header">
                      <div className="generated-group-title">
                        Nhóm {group.id}
                      </div>

                      <Tag>{group.members.length} người</Tag>
                    </div>

                    <div className="generated-group-members">
                      {group.members.map((student) => (
                        <div
                          key={student.id}
                          className="generated-group-member"
                        >
                          <span>{student.name}</span>

                          {student.code && <small>{student.code}</small>}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <Button block icon={<ReloadOutlined />} onClick={handleGenerate}>
                Chia lại
              </Button>
            </>
          )}

          <div className="tool-meta">
            {normalizedStudents.length} học viên sẽ được chia ngẫu nhiên và cố
            gắng cân bằng số lượng giữa các nhóm.
          </div>
        </>
      )}
    </div>
  );
};

export default GroupGeneratorTool;
