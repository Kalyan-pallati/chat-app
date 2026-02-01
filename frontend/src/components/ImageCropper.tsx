import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "../utils/cropUtils";

interface ImageCropperProps {
  imageSrc: string;
  onCropComplete: (file: Blob) => void;
  onCancel: () => void;
}

export default function ImageCropper({ imageSrc, onCropComplete, onCancel }: ImageCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const onCropChange = (crop: { x: number; y: number }) => {
    setCrop(crop);
  };

  const onCropCompleteCallback = useCallback((_: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    try {
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
      onCropComplete(croppedImage);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 p-4">
      <div className="relative w-full max-w-md h-80 bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={1} // 👈 Forces 1:1 Square Ratio
          onCropChange={onCropChange}
          onCropComplete={onCropCompleteCallback}
          onZoomChange={setZoom}
          cropShape="round" // Shows a circle mask (preview)
          showGrid={false}
        />
      </div>

      <div className="w-full max-w-md mt-4 space-y-4">
        {/* Zoom Slider */}
        <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Zoom</span>
            <input
            type="range"
            value={zoom}
            min={1}
            max={3}
            step={0.1}
            aria-labelledby="Zoom"
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full h-1 bg-slate-600 rounded-lg appearance-none cursor-pointer"
            />
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
            <button
            onClick={onCancel}
            className="flex-1 py-2 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-800 transition"
            >
            Cancel
            </button>
            <button
            onClick={handleSave}
            className="flex-1 py-2 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-500 transition"
            >
            Save Photo
            </button>
        </div>
      </div>
    </div>
  );
}