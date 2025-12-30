import { AppData, Shift, Patient, Note } from '../types';

const STORAGE_KEY = 'er-notes-data';

const getDefaultData = (): AppData => ({
  shifts: [],
  currentShiftId: null,
});

export const loadData = (): AppData => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return getDefaultData();

    const data: AppData = JSON.parse(stored);

    // Migrate patients without createdAt
    const migratedData = {
      ...data,
      shifts: data.shifts.map(shift => ({
        ...shift,
        patients: shift.patients.map(patient => {
          if (!patient.createdAt) {
            const timestamp = parseInt(patient.id.split('-')[0]);
            return {
              ...patient,
              createdAt: new Date(timestamp).toISOString(),
            };
          }
          return patient;
        }),
      })),
    };

    if (JSON.stringify(migratedData) !== JSON.stringify(data)) {
      saveData(migratedData);
    }

    return migratedData;
  } catch (error) {
    console.error('Error loading data:', error);
    return getDefaultData();
  }
};

export const saveData = (data: AppData): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving data:', error);
  }
};

export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Shift operations
export const createShift = (data: AppData, name: string): AppData => {
  const newShift: Shift = {
    id: generateId(),
    name,
    createdAt: new Date().toISOString(),
    patients: [],
  };

  const updatedData = {
    shifts: [...data.shifts, newShift],
    currentShiftId: newShift.id,
  };

  saveData(updatedData);
  return updatedData;
};

export const updateShiftName = (data: AppData, shiftId: string, name: string): AppData => {
  const updatedData = {
    ...data,
    shifts: data.shifts.map(shift =>
      shift.id === shiftId ? { ...shift, name } : shift
    ),
  };

  saveData(updatedData);
  return updatedData;
};

export const deleteShift = (data: AppData, shiftId: string): AppData => {
  // Filter out the deleted shift
  const remainingShifts = data.shifts.filter(shift => shift.id !== shiftId);

  // Determine new currentShiftId
  let newCurrentShiftId: string | null;

  if (data.currentShiftId === shiftId) {
    // Deleting the active shift
    if (remainingShifts.length > 0) {
      // Auto-select the first remaining shift
      newCurrentShiftId = remainingShifts[0].id;
    } else {
      // No shifts left, set to null
      newCurrentShiftId = null;
    }
  } else {
    // Not deleting the active shift, keep current selection
    newCurrentShiftId = data.currentShiftId;
  }

  const updatedData = {
    shifts: remainingShifts,
    currentShiftId: newCurrentShiftId,
  };

  saveData(updatedData);
  return updatedData;
};

export const switchShift = (data: AppData, shiftId: string): AppData => {
  const updatedData = {
    ...data,
    currentShiftId: shiftId,
  };

  saveData(updatedData);
  return updatedData;
};

// Patient operations
export const addPatient = (data: AppData, shiftId: string, name: string): AppData => {
  const newPatient: Patient = {
    id: generateId(),
    name,
    notes: [],
    archived: false,
    createdAt: new Date().toISOString(),
  };

  const updatedData = {
    ...data,
    shifts: data.shifts.map(shift =>
      shift.id === shiftId
        ? { ...shift, patients: [...shift.patients, newPatient] }
        : shift
    ),
  };

  saveData(updatedData);
  return updatedData;
};

export const updatePatientName = (
  data: AppData,
  shiftId: string,
  patientId: string,
  name: string
): AppData => {
  const updatedData = {
    ...data,
    shifts: data.shifts.map(shift =>
      shift.id === shiftId
        ? {
            ...shift,
            patients: shift.patients.map(patient =>
              patient.id === patientId ? { ...patient, name } : patient
            ),
          }
        : shift
    ),
  };

  saveData(updatedData);
  return updatedData;
};

export const deletePatient = (data: AppData, shiftId: string, patientId: string): AppData => {
  const updatedData = {
    ...data,
    shifts: data.shifts.map(shift =>
      shift.id === shiftId
        ? {
            ...shift,
            patients: shift.patients.filter(patient => patient.id !== patientId),
          }
        : shift
    ),
  };

  saveData(updatedData);
  return updatedData;
};

export const togglePatientArchive = (
  data: AppData,
  shiftId: string,
  patientId: string
): AppData => {
  const updatedData = {
    ...data,
    shifts: data.shifts.map(shift =>
      shift.id === shiftId
        ? {
            ...shift,
            patients: shift.patients.map(patient =>
              patient.id === patientId
                ? { ...patient, archived: !patient.archived }
                : patient
            ),
          }
        : shift
    ),
  };

  saveData(updatedData);
  return updatedData;
};

// Note operations
export const addNote = (
  data: AppData,
  shiftId: string,
  patientId: string,
  content: string
): AppData => {
  const newNote: Note = {
    id: generateId(),
    content,
    createdAt: new Date().toISOString(),
  };

  const updatedData = {
    ...data,
    shifts: data.shifts.map(shift =>
      shift.id === shiftId
        ? {
            ...shift,
            patients: shift.patients.map(patient =>
              patient.id === patientId
                ? { ...patient, notes: [...patient.notes, newNote] }
                : patient
            ),
          }
        : shift
    ),
  };

  saveData(updatedData);
  return updatedData;
};

export const updateNote = (
  data: AppData,
  shiftId: string,
  patientId: string,
  noteId: string,
  content: string
): AppData => {
  const updatedData = {
    ...data,
    shifts: data.shifts.map(shift =>
      shift.id === shiftId
        ? {
            ...shift,
            patients: shift.patients.map(patient =>
              patient.id === patientId
                ? {
                    ...patient,
                    notes: patient.notes.map(note =>
                      note.id === noteId
                        ? { ...note, content, editedAt: new Date().toISOString() }
                        : note
                    ),
                  }
                : patient
            ),
          }
        : shift
    ),
  };

  saveData(updatedData);
  return updatedData;
};

export const deleteNote = (
  data: AppData,
  shiftId: string,
  patientId: string,
  noteId: string
): AppData => {
  const updatedData = {
    ...data,
    shifts: data.shifts.map(shift =>
      shift.id === shiftId
        ? {
            ...shift,
            patients: shift.patients.map(patient =>
              patient.id === patientId
                ? {
                    ...patient,
                    notes: patient.notes.filter(note => note.id !== noteId),
                  }
                : patient
            ),
          }
        : shift
    ),
  };

  saveData(updatedData);
  return updatedData;
};
