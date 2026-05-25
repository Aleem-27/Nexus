import React, { useState } from 'react';
import { Calendar, Clock } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardBody, CardHeader } from '../ui/Card';
import { Input } from '../ui/Input';
import { WORKING_HOURS, getHoursInRange } from '../../data/calendarUtils';
import { AvailabilitySlot } from '../../types';
import toast from 'react-hot-toast';

interface AvailabilityFormProps {
  onSubmit?: (slot: Omit<AvailabilitySlot, 'id' | 'createdAt'>) => void;
}

export const AvailabilityForm: React.FC<AvailabilityFormProps> = ({ onSubmit }) => {
  const [date, setDate] = useState('');
  const [startHour, setStartHour] = useState('');
  const [endHour, setEndHour] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!date || !startHour || !endHour) {
      toast.error('Please fill in all fields');
      return;
    }

    const start = parseInt(startHour, 10);
    const end = parseInt(endHour, 10);

    if (start >= end) {
      toast.error('End time must be after start time');
      return;
    }

    if (start < WORKING_HOURS.start || end > WORKING_HOURS.end) {
      toast.error(`Hours must be between ${WORKING_HOURS.start} and ${WORKING_HOURS.end}`);
      return;
    }

    const slot: Omit<AvailabilitySlot, 'id' | 'createdAt'> = {
      userId: '', // Will be set by the calling component
      date,
      startHour: start,
      endHour: end,
      status: 'available',
    };

    onSubmit?.(slot);

    // Reset form
    setDate('');
    setStartHour('');
    setEndHour('');

    toast.success('Availability slot added');
  };

  const hours = getHoursInRange(WORKING_HOURS.start, WORKING_HOURS.end);

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold text-gray-900">Add Availability Slot</h3>
      </CardHeader>
      <CardBody>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <Calendar size={18} />
                Date
              </div>
            </label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              fullWidth
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <Clock size={18} />
                  Start Hour
                </div>
              </label>
              <select
                value={startHour}
                onChange={(e) => setStartHour(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Select start hour</option>
                {hours.map((hour) => (
                  <option key={hour} value={hour}>
                    {hour}:00 ({hour}:00 {hour >= 12 ? 'PM' : 'AM'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <Clock size={18} />
                  End Hour
                </div>
              </label>
              <select
                value={endHour}
                onChange={(e) => setEndHour(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Select end hour</option>
                {hours.map((hour) => (
                  <option key={hour} value={hour}>
                    {hour}:00 ({hour}:00 {hour >= 12 ? 'PM' : 'AM'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-2">
            <Button type="submit" fullWidth>
              Add Slot
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
};