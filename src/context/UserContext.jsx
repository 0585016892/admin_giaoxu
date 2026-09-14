import { createContext, useContext, useEffect, useState } from "react";

const UserContext = createContext(null);

// ============================================================
// DECODE JWT
// ============================================================
const decodeJWT = (token) => {
  try {
    if (!token || typeof token !== "string") {
      return null;
    }

    const parts = token.split(".");

    if (parts.length !== 3) {
      return null;
    }

    let base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");

    while (base64.length % 4) {
      base64 += "=";
    }

    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((char) => "%" + ("00" + char.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );

    return JSON.parse(json);
  } catch (error) {
    console.error("Decode JWT error:", error);
    return null;
  }
};

// ============================================================
// BUILD USER FROM JWT
// ============================================================
const buildUserFromPayload = (payload, token) => {
  if (!payload) {
    return null;
  }

  return {
    id: payload.id,
    email: payload.email,
    role: payload.role,
    full_name: payload.full_name,
    username: payload.username,
    avatar: payload.avatar,

    church_id: payload.church_id,

    account_type: payload.account_type,

    teacher_id: payload.teacher_id,
    catechist_id: payload.catechist_id,

    token,
  };
};

// ============================================================
// CHECK TOKEN
// ============================================================
const isTokenExpired = (payload) => {
  if (!payload?.exp) {
    return false;
  }

  return Date.now() >= payload.exp * 1000;
};

// ============================================================
// PROVIDER
// ============================================================
export function UserProvider({ children }) {
  const [user, setUser] = useState(null);

  /**
   * authReady:
   *
   * false = chưa kiểm tra localStorage
   * true  = đã kiểm tra xong
   *
   * Rất quan trọng để ProtectedRoute không redirect
   * về login quá sớm.
   */
  const [authReady, setAuthReady] = useState(false);

  // ==========================================================
  // RESTORE LOGIN
  // ==========================================================
  useEffect(() => {
    const restoreLogin = () => {
      try {
        const token = localStorage.getItem("token");

        console.log("[AUTH] Restore token:", token ? "FOUND" : "NOT FOUND");

        // ----------------------------------------------------
        // Không có token
        // ----------------------------------------------------
        if (!token) {
          setUser(null);
          setAuthReady(true);
          return;
        }

        // ----------------------------------------------------
        // Decode token
        // ----------------------------------------------------
        const payload = decodeJWT(token);

        if (!payload) {
          console.warn("[AUTH] JWT không hợp lệ");

          localStorage.removeItem("token");
          localStorage.removeItem("user");

          setUser(null);
          setAuthReady(true);

          return;
        }

        // ----------------------------------------------------
        // Check token hết hạn
        // ----------------------------------------------------
        if (isTokenExpired(payload)) {
          console.warn("[AUTH] JWT đã hết hạn");

          localStorage.removeItem("token");
          localStorage.removeItem("user");

          setUser(null);
          setAuthReady(true);

          return;
        }

        // ----------------------------------------------------
        // Restore user từ JWT
        // ----------------------------------------------------
        const restoredUser = buildUserFromPayload(payload, token);

        console.log("[AUTH] Restore user:", restoredUser);

        setUser(restoredUser);

        // ----------------------------------------------------
        // Đồng bộ user vào localStorage
        // ----------------------------------------------------
        localStorage.setItem("user", JSON.stringify(restoredUser));

        setAuthReady(true);
      } catch (error) {
        console.error("[AUTH] Restore login error:", error);

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setUser(null);
        setAuthReady(true);
      }
    };

    restoreLogin();
  }, []);

  // ==========================================================
  // LOGIN
  // ==========================================================
  const login = (token) => {
    try {
      if (!token) {
        throw new Error("Không có JWT token");
      }

      const payload = decodeJWT(token);

      if (!payload) {
        throw new Error("JWT token không hợp lệ");
      }

      // ------------------------------------------------------
      // Check hết hạn
      // ------------------------------------------------------
      if (isTokenExpired(payload)) {
        throw new Error("JWT token đã hết hạn");
      }

      // ------------------------------------------------------
      // Build user
      // ------------------------------------------------------
      const loggedUser = buildUserFromPayload(payload, token);

      // ------------------------------------------------------
      // Lưu token
      // ------------------------------------------------------
      localStorage.setItem("token", token);

      // ------------------------------------------------------
      // Lưu user
      // ------------------------------------------------------
      localStorage.setItem("user", JSON.stringify(loggedUser));

      // ------------------------------------------------------
      // Set state
      // ------------------------------------------------------
      setUser(loggedUser);

      setAuthReady(true);

      console.log("[AUTH] Login success:", loggedUser);

      return loggedUser;
    } catch (error) {
      console.error("[AUTH] Login error:", error);

      throw error;
    }
  };

  // ==========================================================
  // LOGOUT
  // ==========================================================
  const logout = () => {
    console.log("[AUTH] Logout");

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("catechist_user");
    localStorage.removeItem("church_id");

    setUser(null);
    setAuthReady(true);

    window.location.replace("/");
  };

  // ==========================================================
  // CONTEXT
  // ==========================================================
  return (
    <UserContext.Provider
      value={{
        user,

        login,

        logout,

        /**
         * Tương thích code cũ
         */
        loading: !authReady,

        /**
         * Tên mới rõ nghĩa hơn
         */
        authReady,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

// ============================================================
// HOOK
// ============================================================
export const useUser = () => {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error("useUser phải được sử dụng bên trong UserProvider");
  }

  return context;
};
