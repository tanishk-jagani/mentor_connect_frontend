import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <nav className="flex items-center justify-between px-10 py-4 bg-white shadow-sm sticky top-0 z-50">
      {/* Logo */}
      <Link to="/" className="flex items-center space-x-2">
        <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
          M
        </div>
        <span className="text-lg font-bold text-gray-800">MentorConnect</span>
      </Link>

      {/* Center Nav Links */}
      <div className="flex items-center gap-6">
        {!user ? (
          <>
            <Link to="/" className="hover:text-blue-600 font-medium">
              Home
            </Link>
            <a
              href="http://localhost:4000/api/auth/google?role=mentee"
              className="hover:text-green-600 font-medium"
            >
              Find a Mentor
            </a>
            <a
              href="http://localhost:4000/api/auth/google?role=mentor"
              className="hover:text-blue-600 font-medium"
            >
              Become a Mentor
            </a>
          </>
        ) : (
          <>
            <Link
              to={
                user.role === "mentor"
                  ? "/dashboard/mentor"
                  : "/dashboard/mentee"
              }
              className="hover:text-blue-600 font-medium"
            >
              Dashboard
            </Link>

            {user?.role === "admin" && (
              <Link
                to="/admin"
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200"
              >
                Admin
              </Link>
            )}

            {user.role === "mentee" && (
              <Link
                to="/find-mentor"
                className="hover:text-green-600 font-medium"
              >
                Find a Mentor
              </Link>
            )}
            {user.role === "mentee" && (
              <Link to="/sessions" className="hover:text-green-600 font-medium">
                My Sessions
              </Link>
            )}
            {user.role === "mentor" && (
              <Link to="/sessions" className="hover:text-green-600 font-medium">
                My Sessions
              </Link>
            )}

            {user.role === "mentor" && (
              <Link to="/mentees" className="hover:text-blue-600 font-medium">
                My Mentees
              </Link>
            )}

            <Link
              to={`/profile/${user?.id}`}
              className="hover:text-blue-600 font-medium"
            >
              Profile
            </Link>
          </>
        )}
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {!user ? (
          <a
            href="http://localhost:4000/api/auth/google?role=mentee"
            className="bg-blue-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Login / Signup
          </a>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-8 h-8 rounded-full border"
              />
              <span className="font-medium text-gray-700">{user.name}</span>
            </div>
            <button
              onClick={handleLogout}
              className="text-red-500 hover:underline font-medium"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
