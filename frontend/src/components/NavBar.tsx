
import { MessageSquare, Users, UserPlus, UserCircle } from "lucide-react";
import { useEffect, useState } from "react";
import MyProfileModal from "./MyProfileModal";
import { useAuthStore, type AuthState } from "../store/authStore";
import { Link } from "react-router-dom";

export default function Navbar() {
  const token = useAuthStore((state: AuthState) => state.token);

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (!token) return;
    const fetchMe = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setCurrentUser(data);
        }
      } catch (err) {
        console.error("Failed to fetch user for Navbar", err);
      }
    };
    fetchMe();
  }, [token]);

  useEffect(() => {
    if (!token) {
      return;
    }
    const fetchPendingRequests = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/users/friends/requests/pending`, {
                headers: { Authorization: `Bearer ${token}`},
            })
            const data = await res.json();
            setPendingCount(data.length);
        }
        catch(err){
            console.error("Failed to load Requests");
        } finally{
        }
        
    }
    fetchPendingRequests();
  }, [token]);

  return (
    <nav className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-xl text-emerald-400 hover:text-emerald-300 transition">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-slate-900">
              <MessageSquare className="w-5 h-5 fill-current" />
            </div>
            Relay
          </Link>

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

              <Link to="/requests" className="relative flex items-center gap-2 text-slate-300 hover:text-white transition text-sm font-medium">
                <UserPlus className="w-4 h-4" />
                <span className="hidden sm:inline">Requests</span>
                {pendingCount > 0 && (
                  <span className="absolute -top-2 -right-3 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full shadow-md">
                    {pendingCount}
                  </span>
                )}
              </Link>

              {/* Divider */}
              <div className="h-6 w-px bg-slate-700 mx-2"></div>
              
              <button 
                onClick={() => setShowProfileModal(true)}
                className="flex items-center gap-2 text-slate-300 hover:text-emerald-400 transition"
              >
                {currentUser?.profile_picture ? (
                  <img src={currentUser.profile_picture} className="w-8 h-8 rounded-full object-cover border border-slate-600" />
                ) : (
                  <UserCircle className="w-6 h-6" />
                )}
                <span className="hidden sm:block font-medium">{currentUser?.username || "Profile"}</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-slate-300 hover:text-white font-medium">Login</Link>
              <Link to="/signup" className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-medium transition">
                Sign Up
              </Link>
            </div>
          )}
        </div>
        {showProfileModal && currentUser && (
        <MyProfileModal 
          currentUser={currentUser} 
          onClose={() => setShowProfileModal(false)} 
          onProfileUpdate={(updatedUser) => setCurrentUser(updatedUser)} 
        />
      )}
      </div>
    </nav>
  );
}