import { createContext, useContext, useEffect, useState } from "react";

// Create Auth Context
const AuthContext = createContext({});

// Helper to decode JWT
const parseJwt = (token) => {
  try {
    const base64Payload = token.split(".")[1];
    return JSON.parse(atob(base64Payload));
  } catch (e) {
    return null;
  }
};

// Check if token is expired
const isTokenExpired = (token) => {
  const payload = parseJwt(token);
  if (!payload || !payload.exp) return true;
  const expiryTime = payload.exp * 1000;
  return Date.now() > expiryTime;
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user/token from localStorage safely
  useEffect(() => {
    // const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedToken && !isTokenExpired(storedToken)) {
      setToken(storedToken);
    } else {
      setToken(null);
      localStorage.removeItem("token");
    }

    setLoading(false);

    // Listen to storage changes in other tabs
    const handleStorageChange = (e) => {
      if (e.key === "token") {
        // setUser(localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null);
        setToken(localStorage.getItem("token") || null);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const isAuthenticated = !!token;

  // Login function
  const login = (authToken) => {
    setToken(authToken);
    localStorage.setItem("token", authToken);
  };

  // Logout function
  const logout = () => {
    setToken(null);
    localStorage.removeItem("token");
  };

  const user = token ? parseJwt(token) : null;
  const isAdmin = user?.isAdmin || false;

  return (
    <AuthContext.Provider
      value={{ token, user, isAdmin, loading, isAuthenticated, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook
export const useAuth = () => useContext(AuthContext);
