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
        return settings;
      }

      try {
        setLoading(true);

        const response = await getChurchSettings();

        if (!response?.success) {
          throw new Error(
            response?.message || "Không thể lấy cấu hình giáo xứ",
          );
        }

        const data = response.data || {};

        setSettings(data);
        setLoaded(true);

        return data;
      } catch (error) {
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
      setSaving(true);

      const response = await updateChurchSettings(data);

      if (!response?.success) {
        throw new Error(
          response?.message || "Không thể cập nhật cấu hình giáo xứ",
        );
      }

      const newSettings = response.data || {};

      setSettings(newSettings);
      setLoaded(true);

      return newSettings;
    } catch (error) {
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
