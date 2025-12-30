import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash2, Pencil, Check, X, ArrowLeft } from 'lucide-react';
import { Shift } from '../types';
import { formatDateTime } from '../utils/dateFormat';

interface ShiftHeaderProps {
  currentShift: Shift | null;
  onUpdateShiftName: (name: string) => void;
  onDeleteShift: () => void;
  onAddPatient: (name: string) => void;
}

export default function ShiftHeader({
  currentShift,
  onUpdateShiftName,
  onDeleteShift,
  onAddPatient,
}: ShiftHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [isAddingPatient, setIsAddingPatient] = useState(false);
  const [newPatientName, setNewPatientName] = useState('');

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

  // Calculate patient counts for current shift
  const activePatients = currentShift?.patients.filter(p => !p.archived).length || 0;
  const archivedPatients = currentShift?.patients.filter(p => p.archived).length || 0;

  return (
    <div className="bg-white border-b border-neutral-200">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between gap-6">
          {/* Left: Back button + Shift info with dashboard metrics */}
          <div className="flex-1 flex items-center gap-5">
            {/* Back to Shifts button */}
            <Link
              to="/app"
              className="flex items-center gap-2 px-3 py-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 rounded-lg transition-colors border border-neutral-200 hover:border-neutral-300"
            >
              <ArrowLeft size={18} />
              <span className="text-label font-medium">Back</span>
            </Link>

            {currentShift && (
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
              )
            )}
          </div>

          {/* Right: Add patient button */}
          <div className="flex items-center gap-3">
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
