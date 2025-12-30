import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Pencil, Check, X, ChevronDown, CheckCircle } from 'lucide-react';
import { Shift } from '../types';
import { formatDateTime } from '../utils/dateFormat';

interface ShiftManagerProps {
  currentShift: Shift | null;
  allShifts: Shift[];
  onCreateShift: (name: string) => void;
  onSwitchShift: (shiftId: string) => void;
  onUpdateShiftName: (name: string) => void;
  onDeleteShift: () => void;
  onAddPatient: (name: string) => void;
}

export default function ShiftManager({
  currentShift,
  allShifts,
  onCreateShift,
  onSwitchShift,
  onUpdateShiftName,
  onDeleteShift,
  onAddPatient,
}: ShiftManagerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAddingShift, setIsAddingShift] = useState(false);
  const [newShiftName, setNewShiftName] = useState('');
  const [isAddingPatient, setIsAddingPatient] = useState(false);
  const [newPatientName, setNewPatientName] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleStartEdit = () => {
    if (currentShift) {
      setEditName(currentShift.name);
      setIsEditing(true);
    }
  };

  const handleSave = () => {
    if (editName.trim()) {
      onUpdateShiftName(editName.trim());
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditName('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleStartAddShift = () => {
    setIsAddingShift(true);
    setNewShiftName('');
  };

  const handleSaveNewShift = () => {
    if (newShiftName.trim()) {
      onCreateShift(newShiftName.trim());
      setIsAddingShift(false);
      setNewShiftName('');
    }
  };

  const handleCancelAddShift = () => {
    setIsAddingShift(false);
    setNewShiftName('');
  };

  const handleNewShiftKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSaveNewShift();
    } else if (e.key === 'Escape') {
      handleCancelAddShift();
    }
  };

  const handleShiftSelect = (shiftId: string) => {
    if (shiftId !== currentShift?.id) {
      onSwitchShift(shiftId);
    }
    setIsDropdownOpen(false);
  };

  const toggleDropdown = () => {
    if (!isEditing) {
      setIsDropdownOpen(!isDropdownOpen);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isDropdownOpen) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isDropdownOpen]);

  const handleStartAddPatient = () => {
    setIsAddingPatient(true);
    setNewPatientName('');
  };

  const handleSaveNewPatient = () => {
    if (newPatientName.trim()) {
      onAddPatient(newPatientName.trim());
      setIsAddingPatient(false);
      setNewPatientName('');
    }
  };

  const handleCancelAddPatient = () => {
    setIsAddingPatient(false);
    setNewPatientName('');
  };

  const handleNewPatientKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSaveNewPatient();
    } else if (e.key === 'Escape') {
      handleCancelAddPatient();
    }
  };

  // Sort shifts by creation date, newest first
  const sortedShifts = [...allShifts].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Calculate patient counts for current shift
  const activePatients = currentShift?.patients.filter(p => !p.archived).length || 0;
  const archivedPatients = currentShift?.patients.filter(p => p.archived).length || 0;

  return (
    <div className="bg-white border-b border-neutral-200">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between gap-6">
          {/* Left: Shift info with dashboard metrics */}
          <div className="flex-1 flex items-center gap-5">
            {currentShift ? (
              isEditing ? (
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 px-4 py-2 bg-white border border-blue-500 rounded-lg focus:outline-none text-subheading"
                    autoFocus
                  />
                  <button
                    onClick={handleSave}
                    className="p-2 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg transition-colors"
                    title="Save"
                  >
                    <Check size={18} />
                  </button>
                  <button
                    onClick={handleCancel}
                    className="p-2 bg-neutral-100 text-neutral-600 hover:bg-neutral-200 rounded-lg transition-colors"
                    title="Cancel"
                  >
                    <X size={18} />
                  </button>
                </div>
              ) : (
                <>
                  {/* Shift switcher (if multiple shifts) */}
                  {allShifts.length > 1 && (
                    <div className="relative" ref={dropdownRef}>
                      <button
                        onClick={toggleDropdown}
                        className="p-2 bg-white hover:bg-neutral-50 border border-neutral-200 hover:border-neutral-300 rounded-lg transition-colors"
                        title="Switch shift"
                      >
                        <ChevronDown
                          size={18}
                          className={`text-neutral-700 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                        />
                      </button>

                      {isDropdownOpen && (
                        <div className="absolute top-full left-0 mt-2 w-96 bg-white border border-neutral-200 rounded-xl shadow-lg z-50 max-h-96 overflow-hidden">
                          <div className="px-4 py-3 bg-neutral-50 border-b border-neutral-200">
                            <h4 className="text-label font-semibold text-neutral-700">
                              All Shifts ({allShifts.length})
                            </h4>
                          </div>
                          <div className="max-h-80 overflow-y-auto">
                            {sortedShifts.map((shift) => (
                              <button
                                key={shift.id}
                                onClick={() => handleShiftSelect(shift.id)}
                                className={`w-full text-left px-4 py-4 transition-colors flex items-center justify-between gap-3 ${
                                  shift.id === currentShift.id
                                    ? 'bg-orange-50'
                                    : 'hover:bg-neutral-50'
                                }`}
                              >
                                <div className="flex-1 min-w-0">
                                  <div className="font-semibold text-body text-neutral-900 truncate">
                                    {shift.name}
                                  </div>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-caption text-neutral-500">
                                      {formatDateTime(shift.createdAt)}
                                    </span>
                                    <span className="text-caption text-neutral-400">•</span>
                                    <span className="text-caption text-neutral-600">
                                      {shift.patients.length} patient{shift.patients.length !== 1 ? 's' : ''}
                                    </span>
                                  </div>
                                </div>
                                {shift.id === currentShift.id && (
                                  <CheckCircle size={16} className="text-orange-500" />
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                <div className="flex-1">
                  <div className="group flex items-center gap-3">
                    <h1 className="text-heading font-bold text-neutral-900">{currentShift.name}</h1>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={handleStartEdit}
                        className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                        title="Edit shift name"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={onDeleteShift}
                        className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                        title="Delete shift"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-caption text-neutral-500">
                    <span>{formatDateTime(currentShift.createdAt)}</span>
                    <span>{activePatients} active</span>
                    {archivedPatients > 0 && <span>{archivedPatients} archived</span>}
                  </div>
                </div>
              </>
            )
          ) : (
            <div className="text-center">
              <h1 className="text-heading font-bold text-neutral-400">No Active Shift</h1>
              <p className="text-caption text-neutral-400 mt-1">Create a new shift to get started</p>
            </div>
          )}
          </div>

          {/* Right: Add shift and patient buttons */}
          <div className="flex items-center gap-3">
            {/* New Shift Button */}
            {isAddingShift ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newShiftName}
                  onChange={(e) => setNewShiftName(e.target.value)}
                  onKeyDown={handleNewShiftKeyDown}
                  placeholder="Enter shift name..."
                  className="px-4 py-2 bg-white border border-blue-500 rounded-lg focus:outline-none w-72 text-subheading"
                  autoFocus
                />
                <button
                  onClick={handleSaveNewShift}
                  className="p-2 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg transition-colors"
                  title="Create shift"
                >
                  <Check size={18} />
                </button>
                <button
                  onClick={handleCancelAddShift}
                  className="p-2 bg-neutral-100 text-neutral-600 hover:bg-neutral-200 rounded-lg transition-colors"
                  title="Cancel"
                >
                  <X size={18} />
                </button>
              </div>
            ) : (
              <button
                onClick={handleStartAddShift}
                className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-semibold"
              >
                <Plus size={18} />
                <span>New Shift</span>
              </button>
            )}

            {/* Add Patient Button */}
            {currentShift && (
              isAddingPatient ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newPatientName}
                    onChange={(e) => setNewPatientName(e.target.value)}
                    onKeyDown={handleNewPatientKeyDown}
                    placeholder="Patient name..."
                    className="px-3 py-2 bg-white border border-blue-500 rounded-lg focus:outline-none text-body"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveNewPatient}
                    className="p-2 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg transition-colors"
                    title="Add patient"
                  >
                    <Check size={18} />
                  </button>
                  <button
                    onClick={handleCancelAddPatient}
                    className="p-2 bg-neutral-100 text-neutral-600 hover:bg-neutral-200 rounded-lg transition-colors"
                    title="Cancel"
                  >
                    <X size={18} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleStartAddPatient}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-semibold"
                >
                  <Plus size={18} />
                  <span>Add Patient</span>
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
