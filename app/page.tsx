"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function PADDInterface() {
  const [stardate, setStardate] = useState("CALCULATING...");
  const [bootSequence, setBootSequence] = useState(true);

  useEffect(() => {
    // Stardate calculation logic
    const updateStardate = () => {
      const sd = (80000 + (Date.now() / 10000000) % 10000).toFixed(3);
      setStardate(sd);
    };
    const timer = setInterval(updateStardate, 1000);
    setTimeout(() => setBootSequence(false), 2500);

    return () => clearInterval(timer);
  },[]);

  if (bootSequence) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-sky-200 font-mono gap-4">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="w-16 h-16 border-t-2 border-orange-700 rounded-full" />
        <p className="animate-flicker">INITIATING DIAGNOSTICS...</p>
        <div className="w-64 h-2 border border-sky-800/50 p-0.5">
          <motion.div initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 2 }} className="h-full bg-sky-200" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-7xl border border-sky-800/50 p-6 relative bg-black/50 backdrop-blur-sm shadow-[0_0_30px_rgba(125,211,252,0.05)]">
        
        {/* Top Header Readouts */}
        <div className="flex justify-between items-start mb-8 text-[10px] uppercase font-mono tracking-widest text-sky-200">
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-2 bg-orange-700"></div>
              <span>CLASS: CONSTITUTION III</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-2 bg-slate-300"></div>
              <span>REGISTRY: NCC-80102-A</span>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 justify-end">
              <span>STARDATE: {stardate}</span>
              <div className="w-12 h-2 bg-red-800"></div>
            </div>
          </div>
        </div>

        {/* Main Display Area */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-center">
          
          {/* Left Diagnostics Column */}
          <div className="flex flex-col gap-6 text-[10px] uppercase font-mono tracking-widest text-sky-200">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <div className="w-6 h-2 bg-orange-700"></div>
                <span>PORT WARP NACELLE: NOMINAL</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-2 bg-slate-500"></div>
                <span className="text-slate-400">PLASMA INJECTORS: 98%</span>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <div className="w-6 h-2 bg-red-800"></div>
                <span>SAUCER DEFLECTOR: ONLINE</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-2 bg-slate-500"></div>
                <span className="text-slate-400">FIELD STRENGTH: 104%</span>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <div className="w-6 h-2 bg-slate-300"></div>
                <span>IMPULSE ENGINES: STANDBY</span>
              </div>
            </div>
          </div>

          {/* Center Ship Graphic */}
          <div className="lg:col-span-2 relative">
            <img 
              src="/titan-a.jpg" 
              alt="Constitution III" 
              className="w-full max-w-4xl mx-auto object-contain drop-shadow-[0_0_15px_rgba(125,211,252,0.3)]" 
            />
            {/* Overlay Grid/Scanning Lines */}
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(125,211,252,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(125,211,252,0.03)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
          </div>

          {/* Right Diagnostics Column */}
          <div className="flex flex-col gap-6 text-[10px] uppercase font-mono tracking-widest text-sky-200 items-end text-right">
            <div className="flex flex-col gap-1 items-end">
              <div className="flex items-center gap-2">
                <span>LIFE SUPPORT: NOMINAL</span>
                <div className="w-6 h-2 bg-orange-700"></div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-400">ENVIRONMENTAL: AUTO</span>
                <div className="w-4 h-2 bg-slate-500"></div>
              </div>
            </div>

            <div className="flex flex-col gap-1 items-end">
              <div className="flex items-center gap-2">
                <span>TACTICAL SENSORS: ACTIVE</span>
                <div className="w-6 h-2 bg-red-800"></div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-400">LONG RANGE: SWEEPING</span>
                <div className="w-4 h-2 bg-slate-500"></div>
              </div>
            </div>
            
            <div className="flex flex-col gap-1 items-end">
              <div className="flex items-center gap-2">
                <span>MAIN COMPUTER: ONLINE</span>
                <div className="w-6 h-2 bg-slate-300"></div>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Footer Readouts */}
        <div className="mt-8 pt-4 border-t border-sky-800/50 flex justify-between items-end text-[10px] uppercase font-mono tracking-widest text-sky-200">
          <div className="flex gap-2">
            <div className="w-16 h-1 bg-orange-700"></div>
            <div className="w-8 h-1 bg-red-800"></div>
            <div className="w-24 h-1 bg-slate-500"></div>
          </div>
          <div className="flex gap-4">
            <div className="flex flex-col items-end">
              <span className="text-slate-400">SYS-CORE</span>
              <span>47-4566</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-slate-400">MOD</span>
              <span>11270</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
