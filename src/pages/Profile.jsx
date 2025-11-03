import React, { useEffect, useMemo, useState, useContext, useRef } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { AuthContext } from "../context/AuthContext";
import {
  Edit,
  Save,
  X,
  Clock,
  Globe,
  Languages,
  Star,
  Briefcase,
  GraduationCap,
  Award,
  MessageSquare,
  CalendarClock,
  Eye,
  EyeOff,
  Tag,
  UserRound,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const API = import.meta.env.VITE_API_BASE || "http://localhost:4000/api";

/* ---------------- tiny helpers ---------------- */
const asArray = (v) =>
  Array.isArray(v)
    ? v
    : v
    ? String(v)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];
const validRole = (r) => (r === "mentor" || r === "mentee" ? r : "mentee");
const classJoin = (...c) => c.filter(Boolean).join(" ");
const safeParseJSON = (v) => {
  if (!v) return null;
  if (typeof v === "object") return v;
  try {
    return JSON.parse(v);
  } catch {
    return null;
  }
};
const profileSafeArray = (v) => {
  if (!v) return [];
  if (typeof v === "string") {
    try {
      const j = JSON.parse(v);
      return Array.isArray(j) ? j : [];
    } catch {
      return [];
    }
  }
  return Array.isArray(v) ? v : [];
};

/* Default avatar — crisp initials bubble */
function getInitials(name = "") {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  if (!parts.length) return "U";
  return parts.map((p) => p[0]?.toUpperCase() || "").join("");
}
function DefaultAvatar({ name, className = "" }) {
  const ii = getInitials(name);
  return (
    <div
      className={classJoin(
        "grid place-items-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold",
        className
      )}
    >
      <span className="text-xl">{ii}</span>
    </div>
  );
}

