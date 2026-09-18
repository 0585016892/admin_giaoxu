import React from "react";
import { Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";

const AppSearchInput = ({
  value,
  onChange,
  placeholder = "Tìm kiếm...",
  allowClear = true,
  size = "large",
  className = "",
  ...props
}) => {
  return (
    <>
      <style>
        {`
          .app-search-input {
            width: 100%;
            height: 42px;
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            background: #fff;
            color: #1e293b;
            font-size: 14px;
            transition:
              border-color 0.2s ease,
              box-shadow 0.2s ease;
          }

          .app-search-input:hover {
            border-color: #173b5e;
          }

          .app-search-input.ant-input-affix-wrapper-focused {
            border-color: #173b5e;
            box-shadow: 0 0 0 2px rgba(23, 59, 94, 0.08);
          }

          .app-search-input input {
            color: #1e293b;
            font-size: 14px;
          }

          .app-search-input input::placeholder {
            color: #94a3b8;
          }

          .app-search-input-icon {
            color: #173b5e;
            font-size: 16px;
          }

          .app-search-input .ant-input-clear-icon {
            color: #94a3b8;
          }

          .app-search-input .ant-input-clear-icon:hover {
            color: #173b5e;
          }

          .app-search-input.ant-input-affix-wrapper-disabled {
            background: #f8fafc;
            cursor: not-allowed;
          }

          @media (max-width: 768px) {
            .app-search-input {
              height: 40px;
            }
          }
        `}
      </style>

      <Input
        className={`app-search-input ${className}`}
        prefix={<SearchOutlined className="app-search-input-icon" />}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        allowClear={allowClear}
        size={size}
        {...props}
      />
    </>
  );
};

export default AppSearchInput;
