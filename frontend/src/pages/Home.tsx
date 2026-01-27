import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white">
      <h1 className="text-4xl font-bold mb-4">Real-Time Chat App</h1>
      <p className="mb-6 text-slate-400">
        Fast. Secure. Real-time messaging.
      </p>
      <Link to="/auth" className="px-6 py-2 bg-blue-600 rounded">
        Get Started
      </Link>
    </div>
  );
}
