import { Patient } from '../types';
import {
  ArrowDownWideNarrow,
  ArrowUpNarrowWide,
  ArrowDownAZ,
  ArrowUpAZ,
} from 'lucide-react';

export type SortOption = 'time-desc' | 'time-asc' | 'alpha-asc' | 'alpha-desc';

export interface SortPreferences {
  active: SortOption;
  archived: SortOption;
}

const SORT_STORAGE_KEY = 'er-notes-sort-preferences';
const DEFAULT_PREFERENCES: SortPreferences = {
  active: 'time-desc',
  archived: 'time-desc',
};

/**
 * Extract timestamp from patient (createdAt or parsed from ID)
 */
const getPatientTimestamp = (patient: Patient): number => {
  if (patient.createdAt) {
    return new Date(patient.createdAt).getTime();
  }
  // Fallback: parse from ID (format: timestamp-random)
  return parseInt(patient.id.split('-')[0]);
};

/**
 * Sort patients array based on sort option (immutable)
 */
export const sortPatients = (patients: Patient[], option: SortOption): Patient[] => {
  const sorted = [...patients];

  switch (option) {
    case 'time-desc':
      return sorted.sort((a, b) => getPatientTimestamp(b) - getPatientTimestamp(a));
    case 'time-asc':
      return sorted.sort((a, b) => getPatientTimestamp(a) - getPatientTimestamp(b));
    case 'alpha-asc':
      return sorted.sort((a, b) =>
        a.name.toLowerCase().localeCompare(b.name.toLowerCase())
      );
    case 'alpha-desc':
      return sorted.sort((a, b) =>
        b.name.toLowerCase().localeCompare(a.name.toLowerCase())
      );
  }
};

/**
 * Get the next sort option in the cycle
 */
export const getNextSortOption = (current: SortOption): SortOption => {
  const cycle: SortOption[] = ['time-desc', 'time-asc', 'alpha-asc', 'alpha-desc'];
  const currentIndex = cycle.indexOf(current);
  return cycle[(currentIndex + 1) % cycle.length];
};

/**
 * Get the icon component for a sort option
 */
export const getSortIcon = (option: SortOption) => {
  const iconMap = {
    'time-desc': ArrowDownWideNarrow,
    'time-asc': ArrowUpNarrowWide,
    'alpha-asc': ArrowUpAZ,
    'alpha-desc': ArrowDownAZ,
  };
  return iconMap[option];
};

/**
 * Get human-readable label for a sort option
 */
export const getSortLabel = (option: SortOption): string => {
  const labelMap = {
    'time-desc': 'Newest first',
    'time-asc': 'Oldest first',
    'alpha-asc': 'A to Z',
    'alpha-desc': 'Z to A',
  };
  return labelMap[option];
};

/**
 * Load sort preferences from localStorage
 */
export const loadSortPreferences = (): SortPreferences => {
  try {
    const stored = localStorage.getItem(SORT_STORAGE_KEY);
    if (!stored) return DEFAULT_PREFERENCES;
    return JSON.parse(stored);
  } catch {
    return DEFAULT_PREFERENCES;
  }
};

/**
 * Save sort preferences to localStorage
 */
export const saveSortPreferences = (preferences: SortPreferences): void => {
  try {
    localStorage.setItem(SORT_STORAGE_KEY, JSON.stringify(preferences));
  } catch (error) {
    console.error('Error saving sort preferences:', error);
  }
};
