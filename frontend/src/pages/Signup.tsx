import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore, type AuthState } from "../store/authStore";
import { Eye, EyeOff, Upload, User } from "lucide-react";
import ImageCropper from "../components/ImageCropper";

export default function Signup() {
  const login = useAuthStore((state: AuthState) => state.login);
  const token = useAuthStore((state: AuthState) => state.token);
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [gender, setGender] = useState("other");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  // Image States
  const [selectedFile, setSelectedFile] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (token) navigate("/chat");
  }, [token, navigate]);

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setShowCropper(true);
      e.target.value = "";
    }
  };

  const onCropFinished = (blob: Blob) => {
    setSelectedFile(blob);
    setShowCropper(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const formData = new FormData();
      formData.append("username", username);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("full_name", fullName);
      formData.append("gender", gender);
      
      if (selectedFile) {
        formData.append("file", selectedFile, "profile.jpg");
      }

      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/signup`, {
        method: "POST",
        body: formData, // Browser sets Content-Type to multipart/form-data automatically
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Signup Failed");

      login(data.access_token);
      navigate("/chat");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white p-4">
      
      {/* Cropper Modal */}
      {showCropper && previewUrl && (
        <ImageCropper
          imageSrc={previewUrl}
          onCropComplete={onCropFinished}
          onCancel={() => setShowCropper(false)}
        />
      )}

      <div className="bg-slate-800 p-8 rounded-lg shadow-xl w-full max-w-md border border-slate-700">
        <h2 className="text-2xl font-bold mb-6 text-emerald-400 text-center">
          Create Account
        </h2>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm p-3 rounded mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Profile Picture Upload */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative w-24 h-24 rounded-full bg-slate-700 border-2 border-slate-600 flex items-center justify-center overflow-hidden group cursor-pointer">
              {selectedFile ? (
                <img
                  src={URL.createObjectURL(selectedFile)}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-10 h-10 text-slate-400" />
              )}
              <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Upload className="w-6 h-6 text-white" />
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={onFileSelect}
                />
              </label>
            </div>
            <p className="text-xs text-slate-400 mt-2">Tap to upload photo</p>
          </div>

          <div>
            <label className="block text-slate-400 text-sm mb-1">Username</label>
            <input
              type="text"
              className="w-full p-2 rounded bg-slate-700 border border-slate-600 focus:border-emerald-500 outline-none"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-slate-400 text-sm mb-1">Full Name</label>
            <input
              type="text"
              className="w-full p-2 rounded bg-slate-700 border border-slate-600 focus:border-emerald-500 outline-none"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-slate-400 text-sm mb-1">Email</label>
            <input
              type="email"
              className="w-full p-2 rounded bg-slate-700 border border-slate-600 focus:border-emerald-500 outline-none"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-slate-400 text-sm mb-1">Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full p-2 rounded bg-slate-700 border border-slate-600 focus:border-emerald-500 outline-none"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 text-sm mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full p-2 rounded bg-slate-700 border border-slate-600 focus:border-emerald-500 outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-400"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full p-3 rounded bg-emerald-600 hover:bg-emerald-500 font-bold transition-colors mt-6"
          >
            Create Account
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-400">
          Already have an account?
          <Link to="/login" className="pl-2 text-emerald-400 hover:underline font-medium">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}