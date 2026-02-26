import { useState, useEffect } from "react";
import { useAuthStore, type AuthState } from "../store/authStore";
import ChatSidebar from "../components/ChatSidebar";
import ChatArea from "../components/ChatArea";
import Navbar from "../components/NavBar";
import { useLocation } from "react-router-dom";

export default function Chat() {
    const [refreshSidebarKey, setRefreshSidebarKey] = useState(0);
    const [selectedFriend, setSelectedFriend] = useState<any>(null);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const token = useAuthStore((state: AuthState) => state.token);

    console.log(selectedFriend);
    const location = useLocation();

    const handleMessageUpdate = () => {
      setRefreshSidebarKey((prev) => prev + 1);
    }

    useEffect(() => {
      if (location.state?.preselectedUser) {
        setSelectedFriend(location.state.preselectedUser);
        window.history.replaceState({}, document.title); // Clear the state after using it
      }
    })

    useEffect(() => {
        const fetchMe = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/users/me`,{
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
      <div>
        <Navbar />
    <div className="flex h-[calc(100vh-64px)] bg-slate-900 overflow-hidden">
      {/* Left Sidebar */}
      <ChatSidebar 
        onSelectFriend={setSelectedFriend} 
        selectedFriendId={selectedFriend?.id} 
        refreshTrigger={refreshSidebarKey}
      />

      <div className="flex-1 flex flex-col bg-black/20 relative">
        {selectedFriend ? (
          <ChatArea 
            currentUser={currentUser} 
            selectedFriend={selectedFriend}
            onMessageUpdate={handleMessageUpdate}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
            <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-4">
               <span className="text-4xl">👋</span>
            </div>
            <p>Select a friend to start chatting</p>
          </div>
        )}
      </div>
    </div>
    </div>
  );
}