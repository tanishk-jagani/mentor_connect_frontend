import { useEffect, useState } from "react";
import axios from "axios";
import ReviewModal from "../components/ReviewModal";

const API = import.meta.env.VITE_API_BASE || "http://localhost:4000/api";

export default function MentorDetail({ mentorId }) {
  const [reviews, setReviews] = useState({ avg: 0, count: 0, items: [] });
  const [showReview, setShowReview] = useState(false);

  const load = async () => {
    const { data } = await axios.get(`${API}/reviews/mentor/${mentorId}`, {
      withCredentials: true,
    });
    setReviews(data);
  };

  useEffect(() => {
    load();
  }, [mentorId]);

  return (
    <section className="mt-8">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">Reviews</h3>
        <button
          className="px-3 py-2 bg-blue-600 text-white rounded-lg"
          onClick={() => setShowReview(true)}
        >
          Leave a review
        </button>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="text-yellow-500 text-xl">
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i}>{i < Math.round(reviews.avg || 0) ? "★" : "☆"}</span>
          ))}
        </div>
        <div className="text-sm text-gray-600">
          {reviews.count} review{reviews.count === 1 ? "" : "s"} • Avg{" "}
          {Number(reviews.avg || 0).toFixed(1)}
        </div>
      </div>

      <div className="space-y-3">
        {reviews.items.map((r) => (
          <div key={r.id} className="p-3 rounded-xl border bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img
                  src={r.mentee?.avatar || "https://via.placeholder.com/32"}
                  alt=""
                  className="w-8 h-8 rounded-full"
                />
                <div className="text-sm font-medium">
                  {r.mentee?.name || r.mentee?.email || "Mentee"}
                </div>
              </div>
              <div className="text-yellow-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i}>{i < Math.round(r.rating) ? "★" : "☆"}</span>
                ))}
              </div>
            </div>
            {r.comment && (
              <p className="text-sm text-gray-700 mt-2">{r.comment}</p>
            )}
            <div className="text-xs text-gray-400 mt-1">
              {new Date(r.createdAt).toLocaleString()}
            </div>
          </div>
        ))}
        {reviews.items.length === 0 && (
          <div className="text-sm text-gray-500">No reviews yet.</div>
        )}
      </div>

      {showReview && (
        <ReviewModal
          mentorId={mentorId}
          onClose={() => setShowReview(false)}
          onSaved={load}
        />
      )}
    </section>
  );
}
