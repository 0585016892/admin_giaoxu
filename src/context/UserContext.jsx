import { createContext, useContext, useState, useEffect } from "react";

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Khi reload -> khôi phục user từ localStorage
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));

        setUser({
          id: payload.id,
          role: payload.role,
          full_name: payload.full_name,
          username: payload.username,
          avatar: payload.avatar,
          church_id: payload.church_id,
          account_type: payload.account_type,
          token,
        });
      } catch (error) {
        console.error("Invalid JWT:", error);
        localStorage.removeItem("token");
      }
    }

    setLoading(false);
  }, []);

  // Login
  const login = (token) => {
    localStorage.setItem("token", token);

    const payload = JSON.parse(atob(token.split(".")[1]));

    console.log("Decoded JWT payload:", payload);

    setUser({
      id: payload.id,
      role: payload.role,
      full_name: payload.full_name,
      account_type: payload.account_type,
      username: payload.username,
      avatar: payload.avatar,
      church_id: payload.church_id,
      token,
    });
  };

  // Logout
  const logout = () => {
    const currentRole = user?.role;

    // Xóa auth
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("catechist_user");
    localStorage.removeItem("church_id");

    setUser(null);

    // Giáo lý viên
    if (currentRole === "catechist") {
      window.location.replace("/login");
      return;
    }

    // Các role quản trị giáo xứ
    window.location.replace("/giao-xu/login");
  };

  return (
    <UserContext.Provider
      value={{
        user,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
