import React from "react";
import { TeamOutlined } from "@ant-design/icons";

const ChildrenEmpty = () => {
  return (
    <div className="children-empty">
      <div className="children-empty-icon">
        <TeamOutlined />
      </div>

      <div className="children-empty-title">Chưa có thông tin con</div>

      <div className="children-empty-description">
        Hiện chưa có học sinh nào được liên kết với tài khoản phụ huynh này.
      </div>
    </div>
  );
};

export default ChildrenEmpty;
