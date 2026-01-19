// frontend/src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axiosInstance";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(
    sessionStorage.getItem("token") // ✅ FIX
  );
  const [loading, setLoading] = useState(true);

  // 🔁 Validate token on app load / refresh
  useEffect(() => {
    const fetchMe = async () => {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const res = await api.get("/auth/me");
        setUser(res.data);
      } catch (err) {
        console.error("Auth validation failed:", err);
        handleLogout(); // invalid token → force logout
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
    // eslint-disable-next-line
  }, [token]);

  // ✅ LOGIN
  const handleLogin = (token, user) => {
    sessionStorage.setItem("token", token); // ✅ FIX
    sessionStorage.setItem("user", JSON.stringify(user)); // optional
    setToken(token);
    setUser(user);
  };

  // ✅ LOGOUT (IMPORTANT)
  const handleLogout = () => {
    sessionStorage.removeItem("token"); // ✅ FIX
    sessionStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, handleLogin, handleLogout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
