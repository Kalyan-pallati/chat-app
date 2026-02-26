import { useEffect, useState, useRef } from "react";
import { useAuthStore, type AuthState } from "../store/authStore";
import { Send } from "lucide-react";
import UserProfileModal from "./UserProfileModal";

interface Message {
  id: number;
  content: string;
  sender_id: number;
  receiver_id: number;
  timestamp: string;
  is_read: boolean;
}

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

interface ChatAreaProps {
  currentUser: any;
  selectedFriend: UserProfile;
  onMessageUpdate?: () => void;
}

export default function ChatArea({
  currentUser,
  selectedFriend,
  onMessageUpdate,
}: ChatAreaProps) {
  const token = useAuthStore((state: AuthState) => state.token);

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [viewingUser, setViewingUser] = useState<UserProfile | null>(null);

  const socketRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch history + socket
  useEffect(() => {
    if (!selectedFriend) return;

    const fetchHistory = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/chat/history/${selectedFriend.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.ok) {
          const data = await res.json();
          setMessages(data);
        }
      } catch (err) {
        console.error("History Fetch Failed", err);
      }
    };

    fetchHistory();

    const ws = new WebSocket(
      `${import.meta.env.VITE_WS_URL}/chat/ws/${token}`
    );

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);

      const isRelevant =
        message.sender_id === selectedFriend.id ||
        (message.sender_id === currentUser.id &&
          message.receiver_id === selectedFriend.id);

      if (isRelevant) {
        setMessages((prev) => [...prev, message]);
      }
      onMessageUpdate?.();
    };

    socketRef.current = ws;

    return () => {
      ws.close();
    };
  }, [selectedFriend, currentUser.id, token]);

  const sendMessage = () => {
    if (
      !newMessage.trim() ||
      !socketRef.current ||
      socketRef.current.readyState !== WebSocket.OPEN
    )
      return;

    socketRef.current.send(
      JSON.stringify({
        receiver_id: selectedFriend.id,
        content: newMessage.trim(),
      })
    );

    setNewMessage("");

    if (textAreaRef.current) {
      textAreaRef.current.style.height = "auto";
    }
    onMessageUpdate?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 w-full">
      
      {/* Header */}
      <div className="p-4 bg-slate-800 border-b border-slate-700 flex items-center gap-3">
        {viewingUser && (
          <UserProfileModal
            user={viewingUser}
            onClose={() => setViewingUser(null)}
          />
        )}

        <div
          onClick={() => setViewingUser(selectedFriend)}
          className="w-10 h-10 rounded-full bg-slate-800 overflow-hidden cursor-pointer"
        >
          {selectedFriend.profile_picture ? (
            <img
              src={selectedFriend.profile_picture}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white">
              {selectedFriend.username[0]}
            </div>
          )}
        </div>

        <h2
          onClick={() => setViewingUser(selectedFriend)}
          className="text-white font-bold cursor-pointer"
        >
          {selectedFriend.full_name || selectedFriend.username}
        </h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isMe = msg.sender_id === currentUser.id;
          return (
            <div
              key={msg.id}
              className={`flex ${
                isMe ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[70%] p-3 rounded-2xl ${
                  isMe
                    ? "bg-emerald-600 text-white rounded-br-none"
                    : "bg-slate-700 text-slate-200 rounded-bl-none"
                }`}
              >
                <p className="whitespace-pre-wrap break-words">
                  {msg.content}
                </p>
                <span className="text-[10px] block text-right mt-1 opacity-70">
                  {new Date(
                    msg.timestamp.endsWith("Z")
                      ? msg.timestamp
                      : msg.timestamp + "Z"
                  ).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 bg-slate-800 border-t border-slate-700 flex items-end gap-2">
        <textarea
          ref={textAreaRef}
          rows={1}
          value={newMessage}
          placeholder="Type a message..."
          onChange={(e) => {
            setNewMessage(e.target.value);
            if (textAreaRef.current) {
              textAreaRef.current.style.height = "auto";
              textAreaRef.current.style.height =
                textAreaRef.current.scrollHeight + "px";
            }
          }}
          onKeyDown={handleKeyDown}
          className="flex-1 resize-none bg-slate-700 text-white px-4 py-3 rounded-2xl focus:outline-none focus:ring-1 focus:ring-emerald-500 max-h-40 overflow-y-auto"
        />

        <button
          onClick={sendMessage}
          className="p-3 bg-emerald-600 rounded-full hover:bg-emerald-500 text-white"
        >
          <Send className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}