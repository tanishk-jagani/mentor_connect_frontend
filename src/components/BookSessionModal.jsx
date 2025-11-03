import { useEffect, useState } from "react";
import axios from "axios";
const API = import.meta.env.VITE_API_BASE || "http://localhost:4000/api";

export default function BookSessionModal({ mentorId, onClose, onBooked }) {
  const [slots, setSlots] = useState([]);
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await axios.get(`${API}/availability/${mentorId}`);
      setSlots(data);
    })();
  }, [mentorId]);

  const book = async () => {
    if (!selected) return;
    setBusy(true);
    try {
      await axios.post(
        `${API}/sessions/book`,
        {
          availability_id: selected.id,
          mentor_id: mentorId,
          note,
        },
        { withCredentials: true }
      );
      onBooked?.();
      onClose();
    } catch (e) {
      alert(e?.response?.data?.message || "Failed to book");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-5 w-full max-w-lg">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold">Select a time</h3>
          <button onClick={onClose}>✕</button>
        </div>

        {slots.length === 0 ? (
          <p className="text-gray-500">No upcoming slots. Try again later.</p>
        ) : (
          <ul className="space-y-2 max-h-64 overflow-y-auto">
            {slots.map((s) => {
              const start = new Date(s.start_time);
              const end = new Date(s.end_time);
              const label = `${start.toLocaleString()} → ${end.toLocaleTimeString()}`;
              const active = selected?.id === s.id;
              return (
                <li key={s.id}>
                  <button
                    onClick={() => setSelected(s)}
                    className={`w-full text-left px-3 py-2 rounded-lg border ${
                      active
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {label}
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        <textarea
          placeholder="Share context or goals (optional)…"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="mt-3 w-full border rounded-lg p-2"
          rows={3}
        />

        <div className="flex justify-end gap-2 mt-3">
          <button className="px-4 py-2 rounded-lg border" onClick={onClose}>
            Cancel
          </button>
          <button
            className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-60"
            onClick={book}
            disabled={!selected || busy}
          >
            {busy ? "Booking…" : "Book"}
          </button>
        </div>
      </div>
    </div>
  );
}
