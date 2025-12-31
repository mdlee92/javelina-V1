import { API, Auth } from 'aws-amplify';
import { Shift, Patient, Note } from '../types';

const API_NAME = 'ERNotesAPI';

// Helper to get auth token
async function getAuthHeaders() {
  try {
    const session = await Auth.currentSession();
    const token = session.getIdToken().getJwtToken();
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  } catch (error) {
    throw new Error('Authentication required');
  }
}

// Shift API
export const shiftAPI = {
  async getAll(): Promise<Shift[]> {
    const headers = await getAuthHeaders();
    const response = await API.get(API_NAME, '/shifts', { headers });
    return response.shifts;
  },

  async create(name: string): Promise<Shift> {
    const headers = await getAuthHeaders();
    const response = await API.post(API_NAME, '/shifts', {
      headers,
      body: { name },
    });
    return response.shift;
  },

  async update(shiftId: string, name: string): Promise<Shift> {
    const headers = await getAuthHeaders();
    const response = await API.put(API_NAME, `/shifts/${shiftId}`, {
      headers,
      body: { name },
    });
    return response.shift;
  },

  async delete(shiftId: string): Promise<void> {
    const headers = await getAuthHeaders();
    await API.del(API_NAME, `/shifts/${shiftId}`, { headers });
  },

  async getById(shiftId: string): Promise<Shift> {
    const headers = await getAuthHeaders();
    const response = await API.get(API_NAME, `/shifts/${shiftId}`, { headers });
    return response.shift;
  },
};

// Patient API
export const patientAPI = {
  async getAll(shiftId: string): Promise<Patient[]> {
    const headers = await getAuthHeaders();
    const response = await API.get(API_NAME, `/shifts/${shiftId}/patients`, { headers });
    return response.patients;
  },

  async create(shiftId: string, name: string): Promise<Patient> {
    const headers = await getAuthHeaders();
    const response = await API.post(API_NAME, `/shifts/${shiftId}/patients`, {
      headers,
      body: { name },
    });
    return response.patient;
  },

  async update(patientId: string, updates: { name?: string; archived?: boolean }): Promise<Patient> {
    const headers = await getAuthHeaders();
    const response = await API.put(API_NAME, `/patients/${patientId}`, {
      headers,
      body: updates,
    });
    return response.patient;
  },

  async delete(patientId: string): Promise<void> {
    const headers = await getAuthHeaders();
    await API.del(API_NAME, `/patients/${patientId}`, { headers });
  },

  async getById(patientId: string): Promise<Patient> {
    const headers = await getAuthHeaders();
    const response = await API.get(API_NAME, `/patients/${patientId}`, { headers });
    return response.patient;
  },
};

// Note API
export const noteAPI = {
  async getAll(patientId: string): Promise<Note[]> {
    const headers = await getAuthHeaders();
    const response = await API.get(API_NAME, `/patients/${patientId}/notes`, { headers });
    return response.notes;
  },

  async create(patientId: string, content: string): Promise<Note> {
    const headers = await getAuthHeaders();
    const response = await API.post(API_NAME, `/patients/${patientId}/notes`, {
      headers,
      body: { content },
    });
    return response.note;
  },

  async update(noteId: string, content: string): Promise<Note> {
    const headers = await getAuthHeaders();
    const response = await API.put(API_NAME, `/notes/${noteId}`, {
      headers,
      body: { content },
    });
    return response.note;
  },

  async delete(noteId: string): Promise<void> {
    const headers = await getAuthHeaders();
    await API.del(API_NAME, `/notes/${noteId}`, { headers });
  },
};
