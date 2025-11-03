// src/components/RequireAuth.jsx
import { useContext, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

/**
 * Optional: pass allowedRoles={['mentor']} to protect mentor-only routes.
 */
export default function RequireAuth({ children, allowedRoles }) {
  const { user, loading } = useContext(AuthContext);
  const nav = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (loading) return;

    // Not logged in → login
    if (!user) {
      nav("/login", { replace: true, state: { from: location.pathname } });
      return;
    }

    // Needs onboarding → onboarding (unless we're already there)
    if (user.needsOnboarding && location.pathname !== "/onboarding") {
      nav("/onboarding", { replace: true });
      return;
    }

    // Role-gated routes (optional)
    if (
      allowedRoles &&
      allowedRoles.length &&
      !allowedRoles.includes(user.role)
    ) {
      // send to their own dashboard
      nav(user.role === "mentor" ? "/dashboard/mentor" : "/dashboard/mentee", {
        replace: true,
      });
    }
  }, [user, loading, nav, location.pathname, allowedRoles]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-500">
        Checking authentication...
      </div>
    );
  }

  return children;
}
