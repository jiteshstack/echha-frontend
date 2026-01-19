"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Play, AlertCircle, Clock, ExternalLink } from "lucide-react";
import { toast } from "react-hot-toast"; // ✅ Import Toast
import GlassCard from "@/components/ui/GlassCard";
import { PersonaApi } from "@/lib/api";
import { Persona } from "@/types";

export default function PersonaGallery({ refreshTrigger }: { refreshTrigger: number }) {
  const [history, setHistory] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. FETCH DATA
  const fetchHistory = async () => {
    try {
      const res = await PersonaApi.getAll();
      if (res.success) {
        setHistory(res.data);
      }
    } catch (err) {
      console.error("Failed to load history", err);
      // We don't usually toast on initial load failure to avoid spamming the user
    } finally {
      setLoading(false);
    }
  };

  // 2. DELETE FUNCTION (Updated)
  const handleDelete = async (id: string) => {
    if(!confirm("Are you sure you want to delete this dream?")) return;
    
    // Optimistic Update: Remove from UI immediately
    setHistory(prev => prev.filter(item => item._id !== id));
    
    // ✅ Toast Loading State
    const toastId = toast.loading("Removing from vault...");

    try {
      await PersonaApi.delete(id);
      toast.success("Dream deleted successfully", { id: toastId }); // Update to success
    } catch (err) {
      toast.error("Could not delete dream", { id: toastId }); // Update to error
      fetchHistory(); // Sync back if it failed
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [refreshTrigger]);

  if (loading) return <div className="text-center text-gray-500 mt-10">Loading collection...</div>;
  
  if (history.length === 0) {
    return (
      <div className="w-full max-w-6xl mx-auto mt-20 px-4 text-center py-12 border border-dashed border-white/10 rounded-xl">
        <p className="text-gray-500">Your vault is empty.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto mt-20 px-4 pb-20">
      <h3 className="text-2xl text-white font-light mb-8 border-b border-white/10 pb-4 flex justify-between items-end">
        <span className="tracking-wide">THE VAULT</span>
        <span className="text-xs text-gray-500 tracking-widest uppercase">{history.length} ITEMS</span>
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {history.map((item, index) => (
            <GlassCard key={item._id} delay={index * 0.1} className="group hover:bg-white/5 transition-colors relative overflow-hidden flex flex-col h-full">
              
              {/* 1. MEDIA HEADER */}
              <div className="aspect-video bg-black/50 rounded-lg overflow-hidden mb-4 relative">
                {item.status === 'completed' && item.videoUrl ? (
                  <div className="relative w-full h-full">
                    <video
                      src={item.videoUrl}
                      className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                      muted
                      loop
                      playsInline
                      onError={(e) => {
                          console.warn("Video failed to load:", item.videoUrl);
                          e.currentTarget.style.display = 'none'; 
                      }}
                      onMouseOver={(e) => {
                          e.currentTarget.play().catch(err => console.log("Playback aborted", err));
                      }}
                      onMouseOut={(e) => {
                          e.currentTarget.pause();
                          e.currentTarget.currentTime = 0;
                      }}
                    />
                    <img src={item.imageUrl} className="absolute inset-0 w-full h-full object-cover opacity-60 -z-10" alt="thumbnail" />
                    
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none group-hover:opacity-0 transition-opacity">
                      <div className="bg-white/10 backdrop-blur-md p-3 rounded-full">
                          <Play size={20} className="text-white fill-white ml-1" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-600 relative bg-gray-900">
                    {/* Show Scraped Image while processing */}
                    {item.imageUrl && !item.imageUrl.includes("placehold") ? (
                       <img src={item.imageUrl} className="w-full h-full object-cover opacity-40" />
                    ) : (
                       <div className="w-full h-full bg-gradient-to-br from-gray-800 to-black" />
                    )}
                    
                    {/* Status Indicator */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                        {item.status === 'processing' && (
                            <>
                                <Clock className="animate-spin text-purple-400" size={24} />
                                <span className="text-[10px] uppercase tracking-widest text-purple-400 animate-pulse">Processing</span>
                            </>
                        )}
                        {item.status === 'failed' && (
                            <>
                                <AlertCircle className="text-red-500" size={24} />
                                <span className="text-[10px] uppercase tracking-widest text-red-500">Failed</span>
                            </>
                        )}
                    </div>
                  </div>
                )}
                
                {item.domain && item.domain !== 'unknown' && (
                  <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-[10px] text-gray-300 uppercase tracking-wider border border-white/10">
                    {item.domain}
                  </div>
                )}
              </div>

              {/* 2. TITLE & PRICE */}
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-white font-medium text-lg leading-tight line-clamp-1 pr-4" title={item.title}>
                  {item.title && item.title !== "Untitled Dream" ? item.title : "Untitled Dream"}
                </h4>
                
                {item.price && item.price > 0 && (
                  <span className="text-emerald-400 font-mono text-sm whitespace-nowrap">
                    {item.currency === 'INR' ? '₹' : '$'}{item.price.toLocaleString()}
                  </span>
                )}
              </div>

              {/* 3. PROMPT & DATE */}
              <p className="text-gray-400 text-xs line-clamp-2 italic mb-4 border-l-2 border-purple-500/30 pl-3 flex-grow">
                "{item.prompt}"
              </p>

              {/* 4. FOOTER (Status + Delete) */}
              <div className="flex justify-between items-center border-t border-white/5 pt-3 mt-auto">
                 <div className="flex flex-col">
                    <span className="text-[10px] text-gray-600 uppercase tracking-widest">
                        {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                    <span className={`text-[10px] uppercase font-bold ${
                        item.status === 'completed' ? 'text-green-500/50' : 
                        item.status === 'failed' ? 'text-red-500/50' : 'text-yellow-500/50'
                    }`}>
                        {item.status}
                    </span>
                 </div>

                 {/* DELETE BUTTON */}
                 <button 
                    onClick={() => handleDelete(item._id)}
                    className="p-2 text-gray-600 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all"
                    title="Remove from Vault"
                 >
                    <Trash2 size={16} />
                 </button>
              </div>

            </GlassCard>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}