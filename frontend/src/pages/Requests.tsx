import { useEffect, useState } from "react";
import { useAuthStore, type AuthState } from "../store/authStore";
import { User, Check, X } from "lucide-react";
import Navbar from "../components/NavBar";

export default function Requests() {
    const token = useAuthStore((state: AuthState) => state.token);
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchRequests = async () => {
        try {
            const res = await fetch("http://localhost:8000/users/friends/requests/pending", {
                headers: { Authorization: `Bearer ${token}`},
            })
            const data = await res.json();
            setRequests(data);
        }
        catch(err){
            console.error("Failed to load Requests");
        } finally{
            setLoading(false);
        }
    }
    useEffect(() => {
        fetchRequests();
    }, []);

    const handleAccept = async (requestId: number) => {
        try {
            const res = await fetch(`http://localhost:8000/users/friends/accept/${requestId}`, {
                method: "POST",
                headers: {Authorization : `Bearer ${token}`},
            });

            if(res.ok){
                setRequests(requests.filter((r) => r.id != requestId));
                alert("Friend Request Accepted! Enjoy chatting with your friend");
            }
        }
        catch(err){
            console.log(err);
        }
    };

    return (
        <div>
            <Navbar />
        <div className="h-screen bg-slate-900 text-white p-8">
            <div className="max-w-md mx-auto">
                <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    Notifications <span className="bg-red-500 text-xs px-2 py-1 rounded-full">{requests.length}</span>
                </h1>

                {loading ? (
                    <p>Loading...</p>
                ): requests.length === 0 ? (
                        <div className="text-slate-500 text-center mt-10">
                            <p>No pending Requestss</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {requests.map((req) => (
                                <div key={req.id} className="bg-slate-800 p-4 rounded-lg border border-slate-700 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="bf-slate-700 p-2 rounded-full">
                                            <User className="w-6 h-6 text-slate-400"/>
                                        </div>
                                        <div>
                                            <p className="font-bold">{req.sender_username}</p>
                                            <p className="text-xs text-slate-400">wants to be your friend..!</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <button onClick={() => handleAccept(req.id)}
                                            className="p-2 bg-emerald-600 rounded-full hover:bg-emerald-500 transition"
                                            title="Accept">
                                                <Check className="w-5 h-5"/>
                                            </button>
                                            <button className="p-2 bg-slate-700 rounded-full hover:bg-red-500 hover:text-white transition text-slate-400">
                                                <X className="w-5 h-5"/>
                                            </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
            </div>
        </div>
        </div>
    );
}