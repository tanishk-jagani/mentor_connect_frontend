import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useEffect, useState } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_BASE || "http://localhost:4000/api";

export default function AvailabilityManager() {
  const [events, setEvents] = useState([]);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data } = await axios.get(`${API}/availability/me`, {
      withCredentials: true,
    });
    setEvents(
      data.map((s) => ({
        id: s.id,
        title: "Available",
        start: s.start_time,
        end: s.end_time,
        backgroundColor: "#DCFCE7",
        borderColor: "#22C55E",
        textColor: "#14532D",
      }))
    );
  };

  useEffect(() => {
    load();
  }, []);

  const createSlot = async (selectInfo) => {
    setSaving(true);
    try {
      await axios.post(
        `${API}/availability`,
        {
          start_time: selectInfo.startStr,
          end_time: selectInfo.endStr,
        },
        { withCredentials: true }
      );
      await load();
    } finally {
      setSaving(false);
    }
  };

  const deleteSlot = async (clickInfo) => {
    const id = clickInfo.event.id;
    if (!id) return;
    if (!confirm("Delete this slot?")) return;
    await axios.delete(`${API}/availability/${id}`, { withCredentials: true });
    await load();
  };

  return (
    <div className="bg-white rounded-2xl shadow p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">Your Availability</h3>
        {saving && <span className="text-sm text-gray-500">Saving…</span>}
      </div>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        selectable
        selectMirror
        height="auto"
        allDaySlot={false}
        select={createSlot}
        events={events}
        eventClick={deleteSlot}
        slotMinTime="07:00:00"
        slotMaxTime="22:00:00"
      />
      <p className="text-sm text-gray-500 mt-3">
        Tip: drag on the calendar to create a slot; click a slot to delete.
      </p>
    </div>
  );
}
