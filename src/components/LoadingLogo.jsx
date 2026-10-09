import React from "react";
import "../assets/css/LoadingLogo.css";
import logoImage from "../assets/images/logoXn.png";

export const COLORS = {
  navy: "#173B5E",
  navyHover: "#244F78",
  gold: "#D9A441",
  background: "#F7F9FC",
  white: "#FFFFFF",
  text: "#173B5E",
  textSecondary: "#64748B",
};

const LoadingLogo = ({ progress = 0 }) => {
  return (
    <div className="faith-loading-wrapper" role="status">
      <div className="faith-loading-container">
        {/* Logo và vòng tròn xoay */}
        <div className="faith-loader">
          {/* Vòng ngoài màu navy */}
          <div className="faith-loader-ring faith-ring-outer">
            <span className="faith-ring-dot" />
          </div>

          {/* Vòng giữa màu gold */}
          <div className="faith-loader-ring faith-ring-middle">
            <span className="faith-ring-dot faith-dot-gold" />
          </div>

          {/* Vòng trong nét đứt */}
          <div className="faith-loader-ring faith-ring-inner" />

          {/* Logo chính giữa */}
          <div className="faith-logo-center">
            <img src={logoImage} alt="FaithEdu" className="faith-logo-image" />
          </div>
        </div>

        {/* Tên thương hiệu */}
        <div className="faith-brand-name">
          <span>Faith</span>
          <span className="faith-brand-gold">Edu</span>
        </div>
      </div>
    </div>
  );
};

export default LoadingLogo;
