import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import { motion } from "framer-motion";
import {
  Calendar,
  Users,
  Clock,
  MessageSquare,
  Check,
  X,
  ArrowRight,
} from "lucide-react";

const API = import.meta.env.VITE_API_BASE || "http://localhost:4000/api";

export default function MentorDashboard() {
  const [sessions, setSessions] = useState([]);
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [sessRes, reqRes, statRes] = await Promise.all([
        axios.get(`${API}/sessions/mine?limit=5`, { withCredentials: true }),
        axios.get(`${API}/requests/mine?status=pending`, {
          withCredentials: true,
        }),
        axios.get(`${API}/dashboard/stats`, { withCredentials: true }),
      ]);

      setSessions(sessRes.data || []);
      setRequests(reqRes.data || []);
      setStats(statRes.data || null);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const actRequest = async (id, kind) => {
    await axios.patch(
      `${API}/requests/${id}/${kind}`,
      {},
      { withCredentials: true }
    );
    await loadData();
  };

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto mt-10 px-6 pb-16">
        <h1 className="text-3xl font-bold mb-2 text-blue-700">
          👨‍🏫 Mentor Dashboard
        </h1>
        <p className="text-gray-600 mb-8">
          Manage your mentorship sessions, new requests, and progress — all in
          one place.
        </p>

        {loading ? (
          <div className="text-center text-gray-500 py-10">
            Loading your dashboard...
          </div>
        ) : (
          <>
            {/* --- Quick Stats --- */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
              <StatCard
                icon={<Users className="w-6 h-6 text-blue-600" />}
                label="Active Mentees"
                value={stats?.mentees || 0}
              />
              <StatCard
                icon={<Calendar className="w-6 h-6 text-emerald-600" />}
                label="Upcoming Sessions"
                value={stats?.sessions || sessions.length}
              />
              <StatCard
                icon={<Clock className="w-6 h-6 text-amber-600" />}
                label="Pending Requests"
                value={stats?.requests || requests.length}
              />
            </div>

            {/* --- Data Sections --- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Upcoming Sessions */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-6 rounded-2xl shadow border border-gray-100"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-lg text-blue-700 flex items-center gap-2">
                    <Calendar className="w-5 h-5" /> Upcoming Sessions
                  </h2>
                  <a
                    href="/sessions"
                    className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                  >
                    View all <ArrowRight className="w-4 h-4" />
                  </a>
                </div>

                {sessions.length === 0 ? (
                  <p className="text-gray-500 text-sm">
                    No sessions scheduled yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {sessions.map((s) => (
                      <div
                        key={s.id}
                        className="p-4 border rounded-xl flex items-center justify-between hover:shadow-sm transition"
                      >
                        <div>
                          <div className="font-medium text-gray-900">
                            {new Date(s.start_time).toLocaleString([], {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })}
                          </div>
                          <div className="text-sm text-gray-600">
                            with {s.mentee?.name || s.mentee?.email}
                          </div>
                          <div className="text-xs text-gray-400 mt-1 uppercase">
                            {s.status}
                          </div>
                        </div>
                        {s.meet_link && (
                          <a
                            href={s.meet_link}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1 text-sm rounded bg-blue-600 text-white hover:bg-blue-700"
                          >
                            Join
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>

              {/* New Mentee Requests */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-6 rounded-2xl shadow border border-gray-100"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-lg text-blue-700 flex items-center gap-2">
                    <Users className="w-5 h-5" /> New Mentee Requests
                  </h2>
                  <a
                    href="/find-mentees"
                    className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                  >
                    Explore mentees <ArrowRight className="w-4 h-4" />
                  </a>
                </div>

                {requests.length === 0 ? (
                  <p className="text-gray-500 text-sm">
                    No new requests right now.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {requests.map((r) => (
                      <div
                        key={r.id}
                        className="p-4 border rounded-xl flex items-center justify-between hover:shadow-sm transition"
                      >
                        <div>
                          <div className="font-medium text-gray-900">
                            {r.mentee?.name || r.mentee?.email}
                          </div>
                          <div className="text-sm text-gray-600">
                            “
                            {r.message ||
                              "Looking forward to learning from you!"}
                            ”
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => actRequest(r.id, "accept")}
                            className="p-2 rounded bg-green-600 text-white hover:bg-green-700"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => actRequest(r.id, "decline")}
                            className="p-2 rounded bg-gray-200 hover:bg-gray-300"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            </div>
          </>
        )}
      </div>
    </>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
      <div className="p-3 bg-blue-50 rounded-full">{icon}</div>
      <div>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        <div className="text-gray-500 text-sm">{label}</div>
      </div>
    </div>
  );
}
