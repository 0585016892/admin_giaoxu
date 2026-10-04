import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  getChurchSettings,
  updateChurchSettings,
} from "../api/settingChurchApi";

const ChurchSettingsContext = createContext(null);

export function ChurchSettingsProvider({ children }) {
  const [settings, setSettings] = useState(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [loaded, setLoaded] = useState(false);

  // ============================================================
  // LOAD SETTINGS
  // Chỉ gọi API 1 lần trong vòng đời Provider
  // ============================================================

  const loadSettings = useCallback(
    async (force = false) => {
      // Đã load rồi thì không gọi lại
      if (loaded && !force) {
        console.log("[ChurchSettings] Đã có settings → không gọi API");
        return settings;
      }

      try {
        console.log("");
        console.log(
          "============================================================",
        );
        console.log("             LOAD CHURCH SETTINGS");
        console.log(
          "============================================================",
        );

        setLoading(true);

        const response = await getChurchSettings();

        console.log("[ChurchSettings] RESPONSE:", response);

        if (!response?.success) {
          throw new Error(
            response?.message || "Không thể lấy cấu hình giáo xứ",
          );
        }

        const data = response.data || {};

        console.log("[ChurchSettings] DATA:", data);

        setSettings(data);
        setLoaded(true);

        return data;
      } catch (error) {
        console.error("[ChurchSettings] LOAD ERROR:", error);

        throw error;
      } finally {
        setLoading(false);
      }
    },
    [loaded, settings],
  );

  // ============================================================
  // UPDATE SETTINGS
  // ============================================================

  const saveSettings = useCallback(async (data) => {
    try {
      console.log("");
      console.log(
        "============================================================",
      );
      console.log("            UPDATE CHURCH SETTINGS");
      console.log(
        "============================================================",
      );

      console.log("[ChurchSettings] PAYLOAD:", data);

      setSaving(true);

      const response = await updateChurchSettings(data);

      console.log("[ChurchSettings] UPDATE RESPONSE:", response);

      if (!response?.success) {
        throw new Error(
          response?.message || "Không thể cập nhật cấu hình giáo xứ",
        );
      }

      const newSettings = response.data || {};

      setSettings(newSettings);
      setLoaded(true);

      console.log("[ChurchSettings] SETTINGS UPDATED:", newSettings);

      return newSettings;
    } catch (error) {
      console.error("[ChurchSettings] UPDATE ERROR:", error);

      throw error;
    } finally {
      setSaving(false);
    }
  }, []);

  // ============================================================
  // REFRESH
  // Chủ động gọi lại API
  // ============================================================

  const refreshSettings = useCallback(async () => {
    return loadSettings(true);
  }, [loadSettings]);

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    if (!loaded) {
      loadSettings().catch((error) => {
        console.error("[ChurchSettings] INITIAL LOAD ERROR:", error);
      });
    }
  }, [loaded, loadSettings]);

  // ============================================================
  // CONTEXT
  // ============================================================

  const value = {
    settings,

    loading,
    saving,
    loaded,

    loadSettings,
    refreshSettings,
    saveSettings,

    // tiện sử dụng
    setSettings,
  };

  return (
    <ChurchSettingsContext.Provider value={value}>
      {children}
    </ChurchSettingsContext.Provider>
  );
}

// ============================================================
// HOOK
// ============================================================

export function useChurchSettings() {
  const context = useContext(ChurchSettingsContext);

  if (!context) {
    throw new Error(
      "useChurchSettings phải được sử dụng bên trong ChurchSettingsProvider",
    );
  }

  return context;
}

export default ChurchSettingsContext;
