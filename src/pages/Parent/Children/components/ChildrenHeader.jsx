import React from "react";
import { TeamOutlined, UserOutlined } from "@ant-design/icons";

const ChildrenHeader = ({ count = 0 }) => {
  return (
    <div className="children-header">
      <div className="children-header-left">
        <div className="children-header-icon">
          <TeamOutlined />
        </div>

        <div className="children-header-content">
          <div className="children-header-eyebrow">GIA ĐÌNH</div>

          <h1 className="children-header-title">Con của tôi</h1>

          <p className="children-header-description">
            Theo dõi thông tin học tập và sinh hoạt giáo lý của các con.
          </p>
        </div>
      </div>

      <div className="children-header-count">
        <div className="children-header-count-icon">
          <UserOutlined />
        </div>

        <div>
          <div className="children-header-count-number">{count}</div>

          <div className="children-header-count-label">
            {count === 1 ? "Người con" : "Người con"}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChildrenHeader;
