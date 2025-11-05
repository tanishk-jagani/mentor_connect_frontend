// /client/src/pages/AdminDashboard.jsx
import { useContext, useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
} from "recharts";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_BASE || "http://localhost:4000/api";

export default function AdminDashboard() {
  const { user, loading, logout } = useContext(AuthContext);
  const [stats, setStats] = useState({
    topMentors: [],
    totalUsers: [],
    totals: {},
  });
  const [tab, setTab] = useState("overview");
  const [users, setUsers] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [busy, setBusy] = useState(false);

  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };
  const [reports, setReports] = useState([]);
  const [filters, setFilters] = useState({ reportStatus: "open" });

  useEffect(() => {
    (async () => {
      const { data } = await axios.get(
        `${API}/admin/reports?status=${filters.reportStatus}`,
        { withCredentials: true }
      );
      setReports(data || []);
    })();
  }, [filters.reportStatus]);

  async function updateReportStatus(id, status) {
    await axios.patch(
      `${API}/admin/reports/${id}`,
      { status },
      { withCredentials: true }
    );
    setReports((r) => r.map((x) => (x.id === id ? { ...x, status } : x)));
  }

  useEffect(() => {
    console.log(user, "<<<<<<<<<<<<<<user");
    if (loading || !user) return;
    if (user.role !== "admin") return;
    loadStats();
  }, [user, loading]);

  const loadStats = async () => {
    const { data } = await axios.get(`${API}/admin/stats`, {
      withCredentials: true,
    });
    setStats(data);
  };

  const loadUsers = async (role = "all") => {
    setBusy(true);
    const { data } = await axios.get(`${API}/admin/users?role=${role}`, {
      withCredentials: true,
    });
    setUsers(data);
    setBusy(false);
  };

  const loadSessions = async () => {
    setBusy(true);
    const { data } = await axios.get(`${API}/admin/sessions`, {
      withCredentials: true,
    });
    setSessions(data);
    setBusy(false);
  };

  const loadReviews = async () => {
    setBusy(true);
    const { data } = await axios.get(`${API}/admin/reviews`, {
      withCredentials: true,
    });
    setReviews(data);
    setBusy(false);
  };

  const toggleBlock = async (u) => {
    const confirm = window.confirm(
      `${u.blocked ? "Unblock" : "Block"} user ${u.name}?`
    );
    if (!confirm) return;
    await axios.put(
      `${API}/admin/user/${u.id}/block`,
      { blocked: !u.blocked },
      { withCredentials: true }
    );
    loadUsers();
  };

  const deleteUser = async (u) => {
    const confirm = window.confirm(
      `Are you sure you want to delete ${u.name}?`
    );
    if (!confirm) return;
    try {
      await axios.delete(`${API}/admin/user/${u.id}`, {
        withCredentials: true,
      });
      setUsers((prev) => prev.filter((x) => x.id !== u.id));
    } catch (err) {
      console.error("Failed to delete user:", err);
      alert("Error deleting user. Please try again.");
    }
  };

  const deleteReview = async (r) => {
    const confirm = window.confirm(`Delete review from ${r.mentee.name}?`);
    if (!confirm) return;
    await axios.delete(`${API}/admin/reviews/${r.id}`, {
      withCredentials: true,
    });
    loadReviews();
  };

  if (loading) return null;
  if (user?.role !== "admin")
    return (
      <div className="p-10 text-center text-red-500">
        Access denied. Admins only.
      </div>
    );

  const StatCard = ({ title, value }) => (
    <div className="flex-1 bg-white p-5 rounded-2xl shadow text-center">
      <div className="text-gray-500">{title}</div>
      <div className="text-2xl font-semibold text-blue-600">{value}</div>
    </div>
  );

  const topMentorData = Array.isArray(stats.topMentors || [])
    ? stats?.topMentors?.map((m) => ({
        name: m.mentor?.name || "Unknown Mentor",
        rating: Number(m.avg) || 0,
      }))
    : [];

  return (
    <main className="max-w-6xl mx-auto py-8">
      <div className="flex gap-3 mb-6">
        <h1 className="text-3xl font-bold ">Admin Dashboard</h1>

        <button onClick={handleLogout} className="text-red-500  font-medium">
          Logout
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-3 mb-6">
        {["overview", "users", "sessions", "reviews", "reports"].map((t) => (
          <button
            key={t}
            onClick={() => {
              setTab(t);
              if (t === "users") loadUsers();
              if (t === "sessions") loadSessions();
              if (t === "reviews") loadReviews();
            }}
            className={`px-4 py-2 rounded-xl ${
              tab === t
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* ===== Overview Tab ===== */}
      {tab === "overview" && stats && (
        <div className="space-y-8">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard title="Total Users" value={stats.totals.totalUsers} />
            <StatCard title="Mentors" value={stats.totals.mentors} />
            <StatCard title="Mentees" value={stats.totals.mentees} />
            <StatCard title="Active Pairs" value={stats.totals.activePairs} />
          </div>

          {/* Chart: User Growth */}
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-lg font-semibold mb-3">
              User Growth (Mentors vs. Mentees)
            </h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={stats.userGrowth || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="week"
                  tickFormatter={(v) => new Date(v).toLocaleDateString()}
                />
                <YAxis />
                <Tooltip
                  labelFormatter={(v) => new Date(v).toLocaleDateString()}
                  formatter={(value, name) => [value, name]}
                />
                <Legend />
                <Line type="monotone" dataKey="mentors" stroke="#2563eb" />
                <Line type="monotone" dataKey="mentees" stroke="#f59e0b" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Chart: Active Mentorships */}
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-lg font-semibold mb-3">
              Active Mentorship Pairs (last 30 days)
            </h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stats.activeMentorships || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="day"
                  tickFormatter={(v) => new Date(v).toLocaleDateString()}
                />
                <YAxis />
                <Tooltip
                  labelFormatter={(v) => new Date(v).toLocaleDateString()}
                  formatter={(v) => [`${v} active pairs`]}
                />
                <Bar dataKey="pairs" fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Chart: Top Mentor Ratings */}
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-lg font-semibold mb-3">Top Mentor Ratings</h2>

            {topMentorData.length === 0 ? (
              <div className="text-gray-500 text-sm">No ratings yet.</div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={topMentorData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 5]} />
                  <Tooltip />
                  <Bar dataKey="rating" fill="#16a34a" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      )}

      {/* ===== Other Tabs remain same as before ===== */}
      {tab === "users" && (
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          {busy ? (
            <div className="p-6 text-center text-gray-500">Loading…</div>
          ) : (
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3 text-left">Role</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t">
                    <td className="p-3">{u.name}</td>
                    <td className="p-3">{u.email}</td>
                    <td className="p-3 capitalize">{u.role}</td>
                    <td className="p-3 text-center">
                      {u.blocked ? (
                        <span className="text-red-500">Blocked</span>
                      ) : (
                        <span className="text-green-600">Active</span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                        onClick={() => deleteUser(u)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === "sessions" && (
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          {busy ? (
            <div className="p-6 text-center text-gray-500">Loading…</div>
          ) : (
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 text-left">Mentor</th>
                  <th className="p-3 text-left">Mentee</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((s) => (
                  <tr key={s.id} className="border-t">
                    <td className="p-3">{s.mentor?.name}</td>
                    <td className="p-3">{s.mentee?.name}</td>
                    <td className="p-3 capitalize">{s.status}</td>
                    <td>
                      {s.createdAt
                        ? new Date(s.createdAt).toLocaleString("en-GB", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === "reviews" && (
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          {busy ? (
            <div className="p-6 text-center text-gray-500">Loading…</div>
          ) : (
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 text-left">Mentor</th>
                  <th className="p-3 text-left">Mentee</th>
                  <th className="p-3 text-left">Rating</th>
                  <th className="p-3 text-left">Comment</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((r) => (
                  <tr key={r.id} className="border-t">
                    <td className="p-3">{r.mentor?.name}</td>
                    <td className="p-3">{r.mentee?.name}</td>
                    <td className="p-3">{r.rating}</td>
                    <td className="p-3">{r.comment}</td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => deleteReview(r)}
                        className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
      {tab === "reports" && (
        <div className="p-6 bg-white rounded-2xl border shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Recent Reports</h3>
            <select
              className="border rounded-lg px-2 py-1 text-sm"
              value={filters.reportStatus || "open"}
              onChange={(e) =>
                setFilters((f) => ({ ...f, reportStatus: e.target.value }))
              }
            >
              <option value="open">Open</option>
              <option value="reviewing">Reviewing</option>
              <option value="resolved">Resolved</option>
              <option value="dismissed">Dismissed</option>
              <option value="all">All</option>
            </select>
          </div>

          <div className="space-y-2">
            {reports.length === 0 && (
              <div className="text-gray-500 text-sm">No reports</div>
            )}
            {reports.map((r) => (
              <div key={r.id} className="p-3 rounded-lg border">
                <div className="text-sm text-gray-700">
                  <span className="font-medium">
                    {r.reporter?.name || r.reporter?.email}
                  </span>{" "}
                  →
                  <span className="ml-1">
                    {r.target?.name || r.target?.email}
                  </span>
                  <span className="ml-2 px-2 py-0.5 text-xs rounded-full border">
                    {r.status}
                  </span>
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  <span className="font-medium">{r.reason}</span>
                  {r.details ? ` — ${r.details}` : ""}
                </div>
                {r.message && (
                  <div className="mt-1 text-xs text-gray-500 italic">
                    Message: “{r.message.text}”
                  </div>
                )}
                <div className="mt-2 flex gap-2">
                  {["open", "reviewing", "resolved", "dismissed"].map((s) => (
                    <button
                      key={s}
                      onClick={() => updateReportStatus(r.id, s)}
                      className={`text-xs px-2 py-1 rounded border ${
                        s === r.status ? "bg-gray-100" : "hover:bg-gray-50"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
