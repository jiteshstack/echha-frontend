"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Sparkles, ArrowLeft, Share2, Check } from 'lucide-react'; // Added Check icon
import Link from 'next/link';
import GlassCard from '@/components/ui/GlassCard';

interface PublicData {
  profile: {
    name: string;
    username?: string;
    vibeSeed: string[];
    dnaCard?: {
        persona: string;
        tribe: string;
        palette: [string, string];
    };
  };
  dreams: any[];
}

export default function PublicProfilePage() {
  const params = useParams();
  const routeName = (params?.username as string) || ""; 
  
  const [data, setData] = useState<PublicData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false); // State for feedback

  useEffect(() => {
    if (!routeName) return;
    fetch(`/api/backend/api/public/profile/${routeName}`)
      .then(res => res.json())
      .then(res => {
        if (res.success) setData(res.data);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [routeName]);

  // 🔗 SHARE FUNCTION
  const handleShare = () => {
    const url = window.location.href; // Grabs current URL (e.g., echha.com/u/jitesh)
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
  };

  if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Summoning...</div>;
  if (!data) return <div className="min-h-screen bg-black text-white flex items-center justify-center">User not found.</div>;

  const displayName = data.profile.name;
  const displayLetter = displayName[0].toUpperCase();
  const displayVibe = data.profile.dnaCard?.persona || data.profile.vibeSeed[0] || "Visionary";
  const primaryColor = data.profile.dnaCard?.palette?.[0] || "#7c3aed";
  const secondaryColor = data.profile.dnaCard?.palette?.[1] || "#2563eb";

  return (
    <div className="min-h-screen bg-black text-white p-6 pt-24 relative overflow-hidden transition-colors duration-1000">
      
      <div 
        className="fixed top-[-20%] left-[50%] -translate-x-1/2 w-[800px] h-[800px] rounded-full blur-[120px] opacity-20 pointer-events-none z-0"
        style={{ background: `radial-gradient(circle, ${primaryColor}, ${secondaryColor})` }}
      />

      <Link href="/" className="fixed top-6 left-6 text-white/50 hover:text-white transition-colors z-10">
        <ArrowLeft size={24} />
      </Link>

      {/* HEADER */}
      <div className="max-w-4xl mx-auto text-center mb-16 relative z-10 flex flex-col items-center">
        <div 
            className="w-24 h-24 rounded-full mb-6 flex items-center justify-center text-3xl font-bold uppercase transition-all duration-500"
            style={{
                background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                boxShadow: `0 0 40px ${primaryColor}40`
            }}
        >
            {displayLetter}
        </div>
        
        <h1 className="text-4xl font-thin tracking-wider mb-2">
          {displayName}
        </h1>
        
        <div className="flex items-center gap-3 mb-6">
            <span className="text-white/40 text-sm uppercase tracking-[0.2em] flex items-center gap-2">
            <Sparkles size={14} style={{ color: primaryColor }} /> {displayVibe}
            </span>
        </div>

        {/* 🔗 SHARE BUTTON */}
        <button 
          onClick={handleShare}
          className="flex items-center gap-2 px-5 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm uppercase tracking-wider text-white/80"
        >
          {copied ? <Check size={16} className="text-green-400" /> : <Share2 size={16} />}
          {copied ? "Link Copied" : "Share Vault"}
        </button>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto pb-20 relative z-10">
        {data.dreams.map((dream: any, index: number) => (
          <GlassCard key={dream._id} delay={index * 0.1} className="group hover:bg-white/5 transition-all duration-500">
             <div className="aspect-[4/3] bg-gray-900 rounded-lg mb-4 overflow-hidden relative">
               {dream.videoUrl ? (
                 <video src={dream.videoUrl} autoPlay muted loop playsInline className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
               ) : (
                 <img src={dream.imageUrl} className="w-full h-full object-cover opacity-60 grayscale group-hover:grayscale-0 transition-all" />
               )}
             </div>
             <h3 className="text-lg font-medium truncate text-white/90">{dream.title}</h3>
           </GlassCard>
        ))}
      </div>
    </div>
  );
}