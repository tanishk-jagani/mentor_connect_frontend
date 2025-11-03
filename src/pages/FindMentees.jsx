// /client/src/pages/FindMentee.jsx
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";

const API = import.meta.env.VITE_API_BASE || "http://localhost:4000/api";

export default function FindMentee() {
  const [items, setItems] = useState([]);
  const [raw, setRaw] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [activeCats, setActiveCats] = useState(new Set());

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(
          `${API}/match/suggestions?for=mentees&limit=24`,
          {
            withCredentials: true,
          }
        );
        setRaw(data || []);
      } catch (e) {
        console.error("Failed to fetch mentee suggestions", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const categoriesUniverse = useMemo(() => {
    const bag = new Set();
    for (const it of raw) {
      String(it.categories || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .forEach((c) => bag.add(c));
    }
    return Array.from(bag).sort();
  }, [raw]);

  useEffect(() => {
    const needle = q.trim().toLowerCase();
    const filtered = raw.filter((m) => {
      const hitsText =
        (m.full_name || "").toLowerCase().includes(needle) ||
        (m.headline || "").toLowerCase().includes(needle) ||
        (m.bio || "").toLowerCase().includes(needle) ||
        (m.help_areas || "").toLowerCase().includes(needle) ||
        (m.interests || "").toLowerCase().includes(needle);

      const catOK =
        activeCats.size === 0 ||
        String(m.categories || "")
          .split(",")
          .map((s) => s.trim())
          .some((c) => activeCats.has(c));

      return hitsText && catOK;
    });
    setItems(filtered);
  }, [q, raw, activeCats]);

  const toggleCat = (c) => {
    const next = new Set(activeCats);
    if (next.has(c)) next.delete(c);
    else next.add(c);
    setActiveCats(next);
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-50 py-10 px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 text-center mb-2">
            Suggested Mentees
          </h1>
          <p className="text-center text-gray-600 mb-8">
            Ranked by alignment with your expertise and preferences.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between mb-6">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name, interest, help area…"
              className="w-full sm:w-[420px] border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          {categoriesUniverse.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {categoriesUniverse.map((c) => {
                const on = activeCats.has(c);
                return (
                  <button
                    key={c}
                    onClick={() => toggleCat(c)}
                    className={`px-3 py-1 rounded-full text-sm border ${
                      on
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700"
                    }`}
                  >
                    {c}
                  </button>
                );
              })}
              {activeCats.size > 0 && (
                <button
                  onClick={() => setActiveCats(new Set())}
                  className="px-3 py-1 rounded-full text-sm border bg-white text-gray-700"
                >
                  Clear
                </button>
              )}
            </div>
          )}

          {loading ? (
            <div className="text-center text-gray-500">Loading mentees…</div>
          ) : items.length === 0 ? (
            <div className="text-center text-gray-500">
              No matching mentees yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
              {items.map((m, i) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="bg-white rounded-2xl shadow hover:shadow-lg border border-gray-100 p-5"
                >
                  <div className="flex gap-4 items-center mb-3">
                    <img
                      src={m.avatar || "https://via.placeholder.com/80"}
                      alt={m.full_name}
                      className="w-14 h-14 rounded-full border"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">
                        {m.full_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {m.headline || "Mentee"}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500">Match</div>
                      <div className="text-lg font-bold text-blue-600">
                        {m.score}
                      </div>
                    </div>
                  </div>

                  {m.bio && (
                    <p className="text-sm text-gray-700 line-clamp-3 mb-3">
                      {m.bio}
                    </p>
                  )}

                  <div className="mb-2">
                    <div className="text-xs text-gray-500 mb-1">Help Areas</div>
                    <div className="flex flex-wrap gap-2">
                      {String(m.help_areas || "")
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean)
                        .slice(0, 6)
                        .map((s, idx) => (
                          <span
                            key={idx}
                            className="bg-amber-50 text-amber-700 text-xs px-2 py-1 rounded-full"
                          >
                            {s}
                          </span>
                        ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="text-xs text-gray-500 mb-1">Interests</div>
                    <div className="flex flex-wrap gap-2">
                      {String(m.interests || "")
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean)
                        .slice(0, 6)
                        .map((s, idx) => (
                          <span
                            key={idx}
                            className="bg-green-50 text-green-700 text-xs px-2 py-1 rounded-full"
                          >
                            {s}
                          </span>
                        ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600">
                      {m.timezone || "Timezone N/A"}
                    </span>
                    <a
                      href={`/mentee/${m.id}`}
                      className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                      View Profile
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
