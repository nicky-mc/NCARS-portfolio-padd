"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getCaptainLog, CaptainLog } from "@/lib/logUtils";
import ReadOnlyLexicalEditor from "@/components/ReadOnlyLexicalEditor";
import { motion } from "framer-motion";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, deleteDoc } from "firebase/firestore";

export default function PortfolioDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [log, setLog] = useState<CaptainLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [armDelete, setArmDelete] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    async function fetchLog() {
      if (typeof params.id === 'string') {
        try {
          const data = await getCaptainLog(params.id);
          setLog(data);
        } catch (error) {
          console.error("Failed to fetch log:", error);
        } finally {
          setLoading(false);
        }
      }
    }
    fetchLog();
  }, [params.id]);

  const handleDelete = async () => {
    try {
      await deleteDoc(doc(db, "captains_logs", params.id as string));
      router.push("/portfolio");
    } catch (error) {
      console.error("Deletion failed:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-sky-800 animate-pulse font-mono tracking-widest">
        SEARCHING DATABANKS...
      </div>
    );
  }

  if (!log) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-red-800 font-mono tracking-widest text-xl font-bold">404 // LOG NOT FOUND</div>
        <div className="text-sky-800 font-mono text-sm">THE REQUESTED RECORD DOES NOT EXIST OR HAS BEEN CLASSIFIED.</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8 pb-12">
      {/* Top Telemetry Decor */}
      <div className="flex justify-between items-end w-full gap-2">
        <div className="flex gap-1 items-end">
          <div className="h-6 w-16 bg-[#4A5D70] flex items-center justify-center p-1">
            <span className="text-[0.6rem] text-black font-okuda font-bold uppercase">LOG-ID</span>
          </div>
          <div className="h-4 w-32 bg-[#9CB4CC] flex items-center px-4">
             <span className="text-[0.5rem] text-black font-okuda font-bold truncate">{log.id}</span>
          </div>
          <div className="h-2 w-8 bg-[#CC4444]"></div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-[0.5rem] text-[#9CB4CC]/40 font-mono">ENCRYPTION: LEVEL 5</span>
          <div className="h-1 w-24 bg-[#3A4B5C]"></div>
        </div>
      </div>

      <header className="border-b-2 border-sky-800 pb-4">
        <div className="flex justify-between items-baseline mb-2">
          <h1 className="text-4xl font-antonio text-orange-700 tracking-tight uppercase">
            {log.title}
          </h1>
          <div className="text-right">
            <span className="block text-xs font-mono text-[#9CB4CC] uppercase tracking-widest">Stardate</span>
            <span className="text-xl font-okuda text-white tracking-widest">{log.stardate}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="h-2 w-1/4 bg-[#4A5D70]"></div>
          <div className="h-2 w-1/6 bg-[#CC4444]"></div>
          <div className="h-2 flex-1 bg-[#3A4B5C]/30"></div>
        </div>
      </header>
      
      {/* Content Area */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-8 relative overflow-hidden"
      >
        {/* Scanning Deco */}
        <div className="absolute top-0 left-0 w-2 h-full bg-[#4A5D70]/20"></div>
        
        <ReadOnlyLexicalEditor content={log.content} />
        
        {/* Bottom Deco */}
        <div className="mt-8 pt-4 border-t border-sky-800/30 flex justify-between items-center text-[0.6rem] font-mono text-sky-800/50 uppercase tracking-[0.2em]">
          <span>Record terminal // EOD</span>
          <span>Titan-A / NCC-80102-A</span>
        </div>
      </motion.div>

      {/* Footer Navigation Greebles */}
      <div className="flex gap-1 h-8 items-start opacity-60">
        <div className="h-full w-4 bg-[#CC4444]"></div>
        <div className="h-full flex-1 bg-[#4A5D70] rounded-br-[2rem]"></div>
      </div>

      {/* CRUD Action Buttons */}
      <div className="flex gap-4 mt-8 justify-end border-t-2 border-[#4A5D70] pt-4 relative z-50 pointer-events-auto">
          <button 
            type="button"
            onClick={() => router.push('/portfolio')} 
            className="bg-[#4A5D70] text-black font-okuda px-6 py-2 text-sm font-bold hover:bg-[#9CB4CC] transition-colors rounded-none cursor-pointer"
          >
              RETURN TO DATABANKS
          </button>
          
          {user && user.uid === process.env.NEXT_PUBLIC_ADMIN_UID && (
            <>
              <button 
                type="button"
                onClick={() => router.push(`/admin?edit=${params.id}`)} 
                className="bg-[#E65100] text-black font-okuda px-6 py-2 text-sm font-bold hover:bg-orange-400 transition-colors rounded-none cursor-pointer"
              >
                  EDIT LOG
              </button>
              <button 
                type="button" 
                onClick={(e) => { 
                  e.preventDefault(); 
                  e.stopPropagation();
                  if (!armDelete) {
                    setArmDelete(true);
                  } else {
                    handleDelete();
                  }
                }} 
                className={`font-okuda px-6 py-2 text-sm font-bold transition-colors rounded-none relative z-50 cursor-pointer ${armDelete ? 'bg-red-600 text-white animate-pulse' : 'bg-red-900 text-white hover:bg-[#CC4444]'}`}
              >
                  {armDelete ? "CONFIRM PURGE" : "DELETE LOG"}
              </button>
            </>
          )}
      </div>
    </div>
  );
}
