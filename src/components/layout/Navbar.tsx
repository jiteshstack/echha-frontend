"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import AuthModal from "@/components/features/auth/AuthModal";
import NotificationBell from "@/components/features/notifications/NotificationBell"; // ✅ IMPORT BELL

export default function Navbar() {
  const { user, logout } = useAuth();
  const [isAuthOpen, setAuthOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 w-full z-40 bg-black/50 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          
          {/* 1. LOGO */}
          <Link href="/" className="text-2xl font-light tracking-tighter text-white">
            echha<span className="text-purple-500">.</span>
          </Link>

          {/* 2. NAVIGATION LINKS (Only show if logged in) */}
          {user && (
            <div className="hidden md:flex items-center gap-6 text-sm uppercase tracking-widest text-white/60">
              <Link href="/explore" className="hover:text-purple-400 transition-colors">Explore</Link>
              <Link href="/dashboard" className="hover:text-purple-400 transition-colors">My Vault</Link>
            </div>
          )}

          <div className="flex items-center gap-6">
            {user ? (
              // --- LOGGED IN VIEW ---
              <div className="flex items-center gap-4">
                
                {/* 🔔 3. NOTIFICATION BELL (Added Here) */}
                <div className="mr-2">
                    <NotificationBell />
                </div>

                {/* User Info Block (Your existing code) */}
                <Link href="/profile" className="text-right hidden md:block cursor-pointer hover:opacity-80 transition">
                    <div className="text-sm font-bold text-white leading-tight">
                        {user.name}
                    </div>
                    {user.dnaCard?.persona && (
                        <div className="text-[10px] uppercase tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 font-bold">
                        {user.dnaCard.persona}
                        </div>
                    )}
                </Link>

                {/* Logout Button */}
                <button 
                  onClick={logout} 
                  className="px-4 py-2 text-xs font-bold uppercase tracking-widest border border-white/20 rounded-full hover:bg-white hover:text-black transition"
                >
                  Logout
                </button>
              </div>
            ) : (
              // --- GUEST VIEW ---
              <button 
                onClick={() => setAuthOpen(true)} 
                className="px-6 py-2 bg-white text-black text-sm font-bold rounded-full hover:bg-gray-200 transition"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </nav>
      <AuthModal isOpen={isAuthOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}