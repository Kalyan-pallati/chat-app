import { useState, useEffect } from "react";
import { useAuthStore, type AuthState } from "../store/authStore";
import ChatSidebar from "../components/ChatSidebar";
import ChatArea from "../components/ChatArea";

export default function Chat() {
    const [selectedFriend, setSelectedFriend] = useState<any>(null);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const token = useAuthStore((state: AuthState) => state.token);

    useEffect(() => {
        const fetchMe = async () => {
            try {
                const res = await fetch("http://localhost:8000/users/me",{
                    headers : {Authorization : `Bearer ${token}`}
                });
                if(res.ok){
                    const data = await res.json();
                    setCurrentUser(data);
                }
            } catch(err) {
                console.error(err);
            }
        };
        fetchMe();
    },[token]);

    if(!currentUser) return <div className="text-white p-10">Loading...</div>;
    return (
    <div className="flex h-screen bg-slate-900 overflow-hidden">
      {/* Left Sidebar */}
      <ChatSidebar 
        onSelectFriend={setSelectedFriend} 
        selectedFriendId={selectedFriend?.id} 
      />

      {/* Right Area */}
      <div className="flex-1 flex flex-col bg-black/20 relative">
        {selectedFriend ? (
          <ChatArea 
            currentUser={currentUser} 
            selectedFriend={selectedFriend} 
          />
        ) : (
          // Empty State
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
            <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-4">
               <span className="text-4xl">👋</span>
            </div>
            <p>Select a friend to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}