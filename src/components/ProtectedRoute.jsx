import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useContext(AuthContext);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500">
        Checking session...
      </div>
    );

  if (!user) {
    console.log("⛔ No user, redirecting to login...");
    return <Navigate to="/" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    console.log("⛔ Role not allowed:", user.role);
    return <Navigate to="/" replace />;
  }

  return children;
}
