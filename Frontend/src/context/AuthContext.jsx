// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import API from "@/api/axios";

const AuthContext = createContext(null);

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // On mount, check if user is already authenticated
    useEffect(() => {
        fetchCurrentUser();
    }, []);

    const fetchCurrentUser = async () => {
        try {
            setLoading(true);
            const res = await API.get("/users/me");
            setUser(res.data.data);
        } catch (err) {
            // Not authenticated or token expired
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (credentials) => {
        const res = await API.post("/users/login", credentials);
        setUser(res.data.data);
        return res.data;
    };

    const register = async (formData) => {
        const res = await API.post("/users/register", formData);
        setUser(res.data.data);
        return res.data;
    };

    const logout = async () => {
        try {
            await API.post("/users/logout");
        } catch (err) {
            console.error("Logout error:", err);
        } finally {
            setUser(null);
        }
    };

    const value = {
        user,
        loading,
        login,
        register,
        logout,
        fetchCurrentUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;
