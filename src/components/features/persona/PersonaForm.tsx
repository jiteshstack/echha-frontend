"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link2, Sparkles, Wand2, X } from "lucide-react";
import { toast } from "react-hot-toast"; 
import GlassCard from "@/components/ui/GlassCard";
import { PersonaApi, ExtractApi } from "@/lib/api";
import { Persona } from "@/types";
// 👇 1. IMPORT AUTH HOOK
import { useAuth } from "@/context/AuthContext";

// --- TYPES ---
interface PersonaFormProps {
  onCreated?: () => void;
}

interface ScrapedData {
  title: string;
  description: string;
  images: string[];
  price: number;
  url: string;
  domain: string;
  currency: string;
}

export default function PersonaForm({ onCreated }: PersonaFormProps) {
  // 👇 2. GET THE TOKEN (Your ID Card)
  const { token } = useAuth();

  // Modes: 'text' = Manual typing, 'link' = Paste URL
  const [mode, setMode] = useState<'text' | 'link'>('text');
  
  // Form State
  const [prompt, setPrompt] = useState("");
  const [url, setUrl] = useState("");
  const [scrapedItem, setScrapedItem] = useState<ScrapedData | null>(null);

  // App State
  const [status, setStatus] = useState<'idle' | 'extracting' | 'loading' | 'polling' | 'success'>('idle');
  const [persona, setPersona] = useState<Persona | null>(null);
  
  // Ref to track if we should keep polling (prevents zombies)
  const isPollingRef = useRef(false);

  // --- HANDLER: 1. Extract from URL ---
  const handleExtract = async () => {
    if (!url) return;
    setStatus('extracting');
    
    try {
      // Note: If ExtractApi also needs auth, we might need to update it too, 
      // but usually extraction is public.
      const res = await ExtractApi.analyze(url);
      
      if (res.success) {
        const data = res.data;
        setScrapedItem(data);

        // SMART PROMPT ENGINEERING
        const smartPrompt = `Cinematic, high-end commercial shot of ${data.title}. 
Focus on details: ${data.description ? data.description.substring(0, 150) : 'luxury product details'}. 
Lighting: Studio softbox, 8k resolution, photorealistic, slow motion product reveal.`;
        
        setPrompt(smartPrompt);
        setMode('text'); 
        setStatus('idle');
        toast.success("Product details extracted");
      }
    } catch (err) {
      console.error("Extraction failed", err);
      toast.error("Could not read this link. Try entering manually.");
      setStatus('idle');
    }
  };

  // --- HANDLER: 2. Create Persona (UPDATED) ---
  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    // 🛡️ CHECK: Do we have a token?
    if (!token) {
        toast.error("Please login to generate dreams.");
        return;
    }

    try {
      setStatus('loading');
      
      const thumbnail = scrapedItem?.images?.[0] || undefined;

      // 👇 REPLACED 'PersonaApi.create' WITH DIRECT FETCH
      // This ensures we send the Token correctly!
      const response = await fetch('/api/backend/api/persona/create', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // ✅ THE FIX: Sending your ID
        },
        body: JSON.stringify({
            prompt,
            // userId: 'guest-user', ❌ REMOVED THIS! The token handles it.
            imageUrl: thumbnail,
            title: scrapedItem?.title,
            price: scrapedItem?.price,
            currency: scrapedItem?.currency,
            domain: scrapedItem?.domain
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setPersona(data.data);
        setStatus('polling');
        // Start the polling loop
        startPolling(data.data._id);
        if (onCreated) onCreated();
        toast.success("Dream initiated. Creating reality...");
      } else {
        throw new Error(data.message || "Generation failed");
      }

    } catch (err: any) {
      console.error("Failed to create:", err);
      setStatus('idle');
      toast.error(err.message || "Something went wrong.");
    }
  };

  // --- 3. ROBUST RECURSIVE POLLING ---
  const startPolling = async (id: string) => {
    isPollingRef.current = true;
    pollStatus(id);
  };

  const pollStatus = async (id: string) => {
    // 1. Safety Check: Stop if user navigated away or cancelled
    if (!isPollingRef.current) return;

    try {
      console.log(`📡 Checking Status for ${id}...`);
      
      // We use the helper here (usually safe for GET requests)
      // If this fails too, we can replace it with fetch later.
      const res = await PersonaApi.getStatus(id);
      
      // ✅ SUCCESS CASE
      if (res.data.status === 'completed') {
        console.log("✅ Video Finished!");
        setPersona(res.data);
        setStatus('success');
        isPollingRef.current = false; 
        toast.success("Your Persona is ready!", { duration: 5000 });
        return;
      }

      // ❌ FAILURE CASE
      if (res.data.status === 'failed') {
        console.error("❌ Generation Failed");
        setStatus('idle');
        toast.error("AI Generation Failed.");
        isPollingRef.current = false;
        return;
      }

      // ⏳ WAIT & RETRY (Recursion)
      if (isPollingRef.current) {
        setTimeout(() => pollStatus(id), 3000); 
      }

    } catch (err) {
      console.error("Polling Network Error", err);
      // Even on error, we try again in case it was a blip
      if (isPollingRef.current) {
        setTimeout(() => pollStatus(id), 5000);
      }
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isPollingRef.current = false; // Kill polling if component closes
    };
  }, []);

  // --- UI RENDER ---
  return (
    <div className="w-full max-w-xl mx-auto space-y-8">
      
      {/* 1. INPUT VIEW */}
      {(status === 'idle' || status === 'extracting') && (
        <GlassCard>
          <div className="flex space-x-6 mb-6 border-b border-white/10 pb-2">
            <button 
              onClick={() => setMode('text')}
              className={`pb-2 flex items-center gap-2 text-sm uppercase tracking-widest transition-colors ${mode === 'text' ? 'text-white border-b-2 border-purple-500' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <Sparkles size={16} /> Desire
            </button>
            <button 
              onClick={() => setMode('link')}
              className={`pb-2 flex items-center gap-2 text-sm uppercase tracking-widest transition-colors ${mode === 'link' ? 'text-white border-b-2 border-purple-500' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <Link2 size={16} /> Extract
            </button>
          </div>

          {/* Scraped Preview */}
          {scrapedItem && mode === 'text' && (
             <motion.div 
               initial={{ opacity: 0, y: -10 }}
               animate={{ opacity: 1, y: 0 }}
               className="mb-6 p-3 bg-white/5 rounded-xl border border-white/10 flex gap-4 items-center relative group"
             >
               {scrapedItem.images && scrapedItem.images.length > 0 ? (
                 <img src={scrapedItem.images[0]} alt="Product" className="w-16 h-16 object-cover rounded-lg border border-white/20"/>
               ) : (
                 <div className="w-16 h-16 bg-white/10 rounded-lg flex items-center justify-center text-xs">No Img</div>
               )}
               <div className="overflow-hidden flex-1">
                 <h4 className="text-sm font-bold text-white truncate pr-6">{scrapedItem.title}</h4>
                 <p className="text-xs text-purple-400">
                    {scrapedItem.domain} • {scrapedItem.currency} {scrapedItem.price > 0 ? scrapedItem.price : ''}
                 </p>
               </div>
               <button onClick={() => { setScrapedItem(null); setPrompt(""); }} className="absolute top-2 right-2 text-gray-500 hover:text-white">
                 <X size={14} />
               </button>
             </motion.div>
           )}

          <AnimatePresence mode="wait">
            {mode === 'text' ? (
              <motion.div key="text-mode" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                {!scrapedItem && <h2 className="text-2xl font-light text-white mb-4">What do you desire?</h2>}
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="E.g. A cyberpunk samurai shopping in neon Tokyo..."
                  className="w-full h-32 bg-transparent text-xl text-gray-200 placeholder-gray-600 border-none outline-none resize-none"
                  autoFocus
                />
                <div className="mt-6 flex justify-end">
                  <button onClick={handleGenerate} disabled={!prompt} className="bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-gray-200 transition-all disabled:opacity-50 flex items-center gap-2">
                    <Wand2 size={18} /> Generate Persona
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div key="link-mode" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                <h2 className="text-2xl font-light text-white mb-4">Paste a Product Link</h2>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://flipkart.com/..."
                  className="w-full bg-white/5 text-xl text-white p-4 rounded-xl border border-white/10 outline-none focus:border-purple-500 transition-colors"
                  autoFocus
                />
                <div className="mt-6 flex justify-end">
                  <button onClick={handleExtract} disabled={!url || status === 'extracting'} className="bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-gray-200 transition-all disabled:opacity-50 flex items-center gap-2">
                    {status === 'extracting' ? <span className="animate-pulse flex items-center gap-2"><Sparkles size={18} className="animate-spin" /> Scanning...</span> : <><Link2 size={18} /> Analyze URL</>}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </GlassCard>
      )}

      {/* 2. LOADING / POLLING VIEW */}
      {(status === 'loading' || status === 'polling') && (
        <GlassCard className="text-center py-12">
          <div className="animate-pulse-slow text-6xl mb-6">🔮</div>
          <h3 className="text-2xl text-white font-light">
            {status === 'loading' ? "Contacting AI..." : "Dreaming your reality..."}
          </h3>
          <p className="text-gray-500 mt-2">This may take a few moments</p>
          {scrapedItem?.images?.[0] && (
            <motion.img initial={{ opacity: 0 }} animate={{ opacity: 1 }} src={scrapedItem.images[0]} alt="Preview" className="mt-6 rounded-lg w-full h-64 object-cover opacity-50 mx-auto" />
          )}
        </GlassCard>
      )}

      {/* 3. SUCCESS VIEW */}
      {status === 'success' && persona?.videoUrl && (
        <GlassCard>
          <h2 className="text-xl text-white mb-4">Your Persona is Ready</h2>
          <video src={persona.videoUrl} autoPlay loop muted controls className="w-full rounded-lg shadow-[0_0_30px_rgba(124,58,237,0.3)]" />
          <button onClick={() => { setStatus('idle'); setPrompt(""); setUrl(""); setScrapedItem(null); }} className="mt-6 w-full py-3 border border-white/20 rounded-full text-white hover:bg-white/10 transition">
            Create Another
          </button>
        </GlassCard>
      )}
    </div>
  );
}