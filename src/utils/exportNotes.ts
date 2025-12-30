import { Patient } from '../types';

/**
 * Formats ISO date string to simple readable format: MM/DD/YYYY h:mm AM/PM
 */
export const formatExportTimestamp = (isoString: string): string => {
  const date = new Date(isoString);

  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();

  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';

  hours = hours % 12;
  hours = hours ? hours : 12; // Convert 0 to 12

  return `${month}/${day}/${year} ${hours}:${minutes} ${ampm}`;
};

/**
 * Formats patient notes as text file content
 */
export const formatNotesAsText = (patient: Patient): string => {
  const lines: string[] = [];

  // Header
  lines.push('========================================');
  lines.push(`PATIENT: ${patient.name}`);
  lines.push(`TOTAL NOTES: ${patient.notes.length}`);
  lines.push(`EXPORTED: ${formatExportTimestamp(new Date().toISOString())}`);
  lines.push('========================================');
  lines.push('');

  // Sort notes by creation time (oldest first, matching display order)
  const sortedNotes = [...patient.notes].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  // Add each note
  sortedNotes.forEach((note, index) => {
    lines.push(`NOTE ${index + 1}`);
    lines.push(`Created: ${formatExportTimestamp(note.createdAt)}`);
    if (note.editedAt) {
      lines.push(`Edited: ${formatExportTimestamp(note.editedAt)}`);
    }
    lines.push('---');
    lines.push(note.content);
    lines.push('');
    lines.push(''); // Extra blank line between notes
  });

  return lines.join('\n');
};

/**
 * Generates safe filename for export
 */
export const generateExportFilename = (patientName: string): string => {
  // Remove special characters and replace spaces with underscores
  const safeName = patientName.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');

  // Add current date
  const now = new Date();
  const dateStr = `${now.getMonth() + 1}-${now.getDate()}-${now.getFullYear()}`;

  return `${safeName}_Notes_${dateStr}.txt`;
};

/**
 * Triggers browser download of text content
 */
export const downloadTextFile = (content: string, filename: string): void => {
  // Create blob with text content
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });

  // Create temporary download link
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;

  // Trigger download
  document.body.appendChild(link);
  link.click();

  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Main export function - combines all steps
 */
export const exportPatientNotes = (patient: Patient): void => {
  const content = formatNotesAsText(patient);
  const filename = generateExportFilename(patient.name);
  downloadTextFile(content, filename);
};
