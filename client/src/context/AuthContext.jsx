// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";

// Create context
const AuthContext = createContext();

// Context Provider
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const savedToken = localStorage.getItem("token");

    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setToken(savedToken);
    }
  }, []);

  const login = (userObj, token) => {
    setUser(userObj); // ← Save full user object, which includes .email
    setToken(token);
    localStorage.setItem("user", JSON.stringify(userObj)); // Save actual user object
    localStorage.setItem("token", token);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// ✅ useAuth hook
export const useAuth = () => useContext(AuthContext);
