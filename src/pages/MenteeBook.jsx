import { useEffect, useState } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_BASE || "http://localhost:4000/api";
const MENTEE_ID = "f08e3802-c2d1-4604-9c12-a086e61e9d6a"; // ✅ your mentee ID
const MENTOR_ID = "b4b2cc34-8648-4dd1-ac47-3b3311857e7d"; // ✅ same mentor ID

export default function MenteeBook() {
  const [slots, setSlots] = useState([]);

  useEffect(() => {
    async function load() {
      const res = await axios.get(`${API}/schedule/available/${MENTOR_ID}`);
      setSlots(res.data);
    }
    load();
  }, []);

  async function bookSlot(id) {
    await axios.post(`${API}/schedule/book`, {
      slot_id: id,
      mentee_id: MENTEE_ID
    });

    alert("🎉 Meeting booked!");
    window.location.reload();
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Available Times with Mentor</h1>

      {slots.length === 0 && <p className="text-gray-500">No available times yet.</p>}

      {slots.map(slot => (
        <div key={slot.id} className="flex justify-between border p-3 rounded-lg mb-2">
          <span>{new Date(slot.date).toLocaleString()}</span>
          <button
            onClick={() => bookSlot(slot.id)}
            className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
          >
            Book
          </button>
        </div>
      ))}
    </div>
  );
}
