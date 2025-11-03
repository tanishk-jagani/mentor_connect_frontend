import { useEffect, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import axios from "axios";

const API = import.meta.env.VITE_API_BASE || "http://localhost:4000/api";

export default function Schedule() {
  const calendarRef = useRef(null);

  const handleDateSelect = async (selectInfo) => {
    const title = prompt("Enter event title:");
    if (title) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.addEvent({
        id: new Date().toISOString(),
        title,
        start: selectInfo.startStr,
        end: selectInfo.endStr,
        allDay: selectInfo.allDay,
      });

      // Save to backend (optional)
      try {
        await axios.post(`${API}/schedule/book`, {
          title,
          start: selectInfo.startStr,
          end: selectInfo.endStr,
        });
      } catch (err) {
        console.error("Error saving event:", err);
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-10 px-5">
      <h1 className="text-3xl font-bold mb-6 text-center">
        📅 Mentor / Mentee Schedule
      </h1>

      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        selectable={true}
        select={handleDateSelect}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        height="auto"
      />
    </div>
  );
}
