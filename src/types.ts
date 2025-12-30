export interface Note {
  id: string;
  content: string;
  createdAt: string; // ISO string
  editedAt?: string; // ISO string
}

export interface Patient {
  id: string;
  name: string;
  notes: Note[];
  archived?: boolean;
  createdAt?: string; // ISO string - optional for backward compatibility
}

export interface Shift {
  id: string;
  name: string;
  createdAt: string; // ISO string
  patients: Patient[];
}

export interface AppData {
  shifts: Shift[];
  currentShiftId: string | null;
}
