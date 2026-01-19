"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { DnaApi } from '@/lib/api';

const QUESTIONS = [
  {
    id: 1,
    text: "Where does your mind wander?",
    options: [
      { label: "Neon City Streets", value: "neon tech" },
      { label: "Quiet Forest Cabin", value: "nature calm" },
      { label: "Golden Penthouse", value: "luxury gold" },
    ]
  },
  {
    id: 2,
    text: "Pick your weapon of choice.",
    options: [
      { label: "Analog Camera", value: "vintage" },
      { label: "Holographic Tablet", value: "tech" },
      { label: "Fountain Pen", value: "classic" },
    ]
  },
  {
    id: 3,
    text: "What fuels you?",
    options: [
      { label: "Chaos & Adrenaline", value: "chaos" },
      { label: "Order & Silence", value: "order" },
      { label: "Beauty & Art", value: "art" },
    ]
  }
];

export default function OnboardingPage() {
  const { user, login, loading: authLoading } = useAuth(); 
  const router = useRouter();
  
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // 🛡️ SECURITY CHECK
  useEffect(() => {
    // Only redirect if we are SURE auth is done loading,
    // AND there is no user,
    // AND there is no token in local storage (double check)
    const token = localStorage.getItem('token');
    
    if (!authLoading && !user && !token) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  const handleSelect = async (value: string) => {
    const newAnswers = [...answers, value];
    setAnswers(newAnswers);

    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      // FINISH -> CALL API
      await submitDNA(newAnswers);
    }
  };

  const submitDNA = async (finalAnswers: string[]) => {
    // Extra safety check
    if (!user) {
      alert("Session expired. Please log in again.");
      router.push('/');
      return;
    }

    setLoading(true);
    
    try {
      // 1. Generate DNA on Server
      const res = await DnaApi.generate(user.id, finalAnswers);
      
      if (res && (res.success || res.data)) {
        // 2. Update local user context with the new DNA
        const token = localStorage.getItem('token') || "";
        // Use res.data if it exists, otherwise fall back to what's available
        const userData = res.data || res; 
        
        login(token, userData);
        
        // 3. Go to Home
        router.push('/'); 
      }
    } catch (err) {
      console.error(err);
      alert("Failed to sync neural link. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const currentQ = QUESTIONS[step];

  // Prevent rendering while checking auth
  if (authLoading) return null; 

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      {/* PROGRESS BAR */}
      <div className="w-full max-w-md h-1 bg-white/10 mb-12 rounded-full overflow-hidden">
        <motion.div 
          className="h-full bg-purple-500"
          initial={{ width: 0 }}
          animate={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }}
        />
      </div>

      <AnimatePresence>
        {loading ? (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-center"
          >
            <h2 className="text-2xl font-light animate-pulse">Analyzing Neural Patterns...</h2>
            <p className="text-sm text-gray-500 mt-2">Generating your digital persona.</p>
          </motion.div>
        ) : (
          <motion.div 
            key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-md"
          >
            <h1 className="text-3xl font-light mb-8 text-center">{currentQ.text}</h1>
            
            <div className="space-y-3">
              {currentQ.options.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleSelect(opt.value)}
                  className="w-full p-4 border border-white/10 rounded-xl text-left hover:bg-white/10 hover:border-purple-500 transition-all group"
                >
                  <span className="text-gray-400 group-hover:text-white transition-colors">{opt.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}