import { get, post, put, del } from 'aws-amplify/api';
import { fetchAuthSession } from 'aws-amplify/auth';
import { Shift, Patient, Note } from '../types';

const API_NAME = 'ERNotesAPI';

// Helper to get auth token
async function getAuthHeaders() {
  try {
    const { tokens } = await fetchAuthSession();
    const token = tokens?.idToken?.toString() || '';
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
    const restOperation = get({
      apiName: API_NAME,
      path: '/shifts',
      options: { headers },
    });
    const { body } = await restOperation.response;
    const response = await body.json();
    return (response as any).shifts;
  },

  async create(name: string): Promise<Shift> {
    const headers = await getAuthHeaders();
    const restOperation = post({
      apiName: API_NAME,
      path: '/shifts',
      options: {
        headers,
        body: { name },
      },
    });
    const { body } = await restOperation.response;
    const response = await body.json();
    return (response as any).shift;
  },

  async update(shiftId: string, name: string): Promise<Shift> {
    const headers = await getAuthHeaders();
    const restOperation = put({
      apiName: API_NAME,
      path: `/shifts/${shiftId}`,
      options: {
        headers,
        body: { name },
      },
    });
    const { body } = await restOperation.response;
    const response = await body.json();
    return (response as any).shift;
  },

  async delete(shiftId: string): Promise<void> {
    const headers = await getAuthHeaders();
    const restOperation = del({
      apiName: API_NAME,
      path: `/shifts/${shiftId}`,
      options: { headers },
    });
    await restOperation.response;
  },

  async getById(shiftId: string): Promise<Shift> {
    const headers = await getAuthHeaders();
    const restOperation = get({
      apiName: API_NAME,
      path: `/shifts/${shiftId}`,
      options: { headers },
    });
    const { body } = await restOperation.response;
    const response = await body.json();
    return (response as any).shift;
  },
};

// Patient API
export const patientAPI = {
  async getAll(shiftId: string): Promise<Patient[]> {
    const headers = await getAuthHeaders();
    const restOperation = get({
      apiName: API_NAME,
      path: `/shifts/${shiftId}/patients`,
      options: { headers },
    });
    const { body } = await restOperation.response;
    const response = await body.json();
    return (response as any).patients;
  },

  async create(shiftId: string, name: string): Promise<Patient> {
    const headers = await getAuthHeaders();
    const restOperation = post({
      apiName: API_NAME,
      path: `/shifts/${shiftId}/patients`,
      options: {
        headers,
        body: { name },
      },
    });
    const { body } = await restOperation.response;
    const response = await body.json();
    return (response as any).patient;
  },

  async update(patientId: string, updates: { name?: string; archived?: boolean }): Promise<Patient> {
    const headers = await getAuthHeaders();
    const restOperation = put({
      apiName: API_NAME,
      path: `/patients/${patientId}`,
      options: {
        headers,
        body: updates,
      },
    });
    const { body } = await restOperation.response;
    const response = await body.json();
    return (response as any).patient;
  },

  async delete(patientId: string): Promise<void> {
    const headers = await getAuthHeaders();
    const restOperation = del({
      apiName: API_NAME,
      path: `/patients/${patientId}`,
      options: { headers },
    });
    await restOperation.response;
  },

  async getById(patientId: string): Promise<Patient> {
    const headers = await getAuthHeaders();
    const restOperation = get({
      apiName: API_NAME,
      path: `/patients/${patientId}`,
      options: { headers },
    });
    const { body } = await restOperation.response;
    const response = await body.json();
    return (response as any).patient;
  },
};

// Note API
export const noteAPI = {
  async getAll(patientId: string): Promise<Note[]> {
    const headers = await getAuthHeaders();
    const restOperation = get({
      apiName: API_NAME,
      path: `/patients/${patientId}/notes`,
      options: { headers },
    });
    const { body } = await restOperation.response;
    const response = await body.json();
    return (response as any).notes;
  },

  async create(patientId: string, content: string): Promise<Note> {
    const headers = await getAuthHeaders();
    const restOperation = post({
      apiName: API_NAME,
      path: `/patients/${patientId}/notes`,
      options: {
        headers,
        body: { content },
      },
    });
    const { body } = await restOperation.response;
    const response = await body.json();
    return (response as any).note;
  },

  async update(noteId: string, content: string): Promise<Note> {
    const headers = await getAuthHeaders();
    const restOperation = put({
      apiName: API_NAME,
      path: `/notes/${noteId}`,
      options: {
        headers,
        body: { content },
      },
    });
    const { body } = await restOperation.response;
    const response = await body.json();
    return (response as any).note;
  },

  async delete(noteId: string): Promise<void> {
    const headers = await getAuthHeaders();
    const restOperation = del({
      apiName: API_NAME,
      path: `/notes/${noteId}`,
      options: { headers },
    });
    await restOperation.response;
  },
};
