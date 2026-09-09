import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import axios from "../api/axios";

const LicenseContext = createContext(null);

const LICENSE_EXPIRED_KEY = "faidedu_license_expired";

export const LicenseProvider = ({ children }) => {
  const [license, setLicense] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expired, setExpired] = useState(false);

  const checkLicense = useCallback(async () => {
    try {
      setLoading(true);

      const res = await axios.get("/license/me");

      const data = res?.data;

      if (!data?.success) {
        return;
      }

      const licenseData = data.license;

      setLicense(licenseData);

      const isExpired =
        licenseData?.status === "expired" || licenseData?.is_expired === true;

      setExpired(isExpired);

      if (isExpired) {
        localStorage.setItem(LICENSE_EXPIRED_KEY, "true");
      } else {
        localStorage.removeItem(LICENSE_EXPIRED_KEY);
      }
    } catch (error) {
      // Nếu API trả 402 thì chắc chắn expired
      if (error?.response?.status === 402) {
        setExpired(true);
        localStorage.setItem(LICENSE_EXPIRED_KEY, "true");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    checkLicense();
  }, [checkLicense]);
  useEffect(() => {
    const handleLicenseExpired = () => {
      setExpired(true);

      localStorage.setItem("faidedu_license_expired", "true");
    };

    window.addEventListener("faidedu-license-expired", handleLicenseExpired);

    return () => {
      window.removeEventListener(
        "faidedu-license-expired",
        handleLicenseExpired,
      );
    };
  }, []);
  const refreshLicense = async () => {
    await checkLicense();
  };

  return (
    <LicenseContext.Provider
      value={{
        license,
        loading,
        expired,
        refreshLicense,
      }}
    >
      {children}
    </LicenseContext.Provider>
  );
};

export const useLicense = () => {
  const context = useContext(LicenseContext);

  if (!context) {
    throw new Error("useLicense phải được dùng bên trong LicenseProvider");
  }

  return context;
};
