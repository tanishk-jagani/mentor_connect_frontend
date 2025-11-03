import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import axios from "axios";
import { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_BASE || "http://localhost:4000/api";

export default function MentorAvailabilityCalendar() {
  const [events, setEvents] = useState([]);

  const load = async () => {
    try {
      const { data } = await axios.get(`${API}/availability/slots/me`, {
        withCredentials: true,
      });
      setEvents(
        data.map((s) => ({
          id: s.id,
          start: s.start_time,
          end: s.end_time,
          title: s.status === "available" ? "Available" : "Booked",
          backgroundColor: s.status === "available" ? "#cfe8ff" : "#f8d7da",
          borderColor: s.status === "available" ? "#007bff" : "#dc3545",
          extendedProps: { status: s.status },
        }))
      );
    } catch (err) {
      console.error("Failed to load availability:", err);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // 🟢 1. When dragging over a range
  const handleSelect = async (info) => {
    console.log("✅ select fired", info);
    if (!window.confirm(`Add slot from ${info.startStr} to ${info.endStr}?`))
      return;

    try {
      await axios.post(
        `${API}/availability/slots`,
        {
          start_time: info.startStr,
          end_time: info.endStr,
        },
        { withCredentials: true }
      );
      await load();
    } catch (err) {
      console.error(err);
      alert("Failed to create slot.");
    }
  };

  // 🟢 2. When single-clicking a cell (adds 1-hour slot)
  const handleDateClick = async (info) => {
    console.log("✅ dateClick fired", info);
    const start = new Date(info.date);
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    if (!window.confirm(`Create 1-hour slot at ${start.toLocaleString()}?`))
      return;

    try {
      await axios.post(
        `${API}/availability/slots`,
        {
          start_time: start.toISOString(),
          end_time: end.toISOString(),
        },
        { withCredentials: true }
      );
      await load();
    } catch (err) {
      console.error(err);
      alert("Failed to create slot.");
    }
  };

  // 🟢 3. When clicking an event
  const handleEventClick = async (clickInfo) => {
    console.log("✅ eventClick fired", clickInfo.event);
    const status = clickInfo.event.extendedProps?.status;
    if (status !== "available") {
      alert("Cannot delete booked slots.");
      return;
    }
    if (!window.confirm("Delete this slot?")) return;

    try {
      await axios.delete(`${API}/availability/slots/${clickInfo.event.id}`, {
        withCredentials: true,
      });
      await load();
    } catch (err) {
      console.error(err);
      alert("Failed to delete slot.");
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-xl font-semibold mb-2">My Availability</h2>
      <p className="text-sm text-gray-500 mb-4">
        Drag to create a slot, click empty space to create 1-hour slot, click on
        an existing slot to delete it.
      </p>

      <FullCalendar
        plugins={[timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        selectable={true}
        selectMirror={true}
        select={handleSelect}
        dateClick={handleDateClick}
        eventClick={handleEventClick}
        events={events}
        allDaySlot={false}
        nowIndicator={true}
        height="auto"
        slotMinTime="07:00:00"
        slotMaxTime="22:00:00"
      />
    </div>
  );
}
