"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User as UserIcon, ArrowRight } from 'lucide-react';
import { AuthApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { login } = useAuth();
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    console.log("🚀 Attempting Login/Register..."); // Check Console

    try {
      let res;
      if (isLogin) {
        console.log("Submitting Login:", { email });
        res = await AuthApi.login(email, password);
      } else {
        console.log("Submitting Register:", { name, email });
        res = await AuthApi.register(name, email, password);
      }

      console.log("✅ API Response:", res);

      if (res && res.token) {
        alert("Login Successful! Closing Modal..."); // Temporary Alert
        login(res.token, res.user);
        onClose();

        // If it was Registration, go to Onboarding
        if (!isLogin) {
          router.push('/onboarding');
        }
      } else {
        console.error("❌ Token missing in response:", res);
        setError("Server connected, but no token received.");
      }
    } catch (err: any) {
      console.error("❌ Request Failed:", err);
      // Show the actual error message from backend
      const serverMessage = err.response?.data?.message || err.message;
      alert(`Error: ${serverMessage}`); // Force user to see error
      setError(serverMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      {/* Modal */}
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="relative w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X size={20} /></button>

        <div className="p-8">
          <h2 className="text-2xl font-light text-white mb-2">{isLogin ? "Welcome Back" : "Join Echha"}</h2>
          <p className="text-sm text-gray-400 mb-8">{isLogin ? "Sign in to your sanctuary." : "Create your digital wishlist."}</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence>
              {!isLogin && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="overflow-hidden">
                  <div className="relative group mb-4">
                    <UserIcon size={18} className="absolute left-3 top-3 text-gray-500" />
                    <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 pl-10 text-white" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative group">
              <Mail size={18} className="absolute left-3 top-3 text-gray-500" />
              <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 pl-10 text-white" />
            </div>
            <div className="relative group">
              <Lock size={18} className="absolute left-3 top-3 text-gray-500" />
              <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 pl-10 text-white" />
            </div>

            {error && <p className="text-red-400 text-xs text-center">{error}</p>}

            <button disabled={loading} className="w-full bg-white text-black font-bold py-3 rounded-lg flex items-center justify-center gap-2 mt-4 hover:bg-gray-200">
              {loading ? "Processing..." : (isLogin ? "Sign In" : "Create Account")}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            <button onClick={() => { setIsLogin(!isLogin); setError(""); }} className="text-white hover:underline">
              {isLogin ? "Create Account" : "Sign In"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}