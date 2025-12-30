import { UserCircle, ChevronDown, Activity } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-white border-b border-neutral-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left: Branding */}
        <div className="flex items-center gap-3">
          <Activity size={24} className="text-orange-500" />
          <h1 className="text-heading font-bold text-neutral-900">Javelina</h1>
        </div>

        {/* Right: User button */}
        <button className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-neutral-50 rounded-lg transition-colors border border-neutral-200 hover:border-neutral-300">
          <UserCircle size={18} className="text-neutral-600" />
          <span className="text-label text-neutral-700">User</span>
          <ChevronDown size={14} className="text-neutral-400" />
        </button>
      </div>
    </header>
  );
}
