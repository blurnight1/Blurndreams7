import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useRef, useEffect } from "react";
import { Id } from "../../convex/_generated/dataModel";

export function TrackList() {
  const tracks = useQuery(api.tracks.list) || [];
  const incrementPlays = useMutation(api.tracks.incrementPlays);
  const [currentTrack, setCurrentTrack] = useState<Id<"tracks"> | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handlePlay = async (trackId: Id<"tracks">, audioUrl: string) => {
    if (currentTrack === trackId && isPlaying) {
      // Pause current track
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      // Play new track or resume
      if (currentTrack !== trackId) {
        setCurrentTrack(trackId);
        if (audioRef.current) {
          audioRef.current.src = audioUrl;
        }
        await incrementPlays({ trackId });
      }
      
      audioRef.current?.play();
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTrack(null);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handlePlay = () => {
      setIsPlaying(true);
    };

    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('play', handlePlay);

    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('play', handlePlay);
    };
  }, []);

  if (tracks.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#3A3C60] to-[#5F6B90] flex items-center justify-center opacity-50">
          <span className="text-2xl">♪</span>
        </div>
        <p className="text-[#5F6B90] text-lg">No dreams shared yet...</p>
        <p className="text-[#3A3C60] text-sm mt-2">Be the first to share your music</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <audio ref={audioRef} />
      
      {tracks.map((track) => (
        <div
          key={track._id}
          className="group bg-gradient-to-r from-[#1A2340]/60 to-[#121B2E]/60 backdrop-blur-sm rounded-xl border border-[#3A3C60]/20 p-6 hover:border-[#5F6B90]/40 transition-all duration-500 hover:shadow-lg hover:shadow-[#3A3C60]/20"
        >
          <div className="flex items-center gap-6">
            <button
              onClick={() => handlePlay(track._id, track.audioUrl!)}
              className="flex-shrink-0 w-14 h-14 rounded-full bg-gradient-to-br from-[#5F6B90] to-[#3A3C60] flex items-center justify-center hover:from-[#6F7BA0] hover:to-[#4A4C70] transition-all duration-300 shadow-lg group-hover:scale-105"
            >
              {currentTrack === track._id && isPlaying ? (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                </svg>
              ) : (
                <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              )}
            </button>

            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-medium mb-2 text-white group-hover:text-[#5F6B90] transition-colors duration-300">
                {track.title}
              </h3>
              <p className="text-[#5F6B90] text-sm mb-3 line-clamp-2">
                {track.description}
              </p>
              <div className="flex items-center gap-4 text-xs text-[#3A3C60]">
                <span>by {track.uploaderName}</span>
                <span>•</span>
                <span>{track.plays} plays</span>
                <span>•</span>
                <span>{new Date(track._creationTime).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {currentTrack === track._id && (
            <div className="mt-4 pt-4 border-t border-[#3A3C60]/20">
              <div className="flex items-center gap-2 text-xs text-[#5F6B90]">
                <div className="w-2 h-2 rounded-full bg-[#5F6B90] animate-pulse"></div>
                <span>{isPlaying ? "Now playing" : "Paused"}</span>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
