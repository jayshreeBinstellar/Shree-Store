import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { CircularProgress } from "@mui/material";

export function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <CircularProgress size="3rem" style={{ color: "black" }} />
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/auth" replace />;
}
