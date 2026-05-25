import React, { useState } from 'react';
import { X, Clock, Users } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardBody, CardHeader } from '../ui/Card';
import { Input } from '../ui/Input';
import { Avatar } from '../ui/Avatar';
import { users, investors, entrepreneurs } from '../../data/users';
import { availabilitySlots } from '../../data/calendar';
import { getAvailableHours, DURATION_OPTIONS, formatTime } from '../../data/calendarUtils';
import { AvailabilitySlot, MeetingRequest } from '../../types';
import toast from 'react-hot-toast';

interface MeetingRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserId?: string;
  onSubmit?: (request: Omit<MeetingRequest, 'id' | 'createdAt'>) => void;
  userRole?: 'entrepreneur' | 'investor';
}

export const MeetingRequestModal: React.FC<MeetingRequestModalProps> = ({
  isOpen,
  onClose,
  currentUserId = '',
  onSubmit,
  userRole = 'entrepreneur',
}) => {
  const [recipientId, setRecipientId] = useState('');
  const [date, setDate] = useState('');
  const [hour, setHour] = useState('');
  const [duration, setDuration] = useState('60');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');

  // Get available recipients (opposite role)
  const availableRecipients = userRole === 'entrepreneur' ? investors : entrepreneurs;

  // Get available hours based on selected recipient and date
  const getAvailableHoursForRecipient = (): number[] => {
    if (!recipientId || !date) return [];
    const slots = availabilitySlots.filter(
      (slot) => slot.userId === recipientId && slot.date === date && slot.status === 'available'
    );
    if (slots.length === 0) return [];
    return getAvailableHours(recipientId, date, availabilitySlots);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!recipientId || !date || !hour || !title || !message) {
      toast.error('Please fill in all fields');
      return;
    }

    const availableHours = getAvailableHoursForRecipient();
    if (!availableHours.includes(parseInt(hour, 10))) {
      toast.error('Selected time is not available');
      return;
    }

    const request: Omit<MeetingRequest, 'id' | 'createdAt'> = {
      senderId: currentUserId,
      receiverId: recipientId,
      proposedDate: date,
      proposedHour: parseInt(hour, 10),
      duration: parseInt(duration, 10),
      title,
      message,
      status: 'pending',
    };

    onSubmit?.(request);

    // Reset form
    setRecipientId('');
    setDate('');
    setHour('');
    setDuration('60');
    setTitle('');
    setMessage('');

    onClose();
    toast.success('Meeting request sent');
  };

  if (!isOpen) return null;

  const availableHours = getAvailableHoursForRecipient();
  const selectedRecipient = users.find((u) => u.id === recipientId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl mx-4">
        <CardHeader className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Request Meeting</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-md transition-colors"
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </CardHeader>

        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Recipient Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <div className="flex items-center gap-2">
                  <Users size={18} />
                  Select Recipient
                </div>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-32 overflow-y-auto">
                {availableRecipients.map((recipient) => (
                  <div
                    key={recipient.id}
                    onClick={() => setRecipientId(recipient.id)}
                    className={`p-3 border rounded-lg cursor-pointer transition-all ${
                      recipientId === recipient.id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-primary-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Avatar src={recipient.avatarUrl} alt={recipient.name} size="sm" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{recipient.name}</p>
                        <p className="text-xs text-gray-500">
                          {recipient.role === 'entrepreneur'
                            ? (recipient as any).startupName
                            : `Investor`}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Date and Time Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => {
                    setDate(e.target.value);
                    setHour(''); // Reset hour when date changes
                  }}
                  min={new Date().toISOString().split('T')[0]}
                  fullWidth
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Clock size={16} />
                    Time
                  </div>
                </label>
                <select
                  value={hour}
                  onChange={(e) => setHour(e.target.value)}
                  disabled={availableHours.length === 0 || !date || !recipientId}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {date && recipientId
                      ? availableHours.length > 0
                        ? 'Select time'
                        : 'No available times'
                      : 'Select date and recipient first'}
                  </option>
                  {availableHours.map((h) => (
                    <option key={h} value={h}>
                      {formatTime(h)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes)</label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                {DURATION_OPTIONS.map((d) => (
                  <option key={d} value={d}>
                    {d} minutes
                  </option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Meeting Title</label>
              <Input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Funding Discussion"
                fullWidth
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell them why you want to meet..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button variant="outline" fullWidth onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" fullWidth>
                Send Request
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
};