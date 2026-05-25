import React, { useState } from 'react';
import { X } from 'lucide-react';
import { User } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { createMeetingRequest } from '../../data/meetings';

interface SendMeetingModalProps {
  senderId: string;
  contacts: User[];
  defaultStart?: string;
  defaultEnd?: string;
  onClose: () => void;
  onSent: () => void;
}

const toLocalInput = (iso?: string) => {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export const SendMeetingModal: React.FC<SendMeetingModalProps> = ({
  senderId,
  contacts,
  defaultStart,
  defaultEnd,
  onClose,
  onSent,
}) => {
  const [receiverId, setReceiverId] = useState(contacts[0]?.id ?? '');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [startAt, setStartAt] = useState(toLocalInput(defaultStart));
  const [endAt, setEndAt] = useState(toLocalInput(defaultEnd));
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiverId || !title.trim()) {
      setError('Select a contact and enter a meeting title.');
      return;
    }
    const start = new Date(startAt);
    const end = new Date(endAt);
    if (end <= start) {
      setError('End time must be after start time.');
      return;
    }

    createMeetingRequest(
      senderId,
      receiverId,
      title.trim(),
      start.toISOString(),
      end.toISOString(),
      message.trim() || undefined
    );
    onSent();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Send meeting request</h2>
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contact</label>
            <select
              value={receiverId}
              onChange={(e) => setReceiverId(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              required
            >
              {contacts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                  {'startupName' in c ? ` — ${c.startupName}` : ''}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Meeting title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message (optional)</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            />
          </div>
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

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Send request</Button>
          </div>
        </form>
      </div>
    </div>
  );
};
