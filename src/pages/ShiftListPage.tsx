import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Pencil, Check, X, Calendar, ArrowUp, ArrowDown } from 'lucide-react';
import { useShifts } from '../hooks/useShifts';
import Header from '../components/Header';
import ConfirmDialog from '../components/ConfirmDialog';
import { formatDateTime } from '../utils/dateFormat';

interface ConfirmState {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
}

type ShiftSortColumn = 'name' | 'createdAt' | 'totalPatients' | 'activePatients' | 'archivedPatients';
type SortDirection = 'asc' | 'desc';

export default function ShiftListPage() {
  const navigate = useNavigate();
  const { shifts, loading, error, createShift, updateShiftName, deleteShift } = useShifts();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [isAddingShift, setIsAddingShift] = useState(false);
  const [newShiftName, setNewShiftName] = useState('');
  const [confirmDialog, setConfirmDialog] = useState<ConfirmState>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });
  const [sortColumn, setSortColumn] = useState<ShiftSortColumn>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const showConfirm = (title: string, message: string, onConfirm: () => void) => {
    setConfirmDialog({
      isOpen: true,
      title,
      message,
      onConfirm,
    });
  };

  const closeConfirm = () => {
    setConfirmDialog({
      isOpen: false,
      title: '',
      message: '',
      onConfirm: () => {},
    });
  };

  const handleConfirm = () => {
    confirmDialog.onConfirm();
    closeConfirm();
  };

  const handleShiftClick = (shiftId: string) => {
    if (!editingId) {
      navigate(`/shift/${shiftId}`);
    }
  };

  const handleCreateShift = async () => {
    if (newShiftName.trim()) {
      try {
        const newShift = await createShift(newShiftName.trim());
        setIsAddingShift(false);
        setNewShiftName('');
        // Auto-navigate to the newly created shift
        navigate(`/shift/${newShift.id}`);
      } catch (err) {
        console.error('Failed to create shift:', err);
      }
    }
  };

  const handleStartEdit = (shiftId: string, currentName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(shiftId);
    setEditName(currentName);
  };

  const handleSaveEdit = async (shiftId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (editName.trim()) {
      try {
        await updateShiftName(shiftId, editName.trim());
        setEditingId(null);
        setEditName('');
      } catch (err) {
        console.error('Failed to update shift name:', err);
      }
    }
  };

  const handleCancelEdit = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingId(null);
    setEditName('');
  };

  const handleDeleteShift = (shiftId: string, shiftName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    showConfirm(
      'Delete Shift',
      `Are you sure you want to delete "${shiftName}" and all its patients? This cannot be undone.`,
      async () => {
        try {
          await deleteShift(shiftId);
        } catch (err) {
          console.error('Failed to delete shift:', err);
        }
      }
    );
  };

  const handleEditKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, shiftId: string) => {
    if (e.key === 'Enter') {
      handleSaveEdit(shiftId);
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const handleNewShiftKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCreateShift();
    } else if (e.key === 'Escape') {
      setIsAddingShift(false);
      setNewShiftName('');
    }
  };

  const handleSort = (column: ShiftSortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection(column === 'name' ? 'asc' : 'desc');
    }
  };

  const sortedShifts = [...shifts].sort((a, b) => {
    let aValue: string | number;
    let bValue: string | number;

    switch (sortColumn) {
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'createdAt':
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
        break;
      case 'totalPatients':
        aValue = a.patients.length;
        bValue = b.patients.length;
        break;
      case 'activePatients':
        aValue = a.patients.filter(p => !p.archived).length;
        bValue = b.patients.filter(p => !p.archived).length;
        break;
      case 'archivedPatients':
        aValue = a.patients.filter(p => p.archived).length;
        bValue = b.patients.filter(p => p.archived).length;
        break;
    }

    const direction = sortDirection;
    if (aValue < bValue) return direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return direction === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <div className="h-screen flex flex-col bg-neutral-50">
      <Header />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-8">
          {/* Page header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-neutral-900">Shifts</h1>
            {!isAddingShift ? (
              <button
                onClick={() => setIsAddingShift(true)}
                className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-semibold"
              >
                <Plus size={18} />
                <span>New Shift</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newShiftName}
                  onChange={(e) => setNewShiftName(e.target.value)}
                  onKeyDown={handleNewShiftKeyDown}
                  placeholder="Enter shift name..."
                  className="px-4 py-2 bg-white border border-blue-500 rounded-lg focus:outline-none w-72 text-body"
                  autoFocus
                />
                <button
                  onClick={handleCreateShift}
                  className="p-2 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg transition-colors"
                  title="Create shift"
                >
                  <Check size={18} />
                </button>
                <button
                  onClick={() => {
                    setIsAddingShift(false);
                    setNewShiftName('');
                  }}
                  className="p-2 bg-neutral-100 text-neutral-600 hover:bg-neutral-200 rounded-lg transition-colors"
                  title="Cancel"
                >
                  <X size={18} />
                </button>
              </div>
            )}
          </div>

          {/* Empty state */}
          {sortedShifts.length === 0 ? (
            <div className="flex-1 flex items-center justify-center py-20">
              <div className="text-center text-neutral-400">
                <Calendar size={48} className="mx-auto mb-4 text-neutral-300" />
                <p className="text-body font-semibold text-neutral-600 mb-2">No shifts yet</p>
                <p className="text-caption">Create your first shift to get started</p>
              </div>
            </div>
          ) : (
            <>
              {/* Desktop table view */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full bg-white border border-neutral-200 rounded-lg overflow-hidden">
                  <thead className="bg-neutral-50 border-b border-neutral-200">
                    <tr>
                      <th
                        onClick={() => handleSort('name')}
                        className="px-4 py-3 text-left text-label font-semibold text-neutral-700 cursor-pointer hover:bg-neutral-100 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span>Shift Name</span>
                          {sortColumn === 'name' && (
                            sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                          )}
                        </div>
                      </th>
                      <th
                        onClick={() => handleSort('createdAt')}
                        className="px-4 py-3 text-left text-label font-semibold text-neutral-700 cursor-pointer hover:bg-neutral-100 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span>Created</span>
                          {sortColumn === 'createdAt' && (
                            sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                          )}
                        </div>
                      </th>
                      <th
                        onClick={() => handleSort('totalPatients')}
                        className="px-4 py-3 text-center text-label font-semibold text-neutral-700 cursor-pointer hover:bg-neutral-100 transition-colors"
                      >
                        <div className="flex items-center justify-center gap-2">
                          <span>Total Patients</span>
                          {sortColumn === 'totalPatients' && (
                            sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                          )}
                        </div>
                      </th>
                      <th
                        onClick={() => handleSort('activePatients')}
                        className="px-4 py-3 text-center text-label font-semibold text-neutral-700 cursor-pointer hover:bg-neutral-100 transition-colors"
                      >
                        <div className="flex items-center justify-center gap-2">
                          <span>Active</span>
                          {sortColumn === 'activePatients' && (
                            sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                          )}
                        </div>
                      </th>
                      <th
                        onClick={() => handleSort('archivedPatients')}
                        className="px-4 py-3 text-center text-label font-semibold text-neutral-700 cursor-pointer hover:bg-neutral-100 transition-colors"
                      >
                        <div className="flex items-center justify-center gap-2">
                          <span>Archived</span>
                          {sortColumn === 'archivedPatients' && (
                            sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                          )}
                        </div>
                      </th>
                      <th className="px-4 py-3 text-right text-label font-semibold text-neutral-700">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedShifts.map((shift) => (
                      editingId === shift.id ? (
                        <tr key={shift.id}>
                          <td colSpan={6} className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                onKeyDown={(e) => handleEditKeyDown(e, shift.id)}
                                className="flex-1 px-3 py-2 bg-white border border-blue-500 rounded-lg focus:outline-none text-body"
                                autoFocus
                              />
                              <button
                                onClick={(e) => handleSaveEdit(shift.id, e)}
                                className="p-2 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg transition-colors"
                                title="Save"
                              >
                                <Check size={18} />
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="p-2 bg-neutral-100 text-neutral-600 hover:bg-neutral-200 rounded-lg transition-colors"
                                title="Cancel"
                              >
                                <X size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        <tr
                          key={shift.id}
                          onClick={() => handleShiftClick(shift.id)}
                          className="border-b border-neutral-200 last:border-b-0 hover:bg-neutral-50 transition-colors cursor-pointer"
                        >
                          <td className="px-4 py-3 text-body text-neutral-900 font-semibold">{shift.name}</td>
                          <td className="px-4 py-3 text-body text-neutral-700">{formatDateTime(shift.createdAt)}</td>
                          <td className="px-4 py-3 text-body text-neutral-900 text-center">{shift.patients.length}</td>
                          <td className="px-4 py-3 text-body text-green-600 font-medium text-center">
                            {shift.patients.filter(p => !p.archived).length}
                          </td>
                          <td className="px-4 py-3 text-body text-neutral-400 text-center">
                            {shift.patients.filter(p => p.archived).length}
                          </td>
                          <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={(e) => { e.stopPropagation(); handleStartEdit(shift.id, shift.name, e); }}
                                className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                title="Edit shift name"
                              >
                                <Pencil size={16} />
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleDeleteShift(shift.id, shift.name, e); }}
                                className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                title="Delete shift"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile card view */}
              <div className="block md:hidden space-y-4">
                {sortedShifts.map((shift) => (
                  <div
                    key={shift.id}
                    onClick={() => handleShiftClick(shift.id)}
                    className="bg-white border border-neutral-200 rounded-xl p-4 hover:shadow-lg transition-all cursor-pointer"
                  >
                    {editingId === shift.id ? (
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={(e) => handleEditKeyDown(e, shift.id)}
                          className="flex-1 px-3 py-2 bg-white border border-blue-500 rounded-lg focus:outline-none text-body"
                          autoFocus
                        />
                        <button
                          onClick={(e) => handleSaveEdit(shift.id, e)}
                          className="p-2 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg transition-colors"
                          title="Save"
                        >
                          <Check size={18} />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="p-2 bg-neutral-100 text-neutral-600 hover:bg-neutral-200 rounded-lg transition-colors"
                          title="Cancel"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <h3 className="text-lg font-bold text-neutral-900 mb-3">{shift.name}</h3>

                        <div className="grid grid-cols-2 gap-3 mb-3 text-caption text-neutral-600">
                          <div>
                            <div className="text-label font-semibold text-neutral-700 mb-1">Created</div>
                            <div>{formatDateTime(shift.createdAt)}</div>
                          </div>
                          <div>
                            <div className="text-label font-semibold text-neutral-700 mb-1">Total Patients</div>
                            <div>{shift.patients.length}</div>
                          </div>
                          <div>
                            <div className="text-label font-semibold text-neutral-700 mb-1">Active</div>
                            <div className="text-green-600 font-medium">
                              {shift.patients.filter(p => !p.archived).length}
                            </div>
                          </div>
                          <div>
                            <div className="text-label font-semibold text-neutral-700 mb-1">Archived</div>
                            <div className="text-neutral-400">
                              {shift.patients.filter(p => p.archived).length}
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2 pt-3 border-t border-neutral-200" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleStartEdit(shift.id, shift.name, e); }}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors text-caption font-semibold"
                          >
                            <Pencil size={14} />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteShift(shift.id, shift.name, e); }}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors text-caption font-semibold"
                          >
                            <Trash2 size={14} />
                            <span>Delete</span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={handleConfirm}
        onCancel={closeConfirm}
      />
    </div>
  );
}
