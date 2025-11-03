import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import axios from "axios";
import { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_BASE || "http://localhost:4000/api";

export default function BookingCalendar({ mentorId }) {
  const [events, setEvents] = useState([]);
  const load = async () => {
    const { data } = await axios.get(
      `${API}/availability/slots/of/${mentorId}`
    );
    setEvents(
      data.map((s) => ({
        start: s.start_time,
        end: s.end_time,
        title: "Book",
        extendedProps: { start_time: s.start_time, end_time: s.end_time },
        backgroundColor: "#e1fce6",
        borderColor: "#22c55e",
      }))
    );
  };
  useEffect(() => {
    load();
  }, [mentorId]);

  const onSelect = async (click) => {
    const { start_time, end_time } = click.event.extendedProps;
    if (!confirm(`Book ${new Date(start_time).toLocaleString()}?`)) return;
    await axios
      .post(
        `${API}/sessions/book`,
        {
          mentor_id: mentorId,
          start_time,
          end_time,
        },
        { withCredentials: true }
      )
      .then(() => alert("Request sent!"));
    await load();
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow">
      <h3 className="font-semibold mb-2">Available Slots</h3>
      <FullCalendar
        plugins={[timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        events={events}
        eventClick={onSelect}
        height="auto"
        slotMinTime="07:00:00"
        slotMaxTime="22:00:00"
      />
    </div>
  );
}
