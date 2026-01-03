import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useShifts } from '../hooks/useShifts';
import { usePatients } from '../hooks/usePatients';
import { useNotes } from '../hooks/useNotes';
import Header from '../components/Header';
import ShiftHeader from '../components/ShiftHeader';
import PatientList from '../components/PatientList';
import PatientDetail from '../components/PatientDetail';
import ConfirmDialog from '../components/ConfirmDialog';

interface ConfirmState {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
}

export default function ShiftView() {
  const { shiftId } = useParams<{ shiftId: string }>();
  const navigate = useNavigate();
  const { shifts, updateShiftName, deleteShift } = useShifts();
  const { patients, createPatient, updatePatientName, deletePatient, togglePatientArchive } = usePatients(shiftId || null);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const { notes, createNote, updateNote, deleteNote } = useNotes(selectedPatientId);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmState>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Validate shift exists
  useEffect(() => {
    if (!shiftId) {
      navigate('/', { replace: true });
      return;
    }

    const shift = shifts.find((s) => s.id === shiftId);
    if (shifts.length > 0 && !shift) {
      navigate('/', { replace: true });
      return;
    }
  }, [shiftId, shifts, navigate]);

  const currentShift = shifts.find((s) => s.id === shiftId) || null;
  const selectedPatient = patients.find((p) => p.id === selectedPatientId) || null;

  // Auto-select first patient when shift changes, preferring active patients
  useEffect(() => {
    if (patients.length > 0 && !selectedPatientId) {
      // Prefer active patients when auto-selecting
      const activePatient = patients.find(p => !p.archived);
      setSelectedPatientId(activePatient?.id || patients[0].id);
    } else if (selectedPatientId && !patients.find((p) => p.id === selectedPatientId)) {
      // If selected patient was deleted, prefer active patients
      if (patients.length > 0) {
        const activePatient = patients.find(p => !p.archived);
        setSelectedPatientId(activePatient?.id || patients[0].id);
      } else {
        setSelectedPatientId(null);
      }
    }
  }, [patients, selectedPatientId]);

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

  const handleUpdateShiftName = async (name: string) => {
    if (!currentShift) return;
    try {
      await updateShiftName(currentShift.id, name);
    } catch (err) {
      console.error('Failed to update shift name:', err);
    }
  };

  const handleDeleteShift = () => {
    if (!currentShift) return;
    showConfirm(
      'Delete Shift',
      `Are you sure you want to delete "${currentShift.name}" and all its patients? This cannot be undone.`,
      async () => {
        try {
          await deleteShift(currentShift.id);
          setSelectedPatientId(null);
          navigate('/');
        } catch (err) {
          console.error('Failed to delete shift:', err);
        }
      }
    );
  };

  // Patient operations
  const handleAddPatient = async (name: string) => {
    if (!currentShift) return;
    try {
      console.log('Creating patient with name:', name);
      const newPatient = await createPatient(name);
      console.log('Patient created successfully:', newPatient);
      setSelectedPatientId(newPatient.id);
    } catch (err: any) {
      console.error('Failed to add patient:', err);
      alert(`Error creating patient: ${err.message || 'Unknown error'}\n\nPlease check the browser console for details.`);
    }
  };

  const handleUpdatePatientName = async (patientId: string, name: string) => {
    try {
      await updatePatientName(patientId, name);
    } catch (err) {
      console.error('Failed to update patient name:', err);
    }
  };

  const handleDeletePatient = (patientId: string) => {
    const patient = patients.find((p) => p.id === patientId);
    if (!patient) return;

    showConfirm(
      'Delete Patient',
      `Are you sure you want to delete "${patient.name}" and all their notes? This cannot be undone.`,
      async () => {
        try {
          await deletePatient(patientId);
        } catch (err) {
          console.error('Failed to delete patient:', err);
        }
      }
    );
  };

  const handleToggleArchive = async (patientId: string) => {
    try {
      await togglePatientArchive(patientId);
    } catch (err) {
      console.error('Failed to toggle patient archive:', err);
    }
  };

  // Note operations
  const handleAddNote = async (content: string) => {
    if (!selectedPatientId) return;
    try {
      await createNote(content);
    } catch (err) {
      console.error('Failed to add note:', err);
    }
  };

  const handleUpdateNote = async (noteId: string, content: string) => {
    try {
      await updateNote(noteId, content);
    } catch (err) {
      console.error('Failed to update note:', err);
    }
  };

  const handleDeleteNote = (noteId: string) => {
    showConfirm(
      'Delete Note',
      'Are you sure you want to delete this note? This cannot be undone.',
      async () => {
        try {
          await deleteNote(noteId);
        } catch (err) {
          console.error('Failed to delete note:', err);
        }
      }
    );
  };

  return (
    <div className="h-screen flex flex-col bg-neutral-50">
      <Header />
      <ShiftHeader
        currentShift={currentShift}
        onUpdateShiftName={handleUpdateShiftName}
        onDeleteShift={handleDeleteShift}
        onAddPatient={handleAddPatient}
      />

      {currentShift ? (
        <div className="flex-1 flex overflow-hidden pb-6">
          <PatientList
            patients={patients}
            selectedPatientId={selectedPatientId}
            onSelectPatient={setSelectedPatientId}
            onUpdatePatientName={handleUpdatePatientName}
            onDeletePatient={handleDeletePatient}
            onToggleArchive={handleToggleArchive}
          />
          <PatientDetail
            patient={selectedPatient}
            notes={notes}
            onAddNote={handleAddNote}
            onUpdateNote={handleUpdateNote}
            onDeleteNote={handleDeleteNote}
          />
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-neutral-400">
            <p className="text-body">Loading shift...</p>
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
