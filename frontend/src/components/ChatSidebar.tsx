import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { useAuthStore, type AuthState } from "../store/authStore";
import { formatSidebarTime } from "../utils/formatSidebar";

interface Friend {
  id: number;
  username: string;
  email: string;
  full_name: string;
  bio: string;
  gender: string;
  allow_stranger_dms: boolean;
  profile_picture: string | null;
  last_message_time: string | null;
  last_message_content: string | null;
  unread_count: number;
}

interface ChatSidebarProps {
  onSelectFriend: (friend: Friend) => void;
  selectedFriendId?: number;
  refreshTrigger?: number; 
}

export default function ChatSidebar({ onSelectFriend, selectedFriendId, refreshTrigger }: ChatSidebarProps) {
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
  }, [token, refreshTrigger]);

  useEffect(() => {
    if (!token) return;

    const ws = new WebSocket(`${import.meta.env.VITE_WS_URL}/chat/ws/${token}`);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      // If the message is a READ signal, clear the badges
      if (data.type === "READ_UPDATE") {
         setFriends((prevFriends) => 
            prevFriends.map(f => 
                f.id === data.reader_id ? { ...f, unread_count: 0 } : f
            )
         );
         return;
      }

      // If it's a normal message, we need to update the sidebar!
      if (data.sender_id && data.content) {
        setFriends((prevFriends) => {
          
          // 1. Check if the message is from the friend we currently have open
          // If so, we don't increase the unread count because we are looking at it!
          const isCurrentlyOpen = selectedFriendId === data.sender_id;

          const updatedFriends = prevFriends.map((friend) => {
            if (friend.id === data.sender_id || friend.id === data.receiver_id) {
              const shouldIncrementUnread = data.sender_id === friend.id && !isCurrentlyOpen;

              return {
                ...friend,
                last_message_content: data.content,
                last_message_time: data.timestamp || new Date().toISOString(),
                unread_count: shouldIncrementUnread ? (friend.unread_count || 0) + 1 : friend.unread_count
              };
            }
            return friend;
          });

          // 3. Sort the array so the person who just texted jumps to the top!
          return updatedFriends.sort((a, b) => {
             const timeA = new Date(a.last_message_time || 0).getTime();
             const timeB = new Date(b.last_message_time || 0).getTime();
             return timeB - timeA;
          });
          
        });
      }
    };

    return () => {
      ws.close();
    };
  }, [token, selectedFriendId]); // Re-run if we select a different friend so isCurrentlyOpen is accurate


  const filteredFriends = friends.filter((f) =>
    f.full_name?.toLowerCase().includes(search.toLowerCase()) || 
    f.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full bg-slate-800 border-r border-slate-700 flex flex-col h-full">
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
          filteredFriends.map((friend) => {
            // 👇 1. Check for unread messages
            const hasUnread = friend.unread_count > 0;
            const isSelected = selectedFriendId === friend.id;

            return (
              <div
                key={friend.id}
                onClick={() => onSelectFriend(friend)}
                className={`p-3 flex items-center gap-3 cursor-pointer hover:bg-slate-700 transition-colors ${
                  isSelected ? "bg-slate-700 border-l-4 border-emerald-500" : "border-l-4 border-transparent"
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-slate-600 flex-shrink-0 overflow-hidden">
                  {friend.profile_picture ? (
                    <img src={friend.profile_picture} alt={friend.username} className="w-full h-full object-cover"/>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300 font-bold text-lg">
                        {friend.username[0].toUpperCase()}
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className={`truncate ${hasUnread ? "text-white font-extrabold" : "text-slate-200 font-medium"}`}>
                        {friend.full_name || friend.username}
                    </h3>
                    <span className={`text-[11px] whitespace-nowrap ml-2 ${hasUnread ? "text-emerald-400 font-bold" : "text-slate-400"}`}>
                        {friend.last_message_time ? formatSidebarTime(friend.last_message_time) : ""}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className={`text-xs truncate pr-2 ${hasUnread ? "text-slate-300 font-bold" : "text-slate-400"}`}>
                        {friend.last_message_content || "Click to chat"}
                    </p>
                    
                    {hasUnread && (
                      <div className="bg-emerald-500 text-white text-[10px] font-bold h-5 min-w-[20px] px-1.5 flex items-center justify-center rounded-full shadow-md">
                        {friend.unread_count > 99 ? "99+" : friend.unread_count}
                      </div>
                    )}
                  </div>

                </div>
              </div>
            );
          })       
      )}
      </div>
    </div>
  );
}