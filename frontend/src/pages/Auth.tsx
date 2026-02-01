import { useState, useEffect } from "react"; // 👈 Added useEffect
import { useNavigate } from "react-router-dom";
import { useAuthStore, type AuthState } from "../store/authStore";
import { Eye, EyeOff } from "lucide-react";

export default function Auth() {
  const login = useAuthStore((state: AuthState) => state.login);
  const token = useAuthStore((state: AuthState) => state.token); // 👈 Get the token
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  // 👈 NEW: Check for existing session on mount
  useEffect(() => {
    if (token) {
      navigate("/find");
    }
  }, [token, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const endpoint = isLogin ? "/auth/login" : "/auth/signup";
    const payload = isLogin
      ? { username, password }
      : { username, email, password };

    try {
      const res = await fetch(`http://localhost:8000${endpoint}`, {
        body: JSON.stringify(payload),
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Authentication Failed");
      }
      login(data.access_token);
      navigate("/find");
    } catch (err: any) {
      setError(err.message || "Something went wrong"); // Fixed error type handling
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
      <div className="bg-slate-800 p-8 rounded-lg shadow-xl w-80 border border-slate-700">
        <h2 className="text-2xl font-bold mb-6 text-emerald-400 text-center">
          {isLogin ? "Log In" : "Sign Up"}
        </h2>
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm p-2 rounded mb-4 text-center">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-slate-400 text-sm mb-1">
              Username
            </label>
            <input
              type="text"
              className="w-full p-2 rounded bg-slate-700 border border-slate-600 focus:border-emerald-500 focus:outline-none transition-colors"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-slate-400 text-sm mb-1">Email</label>
              <input
                type="email"
                className="w-full p-2 rounded bg-slate-700 border border-slate-600 focus:border-emerald-500 focus:outline-none transition-colors"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          )}

          <div>
            <label className="block text-slate-400 text-sm mb-1">
              Password
            </label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full p-2 rounded bg-slate-700 border border-slate-600 focus:border-emerald-500 focus:outline-none transition-colors"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-400 transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <Eye className="w-5 h-5" />
                ) : (
                  <EyeOff className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
          <button
            type="submit"
            className="w-full p-2 rounded bg-emerald-600 hover:bg-emerald-500 font-bold transition-colors"
          >
            {isLogin ? "Login" : "Create Account"}
          </button>
        </form>
        <div className="mt-6 text-center text-sm text-slate-400">
          {isLogin ? "New Here?" : "Already have an account?"}

          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
            }}
            className="pl-1 text-emerald-400 hover:text-emerald-300 hover:underline font-medium cursor-pointer"
          >
            {isLogin ? "Signup" : "Login"}
          </button>
        </div>
      </div>
    </div>
  );
}