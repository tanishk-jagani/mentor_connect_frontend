// src/pages/Sessions.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import AvailabilityManager from "../components/AvailabilityManager";
import Navbar from "../components/Navbar";

const API = import.meta.env.VITE_API_BASE || "http://localhost:4000/api";

export default function Sessions() {
  const [me, setMe] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadSessions = async () => {
    const { data } = await axios.get(`${API}/sessions/mine`, {
      withCredentials: true,
    });
    setItems(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(`${API}/auth/me`, {
          withCredentials: true,
        });
        setMe(data || null);
        await loadSessions();
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const act = async (id, kind) => {
    await axios.patch(
      `${API}/sessions/${id}/${kind}`,
      {},
      { withCredentials: true }
    );
    await loadSessions();
  };

  const fmtRange = (start, end) => {
    const s = new Date(start);
    const e = new Date(end);
    const bad = (d) => Number.isNaN(d.getTime());
    if (bad(s) || bad(e)) return "—";
    const sameDay =
      s.getFullYear() === e.getFullYear() &&
      s.getMonth() === e.getMonth() &&
      s.getDate() === e.getDate();
    const datePart = s.toLocaleDateString();
    const t1 = s.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const t2 = e.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    return sameDay
      ? `${datePart} • ${t1}–${t2}`
      : `${s.toLocaleString()} → ${e.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-10 text-gray-500">Loading…</div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="max-w-5xl mx-auto py-10">
        <h1 className="text-2xl font-bold mb-6">My Sessions</h1>

        {/* Mentor-only availability calendar (AvailabilityManager fetches its own data from /availability/me) */}
        {me?.role === "mentor" && (
          <div className="mb-10">
            <h2 className="text-lg font-semibold mb-3">My Availability</h2>
            <p className="text-sm text-gray-500 mb-3">
              Drag on the calendar to add a slot. Click a slot to delete it.
            </p>
            <AvailabilityManager />
          </div>
        )}

        <h2 className="text-lg font-semibold mb-3">
          Upcoming &amp; Past Sessions
        </h2>
        {items.length === 0 ? (
          <div className="text-gray-500">No sessions yet.</div>
        ) : (
          <div className="space-y-3">
            {items.map((s) => (
              <div
                key={s.id}
                className="bg-white border rounded-xl p-4 flex justify-between items-center"
              >
                <div>
                  <div className="font-medium">
                    {fmtRange(s.start_time, s.end_time)}
                  </div>
                  <div className="text-sm text-gray-600">
                    Mentor: {s.mentor?.name || s.mentor?.email || "—"} · Mentee:{" "}
                    {s.mentee?.name || s.mentee?.email || "—"}
                  </div>
                  <div className="text-xs mt-1">
                    Status: <b className="uppercase">{s.status}</b>
                  </div>
                </div>
                <div className="flex gap-2">
                  {me?.role === "mentor" && s.status === "pending" && (
                    <>
                      <button
                        onClick={() => act(s.id, "accept")}
                        className="px-3 py-1 rounded bg-green-600 text-white"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => act(s.id, "decline")}
                        className="px-3 py-1 rounded bg-gray-200"
                      >
                        Decline
                      </button>
                    </>
                  )}
                  {s.meet_link && (
                    <a
                      href={s.meet_link}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1 rounded bg-blue-600 text-white"
                    >
                      Join
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
