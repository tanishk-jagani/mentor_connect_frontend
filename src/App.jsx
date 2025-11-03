// App.jsx
import React, { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";
import Landing from "./pages/Landing";
import MentorDashboard from "./pages/MentorDashboard";
import MenteeDashboard from "./pages/MenteeDashboard";
import Profile from "./pages/Profile";
import Onboarding from "./pages/Onboarding";
import LoginPage from "./pages/LoginPage"; // NEW
import FindMentor from "./pages/FindMentor";
// main.jsx or index.css
import "./styles/ui.css";
import MentorProfile from "./pages/MentorProfile";
import Messages from "./pages/Messages";
import Chat from "./pages/Chat";
import RequireAuth from "./components/RequireAuth";
import FindMentees from "./pages/FindMentees";
import MenteeProfile from "./pages/MenteeProfile";
import FindMentee from "./pages/FindMentees";
import Sessions from "./pages/Sessions";
import ProfileRouter from "./pages/ProfileRouter";
import AdminDashboard from "./pages/AdminDashboard";

function ProtectedRoute({ children, role }) {
  const { user } = useContext(AuthContext);
  if (!user) return <Navigate to="/" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const { loading } = useContext(AuthContext);
  if (loading) return <div>Loading...</div>;

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<LoginPage />} /> {/* NEW */}
      {/* <Route
        path="/admin"
        element={
          <RequireAuth>
            <AdminDashboard />
          </RequireAuth>
        }
      /> */}
      <Route
        path="/dashboard/admin"
        element={
          <ProtectedRoute role="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/mentor"
        element={
          <ProtectedRoute role="mentor">
            <MentorDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/mentee"
        element={
          <ProtectedRoute role="mentee">
            <MenteeDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile/:id"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/onboarding"
        element={
          <ProtectedRoute>
            <Onboarding />
          </ProtectedRoute>
        }
      />
      <Route
        path="/find-mentor"
        element={
          <ProtectedRoute>
            <FindMentor />
          </ProtectedRoute>
        }
      />
      <Route
        path="/find/mentees"
        element={
          <RequireAuth>
            <FindMentee />
          </RequireAuth>
        }
      />
      <Route
        path="/mentees"
        element={
          <ProtectedRoute>
            <FindMentees />
          </ProtectedRoute>
        }
      />
      <Route path="/mentee/:id" element={<MenteeProfile />} />
      <Route
        path="/mentor/:id"
        element={
          <ProtectedRoute>
            <MentorProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/messages"
        element={
          <RequireAuth>
            <Messages />
          </RequireAuth>
        }
      />
      <Route
        path="/chat/:otherId"
        element={
          <RequireAuth>
            <Chat />
          </RequireAuth>
        }
      />
      <Route
        path="/sessions"
        element={
          <RequireAuth>
            <Sessions />
          </RequireAuth>
        }
      />
      {/* <Route
        path="/admin"
        element={
          <RequireAuth>
            <AdminDashboard />
          </RequireAuth>
        }
      /> */}
      <Route path="/chat" element={<Navigate to="/messages" replace />} />
    </Routes>
  );
}
