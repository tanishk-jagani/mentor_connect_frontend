// client/src/pages/FindMentor.jsx
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Search, Star, MapPin, Briefcase, Clock, Info } from "lucide-react";
import MatchExplanationModal from "../components/MatchExplanationModal";
import Navbar from "../components/Navbar";

const API = import.meta.env.VITE_API_BASE || "http://localhost:4000/api";

export default function FindMentor() {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [onlyAvail, setOnlyAvail] = useState(false);
  const [explainId, setExplainId] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`${API}/match/suggestions`, {
          withCredentials: true,
        });
        setMentors(res.data || []);
      } catch (e) {
        console.error("Failed to load mentors:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (mentors || [])
      .filter((m) => (!onlyAvail ? true : m.has_availability === true))
      .filter((m) => {
        if (!q) return true;
        return (
          (m.full_name || "").toLowerCase().includes(q) ||
          (m.expertise || "").toLowerCase().includes(q) ||
          (m.bio || "").toLowerCase().includes(q) ||
          (m.skills || "").toLowerCase().includes(q)
        );
      });
  }, [mentors, search, onlyAvail]);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#F7F8FA]">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <header className="mb-8">
            <h1 className="text-4xl font-extrabold tracking-tight text-[#0F172A] text-center">
              Find Your Mentor
            </h1>
            <p className="text-center text-[#475569] mt-3">
              Smart suggestions based on your goals, interests, and
              availability.
            </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Results */}
            <section className="lg:col-span-8">
              {/* Search */}
              <div className="relative mb-6">
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, skill, expertise…"
                  className="w-full rounded-2xl bg-white pl-10 pr-4 py-3 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Loading state */}
              {loading && (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <SkeletonCard key={i} />
                  ))}
                </div>
              )}

              {/* Empty state */}
              {!loading && filtered.length === 0 && <EmptyState />}

              {/* Mentor list */}
              <div className="space-y-5">
                {filtered.map((m, idx) => (
                  <motion.article
                    key={m.mentor_id || m.user_id || idx}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition p-5"
                  >
                    <div className="flex items-start gap-4">
                      <Avatar src={m.user?.avatar} name={m.full_name} />

                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="text-lg font-semibold text-slate-900 leading-tight">
                              {m.full_name || "Unnamed Mentor"}
                            </h3>
                            <p className="text-sm text-slate-500 mt-0.5 flex items-center gap-2">
                              <span className="inline-flex items-center gap-1">
                                <Briefcase className="w-4 h-4" />
                                {m.title || "Mentor"}
                              </span>
                              {m.company ? (
                                <>
                                  <span>•</span>
                                  <span>{m.company}</span>
                                </>
                              ) : null}
                            </p>
                          </div>

                          <div className="text-right">
                            <p className="text-xs text-slate-500">Match</p>
                            <p className="text-xl font-bold text-blue-600">
                              {Math.round(m.score || 0)}
                            </p>
                          </div>
                        </div>

                        {/* Bio */}
                        {m.bio && (
                          <p className="text-sm text-slate-700 mt-3 line-clamp-2">
                            {m.bio}
                          </p>
                        )}

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mt-3">
                          {splitCSV(m.skills)
                            .slice(0, 4)
                            .map((t, i) => (
                              <Pill key={i} label={t} />
                            ))}
                          {splitCSV(m.interests)
                            .slice(0, 2)
                            .map((t, i) => (
                              <Pill key={`i-${i}`} label={t} tone="green" />
                            ))}
                        </div>

                        {/* Meta row */}
                        <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-slate-600">
                          <Meta
                            icon={<Star className="w-4 h-4" />}
                            text={`${m.rating || "4.9"} avg`}
                          />
                          {m.city && (
                            <Meta
                              icon={<MapPin className="w-4 h-4" />}
                              text={m.city}
                            />
                          )}
                          <Meta
                            icon={<Clock className="w-4 h-4" />}
                            text={
                              m.has_availability
                                ? "Has upcoming slots"
                                : "No slots listed"
                            }
                            muted={!m.has_availability}
                          />
                        </div>

                        {/* Actions */}
                        <div className="mt-4 flex flex-wrap items-center gap-3">
                          <button
                            onClick={() => setExplainId(m.id)}
                            className="inline-flex items-center justify-center px-4 py-2 rounded-xl border border-blue-600 text-blue-600 hover:bg-blue-50 text-sm font-medium"
                          >
                            <Info className="w-4 h-4 mr-1.5" />
                            View Match Details
                          </button>

                          <Link
                            to={`/mentor/${m.id}`}
                            className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold"
                          >
                            View Profile
                          </Link>
                        </div>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>
            </section>

            {/* Right: Filters */}
            <aside className="lg:col-span-4">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h4 className="text-sm font-semibold text-slate-900">
                  Filters
                </h4>
                <div className="mt-4 space-y-3">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={onlyAvail}
                      onChange={(e) => setOnlyAvail(e.target.checked)}
                    />
                    <span className="text-sm text-slate-700">
                      Only mentors with upcoming availability
                    </span>
                  </label>
                  {/* You can add more filters here later (price, timezone, language) */}
                </div>
              </div>
            </aside>
          </div>
        </div>

        {explainId && (
          <MatchExplanationModal
            mentorId={explainId}
            onClose={() => setExplainId(null)}
          />
        )}
      </div>
    </>
  );
}

/* ----------------------------- helpers ----------------------------- */

function splitCSV(v) {
  if (!v) return [];
  if (Array.isArray(v)) return v;
  return String(v)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function Avatar({ src, name }) {
  const initials =
    (name || "")
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2) || "M";
  return src ? (
    <img
      src={src}
      alt={name}
      className="w-14 h-14 rounded-full object-cover border border-gray-200"
    />
  ) : (
    <div className="w-14 h-14 rounded-full flex items-center justify-center bg-indigo-100 text-indigo-700 font-semibold border border-gray-200">
      {initials}
    </div>
  );
}

function Pill({ label, tone = "blue" }) {
  const tones = {
    blue: "bg-blue-50 text-blue-700",
    green: "bg-emerald-50 text-emerald-700",
    gray: "bg-gray-100 text-gray-700",
  };
  return (
    <span className={`px-2.5 py-1 text-xs rounded-full ${tones[tone]}`}>
      {label}
    </span>
  );
}

function Meta({ icon, text, muted = false }) {
  return (
    <span
      className={`inline-flex items-center gap-1 ${
        muted ? "text-slate-400" : "text-slate-600"
      }`}
    >
      {icon}
      {text}
    </span>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-full bg-gray-200" />
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-40" />
          <div className="h-3 bg-gray-200 rounded w-24 mt-2" />
          <div className="h-3 bg-gray-200 rounded w-3/4 mt-4" />
          <div className="flex gap-2 mt-4">
            <div className="h-6 w-20 bg-gray-200 rounded-full" />
            <div className="h-6 w-20 bg-gray-200 rounded-full" />
            <div className="h-6 w-16 bg-gray-200 rounded-full" />
          </div>
          <div className="h-9 w-36 bg-gray-200 rounded-xl mt-4" />
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
      <h3 className="text-lg font-semibold text-slate-900">
        No mentors match your search
      </h3>
      <p className="text-sm text-slate-500 mt-1">
        Try broadening your keywords, or turn off filters.
      </p>
    </div>
  );
}
