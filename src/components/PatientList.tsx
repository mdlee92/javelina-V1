import { useState } from 'react';
import {
  Pencil,
  Trash2,
  Check,
  X,
  User,
  Archive,
  ArchiveRestore,
  ChevronDown,
} from 'lucide-react';
import { Patient } from '../types';
import {
  loadSortPreferences,
  saveSortPreferences,
  sortPatients,
  getNextSortOption,
  getSortIcon,
  getSortLabel,
} from '../utils/patientSort';
import { formatDateTime } from '../utils/dateFormat';
import { getPatientInitials } from '../utils/patientUtils';

interface PatientListProps {
  patients: Patient[];
  selectedPatientId: string | null;
  onSelectPatient: (patientId: string) => void;
  onUpdatePatientName: (patientId: string, name: string) => void;
  onDeletePatient: (patientId: string) => void;
  onToggleArchive: (patientId: string) => void;
}

export default function PatientList({
  patients,
  selectedPatientId,
  onSelectPatient,
  onUpdatePatientName,
  onDeletePatient,
  onToggleArchive,
}: PatientListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [archivedSectionExpanded, setArchivedSectionExpanded] = useState(false);
  const [sortPreferences, setSortPreferences] = useState(() => loadSortPreferences());

  const handleStartEdit = (patient: Patient, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(patient.id);
    setEditName(patient.name);
  };

  const handleSave = (patientId: string) => {
    if (editName.trim()) {
      onUpdatePatientName(patientId, editName.trim());
      setEditingId(null);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditName('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, patientId: string) => {
    if (e.key === 'Enter') {
      handleSave(patientId);
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleSortChange = (section: 'active' | 'archived') => {
    const currentSort = sortPreferences[section];
    const nextSort = getNextSortOption(currentSort);
    const newPreferences = {
      ...sortPreferences,
      [section]: nextSort,
    };
    setSortPreferences(newPreferences);
    saveSortPreferences(newPreferences);
  };

  // Split patients into active and archived, then sort each
  const activePatients = sortPatients(
    patients.filter(p => !p.archived),
    sortPreferences.active
  );
  const archivedPatients = sortPatients(
    patients.filter(p => p.archived),
    sortPreferences.archived
  );

  return (
    <div className="w-80 flex flex-col h-full overflow-hidden">
      <div className="h-full bg-white flex flex-col overflow-hidden">
        {/* Patient list */}
        <div className="flex-1 overflow-y-auto">
          {patients.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-neutral-200 flex items-center justify-center">
                <User size={32} className="text-neutral-400" />
              </div>
              <p className="text-body font-semibold text-neutral-400">No patients yet</p>
              <p className="text-caption text-neutral-400 mt-1">Click "Add Patient" to start</p>
            </div>
          ) : (
          <>
            {/* Active Patients Section */}
            <div className="mb-3">
              {/* Section header */}
              <div className="sticky top-0 z-20 px-5 py-3 bg-neutral-50 border-b border-neutral-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-label font-semibold text-neutral-700">
                    Active Patients ({activePatients.length})
                  </h3>
                  <button
                    onClick={() => handleSortChange('active')}
                    className="p-2 text-blue-600 hover:bg-neutral-100 rounded-lg transition-colors"
                    title={getSortLabel(sortPreferences.active)}
                  >
                    {(() => {
                      const Icon = getSortIcon(sortPreferences.active);
                      return <Icon size={16} />;
                    })()}
                  </button>
                </div>
              </div>

              {/* Patient cards */}
              <div>
                {activePatients.length === 0 ? (
                  <div className="p-6 text-center text-neutral-400 text-caption">
                    No active patients
                  </div>
                ) : (
                  activePatients.map((patient) => (
                    <div
                      key={patient.id}
                      className={`group relative px-4 py-4 transition-colors cursor-pointer ${
                        selectedPatientId === patient.id
                          ? 'bg-orange-50'
                          : 'bg-white hover:bg-neutral-50'
                      }`}
                    >
                      {editingId === patient.id ? (
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, patient.id)}
                            className="flex-1 px-3 py-2 bg-white border border-blue-500 rounded-lg focus:outline-none text-body"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSave(patient.id)}
                            className="p-2 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg transition-colors"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={handleCancel}
                            className="p-2 bg-neutral-100 text-neutral-600 hover:bg-neutral-200 rounded-lg transition-colors"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <div onClick={() => onSelectPatient(patient.id)} className="flex items-start gap-3">
                          {/* Avatar with initials */}
                          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-neutral-200 flex items-center justify-center">
                            <span className="text-label font-semibold text-neutral-700">
                              {getPatientInitials(patient.name)}
                            </span>
                          </div>

                          {/* Content column with 2 rows */}
                          <div className="flex-1 min-w-0">
                            {/* Row 1: Name and Timestamp */}
                            <div className="flex items-center justify-between gap-2">
                              <h3 className="font-semibold text-body text-neutral-900 truncate">
                                {patient.name}
                              </h3>
                              <div className="flex-shrink-0 text-caption text-neutral-500">
                                {patient.createdAt && formatDateTime(patient.createdAt)}
                              </div>
                            </div>

                            {/* Row 2: Notes count and Action buttons */}
                            <div className="flex items-center justify-between gap-2 mt-0.5">
                              <p className="text-caption text-neutral-500">
                                {patient.notes.length} {patient.notes.length === 1 ? 'note' : 'notes'}
                              </p>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={(e) => handleStartEdit(patient, e)}
                                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                  title="Edit patient name"
                                >
                                  <Pencil size={14} />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onToggleArchive(patient.id);
                                  }}
                                  className="p-1.5 text-neutral-600 hover:bg-neutral-100 rounded transition-colors"
                                  title="Archive patient"
                                >
                                  <Archive size={14} />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onDeletePatient(patient.id);
                                  }}
                                  className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                                  title="Delete patient"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Archived Patients Section */}
            {archivedPatients.length > 0 && (
              <div className="mb-3">
                <div
                  className="sticky top-0 z-20 px-5 py-3 bg-neutral-100 border-b border-neutral-200 cursor-pointer hover:bg-neutral-200 transition-colors"
                  onClick={() => setArchivedSectionExpanded(!archivedSectionExpanded)}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-label font-semibold text-neutral-600 flex items-center gap-2">
                      <Archive size={14} />
                      Archived ({archivedPatients.length})
                    </h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSortChange('archived');
                        }}
                        className="p-2 text-neutral-600 hover:bg-neutral-50 rounded-lg transition-colors"
                        title={getSortLabel(sortPreferences.archived)}
                      >
                        {(() => {
                          const Icon = getSortIcon(sortPreferences.archived);
                          return <Icon size={16} />;
                        })()}
                      </button>
                      <ChevronDown
                        size={16}
                        className={`text-neutral-600 transition-transform ${archivedSectionExpanded ? 'rotate-180' : ''}`}
                      />
                    </div>
                  </div>
                </div>
                {archivedSectionExpanded && (
                  <div>
                    {archivedPatients.map((patient) => (
                      <div
                        key={patient.id}
                        className={`group relative px-4 py-4 transition-colors cursor-pointer ${
                          selectedPatientId === patient.id
                            ? 'bg-neutral-100'
                            : 'bg-white hover:bg-neutral-50'
                        }`}
                      >
                        {editingId === patient.id ? (
                          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              onKeyDown={(e) => handleKeyDown(e, patient.id)}
                              className="flex-1 px-3 py-2 bg-white border border-neutral-400 rounded-lg focus:outline-none text-body"
                              autoFocus
                            />
                            <button
                              onClick={() => handleSave(patient.id)}
                              className="p-2 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg transition-colors"
                            >
                              <Check size={16} />
                            </button>
                            <button
                              onClick={handleCancel}
                              className="p-2 bg-neutral-100 text-neutral-600 hover:bg-neutral-200 rounded-lg transition-colors"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ) : (
                          <div onClick={() => onSelectPatient(patient.id)} className="flex items-start gap-3">
                            {/* Avatar with initials */}
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-neutral-200 flex items-center justify-center">
                              <span className="text-label font-semibold text-neutral-700">
                                {getPatientInitials(patient.name)}
                              </span>
                            </div>

                            {/* Content column with 2 rows */}
                            <div className="flex-1 min-w-0">
                              {/* Row 1: Name and Timestamp */}
                              <div className="flex items-center justify-between gap-2">
                                <h3 className="font-semibold text-body text-neutral-700 truncate">
                                  {patient.name}
                                </h3>
                                <div className="flex-shrink-0 text-caption text-neutral-500">
                                  {patient.createdAt && formatDateTime(patient.createdAt)}
                                </div>
                              </div>

                              {/* Row 2: Notes count and Action buttons */}
                              <div className="flex items-center justify-between gap-2 mt-0.5">
                                <p className="text-caption text-neutral-500">
                                  {patient.notes.length} {patient.notes.length === 1 ? 'note' : 'notes'}
                                </p>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={(e) => handleStartEdit(patient, e)}
                                    className="p-1.5 text-neutral-600 hover:bg-neutral-100 rounded transition-colors"
                                    title="Edit patient name"
                                  >
                                    <Pencil size={14} />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onToggleArchive(patient.id);
                                    }}
                                    className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
                                    title="Unarchive patient"
                                  >
                                    <ArchiveRestore size={14} />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onDeletePatient(patient.id);
                                    }}
                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                                    title="Delete patient"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
        </div>
      </div>
    </div>
  );
}
