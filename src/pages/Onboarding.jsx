// src/pages/Onboarding.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

const API = import.meta.env.VITE_API_BASE || "http://localhost:4000/api";
const validRole = (r) => (r === "mentor" || r === "mentee" ? r : "mentee");

export default function Onboarding() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    expertise: "",
    skills: "",
    interests: "",
    goals: "",
    role: "mentee", // NEW
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // ✅ Fetch logged-in user info
  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`${API}/auth/me`, {
          withCredentials: true,
        });
        console.log(res.data, "<<<<<<<<<<");
        setUser(res.data);
        // prefill role from user if valid, else mentee
        setFormData((f) => ({ ...f, role: validRole(res.data?.role) }));
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading)
    return (
      <div className="h-screen flex justify-center items-center">
        Loading...
      </div>
    );
  if (!user)
    return (
      <div className="h-screen flex justify-center items-center">
        Please log in first.
      </div>
    );

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await axios.post(
        `${API}/profile/onboarding`,
        { ...formData, role: formData.role }, // 🔑 use dropdown value
        { withCredentials: true }
      );

      // Re-fetch user to get updated role (in case it changed here)
      const { data: me } = await axios.get(`${API}/auth/me`, {
        withCredentials: true,
      });
      const role = validRole(me.role);
      window.location.href =
        role === "mentor" ? "/dashboard/mentor" : "/dashboard/mentee";
    } catch (err) {
      console.error("❌ Error saving onboarding info:", err);
      setError(
        err?.response?.data?.message || "Failed to save profile. Try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const isMentor = formData.role === "mentor";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-16 px-5">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="bg-white shadow-lg rounded-2xl p-10 max-w-3xl w-full"
      >
        <h1 className="text-3xl font-bold text-center text-blue-700 mb-6">
          {isMentor ? "Mentor Onboarding" : "Mentee Onboarding"}
        </h1>

        <p className="text-gray-600 text-center mb-8">
          Complete your profile so we can match you with the right{" "}
          {isMentor ? "mentees" : "mentors"}.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* NEW: Role select */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              I want to join as
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="mentee">Mentee</option>
              <option value="mentor">Mentor</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Short Bio
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows="3"
              placeholder="Tell us about your background..."
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {isMentor ? (
            <>
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Expertise / Profession
                </label>
                <input
                  type="text"
                  name="expertise"
                  value={formData.expertise}
                  onChange={handleChange}
                  placeholder="Software Engineer, UX Designer, etc."
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Skills (comma separated)
                </label>
                <input
                  type="text"
                  name="skills"
                  value={formData.skills}
                  onChange={handleChange}
                  placeholder="React, Node.js, Leadership..."
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Your Interests
                </label>
                <input
                  type="text"
                  name="interests"
                  value={formData.interests}
                  onChange={handleChange}
                  placeholder="AI, Product Design, Marketing..."
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Your Goals
                </label>
                <textarea
                  name="goals"
                  value={formData.goals}
                  onChange={handleChange}
                  rows="3"
                  placeholder="What do you want to achieve from mentorship?"
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
          )}

          {error && <p className="text-red-500 text-center">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            {saving ? "Saving..." : "Complete Onboarding"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
