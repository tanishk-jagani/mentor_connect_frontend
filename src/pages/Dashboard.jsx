import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { API } from "../lib/api";

const MENTEE_ID = "f08e3802-c2d1-4604-9c12-a086e61e9d6a";

export default function Dashboard() {
  const [mentors, setMentors] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(`${API}/match/suggestions/${MENTEE_ID}`);
        setMentors(data);
      } catch (e) {
        console.log(e);
      }
    })();
  }, []);

  return (
    <main className="container-xxl py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Recommended Mentors For You</h1>
        <p className="text-gray-500 mt-1">Based on your interests & goals</p>
      </div>

      {mentors.length === 0 && (
        <div className="card p-8 text-gray-500">No mentors matched yet. Add more interests in your profile.</div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {mentors.map((m) => (
          <article key={m.mentor_id} className="card p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-brand-500 text-white grid place-items-center font-semibold">
                {m.full_name?.[0]?.toUpperCase() || "M"}
              </div>
              <div>
                <h3 className="font-semibold">{m.full_name || "Mentor"}</h3>
                <p className="text-sm text-gray-500 line-clamp-1">{m.bio || "—"}</p>
              </div>
            </div>

            <div className="mt-4">
              <span className="badge bg-brand-50 text-brand-700 border border-brand-100">
                ⭐ Match Score: {m.score}
              </span>
            </div>

            <div className="mt-5 flex gap-2">
              <Link to={`/chat/${m.mentor_id}`} className="btn-solid px-4 py-2 rounded-xl flex-1 text-center">
                Chat
              </Link>
              <Link to={`/schedule?mentor=${m.mentor_id}`} className="btn-ghost px-4 py-2 rounded-xl flex-1 text-center">
                Book
              </Link>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
