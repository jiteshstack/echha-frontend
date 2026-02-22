"use client";

import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';
import { Share2, Check } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  const handleShareProfile = () => {
    if (!user) return;

    const dna = user.dnaCard;
    const username = user.username || user.name.toLowerCase().replace(/\s+/g, '-');
    const profileUrl = `${window.location.origin}/u/${username}`;

    const shareText = `${profileUrl}

🧬 ECHHA FREQUENCY
Persona: ${dna?.persona || 'Not calibrated'}
Tribe: ${dna?.tribe || 'Unknown'}
Palette: ${dna?.palette?.join(', ') || 'Not set'}

Find your frequency on Echha.`;

    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!user) return <div className="p-20 text-center text-white">Please log in.</div>;

  const dna = user.dnaCard;

  return (
    <div className="min-h-screen bg-black text-white p-8 pt-32 flex flex-col items-center">
      
      {/* 🆔 ID CARD CONTAINER */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 md:p-12 relative overflow-hidden"
      >
        {/* Background Glow based on first palette color */}
        <div 
            className="absolute top-0 right-0 w-64 h-64 blur-[100px] opacity-20 rounded-full"
            style={{ backgroundColor: dna?.palette?.[0] || '#555' }} 
        />

        <div className="relative z-10 text-center">
            {/* AVATAR (Initial) */}
            <div className="w-24 h-24 mx-auto bg-white/5 rounded-full flex items-center justify-center text-4xl font-light mb-6 border border-white/10">
                {user.name.charAt(0)}
            </div>

            <h1 className="text-4xl font-bold mb-2">{user.name}</h1>
            <p className="text-gray-400 mb-4">{user.email}</p>

            {/* 🔗 SHARE PROFILE BUTTON */}
            <button
              onClick={handleShareProfile}
              className="flex items-center gap-2 px-5 py-2 mx-auto mb-8 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm uppercase tracking-wider text-white/80"
            >
              {copied ? <Check size={16} className="text-green-400" /> : <Share2 size={16} />}
              {copied ? "Link Copied!" : "Share Profile"}
            </button>

            {/* 🧬 DNA SECTION */}
            {dna ? (
                <div className="bg-white/5 rounded-2xl p-8 border border-white/5">
                    <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">Archetype</p>
                    <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500 mb-2">
                        {dna.persona}
                    </h2>
                    <p className="text-purple-400 text-sm tracking-widest uppercase mb-8">
                        Member of {dna.tribe}
                    </p>

                    {/* COLOR PALETTE */}
                    <div className="flex justify-center gap-4">
                        {dna.palette?.map((color, i) => (
                            <div key={i} className="group relative">
                                <div 
                                    className="w-12 h-12 rounded-full border border-white/10 shadow-lg transform group-hover:scale-110 transition-transform"
                                    style={{ backgroundColor: color }}
                                />
                                <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {color}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="p-8 border border-dashed border-white/20 rounded-2xl">
                    <p className="text-gray-500">No DNA detected.</p>
                    {/* ✅ REPLACE WITH THIS NEW LINE: */}
                    <Link href="/onboarding" className="text-purple-400 hover:underline mt-2 inline-block">
                        Calibrate Identity &rarr;
                    </Link>
                </div>
            )}
        </div>
      </motion.div>
    </div>
  );
}