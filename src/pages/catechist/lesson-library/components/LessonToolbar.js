import React from "react";
import {
  AppstoreOutlined,
  MenuOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { Input, Select, Tooltip } from "antd";
import "./LessonToolbar.css";

const LessonToolbar = ({
  searchText,
  setSearchText,
  sortType,
  setSortType,
  viewMode,
  setViewMode,
}) => {
  return (
    <div className="ll-toolbar">
      <div className="ll-toolbar-search">
        <Input
          allowClear
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
          placeholder="Tìm kiếm bài học..."
          prefix={<SearchOutlined />}
        />
      </div>

      <div className="ll-toolbar-actions">
        <Select
          value={sortType}
          onChange={setSortType}
          options={[
            { value: "name", label: "Tên bài học" },
            { value: "newest", label: "Mới nhất" },
            { value: "oldest", label: "Cũ nhất" },
          ]}
        />

        <div className="ll-view-toggle">
          <Tooltip title="Dạng lưới">
            <button
              type="button"
              className={viewMode === "grid" ? "active" : ""}
              onClick={() => setViewMode("grid")}
              aria-label="Dạng lưới"
            >
              <AppstoreOutlined />
            </button>
          </Tooltip>

          <Tooltip title="Dạng danh sách">
            <button
              type="button"
              className={viewMode === "list" ? "active" : ""}
              onClick={() => setViewMode("list")}
              aria-label="Dạng danh sách"
            >
              <MenuOutlined />
            </button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

export default LessonToolbar;
