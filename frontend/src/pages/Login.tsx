import { useState, useEffect } from "react"; // 
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore, type AuthState } from "../store/authStore";
import { Eye, EyeOff} from "lucide-react";

export default function Login() {
  const login = useAuthStore((state: AuthState) => state.login);
  const token = useAuthStore((state: AuthState) => state.token); 
  const navigate = useNavigate();

  const [error, setError] = useState("");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);


  useEffect(() => {
    if (token) {
      navigate("/chat");
    }
  }, [token, navigate]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      let res;
        res = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Authentication Failed");

      login(data.access_token);
      navigate("/chat");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white p-4">

      <div className="bg-slate-800 p-8 rounded-lg shadow-xl w-full max-w-md border border-slate-700">
        <h2 className="text-2xl font-bold mb-6 text-emerald-400 text-center">
          Welcome Back!
        </h2>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm p-3 rounded mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-slate-400 text-sm mb-1">Username</label>
            <input
              type="text"
              className="w-full p-2 rounded bg-slate-700 border border-slate-600 focus:border-emerald-500 outline-none"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-slate-400 text-sm mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full p-2 rounded bg-slate-700 border border-slate-600 focus:border-emerald-500 outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-400"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full p-3 rounded bg-emerald-600 hover:bg-emerald-500 font-bold transition-colors mt-6"
          >
            Login
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-400">
          New Here?
          <Link to="/signup" className="pl-2 hover:underline font-bold text-emerald-400">Signup</Link>
        </div>
      </div>
    </div>
  );
}