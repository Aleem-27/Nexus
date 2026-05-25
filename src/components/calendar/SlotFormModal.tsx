import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { AvailabilitySlot } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import {
  createAvailabilitySlot,
  updateAvailabilitySlot,
  deleteAvailabilitySlot,
} from '../../data/meetings';

interface SlotFormModalProps {
  userId: string;
  slot?: AvailabilitySlot | null;
  defaultStart?: string;
  defaultEnd?: string;
  onClose: () => void;
  onSaved: () => void;
}

const toLocalInput = (iso?: string) => {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export const SlotFormModal: React.FC<SlotFormModalProps> = ({
  userId,
  slot,
  defaultStart,
  defaultEnd,
  onClose,
  onSaved,
}) => {
  const [title, setTitle] = useState(slot?.title ?? 'Available');
  const [startAt, setStartAt] = useState(toLocalInput(slot?.startAt ?? defaultStart));
  const [endAt, setEndAt] = useState(toLocalInput(slot?.endAt ?? defaultEnd));
  const [error, setError] = useState('');

  useEffect(() => {
    if (slot) {
      setTitle(slot.title);
      setStartAt(toLocalInput(slot.startAt));
      setEndAt(toLocalInput(slot.endAt));
    }
  }, [slot]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const start = new Date(startAt);
    const end = new Date(endAt);
    if (end <= start) {
      setError('End time must be after start time.');
      return;
    }

    if (slot) {
      updateAvailabilitySlot(slot.id, {
        title,
        startAt: start.toISOString(),
        endAt: end.toISOString(),
      });
    } else {
      createAvailabilitySlot(userId, title, start.toISOString(), end.toISOString());
    }

    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {slot ? 'Edit availability' : 'Add availability'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <Input
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            required
          />
          <Input
            label="Start"
            type="datetime-local"
            value={startAt}
            onChange={(e) => setStartAt(e.target.value)}
            fullWidth
            required
          />
          <Input
            label="End"
            type="datetime-local"
            value={endAt}
            onChange={(e) => setEndAt(e.target.value)}
            fullWidth
            required
            error={error}
          />

          <div className="flex justify-between gap-2 pt-2">
            {slot ? (
              <Button
                type="button"
                variant="error"
                onClick={() => {
                  deleteAvailabilitySlot(slot.id);
                  onSaved();
                  onClose();
                }}
              >
                Delete
              </Button>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">{slot ? 'Save changes' : 'Add slot'}</Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
