"use client";

import { useEffect, useState } from 'react';
import { Globe } from 'lucide-react';
import Link from 'next/link';
import GlassCard from '@/components/ui/GlassCard';
import LikeButton from '@/components/ui/LikeButton'; // 👈 IMPORT THIS

export default function ExplorePage() {
  const [dreams, setDreams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/backend/api/public/explore`)
      .then(res => res.json())
      .then(res => {
        if (res.success) setDreams(res.data);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-6 pt-24">
      
      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 w-full p-6 z-50 flex justify-between items-center bg-gradient-to-b from-black via-black/80 to-transparent backdrop-blur-sm">
        <Link href="/" className="text-xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
            ECHHA
        </Link>
        <div className="flex gap-6 text-sm uppercase tracking-widest text-white/60">
            <Link href="/explore" className="text-white hover:text-purple-400 transition-colors">Explore</Link>
            <Link href="/dashboard" className="hover:text-purple-400 transition-colors">My Vault</Link>
        </div>
      </nav>

      {/* HEADER */}
      <div className="max-w-4xl mx-auto text-center mb-16 mt-10">
        <h1 className="text-5xl font-thin tracking-wider mb-4 flex items-center justify-center gap-4">
          <Globe className="text-blue-500 animate-pulse" /> World Feed
        </h1>
        <p className="text-white/40 text-sm uppercase tracking-[0.2em]">
          Witness the collective desires of humanity
        </p>
      </div>

      {/* GRID */}
      {loading ? (
        <div className="text-center text-white/30 animate-pulse mt-20">Connecting to the collective unconscious...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto pb-20">
            {dreams.map((dream: any, index: number) => {
                
                const creatorName = dream.userId?.name || "Anonymous";
                const creatorVibe = dream.userId?.dnaCard?.palette?.[0] || "#7c3aed";
                const creatorLink = dream.userId?.name ? `/u/${dream.userId.name}` : '#';

                return (
                    <GlassCard key={dream._id} delay={index * 0.05} className="group hover:bg-white/5 transition-all duration-500 flex flex-col justify-between h-full">
                        
                        {/* MEDIA */}
                        <div className="aspect-[4/3] bg-gray-900 rounded-lg mb-4 overflow-hidden relative">
                            {dream.videoUrl ? (
                                <video src={dream.videoUrl} autoPlay muted loop playsInline className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                            ) : (
                                <img src={dream.imageUrl} className="w-full h-full object-cover opacity-60 grayscale group-hover:grayscale-0 transition-all" />
                            )}
                            
                            <Link href={creatorLink} className="absolute bottom-3 left-3 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full hover:bg-black/90 transition-colors border border-white/5">
                                <div className="w-3 h-3 rounded-full" style={{ background: creatorVibe }}></div>
                                <span className="text-xs font-bold text-white/90">{creatorName}</span>
                            </Link>
                        </div>

                        {/* TEXT */}
                        <div className="mb-4">
                            <h3 className="text-lg font-medium truncate text-white/90">{dream.title}</h3>
                            <p className="text-xs text-white/40 mt-1 line-clamp-2 italic">"{dream.prompt}"</p>
                        </div>

                        {/* 👇 ACTION BAR (WITH HEART) */}
                        <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                            
                            {/* ❤️ THE LIKE BUTTON */}
                            <LikeButton 
                                dreamId={dream._id} 
                                initialLikes={dream.likeCount || 0} 
                            />

                            <Link href={creatorLink} className="text-xs uppercase tracking-widest text-white/30 hover:text-white transition-colors">
                                View Profile →
                            </Link>
                        </div>

                    </GlassCard>
                );
            })}
        </div>
      )}
    </div>
  );
}