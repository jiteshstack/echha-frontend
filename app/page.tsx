"use client";

import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import PersonaForm from "@/components/features/persona/PersonaForm";
import PersonaGallery from "@/components/features/persona/PersonaGallery"; // Import it
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const { user, loading } = useAuth();
  
  // A simple counter to trigger refreshes
  const [refreshKey, setRefreshKey] = useState(0);

  if (loading) return null;

  return (
    <main className="min-h-screen bg-black text-white relative selection:bg-purple-500/30">
      
      {/* Background Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/10 rounded-full blur-[120px]" />
      </div>

      <Navbar />

      <div className="relative z-10 pt-32 pb-20 px-4 max-w-7xl mx-auto">
        
        {/* HERO SECTION */}
        <div className="text-center mb-16 space-y-4">
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-gray-400">
            ECHHA
          </h1>
          <p className="text-sm md:text-base text-gray-400 uppercase tracking-[0.3em] font-light">
            The Luxury of Imagination
          </p>
        </div>

        {/* 1. CREATION FORM */}
        <PersonaForm onCreated={() => setRefreshKey(k => k + 1)} />

        {/* 2. THE VAULT (New Section) */}
        {user && (
            <div className="mt-24">
                <div className="flex items-center gap-4 mb-8">
                    <div className="h-px bg-white/10 flex-1" />
                    <h2 className="text-xl font-light tracking-widest text-gray-500">THE VAULT</h2>
                    <div className="h-px bg-white/10 flex-1" />
                </div>
                
                {/* Passing refreshKey so it reloads when you create something new */}
                <PersonaGallery refreshTrigger={refreshKey} />
            </div>
        )}

      </div>
    </main>
  );
}