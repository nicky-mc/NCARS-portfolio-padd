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
    <div className="w-full flex flex-col gap-12 py-4">
      <style>{`
        @keyframes scan {
          0% { width: 10%; }
          50% { width: 100%; }
          100% { width: 10%; }
        }
        .animate-scan {
          animation: scan 3s ease-in-out infinite;
        }
      `}</style>
      
      {/* Top Header Readouts - Now as a standalone section for better breathing room */}
      <div className="w-full flex flex-wrap justify-between items-start text-[10px] uppercase font-mono tracking-widest text-[#9CB4CC] px-2">
        <div className="flex flex-wrap gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-2 bg-[#4A5D70]"></div>
            <span className="font-okuda font-bold text-sm tracking-widest">CONSTITUTION-III / MSD-01-A</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-6 h-2 bg-[#9CB4CC]"></div>
            <span className="font-okuda font-bold text-sm tracking-widest text-white/80">REGISTRY: NCC-80102-A</span>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-3 justify-end">
            <span className="font-okuda font-bold text-sm tracking-widest">STARDATE: {stardate}</span>
            <div className="w-16 h-2 bg-[#CC4444]"></div>
          </div>
        </div>
      </div>

      {/* Main Diagnostic Area - Increased gap to 12 for better separation */}
      <div className="w-full flex flex-col xl:flex-row gap-12 xl:gap-8 items-center justify-between min-w-0 relative">
        
        {/* Left Diagnostics Column with framing line */}
        <div className="flex w-full xl:w-1/4 flex-row gap-4 order-2 xl:order-1 min-w-0 px-2 lg:px-0">
          {/* FRAME LINE */}
          <div className="w-1 h-auto bg-[#4A5D70]/40 hidden lg:block rounded-full shrink-0"></div>
          
          <div className="flex flex-col gap-6 text-[10px] uppercase font-mono tracking-widest text-[#9CB4CC] flex-1">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <div className="w-6 h-2 bg-[#4A5D70] animate-pulse flex-none"></div>
                <span className="text-white truncate font-medium">PORT WARP NACELLE: NOMINAL</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-2 bg-[#3A4B5C] flex-none"></div>
                <span className="text-[#9CB4CC]/70 font-okuda font-bold tracking-widest truncate">PLASMA INJECTORS: 98.41</span>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <div className="w-6 h-2 bg-[#4A5D70] animate-pulse flex-none"></div>
                <span className="text-white truncate font-medium">STARBOARD WARP NACELLE: NOMINAL</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-2 bg-[#3A4B5C] flex-none"></div>
                <span className="text-[#9CB4CC]/70 font-okuda font-bold tracking-widest truncate">PLASMA INJECTORS: 99.12</span>
              </div>
            </div>
            
            {/* The Pulse Stack: Data Processing simulation */}
            <div className="flex flex-col gap-2 mt-2">
              <div className="h-1 bg-[#4A5D70]/80 animate-pulse w-32 max-w-full"></div>
              <div className="h-1 bg-[#3A4B5C]/80 animate-pulse w-48 max-w-full delay-75"></div>
              <div className="h-1 bg-[#9CB4CC]/40 animate-pulse w-24 max-w-full delay-150"></div>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <div className="w-6 h-2 bg-[#CC4444] animate-pulse flex-none"></div>
                <span className="text-white truncate font-medium">SAUCER DEFLECTOR: ONLINE</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-2 bg-[#3A4B5C] flex-none"></div>
                <span className="text-[#9CB4CC]/70 font-okuda font-bold tracking-widest truncate">FIELD STRENGTH: 104.2</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center Image Column with Telemetry Frame */}
        <div className="w-full xl:flex-1 flex flex-col justify-center items-center relative gap-1 xl:gap-2 min-w-0 px-2 md:px-4 order-1 xl:order-2">
            
            {/* TOP GREEBLE - Scales from micro (mobile) to medium (laptop) to thick (monitor) */}
            <div className="flex w-full justify-between items-end gap-1 mb-1 lg:mb-2">
                <div className="flex gap-1 items-end">
                    <div className="h-1 lg:h-2 xl:h-4 w-8 lg:w-12 xl:w-16 bg-[#CC4444]"></div>
                    <div className="h-2 lg:h-3 xl:h-6 w-16 lg:w-24 xl:w-32 bg-[#4A5D70] flex items-center justify-end px-1 xl:px-2">
                        {/* Text only shows on XL monitors to save space on laptops */}
                        <span className="hidden xl:inline text-[0.5rem] xl:text-xs text-black font-okuda tracking-widest leading-none">88-402</span>
                    </div>
                </div>
                <div className="h-1 lg:h-2 xl:h-4 w-12 lg:w-16 xl:w-24 bg-[#4A5D70]"></div>
            </div>

            <div className="relative w-full flex justify-center items-center">
              {/* THE ACTUAL SHIP IMAGE - Responsive scale for squat windows */}
              <img 
                src="/titan-a.jpg" 
                alt="Constitution III MSD" 
                className="w-full h-auto max-h-[30vh] lg:max-h-[35vh] xl:max-h-[40vh] object-contain min-h-0 shrink drop-shadow-[0_0_15px_rgba(74,93,112,0.4)] opacity-80 z-10 relative" 
                referrerPolicy="no-referrer"
              />
              {/* Overlay Grid/Scanning Lines */}
              <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(156,180,204,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(156,180,204,0.03)_1px,transparent_1px)] bg-[size:20px_20px] z-20"></div>
              
              {/* SIDE GREEBLES - Only appear on massive screens (xl) */}
              <div className="hidden xl:flex absolute -left-4 top-1/2 -translate-y-1/2 flex-col gap-1 z-0 shrink-0">
                <div className="w-1 h-12 bg-[#4A5D70]"></div>
                <div className="w-1 h-4 bg-[#CC4444]"></div>
                <div className="w-1 h-8 bg-[#9CB4CC]"></div>
              </div>
              <div className="hidden xl:flex absolute -right-4 top-1/2 -translate-y-1/2 flex-col gap-1 z-0 shrink-0">
                <div className="w-1 h-8 bg-[#9CB4CC]"></div>
                <div className="w-1 h-16 bg-[#3A4B5C]"></div>
                <div className="w-1 h-4 bg-[#E65100]"></div>
              </div>
            </div>

            {/* BOTTOM GREEBLE - Scales up smoothly */}
            <div className="flex w-full gap-1 h-2 lg:h-4 xl:h-6 mt-1 lg:mt-2">
                <div className="w-2/3 bg-[#9CB4CC] rounded-bl-xl xl:rounded-bl-2xl flex items-center justify-end px-2 xl:px-4">
                     {/* Text only shows on XL monitors */}
                     <span className="hidden xl:inline text-[0.6rem] xl:text-sm text-black font-okuda tracking-widest uppercase leading-none">SYS-MONITOR</span>
                </div>
                <div className="flex-1 bg-[#4A5D70] rounded-br-xl xl:rounded-br-2xl flex items-center px-2">
                     <span className="hidden xl:inline text-[0.5rem] text-[#9CB4CC] font-okuda font-bold uppercase leading-none">LVL-3 DIAG</span>
                </div>
            </div>
        </div>

        {/* Right Diagnostics Column */}
        <div className="w-full xl:w-1/4 flex flex-col gap-6 text-[10px] uppercase font-mono tracking-widest text-[#9CB4CC] items-center xl:items-end text-center xl:text-right min-w-0 order-3 px-2 lg:px-0">
          <div className="flex flex-col gap-1 items-center xl:items-end">
            <div className="flex items-center gap-2">
              <span className="text-white truncate font-medium">LIFE SUPPORT: NOMINAL</span>
              <div className="w-6 h-2 bg-[#4A5D70] animate-pulse flex-none"></div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#9CB4CC]/70 font-okuda font-bold tracking-widest truncate">ENV-AIR: 100.0</span>
              <div className="w-4 h-2 bg-[#3A4B5C] flex-none"></div>
            </div>
          </div>

          <div className="flex flex-col gap-1 items-center xl:items-end w-full">
            <div className="flex items-center gap-2 justify-center xl:justify-end">
              <span className="text-white truncate font-medium">TACTICAL SENSORS: ACTIVE</span>
              <div className="w-6 h-2 bg-[#CC4444] animate-pulse flex-none"></div>
            </div>
            <div className="w-full max-w-[120px] h-1 bg-[#3A4B5C]/30 mt-1 relative overflow-hidden shrink-0">
              <div className="h-full bg-[#CC4444] animate-scan opacity-60"></div>
            </div>
            
            <div className="flex flex-col gap-1.5 mt-3 items-center xl:items-end font-okuda text-[8px] text-[#9CB4CC]/30">
              <span>08-1120</span>
              <span>99-4747</span>
            </div>

            <div className="flex flex-col gap-1.5 mt-2 items-center xl:items-end">
              <div className="h-1 bg-[#4A5D70]/80 animate-pulse w-24 max-w-full"></div>
              <div className="h-1 bg-[#3A4B5C]/80 animate-pulse w-40 max-w-full delay-100"></div>
              <div className="h-1 bg-[#CC4444]/60 animate-pulse w-32 max-w-full delay-200"></div>
            </div>

            <div className="flex items-center gap-2 justify-center xl:justify-end mt-3">
              <span className="text-[#9CB4CC]/70 font-okuda font-bold tracking-widest truncate">LONG RANGE: SCANNING</span>
              <div className="w-4 h-2 bg-[#3A4B5C] flex-none"></div>
            </div>
          </div>
          
          <div className="flex flex-col gap-1 items-center xl:items-end">
            <div className="flex items-center gap-2 border-r-2 border-[#CC4444] pr-2">
              <span className="text-white truncate font-medium">MAIN COMPUTER: ONLINE</span>
              <div className="w-6 h-2 bg-[#9CB4CC] animate-pulse flex-none"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
