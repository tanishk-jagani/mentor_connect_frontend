import { useState } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_BASE || "http://localhost:4000/api";

export default function AuthModal({ initialRole = "mentee", onClose }) {
  const [isSignup, setIsSignup] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: initialRole, // mentor | mentee
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const endpoint = isSignup ? "signup" : "login";
      const { data: user } = await axios.post(`${API}/auth/${endpoint}`, form, {
        withCredentials: true,
      });
      // role-based redirect
      if (user.role === "mentor") window.location.href = "/dashboard/mentor";
      else window.location.href = "/dashboard/mentee";
    } catch (err) {
      setError(err?.response?.data?.message || "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const continueWithGoogle = () => {
    // Use selected role in the modal
    window.location.href = `${API}/auth/google?role=${form.role}`;
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold">
            {isSignup ? "Create your account" : "Welcome back"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          {isSignup && (
            <>
              <input
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Full name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
              <select
                className="w-full border rounded-lg px-3 py-2"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
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
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />

          <input
            className="w-full border rounded-lg px-3 py-2"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />

          {error && <div className="text-red-600 text-sm">{error}</div>}

          <button
            type="submit"
            disabled={busy}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg disabled:opacity-60"
          >
            {busy ? "Please wait…" : isSignup ? "Sign Up" : "Login"}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-2 my-2">
            <div className="h-px bg-gray-200 flex-1" />
            <span className="text-xs text-gray-400">OR</span>
            <div className="h-px bg-gray-200 flex-1" />
          </div>

          {/* Google */}
          <button
            type="button"
            onClick={continueWithGoogle}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded-lg"
          >
            Continue with Google
          </button>

          {/* Switch */}
          <div className="text-center text-sm">
            {isSignup ? (
              <button
                type="button"
                onClick={() => setIsSignup(false)}
                className="text-blue-600 hover:underline"
              >
                Already have an account? Login
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsSignup(true)}
                className="text-blue-600 hover:underline"
              >
                New here? Create an account
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
