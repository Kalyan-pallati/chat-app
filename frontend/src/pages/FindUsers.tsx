import { useState } from "react";
import { useAuthStore, type AuthState } from "../store/authStore";
import { Search, UserPlus, MessageSquare } from "lucide-react";

interface UserProfile {
  id: number;
  username: string;
  email: string;
  allow_stranger_dms: boolean;
  friendship_status: "stranger" | "friends" | "request_sent" | "request_received";
}

export default function FindUsers() {
  const token = useAuthStore((state: AuthState) => state.token);
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<UserProfile | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const searchUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch(`http://localhost:8000/users/${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!res.ok) throw new Error("User not found");
      
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError("No Users Found");
    } finally {
      setLoading(false);
    }
  };

  const sendRequest = async () => {
    if (!result) return;
    try {
      const res = await fetch(`http://localhost:8000/users/friends/request/${result.username}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        // Update UI locally to show "Sent" immediately
        setResult({ ...result, friendship_status: "request_sent" });
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="h-screen bg-slate-900 text-white p-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Search className="w-6 h-6 text-emerald-400" /> Find Friends
        </h1>

        <form onSubmit={searchUser} className="flex gap-2 mb-8">
          <input
            type="text"
            placeholder="Enter username..."
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

        {result && (
          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 shadow-xl flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">{result.username}</h2>
              <p className="text-slate-400 text-sm">{result.email}</p>
            </div>

            <div className="flex gap-2">
              
              {result.friendship_status === "friends" && (
                <button className="bg-blue-600 p-2 rounded hover:bg-blue-500" title="Chat">
                  <MessageSquare className="w-5 h-5" />
                </button>
              )}

              {result.friendship_status === "request_sent" && (
                <span className="bg-slate-700 text-slate-400 px-3 py-2 rounded text-sm font-medium">
                  Request Sent
                </span>
              )}

              {result.friendship_status === "request_received" && (
                <span className="bg-emerald-900 text-emerald-400 px-3 py-2 rounded text-sm font-medium border border-emerald-500/50">
                  Check Inbox
                </span>
              )}

              {result.friendship_status === "stranger" && (
                <button 
                  onClick={sendRequest}
                  className="bg-emerald-600 p-2 rounded hover:bg-emerald-500 flex items-center gap-1" 
                  title="Add Friend"
                >
                  <UserPlus className="w-5 h-5" /> 
                  <span className="text-sm font-bold ml-1">Add</span>
                </button>
              )}

              {result.friendship_status === "stranger" && result.allow_stranger_dms && (
                 <button className="bg-blue-600 p-2 rounded hover:bg-blue-500" title="Message Request">
                   <MessageSquare className="w-5 h-5" />
                 </button>
              )}

            </div>
          </div>
        )}
      </div>
    </div>
  );
}