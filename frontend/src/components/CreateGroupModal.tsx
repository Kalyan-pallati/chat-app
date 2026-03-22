import { useEffect, useState, useRef } from "react"
import { useAuthStore, type AuthState } from "../store/authStore";
import { X, Camera, Users, Check } from "lucide-react";
import UserProfileModal from "./UserProfileModal";
import ImageCropper from "./ImageCropper";

interface Friend {
    id: number;
    username: string;
    full_name: string;
    profile_picture: string | null;
} 
interface CreateGroupModalProps {
    onClose : () => void;
    onGroupCreated: (newGroup : any) => void;
}
export default function CreateGroupModal({onClose, onGroupCreated} : CreateGroupModalProps) {
    const token = useAuthStore((state: AuthState) => state.token);

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");

    const [friends, setFriends] = useState<Friend[]>([]);
    const [previewUrl, setPreviewUrl] = useState("");

    const [avatarFile, setAvatarFile] = useState<Blob | null>(null);

    const [selectedFriends, setSelectedFriends] = useState<number[]>([]);
    const [viewingUser, setViewingUser] = useState<Friend | null>(null);

    const [showCropper, setShowCropper] = useState(false);
    const [loading, setLoading] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [error, setError] = useState("");
    useEffect(() => {
        const fetchFriends = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/users/friends/friends` ,{
                    headers : {Authorization : `Bearer ${token}`}
                })
                if(res.ok) {
                const data = await res.json();
                setFriends(data);
                }
                
            } catch(err){
                setError("Group is not created");
                console.error("Caught an Error", err);
            } 
        };
        fetchFriends();
    },[token]);

    const handleCropFinished = (blob: Blob) => {
        setAvatarFile(blob);
        setPreviewUrl(URL.createObjectURL(blob)); // Show the perfectly cropped version in the circle!
        setShowCropper(false);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if(!name.trim()) {
            setError("Group name is required");
            return;
        }
        setLoading(true);
        setError("");
        
        try {
            let finalAvatarUrl = "";
            if(avatarFile) {
                const formData = new FormData();
                formData.append("file", avatarFile, "group_avatar.jpg");
            
            const uploadRes = await fetch(`${import.meta.env.VITE_API_URL}/groups/upload-avatar`, {
                headers : { Authorization : `Bearer ${token}`},
                method : "POST",
                body : formData,
            })
            if(uploadRes.ok) {
                const uploadData = await uploadRes.json();
                finalAvatarUrl = uploadData.url;
            } else {
                setError("Failed to upload avatar");
                setLoading(false);
                return;
            }
            const groupData = {
                name: name.trim(),
                description: description.trim(),
                avatar_url: finalAvatarUrl,
                member_ids: selectedFriends,
            };
            const res = await fetch(`${import.meta.env.VITE_API_URL}/groups/create`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(groupData)
            });
            if(res.ok) {
                const newGroup = await res.json();
                onGroupCreated(newGroup);
                onClose();
            } else {
                setError("Failed to create group");
            }

        }
        } catch(err) {
            setError("Failed to upload avatar");
            console.error("Avatar Upload Error", err);
            setLoading(false);
            return;
        }
    }

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        setShowCropper(true);
        e.target.value = ""; // Reset input
        }
    };


    const toggleMember = (friendId : number) => {
        if(selectedFriends.includes(friendId)) {
            setSelectedFriends(selectedFriends.filter(id => id !== friendId));
        } else {
            setSelectedFriends([...selectedFriends, friendId]);
        }
    }

    return (
        <>
        {showCropper && previewUrl && (
        <div className="fixed inset-0 z-[80]">
          <ImageCropper
            imageSrc={previewUrl}
            onCropComplete={handleCropFinished}
            onCancel={() => setShowCropper(false)}
          />
        </div>
      )}
        <div className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-800 w-full max-w-[460px] flex flex-col overflow-hidden rounded-2xl border border-slate-700 shadow-2xl max-h-[90vh]">

                <div className="p-4 min-w-full border border-slate-700 bg-slate-900/50 flex flex-row justify-between items-center shrink-0 ">
                    <div className="flex flex-row items-center justify-center gap-2 text-lg font-bold">
                        <Users className="text-emerald-500"/>
                        <p className="text-white">New Group</p>
                    </div>
                    <div>
                        <button
                        onClick={onClose}>
                            <X className="text-slate-400 hover:text-white transition p-1 rounded-full hover:bg-slate-700"
                            size={32}/>
                        </button>
                    </div>
                </div>    
                    <div className="p-6 overflow-y-auto">
                        {error && <div className="mb-4 p-3 bg-red-500/50 text-red-400 rounded-lg text-sm">{error}</div>}
                        <form id="create-form-group" onSubmit={handleSubmit} className="space-y-6">
                            <div className="flex flex-col items-center">
                                <div 
                                    className="relative group cursor-pointer w-24 h-24 rounded-full border-4 border-slate-700 bg-slate-700 overflow-hidden flex-shrink-0"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    {previewUrl ? (
                                    <img src={previewUrl} className="w-full h-full object-cover" />
                                    ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-400 group-hover:bg-slate-600 transition">
                                        <Camera size={32} />
                                    </div>
                                    )}
                                </div>
                                <p className="text-xs text-slate-400 mt-2">Optional Group Icon</p>
                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageSelect} />
                            </div>
                            <div>
                                <label className="block font-semibold text-white text-sm py-2">Group Name</label>
                                <input type="text" name="" id="" placeholder="e.g Family Chat, Friend Grp..."
                                className="w-full rounded-lg bg-slate-900 border border-slate-600 px-3 py-2 focus:border-emerald-500 outline-none text-white"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block font-semibold text-white text-sm py-2">Description (Optional)</label>
                                <input type="text" name="" id="" placeholder="Something about this group..."
                                className="w-full rounded-lg bg-slate-900 border border-slate-600 px-3 py-2 focus:border-emerald-500 outline-none text-white"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block font-semibold text-white text-sm py-2">Add Members ( <span>{selectedFriends.length}</span> selected)</label>
                                <div className="bg-slate-900 rounded-lg border border-slate-700 max-h-48 overflow-y-auto">
                                    {friends.length === 0 ? (
                                        <p className="text-slate-500 text-center mt-4 text-sm">No friends available to add</p>
                                    ) : (
                                        friends.map((friend) => {
                                            const isSelected = selectedFriends.includes(friend.id);
                                            return (
                                            <div
                                            key={friend.id}
                                            className="flex items-center gap-3 p-2 cursor-pointer border-b border-slate-800 last:border-b-0 hover:bg-slate-800 transition"
                                            >
                                                <div className={`w-5 h-5 border border-slate-500 rounded-sm flex items-center justify-center ${isSelected ? 'bg-emerald-500 border-emerald-500' : 'border-slate-500'}`}
                                                onClick={() => toggleMember(friend.id)}>
                                                    {isSelected && (
                                                        <Check className="text-white"/>
                                                    )}
                                                </div>
                                                <div onClick={() => setViewingUser(friend)} className="flex gap-3 items-center">
                                                        <div className="w-8 h-8 rounded-full bg-slate-700 overflow-hidden">
                                                            {friend.profile_picture ? (
                                                                <img src={friend.profile_picture} alt={friend.username} className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-slate-300 font-bold text-lg">
                                                                    {friend.username[0].toUpperCase()}
                                                                </div>
                                                            )}
                                                        </div>
                                                        
                                                        <div>
                                                            <span className="text-white text-sm font-medium">{friend.full_name ||friend.username}</span>
                                                        </div>
                                                </div>
                                            </div>
                                        )}
                                    )
                                )}
                                </div>
                            </div>
                        </form>
                    </div>
                    {viewingUser && (
                            <UserProfileModal
                              user={viewingUser}
                              onClose={() => setViewingUser(null)}
                            />
                          )}
                    <div className="p-4 border-t border-slate-700 bg-slate-900/50 flex justify-end gap-2">
                        <button onClick={onClose} className="px-4 py-2 rounded-lg text-white hover:bg-slate-800 transition">Cancel</button>
                        <button form="create-form-group" type="submit" className="px-4 py-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition">Create Group</button>
                    </div>
            </div>
        </div>
        </>
    )
}