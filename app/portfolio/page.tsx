"use client";
import { motion } from "framer-motion";
import { useState } from "react";

const projects = [
  { id: 1, title: "STELLAR CARTOGRAPHY", skill: "React / D3.js", desc: "Interactive 3D mapping of sector 001." },
  { id: 2, title: "SUBSPACE RELAY", skill: "Node.js / WebSockets", desc: "Real-time communication protocol." },
  { id: 3, title: "DEFLECTOR CONTROL", skill: "TypeScript / Security", desc: "Shield modulation interface." },
  { id: 4, title: "WARP CORE DIAGNOSTICS", skill: "Firebase / Realtime DB", desc: "Live monitoring of matter/antimatter reactions." },
];

export default function Portfolio() {
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-antonio text-orange-700 mb-6 border-b-2 border-sky-800 pb-2">
        DATABANKS // PORTFOLIO
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <motion.div
            key={project.id}
            className="relative glass-panel p-6 min-h-[200px] overflow-hidden cursor-pointer group"
            onHoverStart={() => setHoveredId(project.id)}
            onHoverEnd={() => setHoveredId(null)}
            whileHover={{ scale: 1.02 }}
          >
            {/* Scanning Light Pulse */}
            <div className={`absolute inset-0 w-full h-2 bg-sky-800/40 shadow-[0_0_15px_rgba(7,89,133,0.5)] ${hoveredId === project.id ? 'hidden' : 'animate-scan-line'}`} />
            
            <h2 className="text-xl font-antonio text-sky-200 mb-2 relative z-10">{project.title}</h2>
            
            {/* Glassmorphism Expand on Hover */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: hoveredId === project.id ? 1 : 0, y: hoveredId === project.id ? 0 : 20 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md p-6 flex flex-col justify-center border border-red-800 z-20"
            >
              <h3 className="text-red-800 font-mono text-sm mb-2">SKILL: {project.skill}</h3>
              <p className="text-sky-200 text-sm">{project.desc}</p>
            </motion.div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
