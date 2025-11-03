import { useEffect, useState } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_BASE || "http://localhost:4000/api";

export default function MatchExplanationModal({ mentorId, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!mentorId) return;
    (async () => {
      try {
        const res = await axios.get(`${API}/match/explain/${mentorId}`, {
          withCredentials: true,
        });
        setData(res.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load explanation");
      } finally {
        setLoading(false);
      }
    })();
  }, [mentorId]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>

        {loading ? (
          <div className="text-center text-gray-600">Loading...</div>
        ) : error ? (
          <div className="text-red-500 text-center">{error}</div>
        ) : (
          <>
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              Match Breakdown
            </h2>
            <p className="text-gray-600 text-sm mb-4">
              <strong>{data.mentor_name}</strong> — Score:{" "}
              <span className="font-semibold text-blue-600">{data.score}</span>
            </p>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {data.reasons.map((r, idx) => (
                <div
                  key={idx}
                  className="flex justify-between text-sm bg-gray-50 px-3 py-2 rounded"
                >
                  <span className="text-gray-700">
                    {r.k.replace(/_/g, " ")}
                  </span>
                  <span className="text-gray-900 font-semibold">
                    +{r.w.toFixed(1)}
                  </span>
                </div>
              ))}
            </div>

            <p className="mt-4 text-xs text-gray-500">
              * Scores are weighted by tag overlap, experience, timezone, and
              availability.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