/* ---------------- Main ---------------- */
export default function Profile() {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [showChats, setShowChats] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const [toast, setToast] = useState(null);
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2200);
  };

  const userId = user?.id;

  useEffect(() => {
    if (!userId) return;
    (async () => {
      try {
        const { data } = await axios.get(`${API}/profile/${userId}`, {
          withCredentials: true,
        });
        const normalized = {
          ...data,
          hourly_rate: data.hourly_rate != null ? Number(data.hourly_rate) : 0,
          role: validRole(data.type || user.role),
          skills: asArray(data.skills),
          interests: asArray(data.interests),
          desired_skills: asArray(data.desired_skills),
          availability: safeParseJSON(data.availability) || {},
        };
        setProfile(normalized);
        setForm(normalized);
      } catch (e) {
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  const isMentor = useMemo(
    () => validRole(form?.role || profile?.role || user?.role) === "mentor",
    [form, profile, user]
  );

  const onChange = (name, value) => setForm((f) => ({ ...f, [name]: value }));

  const debouncedRef = useRef(null);
  const autosave = (payload) => {
    if (!editing) return;
    if (debouncedRef.current) clearTimeout(debouncedRef.current);
    debouncedRef.current = setTimeout(async () => {
      try {
        const wire = serializeForAPI(payload || form);
        await axios.put(`${API}/profile/${userId}`, wire, {
          withCredentials: true,
        });
        setProfile((p) => ({ ...p, ...payload }));
      } catch (e) {
        console.error(e);
        setError("Autosave failed");
      }
    }, 600);
  };

  const saveAll = async () => {
    setSaving(true);
    try {
      const wire = serializeForAPI(form);
      await axios.put(`${API}/profile/${userId}`, wire, {
        withCredentials: true,
      });
      setProfile(form);
      setEditing(false);
      showToast("Profile updated");
    } catch (e) {
      console.error(e);
      setError("Failed to save");
      showToast("Failed to save", "error");
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    setForm(profile);
    setEditing(false);
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto mt-16 px-4">
        <Skeleton />
      </div>
    );
  }
  if (!profile)
    return (
      <div className="max-w-6xl mx-auto mt-20 text-center text-red-500">
        Profile not found.
      </div>
    );

  return (
    <>
      <Navbar />

      <div className="max-w-6xl mx-auto mt-10 px-4 pb-16">
        {toast && (
          <div
            className={classJoin(
              "fixed top-4 left-1/2 -translate-x-1/2 z-50 rounded-lg px-4 py-2 shadow",
              toast.type === "error"
                ? "bg-red-600 text-white"
                : "bg-emerald-600 text-white"
            )}
          >
            {toast.msg}
          </div>
        )}

        {/* HEADER + BODY */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* MAIN */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border p-6">
            <div className="flex gap-5 items-start">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt="avatar"
                  className="w-24 h-24 rounded-full object-cover border"
                />
              ) : (
                <DefaultAvatar
                  name={profile.full_name || "User"}
                  className="w-24 h-24"
                />
              )}

              <div className="flex-1">
                {editing ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Input
                      label="Full name"
                      value={form.full_name || ""}
                      onChange={(v) => {
                        onChange("full_name", v);
                        autosave({ full_name: v });
                      }}
                    />
                    <Select
                      label="Role"
                      value={form.role}
                      onChange={(v) => {
                        onChange("role", v);
                        onChange("type", v);
                        autosave({ role: v, type: v });
                      }}
                      options={[
                        { label: "Mentor", value: "mentor" },
                        { label: "Mentee", value: "mentee" },
                      ]}
                    />
                    <Input
                      label="Headline"
                      value={form.headline || ""}
                      onChange={(v) => {
                        onChange("headline", v);
                        autosave({ headline: v });
                      }}
                    />
                    <Input
                      label="Location"
                      value={form.location || ""}
                      onChange={(v) => {
                        onChange("location", v);
                        autosave({ location: v });
                      }}
                    />
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3 flex-wrap">
                      <h1 className="text-2xl font-bold">
                        {profile.full_name || "Unnamed User"}
                      </h1>
                      <RoleBadge role={isMentor ? "mentor" : "mentee"} />
                    </div>
                    <p className="text-gray-600">
                      {profile.headline || (isMentor ? "Mentor" : "Mentee")}
                    </p>
                    <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600">
                      {profile.location && (
                        <Meta
                          icon={<Globe className="w-4 h-4" />}
                          text={profile.location}
                        />
                      )}
                      {profile.languages && (
                        <Meta
                          icon={<Languages className="w-4 h-4" />}
                          text={profile.languages}
                        />
                      )}
                      {profile.response_time && (
                        <Meta
                          icon={<Clock className="w-4 h-4" />}
                          text={`Responds in ${profile.response_time}`}
                        />
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Always visible action buttons (mobile-friendly) */}
              <div className="flex gap-2">
                {!editing ? (
                  <button
                    onClick={() => setEditing(true)}
                    className="btn-primary-outline"
                  >
                    <Edit className="w-4 h-4 mr-1" /> Edit
                  </button>
                ) : (
                  <>
                    <button
                      onClick={saveAll}
                      disabled={saving}
                      className="btn-primary"
                    >
                      <Save className="w-4 h-4 mr-1" />
                      {saving ? "Saving…" : "Save"}
                    </button>
                    <button onClick={cancelEdit} className="btn-ghost">
                      <X className="w-4 h-4 mr-1" /> Cancel
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* About */}
            <Section title="About">
              {editing ? (
                <Textarea
                  value={form.bio || ""}
                  onChange={(v) => {
                    onChange("bio", v);
                    autosave({ bio: v });
                  }}
                  placeholder="Tell us about your background..."
                />
              ) : (
                <p className="text-gray-700">{profile.bio || "No bio yet."}</p>
              )}
            </Section>

            {/* Tags: Mentor = Skills, Mentee = Interests */}
            <Section
              title={isMentor ? "Skills" : "Interests"}
              icon={<Tag className="w-4 h-4" />}
            >
              {editing ? (
                <TagsEditor
                  value={isMentor ? form.skills : form.interests}
                  onChange={(arr) => {
                    if (isMentor) {
                      onChange("skills", arr);
                      autosave({ skills: arr });
                    } else {
                      onChange("interests", arr);
                      autosave({ interests: arr });
                    }
                  }}
                  placeholder={
                    isMentor
                      ? "Add skill and press Enter"
                      : "Add interest and press Enter"
                  }
                />
              ) : (
                <Chips
                  items={(isMentor ? profile.skills : profile.interests) || []}
                />
              )}
            </Section>

            {/* Extra section for Mentee: Goals / Desired skills */}
            {!isMentor && (
              <Section title="Learning Goals">
                {editing ? (
                  <TagsEditor
                    value={form.desired_skills || []}
                    onChange={(arr) => {
                      onChange("desired_skills", arr);
                      autosave({ desired_skills: arr });
                    }}
                    placeholder="Add a skill you want to learn and press Enter"
                  />
                ) : (
                  <Chips items={profile.desired_skills || []} />
                )}
              </Section>
            )}

            {/* Experience */}
            <Section
              title="Experience"
              icon={<Briefcase className="w-4 h-4" />}
            >
              {editing ? (
                <ListEditor
                  value={profileSafeArray(form.experience)}
                  schema={[
                    { key: "title", placeholder: "Title" },
                    { key: "company", placeholder: "Company" },
                    { key: "years", placeholder: "Years (e.g. 2022–Present)" },
                    { key: "description", placeholder: "Description" },
                  ]}
                  onChange={(list) => {
                    onChange("experience", list);
                    autosave({ experience: list });
                  }}
                />
              ) : (
                <ListDisplay
                  items={profileSafeArray(profile.experience)}
                  fields={["title", "company", "years", "description"]}
                />
              )}
            </Section>

            {/* Education */}
            <Section
              title="Education"
              icon={<GraduationCap className="w-4 h-4" />}
            >
              {editing ? (
                <ListEditor
                  value={profileSafeArray(form.education)}
                  schema={[
                    { key: "degree", placeholder: "Degree" },
                    { key: "institution", placeholder: "Institution" },
                    { key: "year", placeholder: "Year" },
                  ]}
                  onChange={(list) => {
                    onChange("education", list);
                    autosave({ education: list });
                  }}
                />
              ) : (
                <ListDisplay
                  items={profileSafeArray(profile.education)}
                  fields={["degree", "institution", "year"]}
                />
              )}
            </Section>

            {/* Achievements */}
            <Section title="Achievements" icon={<Award className="w-4 h-4" />}>
              {editing ? (
                <SimpleListEditor
                  value={asArray(form.achievements)}
                  onChange={(list) => {
                    onChange("achievements", list);
                    autosave({ achievements: list });
                  }}
                />
              ) : (
                <ul className="list-disc ml-5 text-gray-700 space-y-1">
                  {asArray(profile.achievements).map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              )}
            </Section>

            {/* Reviews (placeholder) */}
            <Section title="Reviews">
              <ReviewList mentorId={userId} />
            </Section>
          </div>

          {/* SIDEBAR — diverges by role */}
          <div>
            <div className="bg-white rounded-2xl shadow-sm border p-6 sticky top-6">
              {isMentor ? (
                <>
                  {/* Mentor rate card */}
                  <div className="flex items-center justify-between">
                    {editing ? (
                      <Input
                        label="Hourly Rate (USD)"
                        type="number"
                        value={form.hourly_rate ?? ""}
                        onChange={(v) => {
                          const num = v === "" ? "" : Number(v);
                          onChange("hourly_rate", num);
                          autosave({ hourly_rate: num });
                        }}
                      />
                    ) : (
                      <div>
                        <div className="text-3xl font-bold">
                          {Number(profile.hourly_rate ?? 0)}
                        </div>
                        <div className="text-gray-500 text-sm">per hour</div>
                      </div>
                    )}
                    {/* <div className="text-yellow-600 flex items-center gap-1">
                    <Star className="w-5 h-5 fill-yellow-500" />
                    <span className="font-semibold">4.9</span>
                    <span className="text-gray-500 text-sm">(38)</span>
                  </div> */}
                  </div>

                  <div className="mt-4 grid gap-2">
                    <button
                      className="btn-primary"
                      onClick={() => navigate("/sessions")}
                    >
                      <CalendarClock className="w-4 h-4 mr-1" />
                      Schedule Session
                    </button>
                    <button
                      className="btn-ghost"
                      onClick={() => navigate("/messages")}
                    >
                      <MessageSquare className="w-4 h-4 mr-1" />
                      Send Message
                    </button>
                  </div>

                  {/* Meta */}
                  <div className="mt-6 space-y-2 text-sm text-gray-700">
                    {profile.languages && (
                      <Meta
                        icon={<Languages className="w-4 h-4" />}
                        text={profile.languages}
                      />
                    )}
                    {profile.timezone && (
                      <Meta
                        icon={<Globe className="w-4 h-4" />}
                        text={`Timezone: ${profile.timezone}`}
                      />
                    )}
                  </div>

                  {/* Visibility */}
                  <div className="mt-6">
                    <label className="text-sm text-gray-600">
                      Profile Visibility
                    </label>
                    {editing ? (
                      <Select
                        value={form.visibility || "public"}
                        onChange={(v) => {
                          onChange("visibility", v);
                          autosave({ visibility: v });
                        }}
                        options={[
                          { label: "Public", value: "public" },
                          { label: "Platform-only", value: "internal" },
                        ]}
                      />
                    ) : (
                      <div className="mt-1 inline-flex items-center text-gray-700">
                        {profile.visibility === "internal" ? (
                          <EyeOff className="w-4 h-4 mr-1" />
                        ) : (
                          <Eye className="w-4 h-4 mr-1" />
                        )}
                        {profile.visibility === "internal"
                          ? "Platform-only"
                          : "Public"}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  {/* Mentee quick panel */}
                  <div className="text-gray-700">
                    <div className="text-lg font-semibold mb-2">
                      What I’m learning
                    </div>
                    <Chips items={profile.desired_skills || []} />
                  </div>

                  <div className="mt-6 grid gap-2">
                    <button
                      className="btn-primary"
                      onClick={() => navigate("/messages")}
                    >
                      <MessageSquare className="w-4 h-4 mr-1" />
                      Send Messages
                    </button>
                  </div>

                  <div className="mt-6 space-y-2 text-sm text-gray-700">
                    {profile.languages && (
                      <Meta
                        icon={<Languages className="w-4 h-4" />}
                        text={profile.languages}
                      />
                    )}
                    {profile.timezone && (
                      <Meta
                        icon={<Globe className="w-4 h-4" />}
                        text={`Timezone: ${profile.timezone}`}
                      />
                    )}
                  </div>

                  {/* Visibility (mentees too) */}
                  <div className="mt-6">
                    <label className="text-sm text-gray-600">
                      Profile Visibility
                    </label>
                    {editing ? (
                      <Select
                        value={form.visibility || "public"}
                        onChange={(v) => {
                          onChange("visibility", v);
                          autosave({ visibility: v });
                        }}
                        options={[
                          { label: "Public", value: "public" },
                          { label: "Platform-only", value: "internal" },
                        ]}
                      />
                    ) : (
                      <div className="mt-1 inline-flex items-center text-gray-700">
                        {profile.visibility === "internal" ? (
                          <EyeOff className="w-4 h-4 mr-1" />
                        ) : (
                          <Eye className="w-4 h-4 mr-1" />
                        )}
                        {profile.visibility === "internal"
                          ? "Platform-only"
                          : "Public"}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </motion.div>

        <ChatsListModal
          open={showChats}
          onClose={() => setShowChats(false)}
          onStart={() => {
            setShowChats(false);
            // route that opens your chat composer / empty chat page:
            navigate("/chat");
          }}
        />
      </div>
    </>
  );
}

function ChatsListModal({ open, onClose, onStart }) {
  const [loading, setLoading] = useState(true);
  const [threads, setThreads] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    let stop = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        // Adjust endpoint if your backend differs:
        // Try common paths in order. Only first success populates.
        const tryPaths = [
          `${API}/chat/threads`,
          `${API}/conversations`,
          `${API}/messages/threads`,
        ];
        let data = [];
        for (const p of tryPaths) {
          try {
            const res = await axios.get(p, { withCredentials: true });
            if (res?.data) {
              data = res.data;
              break;
            }
          } catch {
            /* continue */
          }
        }
        if (!stop) setThreads(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!stop) setError("Failed to load chats");
      } finally {
        if (!stop) setLoading(false);
      }
    })();
    return () => {
      stop = true;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 grid place-items-center p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h3 className="font-semibold">Your conversations</h3>
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div className="p-5 max-h-[60vh] overflow-auto">
          {loading && <div className="text-sm text-gray-600">Loading…</div>}
          {!loading && error && (
            <div className="text-sm text-red-600">{error}</div>
          )}

          {!loading && !error && threads.length === 0 && (
            <div className="text-center py-10">
              <div className="text-4xl mb-2">💬</div>
              <div className="font-medium">No conversations yet</div>
              <p className="text-gray-600 text-sm mt-1">
                Start a conversation to connect with mentors and mentees.
              </p>
              <button className="btn-primary mt-4" onClick={onStart}>
                Start conversation
              </button>
            </div>
          )}

          {!loading && !error && threads.length > 0 && (
            <ul className="divide-y">
              {threads.map((t) => (
                <li
                  key={t.id}
                  className="py-3 flex items-center justify-between"
                >
                  <div>
                    <div className="font-medium">
                      {t.title ||
                        t.other_user?.name ||
                        t.other_user?.email ||
                        "Conversation"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {t.last_message_preview || "No messages yet"}
                    </div>
                  </div>
                  <button
                    className="btn-ghost"
                    onClick={() => {
                      // Common chat routes: /chat, /chat/:id, /chat?thread=...
                      // If you have a specific one, tweak here:
                      const url = t.id ? `/chat/${t.id}` : `/chat`;
                      window.location.href = url;
                    }}
                  >
                    Open
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="px-5 py-4 border-t flex justify-end">
          <button className="btn-ghost" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- UI atoms ---------------- */

function RoleBadge({ role }) {
  return (
    <span
      className={classJoin(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
        role === "mentor"
          ? "bg-blue-50 text-blue-700 border border-blue-100"
          : "bg-emerald-50 text-emerald-700 border border-emerald-100"
      )}
    >
      <UserRound className="w-3 h-3" />
      {role === "mentor" ? "Mentor" : "Mentee"}
    </span>
  );
}

function Section({ title, icon, children }) {
  return (
    <div className="mt-6 border rounded-xl p-5">
      <div className="flex items-center gap-2 mb-3">
        {icon} <h3 className="font-semibold">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function Meta({ icon, text }) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <span>{text}</span>
    </div>
  );
}

function Input({ label, value, onChange, type = "text", placeholder }) {
  return (
    <label className="text-sm w-full">
      <span className="text-gray-600">{label}</span>
      <input
        type={type}
        className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}

function Textarea({ value, onChange, placeholder }) {
  return (
    <textarea
      className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
      rows={4}
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  );
}

function TagsEditor({ value = [], onChange, placeholder }) {
  const [input, setInput] = useState("");
  const add = () => {
    const next = input.trim();
    if (!next) return;
    if (value.includes(next)) return setInput("");
    onChange([...(value || []), next]);
    setInput("");
  };
  const remove = (i) => onChange(value.filter((_, idx) => idx !== i));
  return (
    <div className="border rounded-lg p-2">
      <div className="flex flex-wrap gap-2 mb-2">
        {(value || []).map((t, i) => (
          <span
            key={i}
            className="px-2 py-1 rounded-full bg-blue-50 text-blue-700 text-xs border"
          >
            {t}
            <button className="ml-1 text-blue-700" onClick={() => remove(i)}>
              ×
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          className="flex-1 border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder={placeholder}
        />
        <button type="button" onClick={add} className="btn-ghost">
          Add
        </button>
      </div>
    </div>
  );
}

function Chips({ items = [] }) {
  if (!items.length) return <p className="text-gray-500">No items yet.</p>;
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((t, i) => (
        <span
          key={i}
          className="px-2 py-1 rounded-full bg-gray-100 text-gray-700 text-xs"
        >
          {t}
        </span>
      ))}
    </div>
  );
}

function ListEditor({ value = [], schema, onChange }) {
  const add = () =>
    onChange([
      ...(value || []),
      schema.reduce((o, f) => ({ ...o, [f.key]: "" }), {}),
    ]);
  const update = (idx, key, val) => {
    const next = [...value];
    next[idx] = { ...next[idx], [key]: val };
    onChange(next);
  };
  const remove = (idx) => onChange(value.filter((_, i) => i !== idx));

  return (
    <div className="space-y-3">
      {(value || []).map((row, idx) => (
        <div
          key={idx}
          className="grid grid-cols-1 md:grid-cols-4 gap-2 bg-gray-50 p-3 rounded-lg border"
        >
          {schema.map((f) => (
            <input
              key={f.key}
              className="border rounded-lg px-3 py-2"
              placeholder={f.placeholder}
              value={row[f.key] || ""}
              onChange={(e) => update(idx, f.key, e.target.value)}
            />
          ))}
          <div className="md:col-span-4 flex justify-end">
            <button
              className="text-red-600 text-sm"
              onClick={() => remove(idx)}
            >
              Remove
            </button>
          </div>
        </div>
      ))}
      <button className="btn-ghost" onClick={add}>
        + Add
      </button>
    </div>
  );
}

function SimpleListEditor({ value = [], onChange }) {
  const add = () => onChange([...(value || []), ""]);
  const update = (idx, val) => {
    const next = [...value];
    next[idx] = val;
    onChange(next);
  };
  const remove = (idx) => onChange(value.filter((_, i) => i !== idx));
  return (
    <div className="space-y-2">
      {(value || []).map((v, i) => (
        <div key={i} className="flex gap-2">
          <input
            className="flex-1 border rounded-lg px-3 py-2"
            value={v}
            onChange={(e) => update(i, e.target.value)}
          />
          <button className="text-red-600" onClick={() => remove(i)}>
            Remove
          </button>
        </div>
      ))}
      <button className="btn-ghost" onClick={add}>
        + Add
      </button>
    </div>
  );
}

function ListDisplay({ items = [], fields = [] }) {
  if (!items.length) return <p className="text-gray-500">No entries yet.</p>;
  return (
    <div className="space-y-3">
      {items.map((it, i) => (
        <div key={i} className="p-3 rounded-lg border bg-white">
          <div className="font-semibold">{it[fields[0]] || ""}</div>
          <div className="text-gray-600 text-sm">
            {[it[fields[1]], it[fields[2]]].filter(Boolean).join(" — ")}
          </div>
          {it[fields[3]] && (
            <p className="text-gray-700 mt-1 text-sm">{it[fields[3]]}</p>
          )}
        </div>
      ))}
    </div>
  );
}

function ReviewList({ mentorId }) {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!mentorId) return;
    let stop = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        // Try common endpoints; keep first that works
        const paths = [
          `${API}/reviews/mentor/${mentorId}`,
          `${API}/reviews?mentor_id=${mentorId}`,
        ];
        let data = [];
        for (const p of paths) {
          try {
            const { data: d } = await axios.get(p, { withCredentials: true });
            if (Array.isArray(d) || (d && Array.isArray(d.items))) {
              data = Array.isArray(d) ? d : d.items;
              break;
            }
          } catch {}
        }
        if (!stop) setItems(data || []);
      } catch (e) {
        if (!stop) setError("Failed to load reviews");
      } finally {
        if (!stop) setLoading(false);
      }
    })();
    return () => {
      stop = true;
    };
  }, [mentorId]);

  if (loading) return <div className="text-sm text-gray-600">Loading…</div>;
  if (error) return <div className="text-sm text-red-600">{error}</div>;
  if (!items.length)
    return <div className="text-gray-500">No reviews yet.</div>;

  // compute average for optional display
  const avg = (
    items.reduce((s, r) => s + (Number(r.rating) || 0), 0) / items.length
  ).toFixed(1);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-yellow-600">
        <Star className="w-5 h-5 fill-yellow-500" />
        <span className="font-semibold">{avg}</span>
        <span className="text-gray-500 text-sm">({items.length})</span>
      </div>
      {items.map((r) => (
        <div key={r.id} className="p-3 rounded-lg border bg-white">
          <div className="flex justify-between">
            <div>
              <div className="font-semibold">
                {r.reviewer_name || r.reviewer?.name || "Anonymous"}
              </div>
              <div className="text-gray-500 text-sm">
                {r.reviewer_role || ""}
              </div>
            </div>
            <div className="flex items-center gap-1 text-yellow-600">
              <Star className="w-4 h-4 fill-yellow-500" />
              <span className="font-semibold">
                {Number(r.rating || 0).toFixed(1)}
              </span>
              <span className="text-gray-500 text-sm">
                {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ""}
              </span>
            </div>
          </div>
          <p className="text-gray-700 mt-2 text-sm">{r.comment || r.text}</p>
        </div>
      ))}
    </div>
  );
}

function Skeleton() {
  return (
    <div className="animate-pulse grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white rounded-2xl border p-6 h-80" />
      <div className="bg-white rounded-2xl border p-6 h-80" />
    </div>
  );
}

/* Tailwind button utilities (kept) */
const baseBtn =
  "inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm";
const btnPrimary = "bg-blue-600 hover:bg-blue-700 text-white";
const btnGhost = "border hover:bg-gray-50";
const btnPrimaryOutline =
  "border border-blue-600 text-blue-700 hover:bg-blue-50";

const style = document.createElement("style");
style.innerHTML = `
.btn-primary{ ${tw(btnPrimary)} }
.btn-ghost{ ${tw(btnGhost)} }
.btn-primary-outline{ ${tw(btnPrimaryOutline)} }
`;
document.head.appendChild(style);

function tw(s) {
  return `
  ${baseBtn};
  ${s};
  transition: all .15s ease;
`.replace(/\n/g, "");
}

function Select({ label, value, onChange, options }) {
  return (
    <label className="text-sm w-full">
      {label && <span className="text-gray-600">{label}</span>}
      <select
        className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

/* Serialize for API the same way you did before */
function serializeForAPI(obj) {
  const o = { ...obj };
  if (o.hourly_rate !== "" && o.hourly_rate != null) {
    o.hourly_rate = Number(o.hourly_rate);
  }
  // turn arrays into CSVs where your API expects strings, and JSON for complex fields
  if (Array.isArray(o.skills)) o.skills = o.skills.join(", ");
  if (Array.isArray(o.interests)) o.interests = o.interests.join(", ");
  if (Array.isArray(o.desired_skills))
    o.desired_skills = o.desired_skills.join(", ");
  if (typeof o.availability === "object")
    o.availability = JSON.stringify(o.availability);
  return o;
}
