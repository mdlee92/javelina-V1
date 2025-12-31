import { useState, useEffect } from 'react';
import { Shift } from '../types';
import { shiftAPI } from '../services/api';

export function useShifts() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchShifts();
  }, []);

  async function fetchShifts() {
    try {
      setLoading(true);
      const data = await shiftAPI.getAll();
      setShifts(data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching shifts:', err);
      setError(err.message || 'Failed to load shifts');
    } finally {
      setLoading(false);
    }
  }

  async function createShift(name: string): Promise<Shift> {
    try {
      const newShift = await shiftAPI.create(name);
      setShifts(prev => [...prev, newShift]);
      return newShift;
    } catch (err: any) {
      console.error('Error creating shift:', err);
      throw err;
    }
  }

  async function updateShiftName(shiftId: string, name: string): Promise<void> {
    try {
      const updated = await shiftAPI.update(shiftId, name);
      setShifts(prev =>
        prev.map(shift => (shift.id === shiftId ? updated : shift))
      );
    } catch (err: any) {
      console.error('Error updating shift:', err);
      throw err;
    }
  }

  async function deleteShift(shiftId: string): Promise<void> {
    try {
      await shiftAPI.delete(shiftId);
      setShifts(prev => prev.filter(shift => shift.id !== shiftId));
    } catch (err: any) {
      console.error('Error deleting shift:', err);
      throw err;
    }
  }

  async function refreshShifts(): Promise<void> {
    await fetchShifts();
  }

  return {
    shifts,
    loading,
    error,
    createShift,
    updateShiftName,
    deleteShift,
    refreshShifts,
  };
}
