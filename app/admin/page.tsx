"use client";
import LexicalEditor from "@/components/Editor";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { getCaptainLog, CaptainLog } from "@/lib/logUtils";

function AdminPageContent() {
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');
  const [log, setLog] = useState<CaptainLog | null>(null);
  const [loading, setLoading] = useState(!!editId);

  useEffect(() => {
    if (editId) {
      getCaptainLog(editId)
        .then((data) => {
          if (data) {
            setLog(data);
          }
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [editId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-sky-800 animate-pulse font-mono tracking-widest">
        FETCHING SECURE DATA...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-antonio text-red-800 mb-6 border-b-2 border-orange-700 pb-2 uppercase">
        {editId ? "Edit Captain's Log" : "New Captain's Log Entry"}
      </h1>
      <LexicalEditor 
        initialState={log?.content} 
        existingId={editId || undefined} 
        logTitle={log?.title || ""} 
      />
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={<div className="text-sky-800 animate-pulse font-mono tracking-widest">INITIALIZING SUBSYSTEMS...</div>}>
      <AdminPageContent />
    </Suspense>
  );
}
