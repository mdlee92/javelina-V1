import { useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-xl shadow-lg border border-neutral-200 max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >

        {/* Header */}
        <div className="flex items-start gap-3 p-6 border-b border-neutral-200">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
            <AlertTriangle size={20} className="text-red-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-subheading font-bold text-neutral-900">{title}</h3>
          </div>
          <button
            onClick={onCancel}
            className="flex-shrink-0 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg p-1.5 transition-colors"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Message */}
        <div className="p-6">
          <p className="text-body text-neutral-700">{message}</p>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 p-6 bg-neutral-50 border-t border-neutral-200">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-neutral-700 bg-white border border-neutral-300 hover:bg-neutral-50 rounded-lg transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors font-medium"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
