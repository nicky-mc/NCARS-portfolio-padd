"use client";
import { useRouter } from "next/navigation";

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="max-w-2xl mx-auto glass-panel p-8 text-center mt-20 border-red-800 border-2">
      <h1 className="text-4xl font-antonio text-red-800 mb-4">ACCESS DENIED</h1>
      <p className="text-sky-200 mb-8">You do not have the required clearance to access this sector.</p>
      
      <p className="text-xs text-slate-500 mt-2">
        This area is restricted to Command Level personnel only. 
        If you are the Captain, please use the sidebar to authenticate.
      </p>

      <button onClick={() => router.push("/")} className="ncars-button bg-sky-800 text-sky-200 hover:bg-slate-300 hover:text-black text-xl py-4 px-8 mt-8">
        RETURN TO COMM CENTER
      </button>
    </div>
  );
}
