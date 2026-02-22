"use client";

import { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import Link from 'next/link';

interface Notification {
  _id: string;
  sender: { name: string };
  dreamId: { title: string };
  type: string;
  read: boolean;
  createdAt: string;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 1. Fetch Notifications on Load
  useEffect(() => {
    const fetchNotifications = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const res = await fetch('/api/backend/api/notifications', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setNotifications(data.data);
          setUnreadCount(data.unread);
        }
      } catch (err) {
        console.error("🔔 Fetch Error:", err);
      }
    };

    fetchNotifications();
    // Optional: Poll every 60 seconds for new likes
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  // 2. Handle Click (Open Dropdown & Mark Read)
  const toggleDropdown = async () => {
    if (!isOpen && unreadCount > 0) {
      // Optimistic UI: Clear badge immediately
      setUnreadCount(0);
      
      // Tell Backend we saw them
      const token = localStorage.getItem('token');
      if (token) {
        fetch('/api/backend/api/notifications/read', {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    }
    setIsOpen(!isOpen);
  };

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* 🔔 THE BELL ICON */}
      <button 
        onClick={toggleDropdown}
        className="relative p-2 text-white/60 hover:text-white transition-colors"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_#ef4444]" />
        )}
      </button>

      {/* 📜 THE DROPDOWN */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
          <div className="p-3 border-b border-white/5 text-xs font-bold text-white/40 uppercase tracking-widest">
            Notifications
          </div>
          
          <div className="max-h-64 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-white/20 text-sm italic">
                No new activity... yet.
              </div>
            ) : (
              notifications.map((notif) => (
                <div key={notif._id} className={`p-4 border-b border-white/5 flex gap-3 hover:bg-white/5 transition-colors ${!notif.read ? 'bg-white/5' : ''}`}>
                  <div className="w-2 h-2 mt-1.5 rounded-full bg-blue-500 shrink-0" />
                  <div>
                    <p className="text-sm text-white/90 leading-snug">
                      <span className="font-bold text-white">{notif.sender?.name || "Someone"}</span> liked your dream <span className="italic text-purple-400">"{notif.dreamId?.title || 'Unknown'}"</span>
                    </p>
                    <p className="text-[10px] text-white/30 mt-1 uppercase tracking-wider">
                      {new Date(notif.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}