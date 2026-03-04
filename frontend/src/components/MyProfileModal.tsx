import { useState, useRef } from "react";
import { X, Edit2, Check, XCircle, Camera, Loader2, User, LogOut } from "lucide-react";
import { useAuthStore, type AuthState } from "../store/authStore";
import ImageCropper from "./ImageCropper"; 
import { useNavigate } from "react-router-dom";

interface MyProfileModalProps {
  currentUser: any;
  onClose: () => void;
  onProfileUpdate: (updatedUser: any) => void;
}

export default function MyProfileModal({ currentUser, onClose, onProfileUpdate }: MyProfileModalProps) {
  const { token, logout } = useAuthStore((state: AuthState) => state);
  const navigate = useNavigate();


    const handleLogout = () => {
    logout();
    navigate("/");
  };
  

  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [loading, setLoading] = useState(false);


  const [imageUploading, setImageUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);


  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setShowCropper(true);
      e.target.value = ""; 
    }
  };

  const onCropFinished = async (blob: Blob) => {
    setShowCropper(false);
    setImageUploading(true);

    const formData = new FormData();
    formData.append("file", blob, "profile.jpg");

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/users/updateme/avatar`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (res.ok) {
        const updatedUser = await res.json();
        onProfileUpdate(updatedUser);
      }
    } catch (err) {
      console.error("Failed to upload image", err);
    } finally {
      setImageUploading(false);
      setPreviewUrl(null);
    }
  };

  const handleSaveText = async () => {
    if (!editingField) return;
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/users/updateme`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ [editingField]: editValue }),
      });
      if (res.ok) {
        const updated = await res.json();
        onProfileUpdate(updated);
        setEditingField(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const EditableRow = ({ label, field, value }: { label: string, field: string, value: string }) => (
    <div className="border-b border-slate-700 py-4">
      <p className="text-xs text-emerald-400 font-bold mb-1">{label}</p>
      {editingField === field ? (
        <div className="flex gap-2">
          <input 
            className="bg-slate-900 text-white flex-1 px-3 py-1.5 rounded border border-emerald-500 outline-none focus:ring-1 focus:ring-emerald-500"
            value={editValue} 
            onChange={(e) => setEditValue(e.target.value)} 
            autoFocus 
          />
          <button onClick={handleSaveText} disabled={loading} className="text-emerald-500 hover:bg-emerald-500/20 p-1.5 rounded transition">
            <Check size={20} />
          </button>
          <button onClick={() => setEditingField(null)} className="text-red-500 hover:bg-red-500/20 p-1.5 rounded transition">
            <XCircle size={20} />
          </button>
        </div>
      ) : (
        <div className="flex justify-between items-center group">
          <span className="text-white text-lg">{value || `Set your ${label.toLowerCase()}`}</span>
          <button 
            onClick={() => { setEditingField(field); setEditValue(value || ""); }} 
            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-white transition"
          >
            <Edit2 size={16} />
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      {showCropper && previewUrl && (
        <div className="fixed inset-0 z-[70]">
          <ImageCropper 
            imageSrc={previewUrl} 
            onCropComplete={onCropFinished} 
            onCancel={() => setShowCropper(false)} 
          />
        </div>
      )}

      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
        <div className="bg-slate-800 w-full max-w-md rounded-2xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
          
          <div className="p-4 border-b border-slate-700 bg-slate-900/50 flex justify-between items-center shrink-0">
            <h2 className="font-bold text-white text-lg">My Profile</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition p-1 rounded-full hover:bg-slate-700">
              <X size={24} />
            </button>
          </div>

          <div className="p-6 overflow-y-auto">
            <div className="flex flex-col items-center mb-8">
              <div 
                className="relative group cursor-pointer w-28 h-28 rounded-full border-4 border-slate-700 bg-slate-700 overflow-hidden" 
                onClick={() => !imageUploading && fileInputRef.current?.click()}
              >
                {currentUser.profile_picture ? (
                  <img src={currentUser.profile_picture} className={`w-full h-full object-cover ${imageUploading ? 'opacity-30' : ''}`} />
                ) : (
                  <div className={`w-full h-full flex items-center justify-center text-slate-400 ${imageUploading ? 'opacity-30' : ''}`}>
                    <User size={48} />
                  </div>
                )}
                
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/50 transition duration-200">
                  {imageUploading ? (
                    <Loader2 className="animate-spin text-emerald-400 w-8 h-8" />
                  ) : (
                    <Camera className="text-white w-8 h-8" />
                  )}
                </div>
              </div>
              
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={onFileSelect} 
              />
            </div>

            <EditableRow label="Full Name" field="full_name" value={currentUser.full_name} />
            <EditableRow label="Username" field="username" value={currentUser.username} />
            <EditableRow label="Bio" field="bio" value={currentUser.bio} />


            <div className="pt-6 flex justify-center">
            <button 
                onClick={handleLogout} 
                className="flex items-center gap-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all duration-200 px-5 py-2 rounded-lg font-semibold"
              >
                <LogOut className="w-6 h-6" />
                <span className="sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}