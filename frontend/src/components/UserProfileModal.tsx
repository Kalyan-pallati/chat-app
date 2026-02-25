import { X, User, Calendar, Mail, UserCircle } from "lucide-react";

interface UserProfileModalProps {
    user: any;
    onClose: () => void;
}
export default function UserProfileModal({ user, onClose}: UserProfileModalProps) {
    if(!user) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop:blur-sm p-4" onClick={onClose}>
            <div className="bg-slate-800 w-full max-w-sm rounded-2xl border border-slate-700 shadow-2xl overflow-hidden relative" onClick={(e) => e.stopPropagation()}>

            </div>
        </div>
    )
}