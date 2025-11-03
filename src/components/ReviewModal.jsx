import { useState } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_BASE || "http://localhost:4000/api";

export default function ReviewModal({ mentorId, onClose, onSaved }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const submit = async () => {
    setErr("");

    if (!mentorId) {
      setErr("Missing mentor id.");
      return;
    }
    if (!Number(rating)) {
      setErr("Please choose a rating.");
      return;
    }

    setBusy(true);
    try {
      await axios.post(
        `${API}/reviews`,
        { mentor_id: mentorId, rating: Number(rating), comment },
        { withCredentials: true }
      );
      onSaved?.();
      onClose();
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to submit review");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold">Leave Feedback</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="mb-4">
          <div className="flex gap-1 text-2xl">
            {[1, 2, 3, 4, 5].map((i) => (
              <button
                key={i}
                type="button"
                onClick={() => setRating(i)}
                className={i <= rating ? "text-yellow-500" : "text-gray-300"}
                aria-label={`Rate ${i}`}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        <textarea
          placeholder="What went well? Anything to improve?"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full border rounded-lg p-3 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-200"
          rows={4}
        />

        {err && <div className="text-sm text-red-600 mb-2">{err}</div>}

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border">
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={busy}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-60"
          >
            {busy ? "Saving..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}
