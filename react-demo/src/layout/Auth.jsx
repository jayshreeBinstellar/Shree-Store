import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import routes from "../routes";
import Navbar from "../component/Navbar";
// import Footer from "../widgets/Components/footer";
import { useAuth } from "../context/AuthContext";
import { CircularProgress } from "@mui/material";


export function Auth() {
  const { isAuthenticated, loading } = useAuth();
  const authPages = routes.find((r) => r.layout === "auth")?.pages || [];

  if (loading) {
  return (
    <div className="flex justify-center items-center h-screen">
      <CircularProgress size="3rem" />
    </div>
  );
}

//   If user is logged in, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/main/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* <Navbar /> */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Routes>
            {authPages.map((page) => (
              <Route key={page.path} path={page.path} element={page.element} />
            ))}
            {/* Default redirect to signin */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
      {/* <Footer /> */}
    </div>
  );
}

export default Auth;
