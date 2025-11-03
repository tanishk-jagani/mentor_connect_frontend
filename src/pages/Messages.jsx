// /client/src/pages/Messages.jsx (sidebar with conversations)
import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

const API = import.meta.env.VITE_API_BASE || "http://localhost:4000/api";

export default function Messages() {
  const { user, loading } = useContext(AuthContext);
  const [conversations, setConversations] = useState([]);
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!user) return; // RequireAuth should gate this page

    (async () => {
      try {
        const { data } = await axios.get(`${API}/chat/conversations`, {
          withCredentials: true,
        });
        setConversations(data);
      } finally {
        setBusy(false);
      }
    })();
  }, [user, loading]);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-full max-w-md border-r bg-white p-4 overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">Messages</h2>

        {busy && <div className="text-gray-500">Loading…</div>}
        {!busy && conversations.length === 0 && (
          <div className="text-gray-500">No chats yet.</div>
        )}

        {conversations.map((item) => (
          <Link
            to={`/chat/${item.other_user_id}`}
            key={item.other_user_id}
            className="block p-3 border rounded-xl hover:bg-blue-50 mb-2 transition"
          >
            <div className="flex items-center gap-3">
              <img
                src={item.avatar || "https://via.placeholder.com/40"}
                alt=""
                className="w-10 h-10 rounded-full"
              />
              <div className="min-w-0">
                <div className="font-medium text-gray-800">{item.name}</div>
                <div className="text-gray-600 text-sm truncate">
                  {item.last_message || "Start conversation →"}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Right side placeholder */}
      <div className="hidden md:flex flex-1 items-center justify-center text-gray-400">
        Select a conversation to chat
      </div>
    </div>
  );
}
