import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { useAuthStore, type AuthState } from "../store/authStore";

interface Friend {
  id: number;
  username: string;
  full_name: string;
  profile_picture: string | null;
}

interface ChatSidebarProps {
  onSelectFriend: (friend: Friend) => void;
  selectedFriendId?: number;
}

export default function ChatSidebar({ onSelectFriend, selectedFriendId }: ChatSidebarProps) {
  const token = useAuthStore((state: AuthState) => state.token);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/users/friends/friends`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setFriends(data);
        }
      } catch (err) {
        console.error("Failed to load friends", err);
      }
    };
    fetchFriends();
  }, [token]);

  // Filter friends by search
  const filteredFriends = friends.filter((f) =>
    f.full_name?.toLowerCase().includes(search.toLowerCase()) || 
    f.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-80 bg-slate-800 border-r border-slate-700 flex flex-col h-full">
      <div className="p-4 border-b border-slate-700">
        <h2 className="text-xl font-bold text-white mb-4">Chats</h2>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search friends..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-700 text-white pl-10 pr-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredFriends.length === 0 ? (
           <p className="text-slate-500 text-center mt-10 text-sm">No friends found</p>
        ) : (
          filteredFriends.map((friend) => (
            <div
              key={friend.id}
              onClick={() => onSelectFriend(friend)}
              className={`p-3 flex items-center gap-3 cursor-pointer hover:bg-slate-700 transition-colors ${
                selectedFriendId === friend.id ? "bg-slate-700 border-l-4 border-emerald-500" : ""
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-slate-600 flex-shrink-0 overflow-hidden">
                {friend.profile_picture ? (
                    <img src={friend.profile_picture} alt={friend.username} className="w-full h-full object-cover"/>
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300 font-bold">
                        {friend.username[0].toUpperCase()}
                    </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-medium truncate">
                    {friend.full_name || friend.username}
                </h3>
                <p className="text-slate-400 text-xs truncate">Click to chat</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}