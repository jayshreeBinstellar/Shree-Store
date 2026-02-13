import React from "react";
import { Routes, Route, Navigate, NavLink } from "react-router-dom";
import routes from "../routes";
import { useAuth } from "../context/AuthContext";
import { CircularProgress } from "@mui/material";
import { useSettings } from "../context/SettingsContext";

export function Auth() {
  const { isAuthenticated, loading } = useAuth();
  const { settings } = useSettings();
  const authPages = routes.find((r) => r.layout === "auth")?.pages || [];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <CircularProgress size="3rem" />
      </div>
    );
  }

  // If user is logged in, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/main/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Small Logo/Home Link */}
      <div className="p-6">
        <NavLink to="/main/dashboard" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md">
            <span className="text-white font-black text-xl italic">{settings?.store_name?.charAt(0) || 'S'}</span>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg font-black text-gray-900 tracking-tighter">{settings?.store_name || 'Shree'}</h1>
            <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest -mt-1">Organic Market</p>
          </div>
        </NavLink>
      </div>

      <main className="flex-1 flex items-center justify-center p-4 -mt-12">
        <div className="w-full max-w-md">
          <Routes>
            {authPages.map((page) => (
              <Route key={page.path} path={page.path} element={page.element} />
            ))}
            {/* Default redirect to signin */}
            <Route path="*" element={<Navigate to="/auth" replace />} />
          </Routes>
        </div>
      </main>

      <footer className="py-6 text-center border-t border-gray-100 bg-white">
        <div className="container mx-auto px-4 flex items-center justify-center text-xs font-medium text-gray-400">
          <NavLink to="/privacy-policy" className="hover:text-indigo-600 transition-colors">
            Privacy Policy
          </NavLink>
        </div>
      </footer>
    </div>
  );
}

export default Auth;
