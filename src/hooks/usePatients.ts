import { useState, useEffect } from 'react';
import { Patient } from '../types';
import { patientAPI } from '../services/api';

export function usePatients(shiftId: string | null) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (shiftId) {
      fetchPatients(shiftId);
    } else {
      setPatients([]);
      setLoading(false);
    }
  }, [shiftId]);

  async function fetchPatients(sid: string) {
    try {
      setLoading(true);
      const data = await patientAPI.getAll(sid);
      setPatients(data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching patients:', err);
      setError(err.message || 'Failed to load patients');
    } finally {
      setLoading(false);
    }
  }

  async function createPatient(name: string): Promise<Patient> {
    if (!shiftId) throw new Error('No shift selected');

    try {
      const newPatient = await patientAPI.create(shiftId, name);
      setPatients(prev => [...prev, newPatient]);
      return newPatient;
    } catch (err: any) {
      console.error('Error creating patient:', err);
      throw err;
    }
  }

  async function updatePatientName(patientId: string, name: string): Promise<void> {
    try {
      const updated = await patientAPI.update(patientId, { name });
      setPatients(prev =>
        prev.map(patient => (patient.id === patientId ? updated : patient))
      );
    } catch (err: any) {
      console.error('Error updating patient:', err);
      throw err;
    }
  }

  async function togglePatientArchive(patientId: string): Promise<void> {
    try {
      const current = patients.find(p => p.id === patientId);
      if (!current) throw new Error('Patient not found');

      const updated = await patientAPI.update(patientId, { archived: !current.archived });
      setPatients(prev =>
        prev.map(patient => (patient.id === patientId ? updated : patient))
      );
    } catch (err: any) {
      console.error('Error toggling patient archive:', err);
      throw err;
    }
  }

  async function deletePatient(patientId: string): Promise<void> {
    try {
      await patientAPI.delete(patientId);
      setPatients(prev => prev.filter(patient => patient.id !== patientId));
    } catch (err: any) {
      console.error('Error deleting patient:', err);
      throw err;
    }
  }

  async function refreshPatients(): Promise<void> {
    if (shiftId) {
      await fetchPatients(shiftId);
    }
  }

  return {
    patients,
    loading,
    error,
    createPatient,
    updatePatientName,
    togglePatientArchive,
    deletePatient,
    refreshPatients,
  };
}
