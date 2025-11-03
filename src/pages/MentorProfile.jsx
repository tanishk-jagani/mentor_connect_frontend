// src/pages/MentorProfile.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { Star, Clock, Globe, CalendarDays, MessageSquare } from "lucide-react";
import MentorDetail from "./MentorDetail";

const API = import.meta.env.VITE_API_BASE || "http://localhost:4000/api";

// Simple inline SVG avatar (neutral, professional)
const DefaultAvatar = ({ className = "w-28 h-28" }) => (
  <svg
    viewBox="0 0 64 64"
    className={`${className} rounded-full bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-200`}
  >
    <circle cx="32" cy="24" r="14" fill="#e5e7eb" />
    <circle cx="32" cy="22" r="8" fill="#c7cdd6" />
    <path
      d="M10 56c2-11 10-18 22-18s20 7 22 18"
      fill="#e5e7eb"
      stroke="#d1d5db"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

// Formatters
const fmtDate = (d) =>
  new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date(d));

const fmtTime = (d) =>
  new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(d));

export default function MentorProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [mentor, setMentor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [slots, setSlots] = useState([]);
  const [booking, setBooking] = useState(null);
  const [notice, setNotice] = useState({ type: "", text: "" });

  // Normalize skills from CSV or array
  const skills = useMemo(() => {
    const raw = mentor?.skills;
    if (!raw) return [];
    if (Array.isArray(raw))
      return raw.filter(Boolean).map((s) => String(s).trim());
    return String(raw)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }, [mentor]);

  useEffect(() => {
    (async () => {
      try {
        const [profileRes, availRes] = await Promise.all([
          axios.get(`${API}/profile/${id}`, { withCredentials: true }),
          axios.get(`${API}/availability/${id}`),
        ]);
        setMentor(profileRes.data);
        setSlots(availRes.data || []);
      } catch (err) {
        console.error("❌ Error loading mentor:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const bookSlot = async (slotId) => {
    setNotice({ type: "", text: "" });
    try {
      setBooking(slotId);
      const slot = slots.find((s) => s.id === slotId);
      if (!slot) throw new Error("Slot not found");
      await axios.post(
        `${API}/sessions/book`,
        {
          mentor_id: id,
          start_time: slot.start_time,
          end_time: slot.end_time,
        },
        { withCredentials: true }
      );
      setSlots((prev) => prev.filter((s) => s.id !== slotId));
      setNotice({
        type: "success",
        text: "Session booked! Check it under My Sessions.",
      });
    } catch (e) {
      console.error("Booking failed:", e);
      setNotice({
        type: "error",
        text:
          e?.response?.data?.message ||
          "Unable to book this slot. Please try another.",
      });
    } finally {
      setBooking(null);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Loading…
      </div>
    );

  if (!mentor)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Mentor not found
      </div>
    );

  const rating = Number(mentor.rating || 0);
  const ratingCount = Number(mentor.review_count || 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 py-10 px-4 md:px-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* LEFT: Profile & content */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:col-span-2 bg-white border border-gray-100 rounded-2xl shadow-sm"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-start gap-6">
              {mentor?.user?.avatar ? (
                <img
                  src={mentor.user.avatar}
                  alt={mentor.full_name || "Mentor avatar"}
                  className="w-28 h-28 rounded-full object-cover border border-gray-200"
                />
              ) : (
                <DefaultAvatar />
              )}

              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {mentor.full_name ||
                      mentor.user?.name ||
                      mentor.user?.email}
                  </h1>
                  {rating > 0 && (
                    <span className="inline-flex items-center gap-1 text-sm text-amber-600">
                      <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                      {rating.toFixed(1)}
                      {ratingCount ? (
                        <span className="text-gray-400">({ratingCount})</span>
                      ) : null}
                    </span>
                  )}
                </div>

                <p className="text-gray-600">
                  {mentor.title || "Experienced Professional"}
                  {mentor.company ? (
                    <>
                      {" "}
                      at{" "}
                      <span className="font-medium text-gray-700">
                        {mentor.company}
                      </span>
                    </>
                  ) : null}
                </p>

                <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-500">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-4 h-4 text-blue-500" />
                    Responds in {mentor.response_time || "a few hours"}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Globe className="w-4 h-4 text-blue-500" />
                    {mentor.languages || "English"}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <CalendarDays className="w-4 h-4 text-blue-500" />
                    {mentor.timezone || "Timezone not set"}
                  </span>
                </div>

                {skills.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {skills.map((s, i) => (
                      <span
                        key={`${s}-${i}`}
                        className="px-3 py-1 rounded-full text-xs bg-blue-50 text-blue-700 border border-blue-100"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    onClick={() =>
                      document
                        .getElementById("available-slots")
                        ?.scrollIntoView({ behavior: "smooth", block: "start" })
                    }
                    className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition"
                  >
                    View Available Slots
                  </button>
                  <button
                    onClick={() => navigate(`/chat/${mentor.user_id}`)}
                    className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition inline-flex items-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Send Message
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* About */}
          {mentor.bio && (
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                About
              </h3>
              <p className="text-gray-700 leading-relaxed">{mentor.bio}</p>
            </div>
          )}

          {/* Available Slots */}
          <div id="available-slots" className="p-6 border-t border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Available Slots
            </h3>

            {notice.text ? (
              <div
                className={`mb-4 text-sm px-3 py-2 rounded-lg ${
                  notice.type === "success"
                    ? "bg-green-50 text-green-700 border border-green-100"
                    : "bg-amber-50 text-amber-700 border border-amber-100"
                }`}
              >
                {notice.text}
              </div>
            ) : null}

            {slots.length === 0 ? (
              <p className="text-gray-500 text-sm">
                No available slots right now. Please check back soon.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {slots.map((slot) => (
                  <div
                    key={slot.id}
                    className="flex items-center justify-between gap-3 p-3 rounded-xl border border-gray-200 bg-white hover:shadow-sm transition"
                  >
                    <div>
                      <div className="font-medium text-gray-900">
                        {fmtDate(slot.start_time)}
                      </div>
                      <div className="text-sm text-gray-600">
                        {fmtTime(slot.start_time)} – {fmtTime(slot.end_time)}
                      </div>
                    </div>
                    <button
                      onClick={() => bookSlot(slot.id)}
                      disabled={booking === slot.id}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-60"
                    >
                      {booking === slot.id ? "Booking…" : "Book Slot"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* (Optional) more sections like Experience / Education can remain as needed */}
          {Array.isArray(mentor.experience) && mentor.experience.length > 0 && (
            <div className="p-6 border-t border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Experience
              </h3>
              <div className="space-y-4">
                {mentor.experience.map((exp, i) => (
                  <div key={i} className="border-l-2 border-blue-200 pl-4">
                    <div className="font-medium text-gray-900">{exp.title}</div>
                    <div className="text-sm text-gray-500">
                      {exp.company} • {exp.years}
                    </div>
                    {exp.description && (
                      <p className="text-sm text-gray-600 mt-1">
                        {exp.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* RIGHT: Rate/Meta + details */}
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 h-fit"
        >
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">
              ${mentor.hourly_rate || 150}
              <span className="text-base font-medium text-gray-500">/hr</span>
            </div>
          </div>

          <div className="mt-6 space-y-2 text-sm text-gray-600">
            <p className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-500" />
              Languages: {mentor.languages || "English"}
            </p>
            <p className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-blue-500" />
              Availability: {mentor.availability_days || "Mon–Fri"}
            </p>
            <p className="flex items-center gap-2">
              🕓 Timezone: {mentor.timezone || "Not set"}
            </p>
          </div>

          <div className="mt-6">
            <MentorDetail mentorId={id} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
