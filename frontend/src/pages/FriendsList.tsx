import { useEffect, useState } from "react";
import { useAuthStore, type AuthState } from "../store/authStore";
import {User, MessageSquare} from 'lucide-react';

interface Friend {
    id: number,
    username: string,
    email: string,
}

export default function FriendsList() {
    const token = useAuthStore((state: AuthState) => state.token);
    const [loading, setLoading] = useState(false);
    const [friends, setFriends] = useState<Friend[]>([]);

    useEffect(() => {
        const fetchFriends = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/friends/list`, {
                    headers : { Authorization : `Bearer ${token}`},
                });
                const data = await res.json();
                setFriends(data);
            } catch(err) {
                console.log(err);
            }
            finally {
                setLoading(false);
            }
        };
        fetchFriends();
    }, [token]);

    return (
        <div className="min-h-screen bg-slate-900 text-white p-8">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold mb-8 flex-items-center gap-3">
                    <User className="text-emerald-500 w-8 h-8"/> My Friends
                </h1>
                {loading ? (
                    <p>Loading contacts...</p>
                ): friends.length === 0 ?  (
                    <div className="text-center p-10 bg-slate-800 rounded-lg bordrr border-slate-700">
                        <p className="text-slate-400 mb-4">You don't have any friends..!</p>
                        <a href="/find" className="text-emerald-400 hover:underline">Find people to add</a>
                    </div>
                ): (
                    <div className="grid gap-4">
                        {friends.map((friend) => (
                            <div 
                            key={friend.id}
                            className="bg-slate-800 p-6 rounded-lg border border-slate-700 flex items-center justify-between hover:border-emerald-500/50 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-400 font-bold text-xl">
                                    {friend.username[0].toUpperCase()}
                                    </div>
                                
                                <div>
                                <h3 className="font-bold text-lg">{friend.username}</h3>
                                <p className="text-slate-400 text-sm">{friend.email}</p>
                            </div>
                            </div>
                            <button className="bg-slate-700 hover:bg-emerald-600 p-3 rounded-full transition-colors group">
                                <MessageSquare className="w-5 h-5 text-slate-300 group-hover:text-white"/>
                            </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )

}