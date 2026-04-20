"use client";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { getCaptainLogs, CaptainLog } from "@/lib/logUtils";
import Link from "next/link";

export default function Portfolio() {
  const [logs, setLogs] = useState<CaptainLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLogs() {
      try {
        const data = await getCaptainLogs();
        setLogs(data);
      } catch (error) {
        console.error("Failed to fetch logs:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchLogs();
  }, []);

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-antonio text-orange-700 mb-6 border-b-2 border-sky-800 pb-2 uppercase tracking-widest">
        DATABANKS // CAPTAIN&apos;S LOGS
      </h1>
      
      {loading ? (
        <div className="text-sky-800 animate-pulse font-mono tracking-widest py-12">
          QUERYING ARCHIVES...
        </div>
      ) : logs.length === 0 ? (
        <div className="text-sky-800 font-mono py-12">
          NO RECORDS FOUND IN CURRENT SECTOR.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {logs.map((log) => (
            <Link key={log.id} href={`/portfolio/${log.id}`}>
              <motion.div
                className="relative glass-panel p-6 min-h-[160px] overflow-hidden cursor-pointer group hover:border-orange-700 transition-colors"
                onHoverStart={() => setHoveredId(log.id || null)}
                onHoverEnd={() => setHoveredId(null)}
                whileHover={{ scale: 1.02 }}
              >
                {/* Scanning Light Pulse */}
                <div className={`absolute inset-0 w-full h-1 bg-sky-800/20 shadow-[0_0_10px_rgba(7,89,133,0.3)] ${hoveredId === log.id ? 'hidden' : 'animate-scan-line'}`} />
                
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-antonio text-sky-200 uppercase tracking-tight relative z-10">{log.title}</h2>
                  <span className="text-[10px] font-okuda text-orange-700 font-bold bg-orange-700/10 px-2 py-0.5 rounded-sm">
                    {log.stardate}
                  </span>
                </div>
                
                <p className="text-sky-800 font-mono text-[0.6rem] uppercase tracking-widest mb-4">
                  RECORD ID: {log.id?.slice(0, 8)}...
                </p>

                {/* Glassmorphism Expand on Hover */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: hoveredId === log.id ? 1 : 0, y: hoveredId === log.id ? 0 : 10 }}
                  className="absolute inset-x-0 bottom-0 bg-orange-700 p-2 flex justify-center items-center z-20"
                >
                  <span className="text-black font-okuda font-bold text-xs tracking-[0.3em]">OPEN RECORD</span>
                </motion.div>
              </motion.div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
