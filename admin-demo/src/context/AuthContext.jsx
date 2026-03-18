import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext({});

const parseJwt = (token) => {
    try {
        const base64Payload = token.split(".")[1];
        return JSON.parse(atob(base64Payload));
    } catch (e) {
        return null;
    }
};

const isTokenExpired = (token) => {
    const payload = parseJwt(token);
    if (!payload || !payload.exp) return true;
    const expiryTime = payload.exp * 1000;
    return Date.now() > expiryTime;
};

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedToken = localStorage.getItem("token");

        if (storedToken && !isTokenExpired(storedToken)) {
            setToken(storedToken);
        } else {
            setToken(null);
            localStorage.removeItem("token");
        }

        setLoading(false);

        const handleStorageChange = (e) => {
            if (e.key === "token") {
                setToken(localStorage.getItem("token") || null);
            }
        };

        window.addEventListener("storage", handleStorageChange);
        return () => window.removeEventListener("storage", handleStorageChange);
    }, []);

    const isAuthenticated = !!token;

    const login = (authToken) => {
        setToken(authToken);
        localStorage.setItem("token", authToken);
    };

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

export const useAuth = () => useContext(AuthContext);
