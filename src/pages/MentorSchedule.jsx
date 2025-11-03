import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import axios from "axios";
import { useState } from "react";

export default function MentorSchedule() {
  const [selectedSlot, setSelectedSlot] = useState(null);

  const handleSelect = (info) => {
    const start = info.startStr;
    const end = info.endStr;

    setSelectedSlot({ start, end });

    axios.post("http://localhost:4000/api/availability", {
      mentor_id: localStorage.getItem("user_id"),
      start_time: start,
      end_time: end,
    }).then(() => {
      alert("✅ Availability Added!");
    });
  };

  return (
    <div className="container py-6">
      <h2 className="text-xl font-bold mb-4">Mentor Availability Calendar</h2>

      <FullCalendar
        selectable={true}
        select={handleSelect}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
      />
    </div>
  );
}
