// src/pages/LoginPage.jsx
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

const API = import.meta.env.VITE_API_BASE || "http://localhost:4000/api";

export default function LoginPage() {
  const navigate = useNavigate();
  const { user, loading, setUser, refresh } = useContext(AuthContext);

  const [mode, setMode] = useState("login"); // 'login' | 'signup'
  const [role, setRole] = useState("mentee");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // If already logged in, bounce based on context (no /auth/me here)
  useEffect(() => {
    if (loading || busy) return;
    if (!user) return;

    if (user.needsOnboarding) {
      navigate("/onboarding", { replace: true });
    } else if (user.role === "mentor") {
      navigate("/dashboard/mentor", { replace: true });
    } else if (user.role === "mentee") {
      navigate("/dashboard/mentee", { replace: true });
    }
  }, [user, loading, busy, navigate]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);

    try {
      const endpoint = mode === "signup" ? "signup" : "login";
      const payload =
        mode === "signup"
          ? {
              name: form.name,
              email: form.email,
              password: form.password,
              role,
            }
          : { email: form.email, password: form.password };

      const { data } = await axios.post(`${API}/auth/${endpoint}`, payload, {
        withCredentials: true,
      });

      // Server contract: { user, needsOnboarding, redirect }
      // if (data?.user) setUser(data.user); // optimistic: update context immediately
      if (data?.user) {
        // carry the onboarding flag into context so the effect can see it
        setUser({
          ...data.user,
          needsOnboarding: data.needsOnboarding === true,
        });
      }
      // If server instructed a redirect, follow it.
      if (data?.redirect) {
        navigate(data.redirect, { replace: true });
        return;
      }

      // Server may indicate onboarding either as top-level `needsOnboarding`
      // or nested inside `user.needsOnboarding`. Check both shapes.
      const needsOnboarding =
        data?.needsOnboarding ?? data?.user?.needsOnboarding ?? false;
      if (needsOnboarding) {
        navigate("/onboarding", { replace: true });
        return;
      }

      // Fallback: refresh once to sync session, then route by role or onboarding flag
      const refreshed = await refresh();
      const refreshedUser = refreshed ?? null;

      // If refreshed session says they still need onboarding, route there.
      if (
        refreshedUser?.needsOnboarding ||
        refreshedUser?.user?.needsOnboarding
      ) {
        navigate("/onboarding", { replace: true });
        return;
      }

      const roleNow =
        data?.user?.role ??
        refreshedUser?.role ??
        refreshedUser?.user?.role ??
        user?.role;
      if (roleNow === "mentor") {
        navigate("/dashboard/mentor", { replace: true });
      } else if (roleNow === "mentee") {
        navigate("/dashboard/mentee", { replace: true });
      } else {
        navigate("/onboarding", { replace: true });
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const google = () => {
    window.location.href = `${API}/auth/google?role=${role}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 via-white to-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6">
        <h1 className="text-2xl font-bold text-center mb-1">
          {mode === "signup" ? "Create your account" : "Welcome back"}
        </h1>
        <p className="text-center text-sm text-gray-500 mb-6">
          {mode === "signup"
            ? "Sign up with email or Google"
            : "Login with email or Google"}
        </p>

        <form onSubmit={onSubmit} className="space-y-3">
          {mode === "signup" && (
            <>
              <input
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Full name"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                required
              />
              <select
                className="w-full border rounded-lg px-3 py-2"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="mentee">Mentee</option>
                <option value="mentor">Mentor</option>
              </select>
            </>
          )}

          <input
            className="w-full border rounded-lg px-3 py-2"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            required
          />
          <input
            className="w-full border rounded-lg px-3 py-2"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) =>
              setForm((f) => ({ ...f, password: e.target.value }))
            }
            required
          />

          {error && <div className="text-red-600 text-sm">{error}</div>}

          <button
            type="submit"
            disabled={busy}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg disabled:opacity-60"
          >
            {busy ? "Please wait…" : mode === "signup" ? "Sign Up" : "Login"}
          </button>
        </form>

        <div className="flex items-center gap-2 my-4">
          <div className="h-px bg-gray-200 flex-1" />
          <span className="text-xs text-gray-400">OR</span>
          <div className="h-px bg-gray-200 flex-1" />
        </div>

        <button
          onClick={google}
          className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded-lg"
        >
          Continue with Google
        </button>

        <div className="text-center mt-4 text-sm">
          {mode === "signup" ? (
            <button
              onClick={() => setMode("login")}
              className="text-blue-600 hover:underline"
            >
              Already have an account? Login
            </button>
          ) : (
            <button
              onClick={() => setMode("signup")}
              className="text-blue-600 hover:underline"
            >
              New here? Create an account
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
