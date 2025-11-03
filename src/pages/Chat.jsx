import { useContext, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { socket } from "../sockets/rtm";
import ReviewModal from "../components/ReviewModal";
import ReportModal from "../components/ReportModal";

const API = import.meta.env.VITE_API_BASE || "http://localhost:4000/api";

export default function Chat() {
  const { otherId } = useParams();
  const { user, loading } = useContext(AuthContext);

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollerRef = useRef(null);
  const [showReport, setShowReport] = useState(false);

  // Load chat history
  useEffect(() => {
    if (loading || !user) return;
    (async () => {
      const { data } = await axios.get(`${API}/chat/history/${otherId}`, {
        withCredentials: true,
      });
      setMessages(data);
      scrollToEnd();

      // ✅ Mark messages as seen
      socket.emit("message:seen", {
        sender_id: user.id,
        receiver_id: otherId,
      });
    })();
  }, [otherId, user, loading]);

  // Socket listeners
  useEffect(() => {
    if (loading || !user) return;

    socket.connect();
    socket.emit("join", user.id);

    const onReceive = (msg) => {
      const mine = msg.sender_id === user.id && msg.receiver_id === otherId;
      const theirs = msg.sender_id === otherId && msg.receiver_id === user.id;
      if (mine || theirs) {
        setMessages((prev) => [...prev, msg]);
        scrollToEnd();
      }
    };

    const onTypingStart = (sender_id) => {
      if (sender_id === otherId) setIsTyping(true);
    };

    const onTypingStop = (sender_id) => {
      if (sender_id === otherId) setIsTyping(false);
    };

    const onSeen = ({ from }) => {
      if (from === otherId) {
        setMessages((prev) =>
          prev.map((m) =>
            m.sender_id === user.id ? { ...m, read_at: new Date() } : m
          )
        );
      }
    };

    socket.on("receive_message", onReceive);
    socket.on("message_sent", onReceive);
    socket.on("typing:start", onTypingStart);
    socket.on("typing:stop", onTypingStop);
    socket.on("message:seen", onSeen);

    return () => {
      socket.off("receive_message", onReceive);
      socket.off("message_sent", onReceive);
      socket.off("typing:start", onTypingStart);
      socket.off("typing:stop", onTypingStop);
      socket.off("message:seen", onSeen);
      socket.disconnect();
    };
  }, [otherId, user, loading]);

  // Typing event debounce
  useEffect(() => {
    if (!user) return;
    if (!text.trim()) {
      socket.emit("typing:stop", { sender_id: user.id, receiver_id: otherId });
      return;
    }
    socket.emit("typing:start", { sender_id: user.id, receiver_id: otherId });

    const timeout = setTimeout(() => {
      socket.emit("typing:stop", { sender_id: user.id, receiver_id: otherId });
    }, 1500);
    return () => clearTimeout(timeout);
  }, [text]);

  const send = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setText("");
    await axios.post(
      `${API}/chat/send`,
      { receiver_id: otherId, text: trimmed },
      { withCredentials: true }
    );
  };

  const scrollToEnd = () => {
    requestAnimationFrame(() => scrollerRef.current?.scrollTo(0, 1e9));
  };

  if (loading) return null;

  return (
    <main className="max-w-4xl mx-auto py-6">
      <div className="border rounded-2xl overflow-hidden bg-white shadow">
        <div className="px-4 py-3 border-b flex items-center justify-between bg-gray-50">
          <div className="font-semibold text-gray-800">Chat</div>
          <button
            className="text-sm text-red-600 hover:underline"
            onClick={() => setShowReport(true)}
          >
            Report user
          </button>
        </div>
        <div
          ref={scrollerRef}
          className="h-[65vh] overflow-y-auto p-6 bg-white"
        >
          {messages.map((m) => {
            const mine = m.sender_id === user?.id;
            return (
              <div
                key={m.id}
                className={`mb-3 flex ${
                  mine ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[70%] px-3 py-2 rounded-2xl ${
                    mine
                      ? "bg-blue-600 text-white rounded-br-sm"
                      : "bg-gray-100 text-gray-900 rounded-bl-sm"
                  }`}
                >
                  {m.text}
                  {mine && m.read_at && (
                    <span className="ml-2 text-xs opacity-70">✓ Seen</span>
                  )}
                </div>
              </div>
            );
          })}
          {isTyping && (
            <div className="text-sm text-gray-500 italic">Typing...</div>
          )}
        </div>

        <div className="border-t bg-gray-50 p-3 flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Type message…"
            className="flex-1 h-11 rounded-xl border px-3 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
          <button
            className="h-11 px-5 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
            onClick={send}
          >
            Send
          </button>
        </div>
      </div>
      {showReport && (
        <ReportModal
          open={showReport}
          onClose={() => setShowReport(false)}
          targetId={otherId}
        />
      )}
    </main>
  );
}
