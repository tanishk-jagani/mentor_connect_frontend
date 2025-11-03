import { useContext, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const API = import.meta.env.VITE_API_BASE || "http://localhost:4000/api";

export default function Landing() {
  const { user, loading, logout } = useContext(AuthContext); // ⬅️ use context instead of axios
  const [showAuth, setShowAuth] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  // Auto-redirect if already logged in (uses context)
  useEffect(() => {
    if (loading) return;
    if (!user) return;

    if (user.needsOnboarding) navigate("/onboarding", { replace: true });
    else if (user.role === "mentor")
      navigate("/dashboard/mentor", { replace: true });
    else if (user.role === "mentee")
      navigate("/dashboard/mentee", { replace: true });
    else if (user.role === "admin")
      navigate("/dashboard/admin", { replace: true });
  }, [user, loading, navigate]);

  const handleGoogleLogin = (role) => {
    window.location.href = `${API}/auth/google?role=${role}`;
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-lg">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-gray-50 text-gray-800 flex flex-col">
      {/* ===== Header ===== */}
      <header className="flex justify-between items-center px-10 py-4 bg-white shadow-sm">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 text-white font-bold rounded-lg px-2 py-1">
            M
          </div>
          <h1 className="font-bold text-xl">MentorConnect</h1>
        </div>

        <nav className="flex items-center gap-6">
          <a href="#mentors" className="hover:text-blue-600 font-medium">
            Find a Mentor
          </a>
          <a href="#join" className="hover:text-blue-600 font-medium">
            Become a Mentor
          </a>

          {user ? (
            <div className="flex items-center gap-3">
              <img
                src={user.avatar || "https://via.placeholder.com/30"}
                alt="avatar"
                className="w-8 h-8 rounded-full"
              />
              <span className="font-medium">{user.name || user.email}</span>
            </div>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Login / Signup
            </button>
          )}
        </nav>
      </header>

      {/* ===== Hero Section ===== */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl mx-auto text-center mt-16 relative"
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://via.placeholder.com/1500x500')",
          }}
        ></div>

        <div className="relative z-10">
          <h1 className="text-5xl font-extrabold text-blue-700 mb-6">
            Empower Growth Through Mentorship 🌟
          </h1>
          <p className="text-lg text-gray-600 mb-10 leading-relaxed">
            Connect with experienced mentors or passionate mentees to grow your
            skills, gain guidance, and share knowledge — all in one platform.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
            <button
              onClick={() => handleGoogleLogin("mentor")}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-xl shadow-lg transition-all transform hover:scale-105"
            >
              Continue as Mentor
            </button>

            <button
              onClick={() => handleGoogleLogin("mentee")}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-4 rounded-xl shadow-lg transition-all transform hover:scale-105"
            >
              Continue as Mentee
            </button>
          </div>
        </div>
      </motion.div>

      {/* ===== Key Metrics ===== */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9 }}
        className="mt-20 max-w-5xl mx-auto text-center grid grid-cols-2 sm:grid-cols-4 gap-8"
      >
        <div className="p-6 bg-white rounded-2xl shadow-md hover:shadow-lg transition">
          <h3 className="text-3xl font-bold text-blue-700 mb-3">5,000+</h3>
          <p className="text-gray-600">Active Mentors</p>
        </div>
        <div className="p-6 bg-white rounded-2xl shadow-md hover:shadow-lg transition">
          <h3 className="text-3xl font-bold text-blue-700 mb-3">50,000+</h3>
          <p className="text-gray-600">Successful Matches</p>
        </div>
        <div className="p-6 bg-white rounded-2xl shadow-md hover:shadow-lg transition">
          <h3 className="text-3xl font-bold text-blue-700 mb-3">95%</h3>
          <p className="text-gray-600">Satisfaction Rate</p>
        </div>
        <div className="p-6 bg-white rounded-2xl shadow-md hover:shadow-lg transition">
          <h3 className="text-3xl font-bold text-blue-700 mb-3">100+</h3>
          <p className="text-gray-600">Industries Covered</p>
        </div>
      </motion.div>

      {/* ===== How It Works ===== */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9 }}
        className="mt-20 max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 text-center"
      >
        <div className="p-6 bg-white rounded-2xl shadow-md hover:shadow-lg transition">
          <h3 className="text-xl font-bold text-blue-700 mb-3">1. Sign In</h3>
          <p className="text-gray-600">
            Use Google or email/password to join securely as a mentor or mentee.
          </p>
        </div>
        <div className="p-6 bg-white rounded-2xl shadow-md hover:shadow-lg transition">
          <h3 className="text-xl font-bold text-blue-700 mb-3">2. Match</h3>
          <p className="text-gray-600">
            Mentees get AI-powered mentor matches based on goals and skills.
          </p>
        </div>
        <div className="p-6 bg-white rounded-2xl shadow-md hover:shadow-lg transition">
          <h3 className="text-xl font-bold text-blue-700 mb-3">3. Grow</h3>
          <p className="text-gray-600">
            Chat, schedule sessions, and collaborate to achieve professional
            growth.
          </p>
        </div>
      </motion.div>

      <footer className="mt-20 text-gray-500 text-sm text-center pb-6">
        © {new Date().getFullYear()} Mentorship Platform — Built with 💙 for
        growth
      </footer>
    </div>
  );
}
