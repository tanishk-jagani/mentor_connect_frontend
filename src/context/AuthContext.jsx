// src/context/AuthContext.jsx
import React, {
  createContext,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_BASE || "http://localhost:4000/api";

export const AuthContext = createContext({
  user: null,
  loading: true,
  refresh: async () => {},
  setUser: () => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // { id, email, role, needsOnboarding, ... }
  const [loading, setLoading] = useState(true);
  const didInit = useRef(false); // prevent StrictMode double fetch in dev

  // ONE place to fetch the session
  const refresh = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API}/auth/me`, {
        withCredentials: true,
      });
      setUser(data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (didInit.current) return; // StrictMode guard
    didInit.current = true;
    refresh();
  }, [refresh]);

  const logout = useCallback(async () => {
    try {
      await axios.post(`${API}/auth/logout`, {}, { withCredentials: true });
    } catch (err) {
      console.error("❌ Logout failed:", err);
    } finally {
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, refresh, logout }}>
      {!loading ? (
        children
      ) : (
        <div className="min-h-screen flex items-center justify-center text-gray-500">
          Loading…
        </div>
      )}
    </AuthContext.Provider>
  );
};
