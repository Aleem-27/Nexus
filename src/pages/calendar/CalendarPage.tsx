import React, { useState } from 'react';
import Calendar from 'react-calendar';
import { Plus } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { AvailabilityForm, MeetingRequestModal, MeetingRequestList, ConfirmedMeetingsList } from '../../components/calendar';
import { format, parseISO } from 'date-fns';
import { availabilitySlots, meetingRequests, confirmedMeetings } from '../../data/calendar';
import 'react-calendar/dist/Calendar.css';
import './CalendarPage.css';

export const CalendarPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'availability' | 'requests' | 'meetings'>('availability');

  // Get slots and meetings for selected date
  const dateStr = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';
  const slotsForDate = availabilitySlots.filter(slot => slot.date === dateStr);
  const pendingRequests = meetingRequests.filter(req => req.status === 'pending');
  const upcomingMeetings = confirmedMeetings.filter(m => parseISO(m.date) >= new Date());

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
          <p className="text-gray-600">Manage your availability and meetings</p>
        </div>
        <Button
          leftIcon={<Plus size={18} />}
          onClick={() => setIsModalOpen(true)}
        >
          Request Meeting
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-1">
          <Card>
            <CardBody>
              <Calendar
                value={selectedDate}
                onChange={setSelectedDate}
                className="w-full border-0"
              />
            </CardBody>
          </Card>

          {/* Add Availability Form */}
          <div className="mt-6">
            <AvailabilityForm />
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tabs */}
          <div className="flex gap-2 border-b border-gray-200">
            {[
              { id: 'availability', label: 'My Availability' },
              { id: 'requests', label: 'Meeting Requests' },
              { id: 'meetings', label: 'Confirmed Meetings' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setCurrentView(tab.id as any)}
                className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                  currentView === tab.id
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          {currentView === 'availability' && (
            <div>
              {selectedDate && (
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Availability for {format(selectedDate, 'MMMM d, yyyy')}
                  </h3>
                  {slotsForDate.length > 0 ? (
                    <div className="space-y-2">
                      {slotsForDate.map((slot) => (
                        <Card key={slot.id}>
                          <CardBody className="py-3">
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-gray-900">
                                {slot.startHour}:00 - {slot.endHour}:00
                              </span>
                              <span className="text-xs font-medium text-green-700 bg-green-50 px-2 py-1 rounded">
                                Available
                              </span>
                            </div>
                          </CardBody>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600">No availability slots for this date</p>
                  )}
                </div>
              )}
            </div>
          )}

          {currentView === 'requests' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Pending Meeting Requests</h3>
              <MeetingRequestList requests={pendingRequests} />
            </div>
          )}

          {currentView === 'meetings' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Meetings</h3>
              <ConfirmedMeetingsList meetings={upcomingMeetings} />
            </div>
          )}
        </div>
      </div>

      {/* Meeting Request Modal */}
      <MeetingRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentUserId="i1"
        userRole="investor"
      />
    </div>
  );
};