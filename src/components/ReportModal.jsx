import { useState } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_BASE || "http://localhost:4000/api";

export default function ReportModal({ open, onClose, targetId, messageId }) {
  const [reason, setReason] = useState("Harassment");
  const [details, setDetails] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  if (!open) return null;

  const submit = async () => {
    try {
      setBusy(true);
      await axios.post(
        `${API}/reports`,
        { target_id: targetId, reason, details, message_id: messageId || null },
        { withCredentials: true }
      );
      setDone(true);
      setTimeout(onClose, 1200);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Report user</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {done ? (
          <div className="text-green-600 font-medium">
            Report submitted. Thank you.
          </div>
        ) : (
          <>
            <label className="text-sm block mb-2">
              <span className="text-gray-600">Reason</span>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="mt-1 w-full border rounded-lg px-3 py-2"
              >
                <option>Harassment</option>
                <option>Spam</option>
                <option>Scam / Fraud</option>
                <option>Hate Speech</option>
                <option>Other</option>
              </select>
            </label>

            <label className="text-sm block">
              <span className="text-gray-600">Details (optional)</span>
              <textarea
                rows={4}
                className="mt-1 w-full border rounded-lg px-3 py-2"
                placeholder="Add any relevant context or quotes…"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
              />
            </label>

            <div className="mt-4 flex justify-end gap-2">
              <button className="btn-ghost" onClick={onClose}>
                Cancel
              </button>
              <button className="btn-primary" disabled={busy} onClick={submit}>
                {busy ? "Submitting…" : "Submit report"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
