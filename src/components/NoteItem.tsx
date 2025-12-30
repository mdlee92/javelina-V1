import { useState } from 'react';
import { Pencil, Trash2, Check, X } from 'lucide-react';
import { Note } from '../types';
import { formatDateTime } from '../utils/dateFormat';

interface NoteItemProps {
  note: Note;
  onUpdate: (content: string) => void;
  onDelete: () => void;
}

export default function NoteItem({ note, onUpdate, onDelete }: NoteItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(note.content);

  const handleSave = () => {
    if (editContent.trim()) {
      onUpdate(editContent.trim());
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditContent(note.content);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <div className="group bg-white border border-neutral-200 hover:border-neutral-300 rounded-lg p-4 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        {/* Timestamps */}
        <div className="flex items-baseline gap-2 text-caption text-neutral-500">
          <span>{formatDateTime(note.createdAt)}</span>
          {note.editedAt && (
            <>
              <span className="text-neutral-300">•</span>
              <span>Edited {formatDateTime(note.editedAt)}</span>
            </>
          )}
        </div>

        {/* Action buttons */}
        {!isEditing && (
          <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => setIsEditing(true)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Edit note"
            >
              <Pencil size={16} />
            </button>
            <button
              onClick={onDelete}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete note"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      {isEditing ? (
        <div className="space-y-3">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full p-3 bg-white border border-blue-500 rounded-lg resize-none focus:outline-none text-body"
            rows={5}
            autoFocus
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-medium"
            >
              <Check size={16} className="inline mr-1" /> Save
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg transition-colors font-medium"
            >
              <X size={16} className="inline mr-1" /> Cancel
            </button>
          </div>
        </div>
      ) : (
        <div>
          <p className="text-body text-neutral-800 whitespace-pre-wrap">
            {note.content}
          </p>
        </div>
      )}
    </div>
  );
}
