"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import AuthModal from "@/components/features/auth/AuthModal";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [isAuthOpen, setAuthOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 w-full z-40 bg-black/50 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-2xl font-light tracking-tighter text-white">
            echha<span className="text-purple-500">.</span>
          </Link>

          <div className="flex items-center gap-6">
            {user ? (
              // --- LOGGED IN VIEW ---
              <div className="flex items-center gap-4">
                
                {/* User Info Block */}
                <div className="text-right hidden md:block">
                  <div className="text-sm font-bold text-white leading-tight">
                    {user.name}
                  </div>
                  {/* ✨ SHOW DNA PERSONA IF IT EXISTS ✨ */}
                  {user.dnaCard?.persona && (
                    <div className="text-[10px] uppercase tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 font-bold">
                      {user.dnaCard.persona}
                    </div>
                  )}
                </div>

                {/* ✅ WRAP THIS DIV IN A LINK */}
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