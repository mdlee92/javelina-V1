import { useState, useRef, useEffect } from 'react';
import { FileText, ArrowRight, Download } from 'lucide-react';
import { Patient, Note } from '../types';
import NoteItem from './NoteItem';
import { exportPatientNotes } from '../utils/exportNotes';
import { formatDateTime } from '../utils/dateFormat';

interface PatientDetailProps {
  patient: Patient | null;
  notes?: Note[];
  onAddNote: (content: string) => void;
  onUpdateNote: (noteId: string, content: string) => void;
  onDeleteNote: (noteId: string) => void;
}

export default function PatientDetail({
  patient,
  notes = [],
  onAddNote,
  onUpdateNote,
  onDeleteNote,
}: PatientDetailProps) {
  const [newNoteContent, setNewNoteContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const notesContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when notes change
  useEffect(() => {
    if (notesContainerRef.current) {
      const container = notesContainerRef.current;
      container.scrollTop = container.scrollHeight;
    }
  }, [notes.length]);

  // Handle textarea auto-expansion (1-5 lines, then scrollable)
  const handleTextareaInput = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Reset height to auto to get accurate scrollHeight
    textarea.style.height = 'auto';

    const lineHeight = 24; // pixels
    const maxLines = 5;
    const minHeight = lineHeight + 16; // 1 line + padding
    const maxHeight = lineHeight * maxLines + 16; // 5 lines + padding

    const scrollHeight = textarea.scrollHeight;
    const newHeight = Math.max(minHeight, Math.min(scrollHeight, maxHeight));

    textarea.style.height = `${newHeight}px`;
  };

  const handleAddNote = () => {
    if (newNoteContent.trim()) {
      onAddNote(newNoteContent.trim());
      setNewNoteContent('');
      // Reset textarea height after submitting
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleAddNote();
    }
  };

  const handleNoteContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewNoteContent(e.target.value);
    handleTextareaInput();
  };

  const handleExportNotes = () => {
    if (!patient) return;
    if (notes.length === 0) {
      alert('No notes to export. Add some notes first!');
      return;
    }
    // Create a temporary patient object with notes for export
    const patientWithNotes = { ...patient, notes };
    exportPatientNotes(patientWithNotes);
  };

  if (!patient) {
    return (
      <div className="flex-1 flex items-center justify-center bg-transparent">
        <div className="text-center text-gray-400">
          <FileText size={64} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">Select a patient to view their notes</p>
        </div>
      </div>
    );
  }

  // Sort notes by creation time, oldest first
  const sortedNotes = [...notes].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <div className="h-full bg-white flex flex-col overflow-hidden">
        {/* Simple patient header */}
        <div className="bg-white border-b border-neutral-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-heading font-bold text-neutral-900">
                {patient.name}
              </h2>
              {patient.archived && (
                <span className="text-caption text-neutral-400 mt-1">Archived</span>
              )}
            </div>
            <button
              onClick={handleExportNotes}
              className="p-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
              title="Export notes to text file"
            >
              <Download size={18} />
            </button>
          </div>
          <div className="flex items-center gap-4 mt-2 text-caption text-neutral-500">
            {patient.createdAt && <span>Created {formatDateTime(patient.createdAt)}</span>}
            <span>{notes.length} {notes.length === 1 ? 'note' : 'notes'}</span>
          </div>
        </div>

        {/* Notes list */}
        <div
          ref={notesContainerRef}
          className="flex-1 overflow-y-auto py-6 bg-neutral-50"
        >
          <div className="space-y-3 max-w-3xl mx-auto">
            {sortedNotes.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-neutral-200 flex items-center justify-center">
                  <FileText size={40} className="text-neutral-300" />
                </div>
                <p className="text-body font-semibold text-neutral-400">No notes yet</p>
                <p className="text-caption text-neutral-400 mt-2">Add your first note below</p>
              </div>
            ) : (
              sortedNotes.map((note) => (
                <NoteItem
                  key={note.id}
                  note={note}
                  onUpdate={(content) => onUpdateNote(note.id, content)}
                  onDelete={() => onDeleteNote(note.id)}
                />
              ))
            )}
          </div>
        </div>

        {/* Add note input */}
        <div className="bg-white border-t border-neutral-200 py-6">
          <div className="max-w-3xl mx-auto pr-4">
            <div className="relative">
              <textarea
                ref={textareaRef}
                id="new-note"
                value={newNoteContent}
                onChange={handleNoteContentChange}
                onKeyDown={handleKeyDown}
                placeholder="Add a note..."
                className="w-full py-3 px-4 pr-12 bg-white border border-neutral-200 focus:border-blue-500 rounded-lg resize-none transition-colors text-body"
                style={{ minHeight: '56px', maxHeight: '144px' }}
              />
              <button
                onClick={handleAddNote}
                disabled={!newNoteContent.trim()}
                className="absolute bottom-3 right-3 p-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg disabled:bg-neutral-300 disabled:cursor-not-allowed transition-colors"
                title="Add note (Ctrl+Enter)"
              >
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
