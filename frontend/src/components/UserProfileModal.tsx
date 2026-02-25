import { X, UserCircle } from "lucide-react";

interface UserProfileModalProps {
    user: any;
    onClose: () => void;
}
export default function UserProfileModal({ user, onClose}: UserProfileModalProps) {
    if(!user) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop:blur-sm p-4" onClick={onClose}>
            <div className="bg-slate-800 w-full max-w-sm rounded-2xl border border-slate-700 shadow-2xl overflow-hidden relative" onClick={(e) => e.stopPropagation()}>
                <div className="bg-slate-800 w-full max-w-sm sm:max-w-md rounded-2xl border border-slate-700 shadow-2xl overflow-y-auto max-h-[95vh] relative animate-in fade-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}>
                    {/* Close Button */}
                    <button className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-black/60 rounded-full text-slate-300 hover:text-white transition z-10"
                    onClick={onClose}><X className="w-5 h-5"/>
                    </button>

                    <div className="h-32 sm:h-40 bg-gradient-to-r from-emerald-600 to-teal-800 w-full"></div>

                    <div className="px-6 pb-6 relative">

                        {/* Avatar */}
                        <div className="-mt-16 sm:-mt-20 mb-4 flex justify-start">
                            <div className="w-28 h-28 sm:w-30 rounded-full border-4 border-white-800 bg-slate-700 overflow-hidden shadow-lg shrink-0">
                                {user.profile_picture ? (
                                    <img src={user.profile_picture} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-700">
                                        <span className="text-4xl sm:text-5xl font-bold uppercase">{user.username[0]}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="mb-6">
                            <h2 className="text-2xl sm:text-3xl font-bold text-white break-words leading-tight"
                            >{user.full_name}</h2>
                            <p className="text-emerald-400 text-sm cursor-pointer sm:text-base font-medium mt-1">@{user.username}</p>
                        </div>

                        <div className="bg-slate-900/50 rounded-xl p-4 mb-6 border border-slate-700/50">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">About</h3>
                            <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                                {user.bio || "Hey, there I'm Kalyan"}
                            </p>
                        </div>
                        <div className="space-y-4">

                            <div className="flex items-center gap-3 text-slate-300">
                                <div className="w-10 h-10 rounded-lg bg-slate-700/50 flex items-center justify-center text-emerald-500 shrink-0">
                                <UserCircle className="w-5 h-5"/>
                                </div>
                                <div className="min-w-0 ">
                                    <p className="text-xs text-slate-500">Gender</p>
                                    <p className="text-sm font-medium truncate capitalize">{user.gender}</p>
                                </div>
                            </div>

                            {/* Thinking of removing this feature as email should be private 
                            <div className="flex items-center gap-3 text-slate-300">
                                <div className="w-10 h-10 rounded-lg bg-slate-700/50 flex items-center justify-center text-emerald-500 shrink-0">
                                <Mail className="w-5 h-5"/>
                                </div>
                                <div className="min-w-0 w-full">
                                    <p className="text-xs text-slate-500">Email</p>
                                    <p className="text-sm font-medium truncate">{user.email}</p>
                                </div>
                            </div> */}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}