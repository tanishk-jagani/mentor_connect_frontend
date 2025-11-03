import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import axios from "axios";

const API = import.meta.env.VITE_API_BASE || "http://localhost:4000/api";
const MENTOR_ID = "b4b2cc34-8648-4dd1-ac47-3b3311857e7d"; // ✅ Tiara

export default function Availability() {

  const handleSelect = async (info) => {
    await axios.post(`${API}/availability/add`, {
      mentor_id: MENTOR_ID,
      start_time: info.startStr,
      end_time: info.endStr,
    });
    alert("✅ Time Slot Saved");
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Set Your Availability</h1>

      <FullCalendar
        plugins={[timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        selectable={true}
        select={handleSelect}
      />
    </div>
  );
}
