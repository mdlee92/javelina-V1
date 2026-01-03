import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCircle, ChevronDown, Activity, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Header() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const handleSettings = () => {
    setDropdownOpen(false);
    navigate('/settings');
  };

  // Extract email from user object (Cognito stores it in email attribute)
  const userEmail = user?.email || user?.username || 'User';

  return (
    <header className="bg-white border-b border-neutral-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left: Branding */}
        <div className="flex items-center gap-3">
          <Activity size={24} className="text-orange-500" />
          <h1 className="text-heading font-bold text-neutral-900">Javelina</h1>
        </div>

        {/* Right: User dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-neutral-50 rounded-lg transition-colors border border-neutral-200 hover:border-neutral-300"
          >
            <UserCircle size={18} className="text-neutral-600" />
            <span className="text-label text-neutral-700">{userEmail}</span>
            <ChevronDown size={14} className="text-neutral-400" />
          </button>

          {/* Dropdown menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-neutral-200 py-1 z-50">
              <button
                onClick={handleSettings}
                className="w-full flex items-center gap-3 px-4 py-2 text-label text-neutral-700 hover:bg-neutral-50 transition-colors"
              >
                <Settings size={16} />
                <span>Settings</span>
              </button>
              <div className="border-t border-neutral-200 my-1" />
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2 text-label text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
