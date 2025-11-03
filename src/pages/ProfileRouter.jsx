import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import MentorProfile from "./MentorProfile";
import MenteeProfile from "./MenteeProfile";

const API = import.meta.env.VITE_API_BASE || "http://localhost:4000/api";

export default function ProfileRouter() {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      try {
        const { data } = await axios.get(`${API}/profile/${user.id}`, {
          withCredentials: true,
        });
        setProfile(data);
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center text-gray-600">
        Loading profile…
      </div>
    );

  if (!profile)
    return (
      <div className="flex min-h-screen items-center justify-center text-red-500">
        Profile not found.
      </div>
    );

  const role = (profile.type || user?.role || "").toLowerCase();

  return role === "mentor" ? (
    <MentorProfile profile={profile} />
  ) : (
    <MenteeProfile profile={profile} />
  );
}
