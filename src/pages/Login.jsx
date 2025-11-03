import { API } from "../lib/api";

export default function Login() {
  return (
    <main className="container-xxl py-16">
      <div className="mx-auto max-w-lg card p-10 text-center">
        <h1 className="text-2xl font-semibold">Welcome to MentorMatch</h1>
        <p className="text-gray-500 mt-2">Sign in with Google to continue</p>
        <button
          className="btn-solid w-full mt-6 py-3 rounded-xl"
          onClick={() => (window.location.href = `${API}/auth/google`)}
        >
          <span className="mr-2">🔐</span> Sign in with Google
        </button>
      </div>
    </main>
  );
}
