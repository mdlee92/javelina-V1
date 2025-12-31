import { useState, useEffect } from 'react';
import { Note } from '../types';
import { noteAPI } from '../services/api';

export function useNotes(patientId: string | null) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (patientId) {
      fetchNotes(patientId);
    } else {
      setNotes([]);
      setLoading(false);
    }
  }, [patientId]);

  async function fetchNotes(pid: string) {
    try {
      setLoading(true);
      const data = await noteAPI.getAll(pid);
      setNotes(data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching notes:', err);
      setError(err.message || 'Failed to load notes');
    } finally {
      setLoading(false);
    }
  }

  async function createNote(content: string): Promise<Note> {
    if (!patientId) throw new Error('No patient selected');

    try {
      const newNote = await noteAPI.create(patientId, content);
      setNotes(prev => [...prev, newNote]);
      return newNote;
    } catch (err: any) {
      console.error('Error creating note:', err);
      throw err;
    }
  }

  async function updateNote(noteId: string, content: string): Promise<void> {
    try {
      const updated = await noteAPI.update(noteId, content);
      setNotes(prev =>
        prev.map(note => (note.id === noteId ? updated : note))
      );
    } catch (err: any) {
      console.error('Error updating note:', err);
      throw err;
    }
  }

  async function deleteNote(noteId: string): Promise<void> {
    try {
      await noteAPI.delete(noteId);
      setNotes(prev => prev.filter(note => note.id !== noteId));
    } catch (err: any) {
      console.error('Error deleting note:', err);
      throw err;
    }
  }

  async function refreshNotes(): Promise<void> {
    if (patientId) {
      await fetchNotes(patientId);
    }
  }

  return {
    notes,
    loading,
    error,
    createNote,
    updateNote,
    deleteNote,
    refreshNotes,
  };
}
