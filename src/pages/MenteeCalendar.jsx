import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import axios from "axios";

const API = import.meta.env.VITE_API_BASE || "http://localhost:4000/api";

// ✅ Your mentee ID
const MENTEE_ID = "f08e3802-c2d1-4604-9c12-a086e61e9d6a";

// ✅ Mentor ID you are booking with
const MENTOR_ID = "b4b2cc34-8648-4dd1-ac47-3b3311857e7d";

export default function MenteeCalendar() {
  const [events, setEvents] = useState([]);

  // Load mentor's available slots
  useEffect(() => {
    async function load() {
      const res = await axios.get(`${API}/schedule/available/${MENTOR_ID}`);
      const slots = res.data.map(slot => ({
        id: slot.id,
        title: "Available Slot",
        start: slot.date,
        end: slot.date, // FullCalendar auto handles 1hr display
      }));
      setEvents(slots);
    }
    load();
  }, []);

  // Book a time when clicked
  async function handleEventClick(info) {
    const slot_id = info.event.id;

    if (!confirm("Book this time slot?")) return;

    await axios.post(`${API}/schedule/book`, { slot_id, mentee_id: MENTEE_ID });

    alert("✅ Session booked successfully!");

    info.event.remove(); // Remove from UI after booking
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4 text-center">
        Book a Session
      </h1>

      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        selectable={false}
        events={events}
        eventClick={handleEventClick}
        height="100vh"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
      />
    </div>
  );
}
