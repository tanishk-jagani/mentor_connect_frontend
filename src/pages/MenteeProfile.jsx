import { useContext, useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { AuthContext } from "../context/AuthContext";
import {
  BookOpen,
  Calendar,
  Globe,
  MessageSquare,
  Target,
  UserRound,
  GraduationCap,
  Heart,
} from "lucide-react";

const API = import.meta.env.VITE_API_BASE || "http://localhost:4000/api";

export default function MenteeProfile() {
  const { id } = useParams();
  const nav = useNavigate();
  const { user } = useContext(AuthContext);

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      try {
        const { data } = await axios.get(`${API}/profile/${id}`, {
          withCredentials: true,
        });
        if (!cancelled) setProfile(data);
      } catch (e) {
        console.error(e);
        if (!cancelled) setNotFound(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading mentee profile…
      </div>
    );

  if (notFound || !profile)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center">
        <div className="text-2xl font-semibold">Mentee not found</div>
        <button
          onClick={() => nav(-1)}
          className="px-4 py-2 rounded-lg bg-gray-800 text-white hover:bg-gray-900"
        >
          Go Back
        </button>
      </div>
    );

  const avatar =
    profile.avatar || profile.user?.avatar || "https://via.placeholder.com/150";
  const name = profile.full_name || profile.user?.name || "Unnamed Mentee";
  const bio = profile.bio || "This mentee hasn’t added a bio yet.";
  const goals = profile.goals || "Not specified.";
  const location = profile.location || "Unknown";
  const timezone = profile.timezone || "Not provided";

  const interests = (profile.interests || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const desiredSkills = (profile.desired_skills || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const education = (() => {
    try {
      return Array.isArray(profile.education)
        ? profile.education
        : JSON.parse(profile.education || "[]");
    } catch {
      return [];
    }
  })();

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto mt-10 mb-16 px-4"
    >
      {/* Header Card */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="p-6 sm:p-10 flex flex-col sm:flex-row gap-6 items-center sm:items-start">
          <img
            src={avatar}
            alt={name}
            className="w-28 h-28 rounded-full object-cover border-4 border-green-100"
          />
          <div className="flex-1 w-full">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                  {name}
                  <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                    <UserRound className="w-3 h-3" /> Mentee
                  </span>
                </h1>
                <p className="text-gray-500 mt-1">
                  {profile.headline ||
                    "Aspiring learner looking for mentorship"}
                </p>
              </div>
              <div className="flex gap-3">
                {user?.role === "mentor" && (
                  <Link
                    to={`/chat/${profile.user_id || profile.id}`}
                    className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4" /> Message
                  </Link>
                )}
                <button
                  onClick={() => nav(-1)}
                  className="px-4 py-2 rounded-xl border border-gray-300 hover:bg-gray-50"
                >
                  Back
                </button>
              </div>
            </div>

            <p className="mt-4 text-gray-700 leading-relaxed">{bio}</p>

            {/* Quick Info */}
            <div className="mt-5 flex flex-wrap gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                {location}
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {timezone}
              </div>
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div className="px-6 sm:px-10 pb-10 grid grid-cols-1 md:grid-cols-2 gap-6">
          <DetailCard
            title="Learning Goals"
            icon={<Target className="w-4 h-4" />}
            content={goals}
          />
          <DetailCard
            title="Interests"
            icon={<Heart className="w-4 h-4" />}
            tags={interests}
          />
          <DetailCard
            title="Desired Skills"
            icon={<BookOpen className="w-4 h-4" />}
            tags={desiredSkills}
          />
          <DetailCard
            title="Education"
            icon={<GraduationCap className="w-4 h-4" />}
            list={education.map((e) => ({
              label: `${e.degree || ""}`,
              sub: `${e.institution || ""} (${e.year || ""})`,
            }))}
          />
        </div>
      </div>
    </motion.div>
  );
}

function DetailCard({ title, icon, content, tags, list }) {
  return (
    <div className="p-5 rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center gap-2 mb-2 text-gray-700 font-semibold">
        {icon} {title}
      </div>
      {content && <p className="text-gray-700 text-sm">{content}</p>}
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {tags.map((t, i) => (
            <span
              key={i}
              className="bg-blue-50 text-blue-700 text-xs px-3 py-1 rounded-full border border-blue-100"
            >
              {t}
            </span>
          ))}
        </div>
      )}
      {list && list.length > 0 && (
        <ul className="mt-2 space-y-1 text-sm text-gray-700">
          {list.map((l, i) => (
            <li key={i}>
              <b>{l.label}</b>
              <div className="text-gray-500 text-xs">{l.sub}</div>
            </li>
          ))}
        </ul>
      )}
      {!content && !tags?.length && !list?.length && (
        <p className="text-gray-500 text-sm italic">Not added yet.</p>
      )}
    </div>
  );
}
