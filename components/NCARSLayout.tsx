"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';

const NavLinks = ({ isAdmin, user, handleLogin }: { isAdmin: boolean, user: any, handleLogin: () => void }) => (
  <>
    <Link href="/" className="w-full px-4 py-2 bg-slate-700 text-sky-200 text-xs font-bold whitespace-nowrap rounded-full text-right hover:bg-sky-800 transition-colors">01 // Comm Center</Link>
    <Link href="/portfolio" className="w-full px-4 py-2 bg-slate-700 text-sky-200 text-xs font-bold whitespace-nowrap rounded-full text-right hover:bg-sky-800 transition-colors">02 // Databanks</Link>
    <Link href="/personnel" className="w-full px-4 py-2 bg-slate-700 text-sky-200 text-xs font-bold whitespace-nowrap rounded-full text-right hover:bg-sky-800 transition-colors">03 // Personnel</Link>
    {isAdmin && <Link href="/admin" className="w-full px-4 py-2 bg-red-800 text-sky-200 text-xs font-bold whitespace-nowrap rounded-full text-right hover:bg-red-900 transition-colors">04 // Captain&apos;s Log</Link>}
    <button onClick={handleLogin} className="w-full px-4 py-2 bg-orange-700 text-sky-200 text-xs font-bold whitespace-nowrap rounded-full text-right hover:bg-orange-800 transition-colors mt-4">
      {user ? "LOGOUT" : "LOGIN"}
    </button>
  </>
);

export default function NCARSLayout({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setIsAdmin(u?.uid === process.env.NEXT_PUBLIC_ADMIN_UID);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      if (user) {
        await signOut(auth);
        await fetch('/api/auth', { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'logout' }) 
        });
      } else {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        await fetch('/api/auth', { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ uid: result.user.uid, action: 'login' }) 
        });
      }
    } catch (e) {
      console.error("Auth error:", e);
    }
  };

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden text-sky-200">
      {/* Mobile Hamburger Header */}
      <div className="md:hidden absolute top-0 w-full h-16 border-b border-sky-800 flex items-center justify-between px-4 z-50 glass-panel">
        <span className="font-antonio text-2xl tracking-widest text-orange-700">NCARS 25</span>
        <button onClick={() => setMenuOpen(!menuOpen)} className="text-sky-200 font-mono border border-sky-800 px-2 py-1">
          {menuOpen ? "CLOSE" : "MENU"}
        </button>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div 
            initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
            className="absolute inset-y-0 left-0 w-64 glass-panel z-40 pt-16 border-r border-sky-800 md:hidden"
          >
            <NavLinks isAdmin={isAdmin} user={user} handleLogin={handleLogin} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Content Area */}
      <div className="md:hidden flex-1 pt-16 overflow-y-auto p-4">
        {children}
      </div>

      {/* Desktop LCARS Layout */}
      <div className="hidden md:flex h-screen w-full bg-black text-sky-200 p-4">
        {/* Left Column (Sidebar) */}
        <div className="w-48 flex flex-col">
          {/* The Top-Left Corner Block (The Elbow Joint) */}
          <div className="w-full h-16 bg-slate-700 rounded-tl-3xl rounded-bl-none flex items-center justify-end pr-4">
            <span className="font-antonio text-2xl text-sky-200 font-bold tracking-tighter">NCARS</span>
          </div>
          
          {/* The Menu Area */}
          <div className="flex-1 flex flex-col gap-4 mt-4 mr-4">
            <NavLinks isAdmin={isAdmin} user={user} handleLogin={handleLogin} />
            {/* Decorative LCARS blocks */}
            <div className="h-12 w-full bg-slate-300 rounded-full mt-auto" />
            <div className="h-6 w-full bg-red-800 rounded-full" />
            <div className="h-32 w-full bg-orange-700 rounded-full mb-4" />
          </div>
        </div>

        {/* Right Column (Main Area) */}
        <div className="flex-1 flex flex-col">
          {/* The Top Bar */}
          <div className="w-full h-16 bg-slate-700 rounded-tr-3xl relative">
            <div className="absolute inset-0 bg-slate-700 rounded-tr-3xl rounded-bl-3xl flex items-center justify-end px-4 gap-2">
              <div className="h-8 w-20 bg-slate-300 rounded-full flex-none"></div>
              <div className="h-8 w-12 bg-red-800 rounded-full flex-none"></div>
            </div>
          </div>
          
          {/* The Page Content */}
          <div className="flex-1 overflow-auto mt-4 custom-scrollbar">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
