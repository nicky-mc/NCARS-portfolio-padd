"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import Image from "next/image";
import { uploadToCloudinary } from "@/lib/cloudinary";

interface ProfileData {
  name: string;
  rank: string;
  serial: string;
  photoUrl: string;
  about: string;
  origin: string;
  serviceExperience: string;
}

const AccordionSection = ({ title, content }: { title: string; content: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-sky-800/50 bg-black/40 backdrop-blur-sm mb-4 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-4 bg-sky-800/10 hover:bg-sky-800/20 transition-colors text-left"
      >
        <span className="font-antonio tracking-widest text-orange-700 text-lg">[ DATA: {title} ]</span>
        <span className="text-sky-200 font-mono">{isOpen ? "-" : "+"}</span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="p-4 text-sky-200/80 font-mono text-sm whitespace-pre-wrap border-t border-sky-800/50">
              {content || "NO DATA AVAILABLE."}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function PersonnelRecord() {
  const [editMode, setEditMode] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [profile, setProfile] = useState<ProfileData>({
    name: "JEAN-LUC PICARD",
    rank: "ADMIRAL (RET.)",
    serial: "SP-937-215",
    photoUrl: "https://picsum.photos/seed/picard/400/500",
    about: "Former Captain of the USS Enterprise (NCC-1701-D and E).",
    origin: "La Barre, France, Earth.",
    serviceExperience: "Commanding Officer, USS Stargazer.\nCommanding Officer, USS Enterprise-D.\nCommanding Officer, USS Enterprise-E.",
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setIsAdmin(u?.uid === process.env.NEXT_PUBLIC_ADMIN_UID);
    });

    const fetchProfile = async () => {
      try {
        const docRef = doc(db, "personnel", "admin_record");
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setProfile(prev => ({ ...prev, ...snap.data() } as ProfileData));
        }
      } catch (e) {
        console.error("Error fetching profile:", e);
      }
    };
    fetchProfile();
    
    return () => unsubscribe();
  },[]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    try {
      const secureUrl = await uploadToCloudinary(file);
      setProfile(prev => ({ ...prev, photoUrl: secureUrl }));
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload image to Cloudinary.");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setEditMode(false);
    try {
      await setDoc(doc(db, "personnel", "admin_record"), profile, { merge: true });
    } catch (e) {
      console.error("Error saving profile:", e);
    }
  };

  return (
    <div className="max-w-4xl mx-auto glass-panel p-6 border-l-8 border-sky-800">
      <div className="flex justify-between items-center mb-6 border-b-2 border-orange-700 pb-2">
        <h1 className="text-3xl font-antonio tracking-widest text-red-800">BIOMETRIC RECORD</h1>
        {isAdmin && (
          <button 
            onClick={editMode ? handleSave : () => setEditMode(true)}
            className={`ncars-button ${editMode ? 'bg-red-800 text-sky-200' : ''}`}
          >
            {editMode ? "SAVE RECORD" : "OVERRIDE (EDIT)"}
          </button>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-8 mb-8">
        {/* Profile Image Node */}
        <div className="relative w-64 h-80 border-2 border-sky-800 bg-sky-800/10 flex-shrink-0 group">
          {/* Scanning Line overlay */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
            <div className="w-full h-1 bg-sky-800/50 animate-scan-line shadow-[0_0_10px_rgba(7,89,133,0.5)]" />
          </div>
          
          <Image src={profile.photoUrl} alt="Personnel" fill style={{ objectFit: "cover" }} className="opacity-80" referrerPolicy="no-referrer" />
          
          {editMode && isAdmin && (
            <label className="absolute bottom-2 left-2 right-2 bg-black/80 text-center text-xs p-2 border border-sky-800 cursor-pointer z-20 hover:bg-sky-800 hover:text-sky-200">
              {uploading ? "UPLOADING..." : "UPDATE BIOMETRICS"}
              <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
            </label>
          )}
        </div>

        {/* Text Data Fields */}
        <div className="flex-1 flex flex-col gap-4 font-mono">
          {Object.entries({ Name: "name", Rank: "rank", "Serial Number": "serial" }).map(([label, key]) => (
            <div key={key}>
              <p className="text-xs text-slate-500 uppercase">{label}</p>
              {editMode && isAdmin ? (
                <input 
                  type="text" 
                  value={profile[key as keyof ProfileData]} 
                  onChange={(e) => setProfile({ ...profile, [key]: e.target.value })}
                  className="w-full bg-black border-b border-sky-800 text-sky-200 text-xl outline-none p-1 focus:border-red-800"
                />
              ) : (
                <p className="text-xl font-antonio tracking-wider text-sky-200">{profile[key as keyof ProfileData]}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Animated Accordions for Public View, Textareas for Admin Edit */}
      <div className="mt-8">
        {editMode && isAdmin ? (
          <div className="flex flex-col gap-4">
            <h3 className="text-xl font-antonio text-orange-700 border-b border-sky-800/50 pb-2">EDIT PERSONNEL DATA</h3>
            {Object.entries({ "ABOUT": "about", "ORIGIN": "origin", "SERVICE EXPERIENCE": "serviceExperience" }).map(([label, key]) => (
              <div key={key}>
                <p className="text-xs text-slate-500 uppercase mb-1">{label}</p>
                <textarea
                  value={profile[key as keyof ProfileData]}
                  onChange={(e) => setProfile({ ...profile, [key]: e.target.value })}
                  className="w-full bg-black/50 border border-sky-800/50 text-sky-200 text-sm outline-none p-3 min-h-[100px] focus:border-red-800"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <AccordionSection title="ABOUT" content={profile.about} />
            <AccordionSection title="ORIGIN" content={profile.origin} />
            <AccordionSection title="SERVICE EXPERIENCE" content={profile.serviceExperience} />
          </div>
        )}
      </div>
    </div>
  );
}
