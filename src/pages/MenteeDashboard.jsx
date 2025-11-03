import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";

const API = import.meta.env.VITE_API_BASE || "http://localhost:4000/api";

export default function MenteeDashboard() {
  const [stats, setStats] = useState(null);
  const [mentors, setMentors] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [statsRes, mentorRes, sessionRes] = await Promise.all([
          axios.get(`${API}/mentee-dashboard/stats`, { withCredentials: true }),
          axios.get(`${API}/match/suggestions?for=mentors&limit=4`, {
            withCredentials: true,
          }),
          axios.get(`${API}/sessions/mine`, { withCredentials: true }),
        ]);
        setStats(statsRes.data || {});
        setMentors(mentorRes.data || []);
        setSessions(sessionRes.data || []);
      } catch (e) {
        console.error("Failed to load mentee dashboard:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-gray-500">
        Loading dashboard…
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="max-w-6xl mx-auto mt-10 px-6">
        <h1 className="text-3xl font-bold mb-6 text-green-700">
          🎓 Mentee Dashboard
        </h1>
        <p className="text-gray-600 mb-8">
          Find mentors, view matches, and schedule sessions to grow your skills.
        </p>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <StatCard label="Upcoming Sessions" value={stats?.sessions ?? 0} />
          <StatCard label="Pending Requests" value={stats?.requests ?? 0} />
          <StatCard label="Connected Mentors" value={stats?.mentors ?? 0} />
        </div>

        {/* Recommended Mentors */}
        <div className="bg-white p-6 rounded-xl shadow-md mb-8">
          <h2 className="font-semibold text-lg text-green-700 mb-4">
            Recommended Mentors
          </h2>
          {mentors.length === 0 ? (
            <p className="text-gray-500">No matches found yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {mentors.map((m, i) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="border border-gray-100 rounded-xl shadow-sm hover:shadow-lg p-4 bg-gradient-to-b from-white to-green-50"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={m.avatar || "https://via.placeholder.com/80"}
                      alt={m.full_name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <div className="font-semibold text-gray-800">
                        {m.full_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {m.headline || "Mentor"}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-3">
                    {m.bio || "No bio available."}
                  </p>
                  <a
                    href={`/mentor/${m.id}`}
                    className="text-sm text-green-700 font-medium hover:underline"
                  >
                    View Profile →
                  </a>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Sessions */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="font-semibold text-lg text-green-700 mb-4">
            Upcoming Sessions
          </h2>
          {sessions.length === 0 ? (
            <p className="text-gray-500">No sessions booked yet.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {sessions.map((s, i) => (
                <li key={i} className="py-3 flex justify-between items-center">
                  <div>
                    <div className="font-medium text-gray-800">
                      {new Date(s.start_time).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500">
                      Mentor: {s.mentor?.name || s.mentor?.email}
                    </div>
                  </div>
                  {s.meet_link && (
                    <a
                      href={s.meet_link}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-green-600 text-white text-sm px-3 py-1.5 rounded-lg hover:bg-green-700"
                    >
                      Join
                    </a>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-5 text-center border border-gray-100">
      <div className="text-3xl font-bold text-green-700 mb-1">{value}</div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  );
}
