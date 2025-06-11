import { useState, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

interface UploadTrackProps {
  onComplete: () => void;
}

export function UploadTrack({ onComplete }: UploadTrackProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateUploadUrl = useMutation(api.tracks.generateUploadUrl);
  const createTrack = useMutation(api.tracks.create);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('audio/')) {
        setSelectedFile(file);
      } else {
        toast.error("Please select an audio file");
        event.target.value = "";
      }
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!title.trim() || !description.trim() || !selectedFile) {
      toast.error("Please fill in all fields and select an audio file");
      return;
    }

    setIsUploading(true);

    try {
      // Generate upload URL
      const uploadUrl = await generateUploadUrl();

      // Upload file
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": selectedFile.type },
        body: selectedFile,
      });

      if (!result.ok) {
        throw new Error("Upload failed");
      }

      const { storageId } = await result.json();

      // Get audio duration
      const audio = new Audio();
      const duration = await new Promise<number>((resolve) => {
        audio.addEventListener('loadedmetadata', () => {
          resolve(audio.duration);
        });
        audio.src = URL.createObjectURL(selectedFile);
      });

      // Create track record
      await createTrack({
        title: title.trim(),
        description: description.trim(),
        audioFileId: storageId,
        duration,
      });

      toast.success("Track uploaded successfully!");
      
      // Reset form
      setTitle("");
      setDescription("");
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      
      onComplete();
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload track. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      <h3 className="text-xl font-light mb-6 text-center">Share Your Dream</h3>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-[#5F6B90] mb-2">
            Track Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 bg-[#121B2E]/60 border border-[#3A3C60]/40 rounded-lg focus:border-[#5F6B90] focus:ring-1 focus:ring-[#5F6B90] outline-none transition-all duration-300 text-white placeholder-[#3A3C60]"
            placeholder="Enter a dreamy title..."
            disabled={isUploading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#5F6B90] mb-2">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 bg-[#121B2E]/60 border border-[#3A3C60]/40 rounded-lg focus:border-[#5F6B90] focus:ring-1 focus:ring-[#5F6B90] outline-none transition-all duration-300 text-white placeholder-[#3A3C60] resize-none"
            placeholder="Describe the mood and feeling of your track..."
            disabled={isUploading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#5F6B90] mb-2">
            Audio File
          </label>
          <div className="relative">
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              onChange={handleFileSelect}
              className="hidden"
              disabled={isUploading}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full px-4 py-3 bg-[#121B2E]/60 border border-[#3A3C60]/40 rounded-lg hover:border-[#5F6B90]/60 transition-all duration-300 text-left text-[#3A3C60] hover:text-[#5F6B90]"
              disabled={isUploading}
            >
              {selectedFile ? selectedFile.name : "Choose audio file..."}
            </button>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={onComplete}
            className="flex-1 px-6 py-3 bg-[#3A3C60]/40 text-[#5F6B90] rounded-lg hover:bg-[#3A3C60]/60 transition-all duration-300"
            disabled={isUploading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isUploading || !title.trim() || !description.trim() || !selectedFile}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-[#5F6B90] to-[#3A3C60] text-white rounded-lg hover:from-[#6F7BA0] hover:to-[#4A4C70] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? "Uploading..." : "Share Dream"}
          </button>
        </div>
      </form>
    </div>
  );
}
