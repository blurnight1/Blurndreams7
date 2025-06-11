import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { TrackList } from "./components/TrackList";
import { UploadTrack } from "./components/UploadTrack";
import { useState } from "react";

export default function App() {
  const [showUpload, setShowUpload] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#121B2E] via-[#1A2340] to-[#0F1624] text-white">
      <div className="absolute inset-0 bg-gradient-to-t from-[#3A3C60]/20 via-transparent to-[#5F6B90]/10 pointer-events-none" />
      
      <header className="relative z-10 backdrop-blur-sm bg-[#121B2E]/80 border-b border-[#3A3C60]/30 px-6 py-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#5F6B90] to-[#3A3C60] flex items-center justify-center">
              <span className="text-sm font-bold">♪</span>
            </div>
            <h1 className="text-2xl font-light tracking-wide">bluedreams</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <Authenticated>
              <button
                onClick={() => setShowUpload(!showUpload)}
                className="px-4 py-2 bg-gradient-to-r from-[#3A3C60] to-[#5F6B90] rounded-full text-sm font-medium hover:from-[#4A4C70] hover:to-[#6F7BA0] transition-all duration-300 shadow-lg"
              >
                {showUpload ? "Cancel" : "Share Track"}
              </button>
            </Authenticated>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-4xl mx-auto px-6 py-8">
        <Unauthenticated>
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="mb-8">
              <h2 className="text-4xl font-light mb-4 bg-gradient-to-r from-white to-[#5F6B90] bg-clip-text text-transparent">
                Welcome to bluedreams
              </h2>
              <p className="text-[#5F6B90] text-lg max-w-md">
                A serene space for sharing and discovering dreamy music
              </p>
            </div>
            <div className="w-full max-w-md">
              <SignInForm />
            </div>
          </div>
        </Unauthenticated>

        <Authenticated>
          <div className="space-y-8">
            {showUpload && (
              <div className="bg-gradient-to-br from-[#1A2340]/80 to-[#121B2E]/80 backdrop-blur-sm rounded-2xl border border-[#3A3C60]/30 p-6">
                <UploadTrack onComplete={() => setShowUpload(false)} />
              </div>
            )}
            
            <div>
              <h2 className="text-2xl font-light mb-6 text-center">Latest Dreams</h2>
              <TrackList />
            </div>
          </div>
        </Authenticated>
      </main>
      
      <Toaster 
        theme="dark"
        toastOptions={{
          style: {
            background: '#1A2340',
            border: '1px solid #3A3C60',
            color: 'white',
          },
        }}
      />
    </div>
  );
}
