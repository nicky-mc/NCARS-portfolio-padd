import LexicalEditor from "@/components/Editor";

export default function AdminPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-antonio text-red-800 mb-6 border-b-2 border-orange-700 pb-2">
        CAPTAIN&apos;S LOG ENTRY
      </h1>
      <LexicalEditor />
    </div>
  );
}
