"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';

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
    <div className="flex h-[100dvh] w-full bg-black text-white overflow-hidden font-mono uppercase tracking-widest">
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMenuOpen(false)}
            className="fixed inset-0 bg-black/80 z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* LEFT COLUMN - SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 h-full flex flex-col transition-transform duration-300 md:relative md:translate-x-0 bg-black ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* ELBOW VERTICAL DROP - Taller (h-40) to create the heavy LCARS spine. Flush right. */}
        <div className="h-40 w-full bg-[#4A5D70] rounded-tl-[2.5rem] flex items-end justify-end p-4 pb-2 flex-none">
          <h1 className="text-3xl font-bold font-antonio tracking-widest uppercase text-[#9CB4CC]">NCARS</h1>
        </div>
        
        {/* NAV PANELS - Hardware blocks. COMPLETELY flush to the right, sharp edges, stacked with tight gaps */}
        <nav className="flex-1 overflow-y-auto pt-1 pr-0 flex flex-col gap-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <Link href="/" onClick={() => setMenuOpen(false)} className="w-full text-right bg-[#3A4B5C] text-[#9CB4CC] rounded-none py-3 px-4 text-sm font-bold hover:bg-[#CC4444] transition-colors whitespace-nowrap">01 // Comm Center</Link>
          <Link href="/portfolio" onClick={() => setMenuOpen(false)} className="w-full text-right bg-[#3A4B5C] text-[#9CB4CC] rounded-none py-3 px-4 text-sm font-bold hover:bg-[#CC4444] transition-colors whitespace-nowrap">02 // Databanks</Link>
          <Link href="/personnel" onClick={() => setMenuOpen(false)} className="w-full text-right bg-[#3A4B5C] text-[#9CB4CC] rounded-none py-3 px-4 text-sm font-bold hover:bg-[#CC4444] transition-colors whitespace-nowrap">03 // Personnel</Link>
          {isAdmin && <Link href="/admin" onClick={() => setMenuOpen(false)} className="w-full text-right bg-[#CC4444] text-white rounded-none py-3 px-4 text-sm font-bold hover:bg-red-900 transition-colors whitespace-nowrap">04 // Captain&apos;s Log</Link>}
          
          <button onClick={() => { handleLogin(); setMenuOpen(false); }} className="w-full text-right bg-[#3A4B5C] text-[#9CB4CC] rounded-none py-3 px-4 text-sm font-bold hover:bg-[#CC4444] transition-colors mt-4">
            {user ? "LOGOUT" : "LOGIN"}
          </button>

          {/* Decorative LCARS blocks - Panels (squared). Flush right. */}
          <div className="mt-auto flex flex-col gap-1 pb-4 pr-0">
            <div className="h-12 w-full bg-[#9CB4CC] rounded-none opacity-80" />
            <div className="h-6 w-full bg-[#CC4444] rounded-none opacity-80" />
            <div className="h-24 w-full bg-[#3A4B5C] rounded-none opacity-80" />
          </div>
        </nav>
      </aside>

      {/* RIGHT COLUMN - MAIN AREA (This background color is the secret to the inner curve) */}
      <main className="flex-1 flex flex-col h-[100dvh] bg-[#4A5D70] max-w-full overflow-hidden">
        {/* TOP HEADER - This restores the visible horizontal top bar! */}
        <header className="h-12 w-full bg-[#4A5D70] flex items-center justify-end px-4 gap-4 flex-none m-0">
          {/* Mobile Menu Toggle */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-[#9CB4CC] font-mono border border-[#3A4B5C] px-2 py-1 flex-none bg-black/20">
            MENU
          </button>
          
          <div className="hidden md:flex items-center gap-2 text-xs font-bold">
            <div className="h-6 w-16 bg-[#9CB4CC] rounded-none flex-none"></div>
            <div className="h-6 w-8 bg-[#CC4444] rounded-none flex-none"></div>
            <div className="h-6 w-24 bg-[#3A4B5C] rounded-none flex-none"></div>
          </div>
        </header>

        {/* GLOBAL PAGE WRAPPER - bg-black with rounded-tl creates the flawless inner curve! */}
        <div className="flex-1 flex flex-col overflow-hidden p-4 md:p-8 w-full bg-black rounded-tl-[2.5rem] shadow-[inset_0_4px_10px_rgba(0,0,0,0.5)]">
          
          {/* GLOBAL TOP TELEMETRY - Hidden on small screens */}
          <div className="hidden xl:flex w-full h-4 gap-2 items-end opacity-80 mb-6 shrink-0 flex-none">
            <div className="h-4 w-48 bg-[#4A5D70] flex items-center justify-end px-2">
              <span className="text-[0.6rem] text-black font-okuda tracking-widest uppercase">CMD-883</span>
            </div>
            <div className="h-2 w-16 bg-[#CC4444]"></div>
            <div className="h-4 flex-1 bg-[#3A4B5C] flex items-center justify-between px-4">
              <span className="text-[0.6rem] text-[#9CB4CC] font-okuda uppercase tracking-widest leading-none">ALPHA SHIFT // DIAGNOSTIC ROUTE</span>
              <span className="text-[0.6rem] text-[#9CB4CC] font-okuda uppercase tracking-widest leading-none">S-04-747</span>
            </div>
            <div className="h-4 w-24 bg-[#9CB4CC]"></div>
          </div>

          {/* SCROLLABLE PAGE CONTENT - This holds LandingPage, Editor, etc. */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 w-full pr-2 custom-scrollbar">
            {children}
          </div>

          {/* GLOBAL BOTTOM TELEMETRY - Hidden on small screens */}
          <div className="hidden xl:flex w-full mt-4 items-start gap-2 shrink-0 flex-none">
            <div className="h-8 w-3/4 bg-[#4A5D70] rounded-tr-[2rem] flex items-start justify-end p-2 border-t-4 border-black">
              <span className="text-[0.6rem] text-black font-okuda font-bold tracking-widest uppercase">Sub-System Routing Active</span>
            </div>
            <div className="h-3 w-32 bg-[#CC4444]"></div>
            <div className="h-3 flex-1 bg-[#3A4B5C]"></div>
          </div>
        </div>
      </main>
    </div>
  );
}
