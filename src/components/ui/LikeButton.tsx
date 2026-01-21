"use client";

import { useState } from 'react';
import { Heart } from 'lucide-react';

interface LikeButtonProps {
  dreamId: string;
  initialLikes: number;
}

export default function LikeButton({ dreamId, initialLikes }: LikeButtonProps) {
  const [liked, setLiked] = useState(false); // In a real app, we'd check if user already liked it
  const [count, setCount] = useState(initialLikes);
  const [loading, setLoading] = useState(false);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent clicking the parent Card
    e.stopPropagation(); 

    if (loading) return;

    // ⚡ Optimistic UI: Update screen BEFORE server responds
    const previousLiked = liked;
    const previousCount = count;

    setLiked(!liked);
    setCount(liked ? count - 1 : count + 1);
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert("Login to like dreams!");
        throw new Error("No token");
      }

      // Call the API
      const res = await fetch(`/api/backend/api/social/like/${dreamId}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await res.json();
      if (!data.success) throw new Error();

    } catch (err) {
      // Revert if failed
      setLiked(previousLiked);
      setCount(previousCount);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleLike}
      className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 group ${
        liked 
          ? "bg-red-500/20 text-red-500 border border-red-500/50" 
          : "bg-white/5 text-white/40 border border-white/10 hover:bg-white/10 hover:text-white"
      }`}
    >
      <Heart 
        size={18} 
        className={`transition-transform duration-300 ${liked ? "fill-current scale-110" : "group-hover:scale-110"}`} 
      />
      <span className="text-sm font-bold">{count}</span>
    </button>
  );
}