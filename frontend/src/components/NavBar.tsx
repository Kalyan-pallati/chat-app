import { Link, useNavigate } from "react-router-dom";
import { useAuthStore, type AuthState } from "../store/authStore";
import { MessageSquare, Users, LogOut } from "lucide-react";

export default function Navbar() {
  const { token, logout } = useAuthStore((state: AuthState) => state);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-xl text-emerald-400 hover:text-emerald-300 transition">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-slate-900">
              <MessageSquare className="w-5 h-5 fill-current" />
            </div>
            ChatApp
          </Link>

          {/* Navigation Links (Only if logged in) */}
          {token ? (
            <div className="flex items-center gap-6">
              
              <Link to="/find" className="flex items-center gap-2 text-slate-300 hover:text-white transition text-sm font-medium">
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Find Friends</span>
              </Link>

              <Link to="/chat" className="flex items-center gap-2 text-slate-300 hover:text-white transition text-sm font-medium">
                <MessageSquare className="w-4 h-4" />
                <span className="hidden sm:inline">Chats</span>
              </Link>

              {/* Divider */}
              <div className="h-6 w-px bg-slate-700 mx-2"></div>

              <button 
                onClick={handleLogout} 
                className="flex items-center gap-2 text-red-400 hover:text-red-300 transition text-sm font-medium"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            // Auth Buttons (If logged out)
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-slate-300 hover:text-white font-medium">Login</Link>
              <Link to="/signup" className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-medium transition">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}