// frontend/src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axiosInstance";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // { id, name, role, isApproved }
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true); // 🔴 start as true

  useEffect(() => {
    const fetchMe = async () => {
      // if no token, we're definitely not logged in
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await api.get("/auth/me");
        setUser(res.data);
      } catch (err) {
        console.error(err);
        handleLogout(); // token invalid → clear and go to logged-out state
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
    // eslint-disable-next-line
  }, [token]);

  const handleLogin = (token, user) => {
    setToken(token);
    localStorage.setItem("token", token);
    setUser(user);
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem("token");
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
