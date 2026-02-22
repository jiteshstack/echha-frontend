"use client";

import { useEffect, useState } from 'react';
import { Trophy } from 'lucide-react';
import Link from 'next/link';

export default function TrendingRow() {
  const [trending, setTrending] = useState<any[]>([]);

  useEffect(() => {
    // Fetch top 5 dreams
    fetch(`/api/backend/api/public/trending`)
      .then(res => res.json())
      .then(res => {
        if (res.success) setTrending(res.data);
      })
      .catch(err => console.error("Trending fetch error:", err));
  }, []);

  if (trending.length === 0) return null; // Hide if empty

  return (
    <div className="mb-16">
      <div className="flex items-center gap-3 mb-6 px-2">
        <Trophy className="text-yellow-500" size={20} />
        <h2 className="text-xl font-light tracking-widest text-white/90">TRENDING NOW</h2>
      </div>

      {/* Horizontal Scroll Container */}
      <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide snap-x">
        {trending.map((dream, index) => {
           // Rank Colors: Gold, Silver, Bronze, or Ghost White
           const rankColor = index === 0 ? "text-yellow-400" : index === 1 ? "text-gray-300" : index === 2 ? "text-orange-400" : "text-white/50";
           
           return (
             <Link 
               href={`/u/${dream.userId?.name}`} 
               key={dream._id}
               className="min-w-[280px] h-[200px] relative rounded-xl overflow-hidden group snap-center cursor-pointer border border-white/10 hover:border-yellow-500/50 transition-all"
             >
                {/* Background Image */}
                <img 
                  src={dream.imageUrl} 
                  className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

                {/* Rank Number */}
                <div className={`absolute top-3 right-4 text-4xl font-black italic opacity-50 ${rankColor}`}>
                  #{index + 1}
                </div>

                {/* Title */}
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-white font-bold truncate">{dream.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                     <span className="text-xs text-white/60">by {dream.userId?.name}</span>
                     <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full text-white/80">
                       ❤️ {dream.likeCount}
                     </span>
                  </div>
                </div>
             </Link>
           );
        })}
      </div>
    </div>
  );
}