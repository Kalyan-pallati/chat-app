import { useState } from "react";
import { useAuthStore, type AuthState } from "../store/authStore";
import { Search, UserPlus, MessageSquare } from "lucide-react";
import Navbar from "../components/NavBar";
import UserProfileModal from "../components/UserProfileModal";
import { useNavigate } from "react-router-dom";

interface UserProfile {
  id: number;
  username: string;
  email: string;
  full_name: string;
  bio: string;
  gender: string;
  profile_picture: string | null;
  allow_stranger_dms: boolean;
  friendship_status:
    | "stranger"
    | "friends"
    | "request_sent"
    | "request_received"
    | "self";
}

export default function FindUsers() {
  const token = useAuthStore((state: AuthState) => state.token);
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserProfile[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [viewingUser, setViewingUser] = useState<UserProfile | null>(null);

  const searchUsers = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError("");
    setResults([]);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/users/search?q=${query}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error();

      const data = await res.json();
      setResults(data);

      if (data.length === 0) {
        setError("No Users Found");
      }
    } catch {
      setError("No Users Found");
    } finally {
      setLoading(false);
    }
  };

  const sendRequest = async (username: string) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/users/friends/request/${username}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.ok) {
        setResults((prev) =>
          prev.map((user) =>
            user.username === username
              ? { ...user, friendship_status: "request_sent" }
              : user
          )
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      <Navbar />

      {viewingUser && (
        <UserProfileModal
          user={viewingUser}
          onClose={() => setViewingUser(null)}
        />
      )}

      <div className="flex-1 p-4 sm:p-8">
        <div className="max-w-md mx-auto">
          <h1 className="text-xl sm:text-2xl font-bold mb-6 flex items-center gap-2">
            <Search className="w-6 h-6 text-emerald-400" />
            Find Friends
          </h1>

          <form onSubmit={searchUsers} className="flex gap-2 mb-8">
            <input
              type="text"
              placeholder="Search username..."
              className="flex-1 bg-slate-800 border border-slate-700 rounded p-2 focus:border-emerald-500 outline-none"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded font-bold"
              disabled={loading}
            >
              {loading ? "..." : "Search"}
            </button>
          </form>

          {error && (
            <div className="bg-red-500/10 text-red-400 p-3 rounded border border-red-500/20 text-center">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {results.map((user) => (
              <div
                key={user.id}
                onClick={() => setViewingUser(user)}
                className="bg-slate-800 p-4 rounded-lg border border-slate-700 shadow-xl flex items-center justify-between cursor-pointer hover:bg-slate-700 transition-colors group gap-3"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-14 h-14 rounded-full bg-slate-700 border-2 border-slate-600 overflow-hidden">
                    {user.profile_picture ? (
                      <img
                        src={user.profile_picture}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-slate-400 text-xl">
                        {user.username[0].toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="truncate">
                    <h2 className="text-lg font-bold group-hover:text-emerald-400 transition-colors truncate">
                      {user.full_name || user.username}
                    </h2>
                    <p className="text-slate-400 text-sm truncate">
                      @{user.username}
                    </p>
                  </div>
                </div>

                <div
                  className="flex gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  {user.friendship_status === "friends" && (
                    <button onClick={() => navigate('/chat', {state : {preselectedUser: user}})}
                    className="bg-blue-600 p-2 rounded hover:bg-blue-500">
                      <MessageSquare className="w-5 h-5" />
                    </button>
                  )}

                  {user.friendship_status === "request_sent" && (
                    <span className="bg-slate-700 text-slate-400 px-3 py-2 rounded text-sm">
                      Requested
                    </span>
                  )}

                  {user.friendship_status === "request_received" && (
                    <span className="bg-emerald-900 text-emerald-400 px-3 py-2 rounded text-sm border border-emerald-500/50">
                      Check Inbox
                    </span>
                  )}

                  {user.friendship_status === "stranger" && (
                    <button
                      onClick={() => sendRequest(user.username)}
                      className="bg-emerald-600 p-2 rounded hover:bg-emerald-500"
                    >
                      <UserPlus className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}