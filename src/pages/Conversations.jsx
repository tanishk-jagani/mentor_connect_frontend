import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const API = import.meta.env.VITE_API_BASE || "http://localhost:4000/api";
const USER_ID = "f08e3802-c2d1-4604-9c12-a086e61e9d6a"; // mentee temp login

export default function Conversations() {
  const [list, setList] = useState([]);

  useEffect(() => {
    async function load() {
      const res = await axios.get(`${API}/match/suggestions/${USER_ID}`);
      setList(res.data);
    }
    load();
  }, []);

  return (
    <div className="max-w-3xl mx-auto py-10">
      <h1 className="text-3xl font-semibold mb-6">Your Mentors</h1>

      {list.length === 0 && <p className="text-gray-500">No matches yet.</p>}

      <div className="space-y-4">
        {list.map((m) => (
          <Link
            key={m.mentor_id}
            to={`/chat/${m.mentor_id}`}
            className="flex justify-between items-center p-4 border rounded-xl hover:shadow-md bg-white"
          >
            <div>
              <div className="text-lg font-semibold">{m.full_name}</div>
              <div className="text-gray-500 text-sm">{m.bio}</div>
            </div>

            <span className="text-sm bg-blue-600 text-white px-3 py-1 rounded-full">
              Match Score: {m.score}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
