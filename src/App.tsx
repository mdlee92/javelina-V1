import { useState, useEffect } from 'react';
import { AppData } from './types';
import {
  loadData,
  createShift,
  updateShiftName,
  deleteShift,
  switchShift,
  addPatient,
  updatePatientName,
  deletePatient,
  togglePatientArchive,
  addNote,
  updateNote,
  deleteNote,
} from './utils/storage';
import Header from './components/Header';
import ShiftManager from './components/ShiftManager';
import PatientList from './components/PatientList';
import PatientDetail from './components/PatientDetail';
import ConfirmDialog from './components/ConfirmDialog';

interface ConfirmState {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
}

export default function App() {
  const [data, setData] = useState<AppData>(() => loadData());
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmState>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const currentShift = data.shifts.find((s) => s.id === data.currentShiftId) || null;
  const currentPatients = currentShift?.patients || [];
  const selectedPatient = currentPatients.find((p) => p.id === selectedPatientId) || null;

  // Auto-select first patient when shift changes, preferring active patients
  useEffect(() => {
    if (currentShift && currentShift.patients.length > 0 && !selectedPatientId) {
      // Prefer active patients when auto-selecting
      const activePatient = currentShift.patients.find(p => !p.archived);
      setSelectedPatientId(activePatient?.id || currentShift.patients[0].id);
    } else if (!currentShift) {
      setSelectedPatientId(null);
    } else if (selectedPatientId && !currentPatients.find((p) => p.id === selectedPatientId)) {
      // If selected patient was deleted, prefer active patients
      if (currentPatients.length > 0) {
        const activePatient = currentPatients.find(p => !p.archived);
        setSelectedPatientId(activePatient?.id || currentPatients[0].id);
      } else {
        setSelectedPatientId(null);
      }
    }
  }, [currentShift, selectedPatientId, currentPatients]);

  const showConfirm = (title: string, message: string, onConfirm: () => void) => {
    setConfirmDialog({
      isOpen: true,
      title,
      message,
      onConfirm,
    });
  };

  const closeConfirm = () => {
    setConfirmDialog({
      isOpen: false,
      title: '',
      message: '',
      onConfirm: () => {},
    });
  };

  const handleConfirm = () => {
    confirmDialog.onConfirm();
    closeConfirm();
  };

  // Shift operations
  const handleCreateShift = (name: string) => {
    const newData = createShift(data, name);
    setData(newData);
  };

  const handleSwitchShift = (shiftId: string) => {
    const newData = switchShift(data, shiftId);
    setData(newData);
    setSelectedPatientId(null);
  };

  const handleUpdateShiftName = (name: string) => {
    if (!currentShift) return;
    const newData = updateShiftName(data, currentShift.id, name);
    setData(newData);
  };

  const handleDeleteShift = () => {
    if (!currentShift) return;
    showConfirm(
      'Delete Shift',
      `Are you sure you want to delete "${currentShift.name}" and all its patients? This cannot be undone.`,
      () => {
        const newData = deleteShift(data, currentShift.id);
        setData(newData);
        setSelectedPatientId(null);
      }
    );
  };

  // Patient operations
  const handleAddPatient = (name: string) => {
    if (!currentShift) return;
    const newData = addPatient(data, currentShift.id, name);
    setData(newData);
    // Auto-select the new patient
    const updatedShift = newData.shifts.find((s) => s.id === currentShift.id);
    if (updatedShift) {
      const newPatient = updatedShift.patients[updatedShift.patients.length - 1];
      setSelectedPatientId(newPatient.id);
    }
  };

  const handleUpdatePatientName = (patientId: string, name: string) => {
    if (!currentShift) return;
    const newData = updatePatientName(data, currentShift.id, patientId, name);
    setData(newData);
  };

  const handleDeletePatient = (patientId: string) => {
    if (!currentShift) return;
    const patient = currentPatients.find((p) => p.id === patientId);
    if (!patient) return;

    showConfirm(
      'Delete Patient',
      `Are you sure you want to delete "${patient.name}" and all their notes? This cannot be undone.`,
      () => {
        const newData = deletePatient(data, currentShift.id, patientId);
        setData(newData);
      }
    );
  };

  const handleToggleArchive = (patientId: string) => {
    if (!currentShift) return;
    const newData = togglePatientArchive(data, currentShift.id, patientId);
    setData(newData);
  };

  // Note operations
  const handleAddNote = (content: string) => {
    if (!currentShift || !selectedPatientId) return;
    const newData = addNote(data, currentShift.id, selectedPatientId, content);
    setData(newData);
  };

  const handleUpdateNote = (noteId: string, content: string) => {
    if (!currentShift || !selectedPatientId) return;
    const newData = updateNote(data, currentShift.id, selectedPatientId, noteId, content);
    setData(newData);
  };

  const handleDeleteNote = (noteId: string) => {
    if (!currentShift || !selectedPatientId) return;
    showConfirm(
      'Delete Note',
      'Are you sure you want to delete this note? This cannot be undone.',
      () => {
        const newData = deleteNote(data, currentShift.id, selectedPatientId, noteId);
        setData(newData);
      }
    );
  };

  return (
    <div className="h-screen flex flex-col bg-neutral-50">
      <Header />
      <ShiftManager
        currentShift={currentShift}
        allShifts={data.shifts}
        onCreateShift={handleCreateShift}
        onSwitchShift={handleSwitchShift}
        onUpdateShiftName={handleUpdateShiftName}
        onDeleteShift={handleDeleteShift}
        onAddPatient={handleAddPatient}
      />

      {currentShift ? (
        <div className="flex-1 flex overflow-hidden pb-6">
          <PatientList
            patients={currentPatients}
            selectedPatientId={selectedPatientId}
            onSelectPatient={setSelectedPatientId}
            onUpdatePatientName={handleUpdatePatientName}
            onDeletePatient={handleDeletePatient}
            onToggleArchive={handleToggleArchive}
          />
          <PatientDetail
            patient={selectedPatient}
            onAddNote={handleAddNote}
            onUpdateNote={handleUpdateNote}
            onDeleteNote={handleDeleteNote}
          />
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-neutral-400">
            <p className="text-body">No active shift</p>
            <p className="text-caption mt-2">Create a new shift to get started</p>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={handleConfirm}
        onCancel={closeConfirm}
      />
    </div>
  );
}
